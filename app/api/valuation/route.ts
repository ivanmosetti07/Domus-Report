import { NextRequest, NextResponse } from "next/server"
import { calculateValuation, ValuationInput, ValuationResult } from "@/lib/valuation"
import { geocodeAddress } from "@/lib/geocoding"
import { generateAIValuationAnalysis, PropertyValuationData } from "@/lib/openai"
import { inferCity } from "@/lib/postal-code"
import {
  searchComparables,
  crossCheckWithOMI,
  isComparablesEnabled,
  type ComparablesResult,
  type CrossCheckResult,
} from "@/lib/comparables"

// IMPORTANTE: Non usare Edge Runtime perché il sistema OMI legge dal filesystem (CSV)
// export const runtime = "edge"

interface ExtendedValuationInput extends ValuationInput {
  hasAirConditioning?: boolean
  useAI?: boolean
  useComparables?: boolean // Abilita cross-check con comparables reali
}

/**
 * Applica il cross-check con i comparables reali: ricalcola min/max/estimated
 * con una media pesata tra OMI e il mercato reale.
 *
 * I comparables riflettono mediamente immobili di qualità "Buono-Ristrutturato",
 * quindi adattiamo il risultato alla SOLA condition pura (rispetto alla baseline
 * di mercato 1.05 = media Buono-Ristrutturato). Gli altri fattori (energy, anno,
 * extras, occupancy, rooms/bathrooms) sono già embedded nei prezzi di annuncio,
 * quindi NON vanno moltiplicati di nuovo (bug_008).
 *
 * Inoltre il floorCoefficient va applicato sul €/mq dei comparables perché
 * i comparables non stratificano per piano (bug_006).
 */
