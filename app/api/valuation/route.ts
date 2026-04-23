import { NextRequest, NextResponse } from "next/server"
import {
  calculateValuation,
  ValuationInput,
  ValuationResult,
} from "@/lib/valuation"
import { geocodeAddress } from "@/lib/geocoding"
import { generateAIValuationAnalysis, PropertyValuationData } from "@/lib/openai"
import { inferCity } from "@/lib/postal-code"
import {
  searchComparables,
  crossCheckWithOMI,
  isComparablesEnabled,
  applyComparablesRefinement,
  type ComparablesResult,
  type CrossCheckResult,
} from "@/lib/comparables"
import {
  normalizeCondition,
  normalizeOutdoorSpace,
  normalizeHeating,
  normalizePropertyType,
} from "@/lib/normalize-property"

// IMPORTANTE: Non usare Edge Runtime perché il sistema OMI legge dal filesystem (CSV)
// AI + Comparables in parallelo: maxDuration 90s copre tutti i casi peggiori.
export const maxDuration = 90

/**
 * Valuation API v2 — "Additivo Trasparente"
 *
 * Logica unica (niente più modalità hybrid/omi/ai_market):
 * 1. Geocoding → città corretta
 * 2. Motore additivo v2: baseOMI × sqm × (1 + totalAdj)
 * 3. AI analysis + Comparables in parallelo (entrambi con timeout)
 * 4. Comparables applicati come SOLO warning (se divergenza >25%)
 * 5. AI fornisce solo testo analitico
 *
 * Il campo `valuationMode` nel body è ancora accettato per retrocompatibilità
 * con la UI widget-config, ma viene ignorato lato server.
 */
interface ExtendedValuationInput extends ValuationInput {
  hasAirConditioning?: boolean
  useAI?: boolean
  useComparables?: boolean
  /** @deprecated Ignorato lato server in v2. Mantenuto per retrocompat UI. */
  valuationMode?: "hybrid" | "omi" | "ai_market"
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExtendedValuationInput

    // Normalizza enum-like in ingresso
    const normCondition = normalizeCondition(body.condition as string | undefined)
    if (normCondition) body.condition = normCondition
    const normType = normalizePropertyType(body.propertyType as string | undefined)
    if (normType) body.propertyType = normType
    const normOutdoor = normalizeOutdoorSpace(body.outdoorSpace as string | undefined)
    if (normOutdoor) body.outdoorSpace = normOutdoor
    const normHeating = normalizeHeating(body.heatingType as string | undefined)
    if (normHeating) body.heatingType = normHeating

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

    // Validazione
    if (!body.address || !body.city || !body.propertyType || !body.surfaceSqm || !body.condition) {
      return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 })
    }
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

    // Calcolo baseline OMI + additive adjustments
    const baseValuation = await calculateValuation(body)

    // Se OMI non trovato → errore esplicito (l'utente deve contattare un professionista)
    if (baseValuation.omiZoneMatch === "not_found" || baseValuation.estimatedPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          valuation: baseValuation,
          error:
            "Dati OMI non disponibili per questa zona. Contatta un professionista per una stima affidabile.",
          geocoded: geocodeData !== null,
        },
        { status: 200 }
      )
    }

    // Motore unificato: usiamo sempre AI + comparables quando disponibili.
    // I flag nel body restano solo per retrocompatibilità, ma sono ignorati.
    const useAI = true
    const useComparables = isComparablesEnabled()

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

    // Helper timeout: se una chiamata esterna supera il tempo max, risolve con null.
    // Così l'utente riceve sempre la valutazione OMI anche se AI o comparables sono lenti/giù.
    function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T | null> {
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          console.warn(`[Valuation] ${label} timeout (${ms}ms), skipping`)
          resolve(null)
        }, ms)
        p.then((v) => {
          clearTimeout(timer)
          resolve(v)
        }).catch((err) => {
          clearTimeout(timer)
          console.warn(`[Valuation] ${label} failed:`, err)
          resolve(null)
        })
      })
    }

    const aiPromise: Promise<Awaited<ReturnType<typeof generateAIValuationAnalysis>> | null> = useAI
      ? withTimeout(generateAIValuationAnalysis(aiInput), 20_000, "AI analysis")
      : Promise.resolve(null)

    const comparablesPromise: Promise<ComparablesResult | null> = useComparables
      ? withTimeout(
          searchComparables({
            city: body.city,
            neighborhood: body.neighborhood,
            postalCode: body.postalCode,
            propertyType: body.propertyType,
            surfaceSqm: body.surfaceSqm,
            condition: body.condition,
            rooms: body.rooms,
          }),
          55_000,
          "Comparables search"
        )
      : Promise.resolve(null)

    const [aiAnalysis, comparablesResult] = await Promise.all([aiPromise, comparablesPromise])

    // Motore v2: il prezzo è SEMPRE quello additivo (OMI-ancorato).
    // I comparables diventano solo warning / boost di confidence.
    let finalValuation: ValuationResult = { ...baseValuation }
    let crossCheck: CrossCheckResult | null = null

    if (comparablesResult && comparablesResult.sampleSize >= 1) {
      crossCheck = crossCheckWithOMI(baseValuation.pricePerSqm, comparablesResult)
      finalValuation = applyComparablesRefinement(
        finalValuation,
        comparablesResult,
        crossCheck,
        body.surfaceSqm
      )
    } else {
      // Nessun comparable → cap confidence a "media" se era "alta"
      if (finalValuation.confidence === "alta") {
        finalValuation = {
          ...finalValuation,
          confidence: "media",
          confidenceScore: Math.min(finalValuation.confidenceScore, 70),
          warnings: [
            ...finalValuation.warnings,
            {
              code: "NO_MARKET_VERIFICATION",
              message:
                "Nessun annuncio di mercato trovato per il cross-check: valutazione basata solo su OMI teorico.",
              severity: "warning",
            },
          ],
        }
      }
    }

    // AI fornisce solo testo analitico (NON modifica prezzi, che sono OMI-ancorati)
    if (aiAnalysis) {
      finalValuation.explanation = aiAnalysis.analysis + " " + (finalValuation.explanation || "")
    }

    return NextResponse.json({
      success: true,
      valuation: finalValuation,
      // Manteniamo questi campi per retrocompatibilità con il client, ma in v2
      // l'engine è sempre lo stesso (additivo + comparables come warning).
      valuationMode: "hybrid",
      effectiveValuationMode: "omi_plus_comparables_v2",
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
