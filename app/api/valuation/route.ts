import { NextRequest, NextResponse } from "next/server"
import { calculateValuation, ValuationInput } from "@/lib/valuation"
import { geocodeAddress } from "@/lib/geocoding"
import { generateAIValuationAnalysis, PropertyValuationData } from "@/lib/openai"

// IMPORTANTE: Non usare Edge Runtime perché il sistema OMI legge dal filesystem (CSV)
// export const runtime = "edge"

// Extended input type per includere dati aggiuntivi per l'AI
interface ExtendedValuationInput extends ValuationInput {
  neighborhood?: string
  rooms?: number
  bathrooms?: number
  hasParking?: boolean
  outdoorSpace?: string
  heatingType?: string
  hasAirConditioning?: boolean
  energyClass?: string
  buildYear?: number
  useAI?: boolean // Flag per abilitare/disabilitare analisi AI
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExtendedValuationInput

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
        geocodeData = await geocodeAddress(body.address)
        if (geocodeData) {
          body.latitude = geocodeData.latitude
          body.longitude = geocodeData.longitude
          // Update city with geocoded city if more accurate
          if (geocodeData.city) {
            body.city = geocodeData.city
          }
          if (geocodeData.postalCode) {
            body.postalCode = geocodeData.postalCode
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

    // Se l'AI suggerisce un aggiustamento, applicalo alla valutazione
    let finalValuation = { ...baseValuation }
    if (aiAnalysis && aiAnalysis.adjustmentFactor !== 1.0) {
      const adjustment = aiAnalysis.adjustmentFactor
      finalValuation = {
        ...baseValuation,
        estimatedPrice: Math.round(baseValuation.estimatedPrice * adjustment),
        minPrice: Math.round(baseValuation.minPrice * adjustment),
        maxPrice: Math.round(baseValuation.maxPrice * adjustment),
        // Aggiorna la spiegazione con l'analisi AI
        explanation: aiAnalysis.analysis,
      }
    } else if (aiAnalysis) {
      // Anche senza aggiustamento, usa l'analisi AI come spiegazione
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