function applyComparablesRefinement(
  valuation: ValuationResult,
  comparables: ComparablesResult,
  crossCheck: CrossCheckResult,
  surfaceSqm: number
): ValuationResult {
  if (!crossCheck.shouldAdjust || comparables.sampleSize < 2) return valuation

  // Media mercato "standard": assumiamo pureConditionCoefficient ~1.05 (Buono→Ristrutturato)
  const marketQualityBaseline = 1.05
  // bug_008: usare la condition PURA, non il composite (che include energy/year/extras/...)
  const thisQuality = valuation.pureConditionCoefficient || 1.0
  const qualityAdjustment = thisQuality / marketQualityBaseline

  // bug_006: i comparables non stratificano per piano → applicare floorCoefficient
  const floorCoef = valuation.floorCoefficient || 1.0
  const combinedAdjustment = qualityAdjustment * floorCoef

  // Prezzo suggerito (€/mq) dal cross-check, aggiustato per la qualità e il piano
  const adjustedPPS = Math.round(crossCheck.suggestedPricePerSqm * combinedAdjustment)

  const refinedEstimated = Math.round(adjustedPPS * surfaceSqm)

  // Range derivato dai min/max dei comparables (più realistico dell'OMI teorico)
  const refinedMin = Math.round(comparables.minPricePerSqm * combinedAdjustment * surfaceSqm)
  const refinedMax = Math.round(comparables.maxPricePerSqm * combinedAdjustment * surfaceSqm)

  // Warnings + eventuale flag di confidence downgrade
  const updatedWarnings = [...valuation.warnings]
  for (const w of crossCheck.warnings) {
    updatedWarnings.push({
      code: "COMPARABLES_DIVERGE",
      message: w,
      severity: crossCheck.agreement === "weak" ? "warning" : "info",
    })
  }

  // Ri-calcolo confidence: se agreement è strong → bonus, se weak → malus
  let newScore = valuation.confidenceScore
  if (crossCheck.agreement === "strong") newScore = Math.min(100, newScore + 10)
  else if (crossCheck.agreement === "weak") newScore = Math.max(0, newScore - 15)
  const newLevel: ValuationResult["confidence"] =
    newScore >= 80 ? "alta" : newScore >= 60 ? "media" : "bassa"

  return {
    ...valuation,
    estimatedPrice: refinedEstimated,
    minPrice: Math.min(refinedMin, refinedEstimated),
    maxPrice: Math.max(refinedMax, refinedEstimated),
    pricePerSqm: adjustedPPS,
    confidence: newLevel,
    confidenceScore: newScore,
    warnings: updatedWarnings,
    explanation:
      valuation.explanation +
      ` Raffinato con ${comparables.sampleSize} annunci reali: mercato a ${Math.round(
        comparables.medianPricePerSqm
      )}€/m² (delta OMI ${crossCheck.deltaPct > 0 ? "+" : ""}${crossCheck.deltaPct}%).`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExtendedValuationInput

    // Deduce città da CAP/indirizzo
    const inferredCity = inferCity({
      city: body.city,
      postalCode: body.postalCode,
      address: body.address,
      neighborhood: body.neighborhood,
    })
    if (inferredCity) {
      console.log("[Valuation API] Città dedotta:", {
        original: body.city,
        inferred: inferredCity,
        postalCode: body.postalCode,
      })
      body.city = inferredCity
    }

    // Validate required fields
    if (!body.address || !body.city || !body.propertyType || !body.surfaceSqm || !body.condition) {
      return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 })
    }

    // Validate surface range
    if (body.surfaceSqm < 10 || body.surfaceSqm > 2000) {
      return NextResponse.json(
        { error: "Superficie deve essere tra 10 e 2000 m²" },
        { status: 400 }
      )
    }

    // Geocoding
    let geocodeData = null
    if (!body.latitude || !body.longitude) {
      try {
        const fullAddress = `${body.address}, ${body.city}${body.postalCode ? ", " + body.postalCode : ""}`
        geocodeData = await geocodeAddress(fullAddress)
        if (geocodeData) {
          body.latitude = geocodeData.latitude
          body.longitude = geocodeData.longitude
          if (!body.postalCode && geocodeData.postalCode) {
            body.postalCode = geocodeData.postalCode
          }
          const cityAfterGeocode = inferCity({
            city: body.city,
            postalCode: body.postalCode,
            address: body.address,
            neighborhood: body.neighborhood,
          })
          if (cityAfterGeocode && cityAfterGeocode !== body.city) {
            console.log("[Valuation API] Città corretta dopo geocoding via CAP:", {
              prima: body.city,
              dopo: cityAfterGeocode,
              cap: body.postalCode,
            })
            body.city = cityAfterGeocode
          }
          if (geocodeData.city && geocodeData.city.toLowerCase() !== body.city.toLowerCase()) {
            console.log("[Valuation API] Città corretta via coordinate geocoding:", {
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

    // Se OMI non trovato, ritorna risultato "low-confidence" esplicito invece di errore
    if (baseValuation.omiZoneMatch === "not_found" || baseValuation.estimatedPrice <= 0) {
      return NextResponse.json({
        success: false,
        valuation: baseValuation,
        error: "Dati OMI non disponibili per questa zona. Contatta un professionista per una stima affidabile.",
        geocoded: geocodeData !== null,
      }, { status: 200 }) // 200 perché ritorniamo comunque dati strutturati
    }

    // AI analysis + Comparables in parallelo (due chiamate lente)
    const useAI = body.useAI !== false
    const useComparables = body.useComparables !== false && isComparablesEnabled()

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
      baseOMIValue: baseValuation.baseOMIValue,
      estimatedPrice: baseValuation.estimatedPrice,
      minPrice: baseValuation.minPrice,
      maxPrice: baseValuation.maxPrice,
      floorCoefficient: baseValuation.floorCoefficient,
      conditionCoefficient: baseValuation.conditionCoefficient,
    }

    const aiPromise = useAI
      ? generateAIValuationAnalysis(aiInput).catch((err) => {
          console.warn("AI analysis failed:", err)
          return null
        })
      : Promise.resolve(null)

    const comparablesPromise = useComparables
      ? searchComparables({
          city: body.city,
          neighborhood: body.neighborhood,
          postalCode: body.postalCode,
          propertyType: body.propertyType,
          surfaceSqm: body.surfaceSqm,
          condition: body.condition,
          rooms: body.rooms,
        }).catch((err) => {
          console.warn("Comparables search failed:", err)
          return null
        })
      : Promise.resolve(null)

    const [aiAnalysis, comparablesResult] = await Promise.all([aiPromise, comparablesPromise])

    // Applica cross-check se abbiamo comparables validi
    let finalValuation = { ...baseValuation }
    let crossCheck: CrossCheckResult | null = null

    if (comparablesResult && comparablesResult.sampleSize >= 2) {
      crossCheck = crossCheckWithOMI(baseValuation.pricePerSqm, comparablesResult)
      finalValuation = applyComparablesRefinement(
        finalValuation,
        comparablesResult,
        crossCheck,
        body.surfaceSqm
      )
    }

    // AI fornisce solo testo analitico (NON modifica i prezzi, che sono data-driven)
    if (aiAnalysis) {
      finalValuation.explanation = aiAnalysis.analysis + " " + (finalValuation.explanation || "")
    }

    return NextResponse.json({
      success: true,
      valuation: finalValuation,
      geocoded: geocodeData !== null,
      ai: aiAnalysis
        ? { enabled: true, confidence: aiAnalysis.confidence }
        : { enabled: false, reason: "AI analysis not available or disabled" },
      comparables: comparablesResult
        ? {
            enabled: true,
            provider: comparablesResult.provider,
            sampleSize: comparablesResult.sampleSize,
            medianPricePerSqm: comparablesResult.medianPricePerSqm,
            avgPricePerSqm: comparablesResult.avgPricePerSqm,
            minPricePerSqm: comparablesResult.minPricePerSqm,
            maxPricePerSqm: comparablesResult.maxPricePerSqm,
            items: comparablesResult.comparables,
            crossCheck: crossCheck || null,
            warnings: comparablesResult.warnings,
            executionTimeMs: comparablesResult.executionTimeMs,
          }
        : { enabled: false, reason: useComparables ? "No results" : "Disabled" },
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
