/**
 * Comparables Module - Facade (v2 "Warning-only")
 *
 * Nel motore v2 additivo, i comparables NON modificano più il prezzo.
 * Funzionano come sanity check passivo: se il mercato reale diverge dall'OMI
 * oltre il 25%, viene emesso un warning visibile nel report. Il prezzo resta
 * ancorato all'OMI ufficiale (difendibile legalmente).
 *
 * Provider chain: OpenAI web search. Cache 7 giorni.
 *
 * API esposte:
 * - searchComparables(query): wrapper con cache + chain provider
 * - crossCheckWithOMI(omiPPS, cmp): confronta OMI vs mercato, produce delta e agreement
 * - applyComparablesRefinement(valuation, cmp, crossCheck): aggiunge SOLO warning, NON modifica prezzi
 * - buildValuationFromComparables(...): deprecato (modalità ai_market rimossa)
 *   → manteniamo la firma per retrocompatibilità con `app/api/valuation/route.ts`
 *     ma ritorna la valuation invariata con un warning.
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
// PROVIDER SELECTION — OpenAI web search only
// ============================================================================

let cachedProviders: ComparablesProvider[] | undefined = undefined

function getProviders(): ComparablesProvider[] {
  if (cachedProviders !== undefined) return cachedProviders
  const providers: ComparablesProvider[] = []

  const openai = new OpenAIComparablesProvider()
  if (openai.isAvailable()) {
    providers.push(openai)
    logger.info("OpenAI web search provider available")
  }

  if (providers.length === 0) {
    logger.info("No comparables provider available")
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
// MAIN SEARCH (with cache + provider chain)
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

  let lastResult: ComparablesResult | null = null
  for (const provider of providers) {
    try {
      const result = await provider.searchComparables({ maxResults: 8, ...query })
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

  return lastResult
}

// ============================================================================
// CROSS-CHECK OMI vs COMPARABLES (diagnostico, non modifica prezzi)
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

  const warnings: string[] = []
  if (comparablesResult.sampleSize === 1) {
    warnings.push(
      `Un solo comparable disponibile (${Math.round(cmpMedian)}€/m²): segnale indicativo.`
    )
  }
  if (agreement === "weak") {
    warnings.push(
      `OMI e mercato reale divergono del ${Math.round(absDelta)}% (OMI: ${Math.round(
        omiPricePerSqm
      )}€/m², mercato: ${Math.round(
        cmpMedian
      )}€/m²). La valutazione resta basata su OMI ufficiale; considera il mercato come riferimento aggiuntivo.`
    )
  }

  return {
    omiPricePerSqm,
    comparablesMedianPricePerSqm: cmpMedian,
    deltaPct: Math.round(deltaPct * 10) / 10,
    agreement,
    // Nel v2 "suggested" resta informativo ma non viene applicato:
    // lasciamo il peso 100% OMI per coerenza con la nuova policy.
    suggestedPricePerSqm: omiPricePerSqm,
    shouldAdjust: false,
    warnings,
  }
}

// ============================================================================
// REFINEMENT (v2: solo warning, non modifica prezzi)
// ============================================================================

/**
 * v2 "Warning-only refinement".
 *
 * Il motore additivo tiene il prezzo ancorato all'OMI ufficiale. I comparables
 * servono solo come sanity check: se il mercato diverge dall'OMI oltre il 25%,
 * aggiungiamo un warning visibile nel report ma NON modifichiamo min/max/
 * estimated. Questo rende il prezzo stabile, trasparente e difendibile.
 *
 * La firma resta invariata rispetto a v1 per retrocompatibilità.
 */
