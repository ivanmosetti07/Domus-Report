import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PropertyType, PropertyCondition, FloorType, OutdoorSpace, HeatingType, EnergyClass, OccupancyStatus } from "@/types"
import {
  validateEmail,
  validatePhone,
  validateName,
  validateAddress,
  validateCity,
  validateSurface,
  validateFloor,
  checkRateLimit,
  getClientIP,
  sanitizeString,
} from "@/lib/validation"

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
  // Conversation
  messages: any[]
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(
      clientIP,
      process.env.NODE_ENV === 'production' ? 100 : 10000, // Limite alto in development
      24 * 60 * 60 * 1000
    )

    if (!rateLimitResult.allowed) {
      console.log('[POST /api/leads] Rate limit exceeded:', { clientIP, resetAt: rateLimitResult.resetAt })
      return NextResponse.json(
        {
          error: "Limite di richieste giornaliere raggiunto. Riprova domani.",
          resetAt: rateLimitResult.resetAt,
        },
        { status: 429 }
      )
    }

    const body = (await request.json()) as CreateLeadRequest

    // Logging per debug
    console.log('[POST /api/leads] Received request:', {
      widgetId: body.widgetId,
      email: body.email,
      hasPhone: !!body.phone,
      timestamp: new Date().toISOString()
    })

    // Validate required fields - Widget ID
    if (!body.widgetId || typeof body.widgetId !== "string") {
      return NextResponse.json(
        { error: "Widget ID è obbligatorio" },
        { status: 400 }
      )
    }

    // Sanitize and validate lead data
    const emailValidation = validateEmail(body.email || "")
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    const firstNameValidation = validateName(body.firstName || "", "Nome")
    if (!firstNameValidation.valid) {
      return NextResponse.json(
        { error: firstNameValidation.error },
        { status: 400 }
      )
    }

    const lastNameValidation = validateName(body.lastName || "", "Cognome")
    if (!lastNameValidation.valid) {
      return NextResponse.json(
        { error: lastNameValidation.error },
        { status: 400 }
      )
    }

    const phoneValidation = validatePhone(body.phone || "")
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      )
    }

    // Sanitize and validate property data
    const addressValidation = validateAddress(body.address || "")
    if (!addressValidation.valid) {
      return NextResponse.json(
        { error: addressValidation.error },
        { status: 400 }
      )
    }

    const cityValidation = validateCity(body.city || "")
    if (!cityValidation.valid) {
      return NextResponse.json(
        { error: cityValidation.error },
        { status: 400 }
      )
    }

    const surfaceValidation = validateSurface(body.surfaceSqm || 0)
    if (!surfaceValidation.valid) {
      return NextResponse.json(
        { error: surfaceValidation.error },
        { status: 400 }
      )
    }

    // Validate floor if provided
    if (body.floor !== undefined && body.floor !== null) {
      const floorValidation = validateFloor(body.floor)
      if (!floorValidation.valid) {
        return NextResponse.json(
          { error: floorValidation.error },
          { status: 400 }
        )
      }
    }

    // Validate property type and condition
    if (!Object.values(PropertyType).includes(body.type)) {
      return NextResponse.json(
        { error: "Tipo immobile non valido" },
        { status: 400 }
      )
    }

    if (!Object.values(PropertyCondition).includes(body.condition)) {
      return NextResponse.json(
        { error: "Stato immobile non valido" },
        { status: 400 }
      )
    }

    // Validate valuation data
    if (!body.minPrice || !body.maxPrice || !body.estimatedPrice) {
      return NextResponse.json(
        { error: "Dati valutazione obbligatori: prezzi min/max/stimato" },
        { status: 400 }
      )
    }

    if (body.minPrice < 0 || body.maxPrice < 0 || body.estimatedPrice < 0) {
      return NextResponse.json(
        { error: "Prezzi devono essere positivi" },
        { status: 400 }
      )
    }

    if (body.minPrice > body.maxPrice) {
      return NextResponse.json(
        { error: "Prezzo minimo non può essere maggiore del massimo" },
        { status: 400 }
      )
    }

    // Find agency by widgetId
    // Prima cerca nel nuovo sistema multi-widget (WidgetConfig)
    const widgetConfig = await prisma.widgetConfig.findUnique({
      where: { widgetId: body.widgetId },
      include: { agency: true },
    })

    let agency = widgetConfig?.agency || null

    // Fallback: cerca nel vecchio sistema (campo widgetId diretto in Agency)
    if (!agency) {
      const legacyAgency = await prisma.agency.findUnique({
        where: { widgetId: body.widgetId },
      })
      agency = legacyAgency
    }

    if (!agency) {
      return NextResponse.json(
        { error: "Widget non valido" },
        { status: 404 }
      )
    }

    if (!agency.attiva) {
      console.log('[POST /api/leads] Agency not active:', { agencyId: agency.id })
      return NextResponse.json(
        { error: "Agenzia non attiva" },
        { status: 403 }
      )
    }

    // Verifica che il widget sia attivo (solo per nuovi widget)
    if (widgetConfig && !widgetConfig.isActive) {
      console.log('[POST /api/leads] Widget not active:', { widgetId: body.widgetId })
      return NextResponse.json(
        { error: "Widget non attivo" },
        { status: 403 }
      )
    }

    console.log('[POST /api/leads] Creating lead for agency:', { agencyId: agency.id, agencyName: agency.nome })

    // Create lead with related data in a transaction
    // Prisma nested create operations are automatically wrapped in a transaction
    // If any operation fails, all changes are rolled back
    const lead = await prisma.lead.create({
      data: {
        agenziaId: agency.id,
        nome: firstNameValidation.sanitized,
        cognome: lastNameValidation.sanitized,
        email: emailValidation.sanitized,
        telefono: phoneValidation.sanitized || undefined,
        property: {
          create: {
            indirizzo: addressValidation.sanitized,
            citta: cityValidation.sanitized,
            quartiere: body.neighborhood ? sanitizeString(body.neighborhood) : undefined,
            cap: body.postalCode ? sanitizeString(body.postalCode) : undefined,
            latitudine: body.latitude,
            longitudine: body.longitude,
            tipo: body.type,
            superficieMq: surfaceValidation.value,
            locali: body.rooms,
            bagni: body.bathrooms,
            piano: body.floor,
            ascensore: body.hasElevator,
            tipoPiano: body.floorType,
            spaziEsterni: body.outdoorSpace,
            postoAuto: body.hasParking,
            stato: body.condition,
            riscaldamento: body.heatingType,
            ariaCondizionata: body.hasAirConditioning,
            classeEnergetica: body.energyClass,
            annoCostruzione: body.buildYear,
            statoOccupazione: body.occupancyStatus,
            dataScadenza: body.occupancyEndDate ? sanitizeString(body.occupancyEndDate) : undefined,
            valuation: {
              create: {
                prezzoMinimo: body.minPrice,
                prezzoMassimo: body.maxPrice,
                prezzoStimato: body.estimatedPrice,
                valoreOmiBase: body.baseOMIValue,
                coefficientePiano: body.floorCoefficient,
                coefficienteStato: body.conditionCoefficient,
                spiegazione: body.explanation,
              },
            },
          },
        },
        conversation: {
          create: {
            messaggi: body.messages,
          },
        },
      },
      include: {
        property: {
          include: {
            valuation: true,
          },
        },
        conversation: true,
      },
    })

    console.log('[POST /api/leads] Lead created successfully:', {
      leadId: lead.id,
      agencyId: agency.id,
      email: body.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      lead: lead, // Include full lead object for widget tracking
      message: "Lead creato con successo",
    })
  } catch (error) {
    console.error('[POST /api/leads] Error creating lead:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const widgetId = searchParams.get("widgetId")

    if (!widgetId) {
      return NextResponse.json(
        { error: "Widget ID is required" },
        { status: 400 }
      )
    }

    // Find agency
    // Prima cerca nel nuovo sistema multi-widget (WidgetConfig)
    const widgetConfig = await prisma.widgetConfig.findUnique({
      where: { widgetId },
      include: { agency: true },
    })

    let agency = widgetConfig?.agency || null

    // Fallback: cerca nel vecchio sistema (campo widgetId diretto in Agency)
    if (!agency) {
      const legacyAgency = await prisma.agency.findUnique({
        where: { widgetId },
      })
      agency = legacyAgency
    }

    if (!agency) {
      return NextResponse.json({ error: "Widget non trovato" }, { status: 404 })
    }

    // Fetch leads with statuses
    const leads = await prisma.lead.findMany({
      where: { agenziaId: agency.id },
      include: {
        property: {
          include: {
            valuation: true,
          },
        },
        conversation: true,
        statuses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        dataRichiesta: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      leads: leads,
    })
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
