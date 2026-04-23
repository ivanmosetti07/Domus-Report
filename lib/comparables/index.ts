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
// CROSS-CHECK OMI vs COMPARABLES (con "soft nudge" di mercato)
// ============================================================================

/**
 * Calcola il "nudge" di mercato da applicare al prezzo OMI.
 *
 * Policy (v2.2): quando gli annunci reali concordano su una divergenza
 * dall'OMI, applichiamo una correzione verso il mercato. La strength della
 * correzione scala con il sampleSize:
 *   - sampleSize < 2  → nessun nudge (troppo rumore)
 *   - sampleSize = 2  → factor dimezzato, cap ridotto (segnale debole)
 *   - sampleSize 3-4  → factor standard (policy v2.1)
 *   - sampleSize ≥ 5  → INVERSIONE PESO: 60% mercato / 40% OMI quando weak
 *
 * Per "strong agreement" (delta <10%) non applichiamo mai nudge, qualsiasi
 * sampleSize: OMI è già allineato.
 *
 * Esempi:
 *   - Vomero Cilea (2 annunci, +121% weak)  → nudge +0.20 × 121 = +24% → cap +12%
 *   - Bologna centro (5 annunci, +33% weak) → nudge +0.60 × 33 = +20% → cap +40% non scatta
 *   - Prati (3 annunci, +23% medium)        → nudge +0.25 × 23 = +5.7%
 *   - Centocelle (4 annunci, -9% strong)    → nudge = 0 (OMI già in linea)
 */
function computeMarketNudgePct(
  deltaPct: number,
  agreement: "strong" | "medium" | "weak",
  sampleSize: number
): number {
  if (sampleSize < 2) return 0
  if (agreement === "strong") return 0

  let factor: number
  let cap: number

  if (sampleSize >= 5) {
    // Inversione peso: con 5+ annunci concordi ci fidiamo del mercato.
    // weak: 60% verso mercato (cap 40%). medium: 45% verso mercato (cap 30%).
    factor = agreement === "weak" ? 0.60 : 0.45
    cap = agreement === "weak" ? 0.40 : 0.30
  } else if (sampleSize >= 3) {
    // Policy v2.1 invariata.
    factor = agreement === "weak" ? 0.40 : 0.25
    cap = agreement === "weak" ? 0.20 : 0.15
  } else {
    // sampleSize == 2: factor dimezzato, cap ridotto (segnale debole ma non zero).
    factor = agreement === "weak" ? 0.20 : 0.12
    cap = agreement === "weak" ? 0.12 : 0.08
  }

  const rawNudge = (deltaPct / 100) * factor
  return Math.max(-cap, Math.min(cap, rawNudge))
}

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

  const nudgePct = computeMarketNudgePct(deltaPct, agreement, comparablesResult.sampleSize)
  const suggestedPricePerSqm = Math.round(omiPricePerSqm * (1 + nudgePct))
  const shouldAdjust = nudgePct !== 0

  const warnings: string[] = []
  if (comparablesResult.sampleSize === 1) {
    warnings.push(
      `Un solo comparable disponibile (${Math.round(cmpMedian)}€/m²): segnale indicativo, nessuna correzione applicata.`
    )
  }
  if (agreement === "weak" && !shouldAdjust) {
    warnings.push(
      `OMI e mercato reale divergono del ${Math.round(absDelta)}% (OMI: ${Math.round(
        omiPricePerSqm
      )}€/m², mercato: ${Math.round(cmpMedian)}€/m²). Campione insufficiente per correzione automatica.`
    )
  }
  if (shouldAdjust) {
    const signLabel = nudgePct > 0 ? "+" : ""
    warnings.push(
      `Mercato reale a ${Math.round(cmpMedian)}€/m² vs OMI ${Math.round(
        omiPricePerSqm
      )}€/m² (delta ${deltaPct > 0 ? "+" : ""}${Math.round(deltaPct)}%, ${
        comparablesResult.sampleSize
      } annunci): applicata correzione ${signLabel}${(nudgePct * 100).toFixed(1)}% verso il mercato.`
    )
  }

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
// REFINEMENT (v2.1: "soft nudge" di mercato)
// ============================================================================

/**
 * v2.1 "Soft nudge refinement".
 *
 * Quando `crossCheck.shouldAdjust` è true (≥3 annunci concordi con divergenza
 * media/forte dall'OMI), applichiamo una correzione PARZIALE al prezzo verso
 * il mercato reale. Il nudge è cappato a ±15% (medium) o ±20% (weak) — mai
 * sostituisce il prezzo OMI, lo inclina verso il mercato.
 *
 * In caso contrario (0-2 annunci, oppure agreement strong), il prezzo resta
 * ancorato all'OMI (policy warning-only).
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
      code: crossCheck.shouldAdjust ? "MARKET_NUDGE_APPLIED" : "MARKET_CROSSCHECK",
      message: w,
      severity: crossCheck.agreement === "weak" ? "warning" : "info",
    })
  }

  // Confidence: boost se strong agreement, malus se weak e non abbiamo nudgato
  let newScore = valuation.confidenceScore
  if (crossCheck.agreement === "strong" && comparables.sampleSize >= 2) {
    newScore = Math.min(100, newScore + 10)
  } else if (crossCheck.agreement === "weak" && !crossCheck.shouldAdjust) {
    newScore = Math.max(0, newScore - 10)
  } else if (crossCheck.shouldAdjust) {
    // Nudge applicato: confidence resta com'è (non penalizziamo, abbiamo corretto)
    newScore = Math.min(100, newScore + 5)
  }
  const newLevel: ValuationResult["confidence"] =
    newScore >= 80 ? "alta" : newScore >= 60 ? "media" : "bassa"

  // Calcolo nudge da applicare al prezzo (0 se shouldAdjust=false)
  let nudgePct = 0
  if (crossCheck.shouldAdjust && crossCheck.omiPricePerSqm > 0) {
    nudgePct =
      (crossCheck.suggestedPricePerSqm - crossCheck.omiPricePerSqm) /
      crossCheck.omiPricePerSqm
  }

  const newEstimatedPrice = Math.round(valuation.estimatedPrice * (1 + nudgePct))
  const newMinPrice = Math.round(valuation.minPrice * (1 + nudgePct))
  const newMaxPrice = Math.round(valuation.maxPrice * (1 + nudgePct))
  const newPricePerSqm = Math.round(valuation.pricePerSqm * (1 + nudgePct))

  const nudgeLabel = nudgePct === 0
    ? ""
    : ` Nudge di mercato: ${nudgePct > 0 ? "+" : ""}${(nudgePct * 100).toFixed(1)}% (${
        comparables.sampleSize
      } annunci a ${Math.round(comparables.medianPricePerSqm)}€/m², agreement ${crossCheck.agreement}).`

  const suffix = nudgeLabel ||
    ` Mercato locale: ${comparables.sampleSize} annunci a ${Math.round(
      comparables.medianPricePerSqm
    )}€/m² (delta OMI ${crossCheck.deltaPct > 0 ? "+" : ""}${crossCheck.deltaPct}%, nessun nudge).`

  return {
    ...valuation,
    estimatedPrice: newEstimatedPrice,
    minPrice: newMinPrice,
    maxPrice: newMaxPrice,
    pricePerSqm: newPricePerSqm,
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
