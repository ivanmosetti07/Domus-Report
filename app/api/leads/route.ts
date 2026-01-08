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

    // Logging per debug - PHONE TRACKING
    console.log('[POST /api/leads] 🔍 PHONE DEBUG - Received request:', {
      widgetId: body.widgetId,
      email: body.email,
      phone: body.phone,
      phoneType: typeof body.phone,
      phoneLength: body.phone?.length,
      phoneRaw: JSON.stringify(body.phone),
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

    const phoneValidation = validatePhone(body.phone)

    console.log('[POST /api/leads] 📞 PHONE VALIDATION RESULT:', {
      input: body.phone,
      inputType: typeof body.phone,
      sanitized: phoneValidation.sanitized,
      sanitizedType: typeof phoneValidation.sanitized,
      valid: phoneValidation.valid,
      willSaveAsNull: phoneValidation.sanitized === null,
      error: phoneValidation.error || 'none'
    })

    // CRITICAL FIX: Phone is optional - only reject if phone was provided AND is invalid
    // If phone is null/undefined/empty, that's OK (valid: true, sanitized: null)
    // Only reject if user provided a phone number that doesn't match Italian format
    if (!phoneValidation.valid) {
      console.log('[POST /api/leads] ❌ PHONE VALIDATION FAILED - Rejecting request because invalid format')
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      )
    }

    // Log warning if phone was provided but will be saved as null
    if (body.phone && phoneValidation.sanitized === null) {
      console.warn('[POST /api/leads] ⚠️ WARNING: Phone was provided but sanitized to null:', {
        original: body.phone,
        willSaveAsNull: true
      })
    }

    // IMPORTANTE: L'indirizzo serve SOLO per PDF e database, NON per la valutazione OMI
    // La valutazione OMI si basa esclusivamente su: CAP + città + superficie + caratteristiche immobile
    // Il geocoding serve SOLO per ottenere coordinate opzionali (mappa) - NON è bloccante se città+CAP sono corretti
    const addressInput = sanitizeString(body.address || "")

    if (!addressInput) {
      return NextResponse.json(
        { error: "Indirizzo è obbligatorio" },
        { status: 400 }
      )
    }

    // STEP 1: Verifica affidabilità dati utente PRIMA del geocoding
    // Se città+CAP sono coerenti, i dati sono sufficienti per la valutazione OMI
    // Deduce la città corretta dal CAP se fornito
    const inferredCity = inferCity({
      city: body.city,
      postalCode: body.postalCode,
      address: body.address,
      neighborhood: body.neighborhood
    })

    // Verifica se i dati dell'utente sono affidabili:
    // 1. L'utente ha fornito CAP
    // 2. Il CAP esiste nel database
    // 3. La città dedotta dal CAP CORRISPONDE alla città fornita dall'utente (case-insensitive)
    const cityFromCAP = body.postalCode ? getCityFromPostalCode(body.postalCode) : null

    // Debug dettagliato per capire perché userDataReliable potrebbe essere false
    console.log('[POST /api/leads] UserDataReliable debug:', {
      hasCity: !!body.city,
      cityValue: body.city,
      cityType: typeof body.city,
      hasPostalCode: !!body.postalCode,
      postalCodeValue: body.postalCode,
      postalCodeType: typeof body.postalCode,
      hasCityFromCAP: !!cityFromCAP,
      cityFromCAPValue: cityFromCAP,
      normalizedUserCity: body.city?.toLowerCase().trim(),
      normalizedCAPCity: cityFromCAP?.toLowerCase().trim(),
      citiesMatch: body.city && cityFromCAP ? body.city.toLowerCase().trim() === cityFromCAP.toLowerCase().trim() : false
    })

    const userDataReliable = body.city &&
                            body.postalCode &&
                            cityFromCAP &&
                            body.city.toLowerCase().trim() === cityFromCAP.toLowerCase().trim()

    console.log('[POST /api/leads] User data reliability check:', {
      userCity: body.city,
      userPostalCode: body.postalCode,
      cityFromCAP,
      inferredCity,
      userDataReliable
    })

    // STEP 2: Geocoding con fallback intelligente
    // Se i dati utente sono affidabili ma il geocoding fallisce, usa coordinate della città
    let geocodeResult = null

    // Tentativo 1: Geocodifica indirizzo completo con città+CAP
    let geocodingQuery = addressInput
    if (body.city && body.postalCode) {
      // Geocodifica con città e CAP per maggiore precisione
      geocodingQuery = `${addressInput}, ${body.city}, ${body.postalCode}`
      console.log('[POST /api/leads] Geocoding attempt 1 (full address+city+CAP):', geocodingQuery)
    } else if (body.city) {
      // Se abbiamo solo città (senza CAP), usala comunque
      geocodingQuery = `${addressInput}, ${body.city}`
      console.log('[POST /api/leads] Geocoding attempt 1 (address+city):', geocodingQuery)
    } else {
      console.log('[POST /api/leads] Geocoding attempt 1 (address only):', geocodingQuery)
    }

    geocodeResult = await geocodeAddress(geocodingQuery)

    // Tentativo 2: Se fallisce e dati utente sono affidabili, geocodifica solo la città
    if (!geocodeResult && userDataReliable && body.city) {
      console.log('[POST /api/leads] Geocoding attempt 1 failed. Trying with city only:', body.city)
      geocodeResult = await geocodeAddress(body.city)
      if (geocodeResult) {
        console.log('[POST /api/leads] ✅ Geocoding succeeded with city fallback')
      }
    }

    // STEP 3: Gestione fallimento geocoding
    // IMPORTANTE: Il geocoding NON è bloccante quando città+CAP sono corretti
    // perché la valutazione OMI si basa su città+CAP, NON sull'indirizzo specifico
    if (!geocodeResult) {
      if (userDataReliable) {
        // ✅ Dati città+CAP corretti → PROCEDI anche senza coordinate
        // L'indirizzo verrà salvato come fornito dall'utente (per PDF/database)
        // La valutazione OMI funzionerà normalmente con città+CAP
        console.log('[POST /api/leads] ⚠️ Geocoding failed but user data is reliable (city+CAP valid).')
        console.log('[POST /api/leads] ✅ Proceeding without coordinates - valuation will work with city+CAP')

        // Crea un geocodeResult fittizio con i dati utente
        geocodeResult = {
          address: addressInput,
          city: inferredCity || body.city || '',
          neighborhood: body.neighborhood,
          postalCode: body.postalCode,
          latitude: 0, // Coordinate nulle - verranno salvate come null
          longitude: 0,
          formattedAddress: `${addressInput}, ${inferredCity || body.city}, ${body.postalCode || ''}`
        }
      } else {
        // ❌ Dati città+CAP NON corretti E geocoding fallito → BLOCCA
        // In questo caso il geocoding è necessario per validare l'indirizzo
        console.log('[POST /api/leads] ❌ Geocoding failed and user data not reliable (city+CAP invalid or missing).')
        console.log('[POST /api/leads] ❌ Cannot proceed - need either valid city+CAP or successful geocoding')
        return NextResponse.json(
          { error: "Indirizzo non trovato. Verifica che sia corretto e riprova." },
          { status: 400 }
        )
      }
    }

    console.log('[POST /api/leads] Geocoding result:', {
      city: geocodeResult.city,
      hasCoordinates: !!(geocodeResult.latitude && geocodeResult.longitude),
      coordinates: { lat: geocodeResult.latitude, lon: geocodeResult.longitude }
    })

    // Costruisci indirizzo formattato in base all'affidabilità dei dati
    let finalAddress: string
    if (userDataReliable) {
      // Dati utente affidabili: costruisci indirizzo con i dati forniti dall'utente
      const addressParts = [
        body.address,
        body.neighborhood,
        body.city,
        body.postalCode
      ].filter(Boolean)
      finalAddress = addressParts.join(', ')
      console.log('[POST /api/leads] Using user-provided data for address:', finalAddress)
    } else {
      // Dati utente non affidabili: usa geocoding se disponibile, altrimenti dati utente
      finalAddress = geocodeResult.formattedAddress || addressInput
      console.log('[POST /api/leads] Using geocoded address:', finalAddress)
    }

    const finalCity = userDataReliable ? (inferredCity || body.city) : (geocodeResult.city || body.city)
    const finalPostalCode = body.postalCode || geocodeResult.postalCode
    const finalNeighborhood = body.neighborhood || geocodeResult.neighborhood

    // Gestisci coordinate: se sono 0, 0 (fallback fittizio), salvale come null
    const finalLatitude = (geocodeResult.latitude && geocodeResult.latitude !== 0) ? geocodeResult.latitude : null
    const finalLongitude = (geocodeResult.longitude && geocodeResult.longitude !== 0) ? geocodeResult.longitude : null

    console.log('[POST /api/leads] Final address data:', {
      address: finalAddress,
      city: finalCity,
      postalCode: finalPostalCode,
      neighborhood: finalNeighborhood,
      coordinates: finalLatitude && finalLongitude ? `${finalLatitude}, ${finalLongitude}` : 'null (no coordinates)'
    })

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

    // Verifica limite valutazioni mensili
    const valuationLimit = await checkValuationLimit(agency.id)
    if (!valuationLimit.allowed) {
      console.log('[POST /api/leads] Valuation limit reached:', {
        agencyId: agency.id,
        current: valuationLimit.current,
        limit: valuationLimit.limit,
        extra: valuationLimit.extra
      })
      return NextResponse.json(
        {
          error: "Limite valutazioni mensili raggiunto",
          message: valuationLimit.message || "Hai esaurito le valutazioni disponibili per questo mese. Acquista valutazioni extra o passa a un piano superiore per continuare.",
          current: valuationLimit.current,
          limit: valuationLimit.limit,
          extra: valuationLimit.extra,
          upgradeRequired: true
        },
        { status: 403 }
      )
    }

    console.log('[POST /api/leads] Creating lead for agency:', { agencyId: agency.id, agencyName: agency.nome })

    // Log dettagliato dei dati PRIMA della creazione
    console.log('[POST /api/leads] Data that will be saved to database:', {
      telefono: phoneValidation.sanitized,
      telefonoType: typeof phoneValidation.sanitized,
      telefonoIsNull: phoneValidation.sanitized === null,
      telefonoIsEmptyString: phoneValidation.sanitized === "",
      telefonoValue: JSON.stringify(phoneValidation.sanitized),
      finalAddress,
      finalCity,
      finalPostalCode,
      finalNeighborhood,
      finalLatitude,
      finalLongitude,
      addressSource: userDataReliable ? 'USER_DATA' : 'GEOCODING'
    })

    // Create lead with related data in a transaction
    // Prisma nested create operations are automatically wrapped in a transaction
    // If any operation fails, all changes are rolled back
    const lead = await prisma.lead.create({
      data: {
        agenziaId: agency.id,
        nome: firstNameValidation.sanitized,
        cognome: lastNameValidation.sanitized,
        email: emailValidation.sanitized,
        telefono: phoneValidation.sanitized,
        property: {
          create: {
            indirizzo: finalAddress,
            citta: finalCity,
            quartiere: finalNeighborhood,
            cap: finalPostalCode,
            latitudine: finalLatitude,
            longitudine: finalLongitude,
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

    console.log('[POST /api/leads] ✅ Lead created successfully:', {
      leadId: lead.id,
      agencyId: agency.id,
      email: body.email,
      savedTelefono: lead.telefono,
      savedTelefonoType: typeof lead.telefono,
      savedTelefonoIsNull: lead.telefono === null,
      savedTelefonoValue: JSON.stringify(lead.telefono),
      timestamp: new Date().toISOString()
    })

    // CRITICAL CHECK: Verify phone was actually saved
    if (body.phone && !lead.telefono) {
      console.error('[POST /api/leads] 🚨 CRITICAL BUG: Phone was provided but NOT saved to database!', {
        providedPhone: body.phone,
        validatedPhone: phoneValidation.sanitized,
        savedPhone: lead.telefono
      })
    }

    // Incrementa il contatore delle valutazioni usate questo mese
    await incrementValuationCount(agency.id)
    console.log('[POST /api/leads] Valuation count incremented for agency:', { agencyId: agency.id })

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
