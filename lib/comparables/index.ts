/**
 * Comparables Module - Facade
 *
 * Espone:
 * - getComparablesProvider(): ritorna il provider OpenAI se disponibile
 * - searchComparables(query): wrapper con cache in-memory
 * - crossCheckWithOMI(omiPPS, comparablesPPS): confronta OMI vs mercato reale
 */

import type {
  ComparablesProvider,
  ComparablesQuery,
  ComparablesResult,
  CrossCheckResult,
} from "./types"
import type { ValuationResult } from "../valuation"
import { OpenAIComparablesProvider } from "./openai"
import { createLogger } from "../logger"

const logger = createLogger("comparables")

export type { Comparable, ComparablesQuery, ComparablesResult, CrossCheckResult } from "./types"

// ============================================================================
// PROVIDER SELECTION (OpenAI only)
// ============================================================================

let cachedProvider: ComparablesProvider | null | undefined = undefined

export function getComparablesProvider(): ComparablesProvider | null {
  if (cachedProvider !== undefined) return cachedProvider

  const openai = new OpenAIComparablesProvider()
  if (openai.isAvailable()) {
    cachedProvider = openai
    return openai
  }

  logger.info("No comparables provider available (missing OPENAI_API_KEY)")
  cachedProvider = null
  return null
}

export function isComparablesEnabled(): boolean {
  if (process.env.COMPARABLES_ENABLED === "false") return false
  return getComparablesProvider() !== null
}

// ============================================================================
// IN-MEMORY CACHE (7 days TTL)
// ============================================================================

interface CacheEntry {
  result: ComparablesResult
  timestamp: number
}

const COMPARABLES_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 giorni
const comparablesCache = new Map<string, CacheEntry>()

function getCacheKey(query: ComparablesQuery): string {
  const sqmBucket = bucketSqm(query.surfaceSqm)
  return [
    (query.city || "").toLowerCase(),
    (query.neighborhood || "").toLowerCase(),
    query.postalCode || "",
    query.propertyType,
    sqmBucket,
    query.rooms || "",
  ].join("|")
}

function bucketSqm(sqm: number): string {
  if (sqm < 50) return "<50"
  if (sqm < 80) return "50-80"
  if (sqm < 120) return "80-120"
  if (sqm < 180) return "120-180"
  if (sqm < 300) return "180-300"
  return ">300"
}

// ============================================================================
// MAIN SEARCH (with cache)
// ============================================================================

export async function searchComparables(
  query: ComparablesQuery
): Promise<ComparablesResult | null> {
  const provider = getComparablesProvider()
  if (!provider) return null

  const key = getCacheKey(query)
  const cached = comparablesCache.get(key)
  if (cached && Date.now() - cached.timestamp < COMPARABLES_CACHE_TTL) {
    logger.info("Comparables cache hit", { key })
    return cached.result
  }

  try {
    const result = await provider.searchComparables({
      maxResults: 8,
      ...query,
    })
    if (result.sampleSize > 0) {
      comparablesCache.set(key, { result, timestamp: Date.now() })
    }
    return result
  } catch (error) {
    logger.error("Comparables search failed", { error: String(error) })
    return null
  }
}

// ============================================================================
// CROSS-CHECK OMI vs COMPARABLES
// ============================================================================