export function applyComparablesRefinement(
  valuation: ValuationResult,
  comparables: ComparablesResult,
  crossCheck: CrossCheckResult,
  _surfaceSqm: number
): ValuationResult {
  if (comparables.sampleSize < 1) return valuation

  const updatedWarnings = [...valuation.warnings]
  for (const w of crossCheck.warnings) {
    updatedWarnings.push({
      code: "MARKET_CROSSCHECK",
      message: w,
      severity: crossCheck.agreement === "weak" ? "warning" : "info",
    })
  }

  // Confidence: boost se strong agreement, malus se weak (ma prezzo invariato)
  let newScore = valuation.confidenceScore
  if (crossCheck.agreement === "strong" && comparables.sampleSize >= 2) {
    newScore = Math.min(100, newScore + 10)
  } else if (crossCheck.agreement === "weak") {
    newScore = Math.max(0, newScore - 10)
  }
  const newLevel: ValuationResult["confidence"] =
    newScore >= 80 ? "alta" : newScore >= 60 ? "media" : "bassa"

  const suffix = ` Mercato locale: ${comparables.sampleSize} annunci a ${Math.round(
    comparables.medianPricePerSqm
  )}€/m² (delta OMI ${crossCheck.deltaPct > 0 ? "+" : ""}${crossCheck.deltaPct}%).`

  return {
    ...valuation,
    confidence: newLevel,
    confidenceScore: newScore,
    warnings: updatedWarnings,
    explanation: valuation.explanation + suffix,
  }
}

// ============================================================================
// DEPRECATED: buildValuationFromComparables (ai_market mode rimossa)
// ============================================================================

/**
 * @deprecated La modalità `ai_market` è stata rimossa in v2. Questa funzione
 * resta per retrocompatibilità con chiamanti esistenti. Ritorna una valutazione
 * basata solo sui comparables (senza OMI), con confidence bassa e warning.
 *
 * Non dovrebbe più essere chiamata dal nuovo route.ts. Verrà rimossa
 * completamente quando saranno ripuliti i riferimenti nella UI.
 */
export function buildValuationFromComparables(
  comparables: ComparablesResult,
  surfaceSqm: number,
  floorCoefficient: number,
  pureConditionCoefficient: number,
  conditionCompositeCoefficient: number
): ValuationResult {
  const medianPPS = comparables.medianPricePerSqm
  const estimatedPrice = Math.round(medianPPS * surfaceSqm)
  const minPrice =
    comparables.sampleSize >= 2
      ? Math.round(comparables.minPricePerSqm * surfaceSqm)
      : Math.round(estimatedPrice * 0.9)
  const maxPrice =
    comparables.sampleSize >= 2
      ? Math.round(comparables.maxPricePerSqm * surfaceSqm)
      : Math.round(estimatedPrice * 1.1)

  let confidenceScore = 50
  if (comparables.sampleSize >= 5) confidenceScore = 70
  else if (comparables.sampleSize >= 3) confidenceScore = 60
  else if (comparables.sampleSize >= 2) confidenceScore = 55
  else confidenceScore = 40
  const level: ValuationResult["confidence"] =
    confidenceScore >= 80 ? "alta" : confidenceScore >= 60 ? "media" : "bassa"

  return {
    minPrice: Math.min(minPrice, estimatedPrice),
    maxPrice: Math.max(maxPrice, estimatedPrice),
    estimatedPrice,
    baseOMIValue: medianPPS,
    floorCoefficient,
    conditionCoefficient: conditionCompositeCoefficient,
    pureConditionCoefficient,
    explanation: `Valutazione deprecata basata solo su ${comparables.sampleSize} annunci (modalità ai_market rimossa). Usa OMI per risultati affidabili.`,
    confidence: level,
    confidenceScore,
    warnings: [
      {
        code: "DEPRECATED_AI_MARKET_MODE",
        message:
          "Modalità 'ai_market' deprecata in v2. Il prezzo qui è derivato solo dagli annunci, senza ancoraggio OMI.",
        severity: "warning",
      },
    ],
    omiZoneMatch: "not_found",
    dataCompleteness: 100,
    pricePerSqm: Math.round(estimatedPrice / surfaceSqm),
  }
}
