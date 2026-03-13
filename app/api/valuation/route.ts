import { NextRequest, NextResponse } from "next/server"
import { calculateValuation, ValuationInput } from "@/lib/valuation"
import { geocodeAddress } from "@/lib/geocoding"
import { generateAIValuationAnalysis, PropertyValuationData } from "@/lib/openai"
import { inferCity } from "@/lib/postal-code"

// IMPORTANTE: Non usare Edge Runtime perché il sistema OMI legge dal filesystem (CSV)
// export const runtime = "edge"

// Extended input type per includere dati aggiuntivi non usati nel calcolo OMI
// (energyClass, buildYear, hasParking, outdoorSpace, heatingType sono già in ValuationInput)
interface ExtendedValuationInput extends ValuationInput {
  rooms?: number
  bathrooms?: number
  hasAirConditioning?: boolean
  useAI?: boolean // Flag per abilitare/disabilitare analisi AI
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExtendedValuationInput

    // MIGLIORA ESTRAZIONE CITTÀ: deduce città da CAP, indirizzo o quartiere
    const inferredCity = inferCity({
      city: body.city,
      postalCode: body.postalCode,
      address: body.address,
      neighborhood: body.neighborhood
    })

    // Usa la città dedotta se disponibile
    if (inferredCity) {
      console.log('[Valuation API] Città dedotta:', {
        original: body.city,
        inferred: inferredCity,
        postalCode: body.postalCode
      })
      body.city = inferredCity
    }

    // Validate required fields
    if (!body.address || !body.city || !body.propertyType || !body.surfaceSqm || !body.condition) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 }
      )
    }

    // Validate surface range
    if (body.surfaceSqm < 10 || body.surfaceSqm > 2000) {
      return NextResponse.json(
        { error: "Superficie deve essere tra 10 e 2000 m²" },
        { status: 400 }
      )
    }

    // Try to geocode if coordinates not provided
    let geocodeData = null
    if (!body.latitude || !body.longitude) {
      try {
        // IMPORTANTE: Passa la città al geocoding per evitare ambiguità
        // (es. "via Cammarata" esiste sia a Roma che a Siracusa)
        const fullAddress = `${body.address}, ${body.city}${body.postalCode ? ', ' + body.postalCode : ''}`
        geocodeData = await geocodeAddress(fullAddress)

        if (geocodeData) {
          body.latitude = geocodeData.latitude
          body.longitude = geocodeData.longitude

          // Aggiorna CAP dal geocoding se non era ancora disponibile
          if (!body.postalCode && geocodeData.postalCode) {
            body.postalCode = geocodeData.postalCode
          }

          // Dopo il geocoding rivaluta la città con tutti i dati aggiornati.
          // Il CAP è più specifico della città digitata dall'utente:
          // es. "Roma" con CAP 00071 (Pomezia) → deve usare OMI di Pomezia.
          // Questo previene valutazioni gonfiate/errate per comuni della provincia.
          const cityAfterGeocode = inferCity({
            city: body.city,
            postalCode: body.postalCode,
            address: body.address,
            neighborhood: body.neighborhood,
          })
          if (cityAfterGeocode && cityAfterGeocode !== body.city) {
            console.log('[Valuation API] Città corretta dopo geocoding via CAP:', {
              prima: body.city,
              dopo: cityAfterGeocode,
              cap: body.postalCode,
            })
            body.city = cityAfterGeocode
          }

          // Fallback finale: se inferCity non ha corretto (CAP non nel mapping),
          // usa la città restituta dal geocoding (basata su coordinate = precisa)
          if (geocodeData.city && geocodeData.city.toLowerCase() !== body.city.toLowerCase()) {
            console.log('[Valuation API] Città corretta via coordinate geocoding:', {
              prima: body.city,
              dopo: geocodeData.city,
            })
            body.city = geocodeData.city
          }
        }
      } catch (error) {
        console.warn("Geocoding failed, continuing without coordinates:", error)
      }
    }

    // Calculate base valuation (OMI + coefficients)
    const baseValuation = await calculateValuation(body)

    // Verifica che la valutazione base sia valida
    if (!baseValuation.estimatedPrice || baseValuation.estimatedPrice <= 0) {
      console.error("Invalid base valuation:", baseValuation)
      return NextResponse.json(
        { error: "Errore nel calcolo della valutazione base" },
        { status: 500 }
      )
    }

    // Prepara dati per l'analisi AI
    const aiInput: PropertyValuationData = {
      address: body.address,
      city: body.city,
      neighborhood: body.neighborhood,
      postalCode: body.postalCode,
      propertyType: body.propertyType,
      omiCategory: body.omiCategory,
      surfaceSqm: body.surfaceSqm,
      floor: body.floor,
      hasElevator: body.hasElevator,
      condition: body.condition,
      rooms: body.rooms,
      bathrooms: body.bathrooms,
      hasParking: body.hasParking,
      outdoorSpace: body.outdoorSpace,
      heatingType: body.heatingType,
      hasAirConditioning: body.hasAirConditioning,
      energyClass: body.energyClass,
      buildYear: body.buildYear,
      // Dati valutazione base
      baseOMIValue: baseValuation.baseOMIValue,
      estimatedPrice: baseValuation.estimatedPrice,
      minPrice: baseValuation.minPrice,
      maxPrice: baseValuation.maxPrice,
      floorCoefficient: baseValuation.floorCoefficient,
      conditionCoefficient: baseValuation.conditionCoefficient,
    }

    // Genera analisi AI (usa OpenAI se disponibile, altrimenti fallback)
    // Di default abilitata, può essere disabilitata con useAI: false
    const useAI = body.useAI !== false
    let aiAnalysis = null

    if (useAI) {
      try {
        aiAnalysis = await generateAIValuationAnalysis(aiInput)
      } catch (error) {
        console.warn("AI analysis failed, using base valuation only:", error)
      }
    }

    // L'AI fornisce solo la spiegazione testuale, NON modifica i prezzi.
    // I prezzi devono rimanere matematicamente coerenti:
    // prezzoStimato = superficie × valoreOmiBase × coefficientePiano × coefficienteStato
    let finalValuation = { ...baseValuation }
    if (aiAnalysis) {
      finalValuation.explanation = aiAnalysis.analysis
    }

    return NextResponse.json({
      success: true,
      valuation: finalValuation,
      geocoded: geocodeData !== null,
      ai: aiAnalysis ? {
        enabled: true,
        confidence: aiAnalysis.confidence,
        adjustmentFactor: aiAnalysis.adjustmentFactor,
      } : {
        enabled: false,
        reason: "AI analysis not available or disabled"
      }
    })
  } catch (error) {
    console.error("Valuation API error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
