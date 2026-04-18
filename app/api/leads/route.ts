import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PropertyType, PropertyCondition, FloorType, OutdoorSpace, HeatingType, EnergyClass, OccupancyStatus } from "@/types"
import {
  validateEmail,
  validatePhone,
  validateName,
  validateSurface,
  validateFloor,
  checkRateLimit,
  getClientIP,
  sanitizeString,
} from "@/lib/validation"
import { geocodeAddress } from "@/lib/geocoding"
import { incrementValuationCount, checkValuationLimit } from "@/lib/subscription-limits"
import { inferCity, getCityFromPostalCode } from "@/lib/postal-code"
import { sendEmail } from "@/lib/email"
import { generateNewLeadNotificationHTML, generateNewLeadNotificationText } from "@/lib/email-templates"
import { recordLeadSubmission } from "@/lib/lead-audit"

export interface CreateLeadRequest {
  widgetId: string
  // Lead data
  firstName: string
  lastName: string
  email: string
  phone?: string
  // Property data
  address: string
  city: string
  neighborhood?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  type: PropertyType
  surfaceSqm: number
  rooms?: number
  bathrooms?: number
  floor?: number
  hasElevator?: boolean
  floorType?: FloorType
  outdoorSpace?: OutdoorSpace
  hasParking?: boolean
  condition: PropertyCondition
  heatingType?: HeatingType
  hasAirConditioning?: boolean
  energyClass?: EnergyClass
  buildYear?: number
  occupancyStatus?: OccupancyStatus
  occupancyEndDate?: string
  // Valuation data
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  baseOMIValue: number
  floorCoefficient: number
  conditionCoefficient: number
  explanation: string
  // Valuation quality (optional — da Sprint 1-4)
  confidence?: "alta" | "media" | "bassa"
  confidenceScore?: number
  warnings?: Array<{ code: string; message: string; severity: "info" | "warning" | "error" | "critical" }>
  omiZoneMatch?: string
  dataCompleteness?: number
  pricePerSqm?: number
  comparables?: {
    enabled: boolean
    provider?: string
    sampleSize?: number
    medianPricePerSqm?: number
    avgPricePerSqm?: number
    minPricePerSqm?: number
    maxPricePerSqm?: number
    items?: Array<any>
    crossCheck?: any
  } | null
  // Conversation
  messages: any[]
}