export function crossCheckWithOMI(
  omiPricePerSqm: number,
  comparablesResult: ComparablesResult
): CrossCheckResult {
  const cmpMedian = comparablesResult.medianPricePerSqm

  if (!omiPricePerSqm || !cmpMedian || comparablesResult.sampleSize < 1) {
    return {
      omiPricePerSqm,
      comparablesMedianPricePerSqm: cmpMedian,
      deltaPct: 0,
      agreement: "weak",
      suggestedPricePerSqm: omiPricePerSqm,
      shouldAdjust: false,
      warnings: ["Nessun comparable disponibile per cross-check."],
    }
  }

  const deltaPct = ((cmpMedian - omiPricePerSqm) / omiPricePerSqm) * 100
  const absDelta = Math.abs(deltaPct)

  let agreement: "strong" | "medium" | "weak"
  if (absDelta < 10) agreement = "strong"
  else if (absDelta < 25) agreement = "medium"
  else agreement = "weak"

  // Peso del mercato reale: più annunci → più peso
  // sampleSize=1: peso 0.2 (indicativo ma non dominante)
  // sampleSize=2: peso 0.3
  // sampleSize=3-4: peso 0.5
  // sampleSize>=5: peso 0.6
  const cmpWeight =
    comparablesResult.sampleSize >= 5 ? 0.6 :
    comparablesResult.sampleSize >= 3 ? 0.5 :
    comparablesResult.sampleSize >= 2 ? 0.3 :
    0.2
  const omiWeight = 1 - cmpWeight
  const suggestedPricePerSqm = Math.round(
    omiPricePerSqm * omiWeight + cmpMedian * cmpWeight
  )

  const warnings: string[] = []
  if (comparablesResult.sampleSize === 1) {
    warnings.push(
      `Un solo comparable disponibile: valore di mercato indicativo (peso ${cmpWeight * 100}%).`
    )
  }
  if (agreement === "weak") {
    warnings.push(
      `OMI e mercato reale divergono del ${Math.round(absDelta)}% (OMI: ${Math.round(omiPricePerSqm)}€/m², mercato: ${Math.round(cmpMedian)}€/m²). Valutazione a bassa confidenza.`
    )
  }

  // Con sampleSize=1 aggiustiamo solo se delta significativo per evitare swing da outlier singolo
  const shouldAdjust =
    comparablesResult.sampleSize >= 2
      ? agreement !== "strong"
      : agreement !== "strong" && absDelta >= 15

  return {
    omiPricePerSqm,
    comparablesMedianPricePerSqm: cmpMedian,
    deltaPct: Math.round(deltaPct * 10) / 10,
    agreement,
    suggestedPricePerSqm,
    shouldAdjust,
    warnings,
  }
}

// ============================================================================
// REFINEMENT: applica il cross-check a un ValuationResult
// ============================================================================

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
export function applyComparablesRefinement(
  valuation: ValuationResult,
  comparables: ComparablesResult,
  crossCheck: CrossCheckResult,
  surfaceSqm: number
): ValuationResult {
  if (!crossCheck.shouldAdjust || comparables.sampleSize < 1) return valuation

  const marketQualityBaseline = 1.05
  const thisQuality = valuation.pureConditionCoefficient || 1.0
  const qualityAdjustment = thisQuality / marketQualityBaseline
  const floorCoef = valuation.floorCoefficient || 1.0
  const combinedAdjustment = qualityAdjustment * floorCoef

  const adjustedPPS = Math.round(crossCheck.suggestedPricePerSqm * combinedAdjustment)
  const refinedEstimated = Math.round(adjustedPPS * surfaceSqm)

  // Con un solo annuncio il range derivato dai comparables collassa (min=max).
  // Usiamo comunque un range stretto ±10% dalla stima centrale per coerenza.
  let refinedMin: number
  let refinedMax: number
  if (comparables.sampleSize < 2) {
    refinedMin = Math.round(refinedEstimated * 0.9)
    refinedMax = Math.round(refinedEstimated * 1.1)
  } else {
    refinedMin = Math.round(
      comparables.minPricePerSqm * combinedAdjustment * surfaceSqm
    )
    refinedMax = Math.round(
      comparables.maxPricePerSqm * combinedAdjustment * surfaceSqm
    )
  }

  const updatedWarnings = [...valuation.warnings]
  for (const w of crossCheck.warnings) {
    updatedWarnings.push({
      code: "COMPARABLES_DIVERGE",
      message: w,
      severity: crossCheck.agreement === "weak" ? "warning" : "info",
    })
  }

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
