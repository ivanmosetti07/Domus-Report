/**
 * Comparables Module - Facade
 *
 * Provider chain:
 * 1. Brave Search + gpt-4o-mini parsing (primary, veloce e affidabile)
 * 2. OpenAI web_search_preview (fallback, più lento)
 *
 * Espone:
 * - searchComparables(query): wrapper con cache + chain provider
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
import { BraveComparablesProvider } from "./brave"
import { createLogger } from "../logger"

const logger = createLogger("comparables")

export type { Comparable, ComparablesQuery, ComparablesResult, CrossCheckResult } from "./types"

// ============================================================================
// PROVIDER SELECTION — chain Brave → OpenAI
// ============================================================================

let cachedProviders: ComparablesProvider[] | undefined = undefined

function getProviders(): ComparablesProvider[] {
  if (cachedProviders !== undefined) return cachedProviders
  const providers: ComparablesProvider[] = []

  const brave = new BraveComparablesProvider()
  if (brave.isAvailable()) {
    providers.push(brave)
    logger.info("Brave provider available (primary)")
  }

  const openai = new OpenAIComparablesProvider()
  if (openai.isAvailable()) {
    providers.push(openai)
    logger.info("OpenAI provider available (fallback)")
  }

  if (providers.length === 0) {
    logger.info("No comparables provider available (missing BRAVE_API_KEY and OPENAI_API_KEY)")
  }
  cachedProviders = providers
  return providers
}

export function getComparablesProvider(): ComparablesProvider | null {
  const providers = getProviders()
  return providers[0] ?? null
}

export function isComparablesEnabled(): boolean {
  if (process.env.COMPARABLES_ENABLED === "false") return false
  return getProviders().length > 0
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
  const providers = getProviders()
  if (providers.length === 0) return null

  const key = getCacheKey(query)
  const cached = comparablesCache.get(key)
  if (cached && Date.now() - cached.timestamp < COMPARABLES_CACHE_TTL) {
    logger.info("Comparables cache hit", { key, provider: cached.result.provider })
    return cached.result
  }

  // Prova i provider in ordine: primary → fallback.
  // Ritorna il primo risultato con sampleSize >= 1. Se il primary non trova
  // nulla, prova il fallback (potrebbe avere più copertura per zone rare).
  let lastResult: ComparablesResult | null = null
  for (const provider of providers) {
    try {
      const result = await provider.searchComparables({
        maxResults: 8,
        ...query,
      })
      lastResult = result
      logger.info("Provider result", {
        provider: provider.name,
        sampleSize: result.sampleSize,
        elapsedMs: result.executionTimeMs,
      })
      if (result.sampleSize > 0) {
        comparablesCache.set(key, { result, timestamp: Date.now() })
        return result
      }
    } catch (error) {
      logger.warn("Provider failed", { provider: provider.name, error: String(error) })
    }
  }

  // Tutti i provider hanno ritornato 0 o hanno fallito — ritorna l'ultimo
  // risultato (vuoto) per coerenza con il chiamante (che gestisce sampleSize=0).
  return lastResult
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

  // Peso del mercato reale: più annunci → più peso.
  // Inoltre quando l'agreement è "weak" (OMI e mercato divergono >25%)
  // diamo più peso ai comparables perché OMI è teorico e spesso sfasato
  // rispetto al mercato reale. I comparables sono in tempo reale.
  let cmpWeight =
    comparablesResult.sampleSize >= 5 ? 0.6 :
    comparablesResult.sampleSize >= 3 ? 0.5 :
    comparablesResult.sampleSize >= 2 ? 0.3 :
    0.2
  if (agreement === "weak" && comparablesResult.sampleSize >= 5) {
    cmpWeight = 0.85 // disagreement forte con buon campione → quasi tutto mercato
  } else if (agreement === "weak" && comparablesResult.sampleSize >= 3) {
    cmpWeight = 0.75
  }
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

// ============================================================================
// AI MARKET MODE: costruisce ValuationResult solo da comparables (no OMI)
// ============================================================================

/**
 * Costruisce una ValuationResult basata esclusivamente sui comparables reali
 * recuperati via AI (modalità `ai_market`). Non usa dati OMI.
 *
 * Applica i coefficienti di piano e condition pura (costi di ristrutturazione)
 * al prezzo mediano dei comparables, che già riflettono il mercato reale di
 * immobili mediamente in stato "Buono-Ristrutturato".
 *
 * ATTENZIONE: affidabilità inferiore all'ibrido. Con pochi annunci (<3) o
 * annunci fuori zona target, il risultato può essere fuorviante. Pensato per
 * test / override premium, non come default.
 */
export function buildValuationFromComparables(
  comparables: ComparablesResult,
  surfaceSqm: number,
  floorCoefficient: number,
  pureConditionCoefficient: number,
  conditionCompositeCoefficient: number
): ValuationResult {
  const marketQualityBaseline = 1.05
  const qualityAdjustment = pureConditionCoefficient / marketQualityBaseline
  const combinedAdjustment = qualityAdjustment * floorCoefficient

  const medianPPS = comparables.medianPricePerSqm
  const adjustedPPS = Math.round(medianPPS * combinedAdjustment)
  const estimatedPrice = Math.round(adjustedPPS * surfaceSqm)

  // Range: usa min/max comparables se >=2, altrimenti ±10% dalla stima
  let minPrice: number
  let maxPrice: number
  if (comparables.sampleSize >= 2) {
    minPrice = Math.round(comparables.minPricePerSqm * combinedAdjustment * surfaceSqm)
    maxPrice = Math.round(comparables.maxPricePerSqm * combinedAdjustment * surfaceSqm)
  } else {
    minPrice = Math.round(estimatedPrice * 0.9)
    maxPrice = Math.round(estimatedPrice * 1.1)
  }

  // Confidence basata su sampleSize
  let confidenceScore = 50
  if (comparables.sampleSize >= 5) confidenceScore = 80
  else if (comparables.sampleSize >= 3) confidenceScore = 70
  else if (comparables.sampleSize >= 2) confidenceScore = 60
  else confidenceScore = 45
  const level: ValuationResult["confidence"] =
    confidenceScore >= 80 ? "alta" : confidenceScore >= 60 ? "media" : "bassa"

  const warnings: ValuationResult["warnings"] = [
    {
      code: "AI_MARKET_MODE",
      message: `Valutazione basata solo su ${comparables.sampleSize} annunci reali (modalità sperimentale, no OMI).`,
      severity: "info",
    },
  ]
  if (comparables.sampleSize < 3) {
    warnings.push({
      code: "FEW_COMPARABLES",
      message: `Campione di comparables limitato (${comparables.sampleSize}): stima a bassa confidenza.`,
      severity: "warning",
    })
  }

  return {
    minPrice: Math.min(minPrice, estimatedPrice),
    maxPrice: Math.max(maxPrice, estimatedPrice),
    estimatedPrice,
    baseOMIValue: medianPPS, // proxy: mediana comparables (anche se non OMI)
    floorCoefficient,
    conditionCoefficient: conditionCompositeCoefficient,
    pureConditionCoefficient,
    explanation: `Valutazione basata esclusivamente sul mercato reale: ${comparables.sampleSize} annunci analizzati, €/m² mediano ${Math.round(medianPPS)}. OMI non utilizzato (modalità ai_market).`,
    confidence: level,
    confidenceScore,
    warnings,
    omiZoneMatch: "not_found", // indica che non è OMI-based
    dataCompleteness: 100,
    pricePerSqm: adjustedPPS,
  }
}