type ValuationWarning = { code: string; message: string; severity: "info" | "warning" | "error" | "critical" }

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  let body: Partial<CreateLeadRequest> = {}

  try {
    // Parse body subito per avere contesto negli errori (non blocca audit)
    try {
      body = (await request.json()) as CreateLeadRequest
    } catch {
      await recordLeadSubmission({
        ipAddress: clientIP,
        status: "failed",
        errorCode: "INVALID_JSON",
        errorMessage: "Body non valido JSON",
        httpStatus: 400,
      })
      return NextResponse.json({ error: "Body non valido" }, { status: 400 })
    }

    // Helper: reject + log
    const reject = async (
      httpStatus: number,
      errorCode: string,
      errorMessage: string
    ): Promise<NextResponse> => {
      await recordLeadSubmission({
        widgetId: body.widgetId,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        ipAddress: clientIP,
        status: "failed",
        errorCode,
        errorMessage,
        httpStatus,
        bodySnapshot: body as Record<string, unknown>,
      })
      return NextResponse.json({ error: errorMessage }, { status: httpStatus })
    }

    // ============ HARD GUARDS (bloccanti: impossibile procedere) ============

    // Rate limiting
    const rateLimitResult = checkRateLimit(
      clientIP,
      process.env.NODE_ENV === "production" ? 100 : 10000,
      24 * 60 * 60 * 1000
    )
    if (!rateLimitResult.allowed) {
      return reject(429, "RATE_LIMIT", "Limite di richieste giornaliere raggiunto. Riprova domani.")
    }

    // Widget ID
    if (!body.widgetId || typeof body.widgetId !== "string") {
      return reject(400, "WIDGET_ID_MISSING", "Widget ID è obbligatorio")
    }

    // Email (obbligatoria per contatto)
    const emailValidation = validateEmail(body.email || "")
    if (!emailValidation.valid) {
      return reject(400, "EMAIL_INVALID", emailValidation.error || "Email non valida")
    }

    // Nome/Cognome (obbligatori per contatto)
    const firstNameValidation = validateName(body.firstName || "", "Nome")
    if (!firstNameValidation.valid) {
      return reject(400, "FIRSTNAME_INVALID", firstNameValidation.error || "Nome non valido")
    }

    const lastNameValidation = validateName(body.lastName || "", "Cognome")
    if (!lastNameValidation.valid) {
      return reject(400, "LASTNAME_INVALID", lastNameValidation.error || "Cognome non valido")
    }

    // ============ SOFT WARNINGS (raccolte, non bloccanti) ============
    const softWarnings: ValuationWarning[] = []

    // Telefono: se malformato, salviamo null + warning (invece di rifiutare)
    const phoneValidation = validatePhone(body.phone)
    let finalPhone: string | null = null
    if (phoneValidation.valid) {
      finalPhone = phoneValidation.sanitized ?? null
    } else {
      softWarnings.push({
        code: "PHONE_MALFORMED",
        message: `Telefono non valido scartato: "${body.phone}"`,
        severity: "warning",
      })
    }

    // Indirizzo: obbligatorio minimo, ma se mancante salviamo con placeholder
    let addressInput = sanitizeString(body.address || "")
    if (!addressInput) {
      softWarnings.push({
        code: "ADDRESS_MISSING",
        message: "Indirizzo non fornito dall'utente.",
        severity: "warning",
      })
      addressInput = body.city ? `(indirizzo non specificato) ${body.city}` : "(indirizzo non specificato)"
    }

    // Superficie: se fuori range, salviamo come-è + warning (invece di 400)
    let finalSurface = Number(body.surfaceSqm) || 0
    if (finalSurface <= 0) {
      softWarnings.push({
        code: "SURFACE_MISSING",
        message: "Superficie non indicata o 0.",
        severity: "warning",
      })
      finalSurface = 0
    } else {
      const surfaceValidation = validateSurface(finalSurface)
      if (!surfaceValidation.valid) {
        softWarnings.push({
          code: "SURFACE_OUT_OF_RANGE",
          message: surfaceValidation.error || "Superficie fuori range.",
          severity: "warning",
        })
      } else {
        finalSurface = surfaceValidation.value
      }
    }

    // Piano: se fornito e invalido, scartalo + warning
    let finalFloor: number | undefined = undefined
    if (body.floor !== undefined && body.floor !== null) {
      const floorValidation = validateFloor(body.floor)
      if (floorValidation.valid) {
        finalFloor = body.floor
      } else {
        softWarnings.push({
          code: "FLOOR_INVALID",
          message: floorValidation.error || "Piano non valido.",
          severity: "warning",
        })
      }
    }

    // Tipo immobile: se invalido, default APARTMENT + warning
    let finalType: PropertyType = PropertyType.APARTMENT
    if (body.type && Object.values(PropertyType).includes(body.type)) {
      finalType = body.type
    } else if (body.type) {
      softWarnings.push({
        code: "TYPE_INVALID",
        message: `Tipo immobile "${body.type}" non valido, usato APARTMENT.`,
        severity: "warning",
      })
    }

    // Stato immobile: se invalido, default GOOD + warning
    let finalCondition: PropertyCondition = PropertyCondition.GOOD
    if (body.condition && Object.values(PropertyCondition).includes(body.condition)) {
      finalCondition = body.condition
    } else if (body.condition) {
      softWarnings.push({
        code: "CONDITION_INVALID",
        message: `Stato "${body.condition}" non valido, usato GOOD.`,
        severity: "warning",
      })
    }

    // ============ GEOCODING NON BLOCCANTE ============
    const inferredCity = inferCity({
      city: body.city,
      postalCode: body.postalCode,
      address: body.address,
      neighborhood: body.neighborhood,
    })

    const cityFromCAP = body.postalCode ? getCityFromPostalCode(body.postalCode) : null
    const userDataReliable =
      !!body.city &&
      !!body.postalCode &&
      !!cityFromCAP &&
      body.city.toLowerCase().trim() === cityFromCAP.toLowerCase().trim()

    let geocodeResult: Awaited<ReturnType<typeof geocodeAddress>> | null = null

    const geocodingQuery =
      body.city && body.postalCode
        ? `${addressInput}, ${body.city}, ${body.postalCode}`
        : body.city
          ? `${addressInput}, ${body.city}`
          : addressInput

    try {
      geocodeResult = await geocodeAddress(geocodingQuery)
    } catch (err) {
      console.warn("[POST /api/leads] Geocoding error:", err)
    }

    if (!geocodeResult && userDataReliable && body.city) {
      try {
        geocodeResult = await geocodeAddress(body.city)
      } catch (err) {
        console.warn("[POST /api/leads] Geocoding city fallback error:", err)
      }
    }

    // Se anche questo fallisce: NON blocchiamo. Salviamo senza coordinate.
    if (!geocodeResult) {
      softWarnings.push({
        code: "GEOCODING_FAILED",
        message: "Indirizzo non geolocalizzato. Coordinate mappa non disponibili.",
        severity: "warning",
      })
      geocodeResult = {
        address: addressInput,
        city: inferredCity || body.city || "",
        neighborhood: body.neighborhood,
        postalCode: body.postalCode,
        latitude: 0,
        longitude: 0,
        formattedAddress: `${addressInput}${body.city ? ", " + body.city : ""}`,
      } as NonNullable<typeof geocodeResult>
    }

    // Indirizzo finale
    const finalAddress = userDataReliable
      ? [body.address, body.neighborhood, body.city, body.postalCode].filter(Boolean).join(", ")
      : geocodeResult.formattedAddress || addressInput
    const finalCity = userDataReliable
      ? inferredCity || body.city || ""
      : geocodeResult.city || body.city || ""
    const finalPostalCode = body.postalCode || geocodeResult.postalCode
    const finalNeighborhood = body.neighborhood || geocodeResult.neighborhood
    const finalLatitude =
      geocodeResult.latitude && geocodeResult.latitude !== 0 ? geocodeResult.latitude : null
    const finalLongitude =
      geocodeResult.longitude && geocodeResult.longitude !== 0 ? geocodeResult.longitude : null

    // ============ AGENCY RESOLUTION ============
    const widgetConfig = await prisma.widgetConfig.findUnique({
      where: { widgetId: body.widgetId },
      include: { agency: true },
    })
    let agency = widgetConfig?.agency || null
    if (!agency) {
      agency = await prisma.agency.findUnique({ where: { widgetId: body.widgetId } })
    }
    if (!agency) {
      return reject(404, "WIDGET_NOT_FOUND", "Widget non valido")
    }
    if (!agency.attiva) {
      return reject(403, "AGENCY_INACTIVE", "Agenzia non attiva")
    }
    if (widgetConfig && !widgetConfig.isActive) {
      return reject(403, "WIDGET_INACTIVE", "Widget non attivo")
    }

    // Idempotenza: il widget può tentare più salvataggi ravvicinati mentre
    // mostra PDF/restart. Riusa il lead appena creato invece di consumare
    // altri crediti o mostrare errori di limite mensile.
    const duplicateWindowStart = new Date(Date.now() - 10 * 60 * 1000)
    const duplicateLead = await prisma.lead.findFirst({
      where: {
        agenziaId: agency.id,
        email: emailValidation.sanitized,
        nome: firstNameValidation.sanitized,
        cognome: lastNameValidation.sanitized,
        dataRichiesta: { gte: duplicateWindowStart },
        property: { is: {
          citta: finalCity,
          superficieMq: finalSurface,
          tipo: finalType,
        } },
      },
      include: {
        property: { include: { valuation: true } },
        conversation: true,
      },
      orderBy: { dataRichiesta: "desc" },
    })

    if (duplicateLead) {
      await recordLeadSubmission({
        widgetId: body.widgetId,
        agencyId: agency.id,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        ipAddress: clientIP,
        status: "success",
        errorCode: "DUPLICATE_REUSED",
        errorMessage: "Richiesta duplicata ravvicinata: lead esistente riutilizzato",
        savedLeadId: duplicateLead.id,
        httpStatus: 200,
        bodySnapshot: body as Record<string, unknown>,
      })

      return NextResponse.json({
        success: true,
        leadId: duplicateLead.id,
        lead: duplicateLead,
        deduplicated: true,
        valuationFailed: duplicateLead.property?.valuation
          ? duplicateLead.property.valuation.prezzoStimato <= 0
          : true,
        message: "Lead già salvato, richiesta duplicata ignorata",
      })
    }

    // Limite valutazioni mensili (bloccante per agenzia)
    const valuationLimit = await checkValuationLimit(agency.id)
    if (!valuationLimit.allowed) {
      await recordLeadSubmission({
        widgetId: body.widgetId,
        agencyId: agency.id,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        ipAddress: clientIP,
        status: "failed",
        errorCode: "VALUATION_LIMIT_REACHED",
        errorMessage: valuationLimit.message || "Limite valutazioni mensili raggiunto",
        httpStatus: 403,
        bodySnapshot: body as Record<string, unknown>,
      })
      return NextResponse.json(
        {
          error: "Limite valutazioni mensili raggiunto",
          message: valuationLimit.message,
          current: valuationLimit.current,
          limit: valuationLimit.limit,
          extra: valuationLimit.extra,
          upgradeRequired: true,
        },
        { status: 403 }
      )
    }

    // ============ VALUATION OPZIONALE ============
    // Se i prezzi sono 0/mancanti/invalidi, salviamo comunque il lead con
    // una Valuation placeholder marcata VALUATION_FAILED.
    const hasPrices =
      body.minPrice &&
      body.maxPrice &&
      body.estimatedPrice &&
      body.minPrice > 0 &&
      body.maxPrice > 0 &&
      body.estimatedPrice > 0 &&
      body.minPrice <= body.maxPrice

    const valuationWarnings: ValuationWarning[] = Array.isArray(body.warnings)
      ? [...body.warnings, ...softWarnings]
      : [...softWarnings]

    if (!hasPrices) {
      valuationWarnings.push({
        code: "VALUATION_FAILED",
        message:
          "La valutazione automatica non è andata a buon fine. Il lead è stato comunque salvato per follow-up manuale.",
        severity: "critical",
      })
    }

    const valuationData = {
      prezzoMinimo: hasPrices ? body.minPrice! : 0,
      prezzoMassimo: hasPrices ? body.maxPrice! : 0,
      prezzoStimato: hasPrices ? body.estimatedPrice! : 0,
      valoreOmiBase: hasPrices ? body.baseOMIValue || 0 : 0,
      coefficientePiano: body.floorCoefficient || 1.0,
      coefficienteStato: body.conditionCoefficient || 1.0,
      spiegazione:
        body.explanation ||
        (hasPrices ? "" : "Valutazione automatica non riuscita - richiede follow-up manuale"),
      confidence: body.confidence ?? (hasPrices ? undefined : "bassa"),
      confidenceScore: body.confidenceScore ?? undefined,
      warnings: valuationWarnings.length > 0 ? (valuationWarnings as any) : undefined,
      omiZoneMatch: body.omiZoneMatch ?? (hasPrices ? undefined : "not_found"),
      dataCompleteness: body.dataCompleteness ?? undefined,
      pricePerSqm: body.pricePerSqm ?? undefined,
      comparablesData: body.comparables?.enabled
        ? ({
            provider: body.comparables.provider,
            sampleSize: body.comparables.sampleSize,
            medianPricePerSqm: body.comparables.medianPricePerSqm,
            avgPricePerSqm: body.comparables.avgPricePerSqm,
            minPricePerSqm: body.comparables.minPricePerSqm,
            maxPricePerSqm: body.comparables.maxPricePerSqm,
            items: body.comparables.items,
            crossCheck: body.comparables.crossCheck,
          } as any)
        : undefined,
    }

    // ============ CREATE LEAD ============
    let lead
    try {
      lead = await prisma.lead.create({
        data: {
          agenziaId: agency.id,
          nome: firstNameValidation.sanitized,
          cognome: lastNameValidation.sanitized,
          email: emailValidation.sanitized,
          telefono: finalPhone,
          property: {
            create: {
              indirizzo: finalAddress,
              citta: finalCity,
              quartiere: finalNeighborhood,
              cap: finalPostalCode,
              latitudine: finalLatitude,
              longitudine: finalLongitude,
              tipo: finalType,
              superficieMq: finalSurface,
              locali: body.rooms,
              bagni: body.bathrooms,
              piano: finalFloor,
              ascensore: body.hasElevator,
              tipoPiano: body.floorType,
              spaziEsterni: body.outdoorSpace,
              postoAuto: body.hasParking,
              stato: finalCondition,
              riscaldamento: body.heatingType,
              ariaCondizionata: body.hasAirConditioning,
              classeEnergetica: body.energyClass,
              annoCostruzione: body.buildYear,
              statoOccupazione: body.occupancyStatus,
              dataScadenza: body.occupancyEndDate ? sanitizeString(body.occupancyEndDate) : undefined,
              valuation: { create: valuationData },
            },
          },
          conversation: {
            create: { messaggi: body.messages || [] },
          },
        },
        include: {
          property: { include: { valuation: true } },
          conversation: true,
        },
      })
    } catch (dbError) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError)
      console.error("[POST /api/leads] DB error:", msg)
      return reject(500, "DB_ERROR", `Errore DB: ${msg.slice(0, 200)}`)
    }

    // Incrementa counter solo se valutazione riuscita (non contiamo quelle fallite)
    if (hasPrices) {
      try {
        await incrementValuationCount(agency.id)
      } catch (err) {
        console.warn("[POST /api/leads] incrementValuationCount failed:", err)
      }
    }

    // Notifica email (non bloccante)
    if (agency.email && process.env.SMTP_HOST) {
      try {
        const settings = await prisma.agencySetting.findUnique({ where: { agencyId: agency.id } })
        const shouldNotify =
          !settings || (settings.notificationsEmail && settings.emailOnNewLead)
        if (shouldNotify) {
          const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://domusreport.com"
          const dashboardUrl = `${appUrl}/dashboard/leads/${lead.id}`
          const notifData = {
            agencyName: agency.nome,
            leadName: `${lead.nome} ${lead.cognome}`,
            leadEmail: lead.email,
            leadPhone: lead.telefono,
            propertyAddress: lead.property?.indirizzo ?? finalAddress,
            propertyCity: lead.property?.citta ?? finalCity,
            propertySurface: lead.property?.superficieMq ?? finalSurface,
            estimatedPrice: lead.property?.valuation?.prezzoStimato ?? 0,
            dashboardUrl,
          }
          await sendEmail({
            from: `"Domus Report" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: agency.email,
            subject: `Nuovo Lead: ${lead.nome} ${lead.cognome} - ${notifData.propertyCity}${!hasPrices ? " [valutazione fallita]" : ""}`,
            html: generateNewLeadNotificationHTML(notifData),
            text: generateNewLeadNotificationText(notifData),
          })
        }
      } catch (err) {
        console.error("[POST /api/leads] Email notification failed:", err)
      }
    }

    // Audit log success
    await recordLeadSubmission({
      widgetId: body.widgetId,
      agencyId: agency.id,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      ipAddress: clientIP,
      status: "success",
      errorCode: hasPrices ? null : "VALUATION_FAILED_BUT_SAVED",
      errorMessage: hasPrices ? null : "Lead salvato senza valutazione automatica",
      savedLeadId: lead.id,
      httpStatus: 200,
      bodySnapshot: body as Record<string, unknown>,
    })

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      lead,
      valuationFailed: !hasPrices,
      warnings: valuationWarnings,
      message: hasPrices
        ? "Lead creato con successo"
        : "Lead salvato senza valutazione. Un operatore ricontatterà il cliente.",
    })
  } catch (error) {
    console.error("[POST /api/leads] Unhandled error:", error)
    const msg = error instanceof Error ? error.message : String(error)
    await recordLeadSubmission({
      widgetId: body.widgetId,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      ipAddress: clientIP,
      status: "failed",
      errorCode: "UNHANDLED_ERROR",
      errorMessage: msg,
      httpStatus: 500,
      bodySnapshot: body as Record<string, unknown>,
    })
    return NextResponse.json(
      { error: msg || "Errore interno del server", success: false },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const widgetId = searchParams.get("widgetId")

    if (!widgetId) {
      return NextResponse.json({ error: "Widget ID is required" }, { status: 400 })
    }

    const widgetConfig = await prisma.widgetConfig.findUnique({
      where: { widgetId },
      include: { agency: true },
    })

    let agency = widgetConfig?.agency || null
    if (!agency) {
      agency = await prisma.agency.findUnique({ where: { widgetId } })
    }

    if (!agency) {
      return NextResponse.json({ error: "Widget non trovato" }, { status: 404 })
    }

    const leads = await prisma.lead.findMany({
      where: { agenziaId: agency.id },
      include: {
        property: { include: { valuation: true } },
        conversation: true,
        statuses: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { dataRichiesta: "desc" },
    })

    return NextResponse.json({ success: true, leads })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
