/**
 * Property Valuation Engine — v2 "Additivo Trasparente"
 *
 * Formula (radicalmente semplificata rispetto al motore multi-coefficiente):
 *
 *   basePPS = OMI(zona, categoria)
 *   totalAdj = clamp(
 *     conditionAdj + floorAdj + energyAdj + extrasAdj,
 *     -0.30, +0.30
 *   )
 *   estimatedPrice = basePPS × surfaceSqm × (1 + totalAdj)
 *   minPrice = OMI_min × surfaceSqm × (1 + totalAdj)
 *   maxPrice = OMI_max × surfaceSqm × (1 + totalAdj)
 *
 * Ogni adjustment è una funzione pura che ritorna una frazione (es. -0.05 = -5%).
 * Additivo, non moltiplicativo: elimina la "compound explosion" che dava errori
 * del ±50% in corner case, senza perdere informazione rispetto al modello
 * moltiplicativo con 10 coefficienti a cascata.
 *
 * Il range min/max arriva direttamente dall'OMI (valoreMinMq/valoreMaxMq già
 * pubblicati) invece di essere ricostruito con percentuali arbitrarie.
 *
 * I comparables NON modificano più il prezzo: funzionano come sanity check
 * passivo e producono warning se divergono >25% dall'OMI.
 */

import { PropertyType, PropertyCondition, OccupancyStatus } from "@/types"
import { getOMIValueByZone, mapPropertyTypeToOMI } from "./omi-advanced"
import { resolveZoneFromAddress } from "./zone-mapper"
import { createLogger } from "./logger"

const logger = createLogger("valuation")

// ============================================================================
// TYPES
// ============================================================================

export interface ValuationInput {
  address: string
  city: string
  neighborhood?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  propertyType: PropertyType
  omiCategory?: string
  surfaceSqm: number
  floor?: number
  hasElevator?: boolean
  condition: PropertyCondition
  energyClass?: string
  buildYear?: number
  hasParking?: boolean
  outdoorSpace?: string
  heatingType?: string
  rooms?: number
  bathrooms?: number
  occupancyStatus?: OccupancyStatus | string
}

export interface ValuationWarning {
  code: string
  message: string
  severity: "info" | "warning" | "critical"
}

export interface ValuationResult {
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  baseOMIValue: number
  /** Valore moltiplicativo equivalente del piano (1 + floorAdj). Mantenuto per retrocompatibilità col DB. */
  floorCoefficient: number
  /** Valore moltiplicativo equivalente del totale adjustment (1 + totalAdj). Mantenuto per retrocompatibilità col DB. */
  conditionCoefficient: number
  /** Valore moltiplicativo del solo stato (1 + conditionAdj). */
  pureConditionCoefficient: number
  explanation: string
  confidence: "alta" | "media" | "bassa"
  confidenceScore: number
  warnings: ValuationWarning[]
  omiZoneMatch: "zone_specific" | "cap" | "city_average" | "cap_global" | "not_found"
  dataCompleteness: number
  pricePerSqm: number
}

// ============================================================================
// ADJUSTMENTS (additivi, ciascuno ritorna una frazione)
// ============================================================================

/** Stato immobile: -25% .. +15% */
export function conditionAdjustment(condition: PropertyCondition): number {
  const map: Record<PropertyCondition, number> = {
    [PropertyCondition.NEW]: 0.15,
    [PropertyCondition.RENOVATED]: 0.08,
    [PropertyCondition.PARTIALLY_RENOVATED]: 0.0,
    [PropertyCondition.GOOD]: 0.0,
    [PropertyCondition.HABITABLE_OLD]: -0.15,
    [PropertyCondition.TO_RENOVATE]: -0.25,
  }
  return map[condition] ?? 0
}

/** Piano: -8% .. +5%. Ville non hanno malus piano. */
export function floorAdjustment(
  floor?: number,
  hasElevator?: boolean,
  propertyType?: PropertyType
): number {
  if (propertyType === PropertyType.VILLA) return 0
  if (floor === undefined || floor === null) return 0

  let adj = 0
  if (floor === 0) adj = -0.05
  else if (floor === 1) adj = -0.02
  else if (floor === 2) adj = 0
  else if (floor === 3) adj = 0.02
  else if (floor >= 4) adj = 0.04

  // Attici senza ascensore sono penalizzanti, con ascensore sono premium
  if (floor > 1) {
    if (hasElevator) adj += 0.02
    else adj -= 0.04
  }

  return Math.max(-0.08, Math.min(0.05, adj))
}

/** Classe energetica: -5% .. +5%. Assorbe anche il buildYear (case nuove = classi alte). */
export function energyAdjustment(energyClass?: string, buildYear?: number): number {
  // Se abbiamo classe energetica, la usiamo come segnale primario
  if (energyClass && energyClass !== "UNKNOWN" && energyClass !== "NOT_AVAILABLE") {
    const c = energyClass.toUpperCase().trim()
    if (["A4", "A3", "A2", "A1", "A+", "A"].includes(c)) return 0.05
    if (c === "B") return 0.03
    if (c === "C") return 0.01
    if (c === "D") return 0
    if (c === "E") return -0.02
    if (c === "F") return -0.04
    if (c === "G") return -0.05
  }

  // Fallback su buildYear solo se energyClass assente
  if (buildYear && buildYear >= 1800 && buildYear <= new Date().getFullYear()) {
    if (buildYear >= 2015) return 0.03
    if (buildYear >= 2000) return 0.01
    if (buildYear >= 1980) return 0
    if (buildYear >= 1960) return -0.02
    if (buildYear >= 1930) return -0.04
    return -0.05 // pre-1930
  }

  return 0
}

/** Extras (giardino, parcheggio): 0% .. +8%. */
export function extrasAdjustment(hasParking?: boolean, outdoorSpace?: string): number {
  let adj = 0
  if (hasParking) adj += 0.03
  if (outdoorSpace) {
    const o = outdoorSpace
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
    if (o === "GARDEN" || o === "GIARDINO") adj += 0.05
    else if (o === "ROOF_TERRACE" || o === "ATTICO CON TERRAZZO" || o === "LASTRICO SOLARE") adj += 0.04
    else if (o === "TERRACE" || o === "TERRAZZO" || o === "TERRAZZA") adj += 0.03
    else if (o === "BALCONY" || o === "BALCONE" || o === "BALCONI") adj += 0.01
  }
  return Math.min(0.08, adj)
}

// ============================================================================
// LEGACY API (retrocompatibilità con route.ts, recalculate, test scripts)
// ============================================================================

/** Alias moltiplicativo del floorAdjustment. Ritorna 1 + adj. */
export function calculateFloorCoefficient(
  floor?: number,
  hasElevator?: boolean,
  propertyType?: PropertyType
): number {
  return parseFloat((1 + floorAdjustment(floor, hasElevator, propertyType)).toFixed(4))
}

/** Alias moltiplicativo del conditionAdjustment. Ritorna 1 + adj. */
export function calculateConditionCoefficient(condition: PropertyCondition): number {
  return parseFloat((1 + conditionAdjustment(condition)).toFixed(4))
}

// ============================================================================
// OMI CATEGORY SELECTION (deterministica, senza auto-promozione a signorili)
// ============================================================================

function selectOMICategory(
  propertyType: PropertyType,
  condition: PropertyCondition
): string | undefined {
  if (propertyType === PropertyType.VILLA) return "Ville e Villini"

  if (propertyType === PropertyType.APARTMENT || propertyType === PropertyType.ATTICO) {
    // Regola deterministica:
    // - TO_RENOVATE / HABITABLE_OLD → economico
    // - altrimenti → civili (default onesto)
    // Signorili solo se esplicitamente passato via input.omiCategory.
    if (
      condition === PropertyCondition.TO_RENOVATE ||
      condition === PropertyCondition.HABITABLE_OLD
    ) {
      return "Abitazioni di tipo economico"
    }
    return "Abitazioni civili"
  }
  return undefined
}

// ============================================================================
// DATA COMPLETENESS + CONFIDENCE
// ============================================================================

function calculateDataCompleteness(input: ValuationInput): number {
  const fields: Array<[boolean, number]> = [
    [!!input.city, 10],
    [!!input.address, 5],
    [!!input.postalCode, 5],
    [!!input.propertyType, 10],
    [!!input.surfaceSqm && input.surfaceSqm > 0, 20],
    [!!input.condition, 20],
    [input.floor !== undefined && input.floor !== null, 10],
    [input.hasElevator !== undefined, 3],
    [!!input.energyClass && input.energyClass !== "UNKNOWN", 8],
    [!!input.buildYear, 4],
    [input.hasParking !== undefined, 2],
    [!!input.outdoorSpace, 3],
  ]
  const score = fields.reduce((sum, [hasField, weight]) => sum + (hasField ? weight : 0), 0)
  return Math.min(100, score)
}

function calculateConfidence(
  completeness: number,
  zoneMatch: ValuationResult["omiZoneMatch"],
  omiVariancePct: number
): { level: "alta" | "media" | "bassa"; score: number } {
  let score = 100

  if (completeness < 50) score -= 30
  else if (completeness < 70) score -= 15
  else if (completeness < 85) score -= 5

  if (zoneMatch === "not_found") score -= 40
  else if (zoneMatch === "cap_global") score -= 20
  else if (zoneMatch === "city_average") score -= 15
  else if (zoneMatch === "cap") score -= 5

  if (omiVariancePct > 40) score -= 20
  else if (omiVariancePct > 25) score -= 10

  score = Math.max(0, Math.min(100, score))
  const level = score >= 80 ? "alta" : score >= 60 ? "media" : "bassa"
  return { level, score }
}

// ============================================================================
// SANITY CHECKS
// ============================================================================

function runSanityChecks(
  input: ValuationInput,
  estimatedPrice: number,
  pricePerSqm: number
): ValuationWarning[] {
  const warnings: ValuationWarning[] = []

  if (pricePerSqm < 500) {
    warnings.push({
      code: "PRICE_PER_SQM_LOW",
      message: `€/mq molto basso (${Math.round(pricePerSqm)}): verifica zona e dati inseriti.`,
      severity: "warning",
    })
  } else if (pricePerSqm > 15000) {
    warnings.push({
      code: "PRICE_PER_SQM_HIGH",
      message: `€/mq molto alto (${Math.round(pricePerSqm)}): plausibile solo per zone top.`,
      severity: "warning",
    })
  }

  if (input.propertyType === PropertyType.APARTMENT && input.surfaceSqm > 400) {
    warnings.push({
      code: "SURFACE_UNUSUAL",
      message: `Superficie di ${input.surfaceSqm}m² insolita per un appartamento.`,
      severity: "info",
    })
  }
  if (input.propertyType === PropertyType.VILLA && input.surfaceSqm < 80) {
    warnings.push({
      code: "SURFACE_UNUSUAL",
      message: `Superficie di ${input.surfaceSqm}m² piccola per una villa.`,
      severity: "info",
    })
  }

  if (estimatedPrice < 30000) {
    warnings.push({
      code: "PRICE_VERY_LOW",
      message: "Prezzo stimato molto basso: potrebbe richiedere revisione manuale.",
      severity: "critical",
    })
  } else if (estimatedPrice > 5_000_000) {
    warnings.push({
      code: "PRICE_VERY_HIGH",
      message: "Prezzo stimato molto alto: valutazione a bassa confidenza per immobili di lusso.",
      severity: "warning",
    })
  }

  return warnings
}

// ============================================================================
// EXPLANATION (testo trasparente riga per riga)
// ============================================================================

export function generateValuationExplanation(
  input: ValuationInput,
  result: ValuationResult,
  breakdown: { cond: number; floor: number; energy: number; extras: number; total: number }
): string {
  const parts: string[] = []
  parts.push(
    `Valutazione OMI per ${input.city}: ${result.baseOMIValue}€/m² × ${input.surfaceSqm}m².`
  )

  const fmt = (x: number) => `${x > 0 ? "+" : ""}${(x * 100).toFixed(1)}%`

  if (breakdown.cond !== 0) {
    parts.push(`Stato "${input.condition}": ${fmt(breakdown.cond)}.`)
  }
  if (breakdown.floor !== 0 && input.propertyType !== PropertyType.VILLA) {
    const floorText = input.floor === 0 ? "piano terra" : `${input.floor}° piano`
    const elevatorText = input.hasElevator ? "con ascensore" : "senza ascensore"
    parts.push(`${floorText} ${elevatorText}: ${fmt(breakdown.floor)}.`)
  }
  if (breakdown.energy !== 0) {
    const label = input.energyClass || `anno ${input.buildYear}`
    parts.push(`Efficienza ${label}: ${fmt(breakdown.energy)}.`)
  }
  if (breakdown.extras !== 0) {
    parts.push(`Extras (parcheggio/spazio esterno): ${fmt(breakdown.extras)}.`)
  }

  if (breakdown.total !== 0) {
    parts.push(`Aggiustamento totale: ${fmt(breakdown.total)}.`)
  }

  return parts.join(" ")
}

// ============================================================================
// CACHE
// ============================================================================

interface CacheEntry {
  result: ValuationResult
  timestamp: number
}

const valuationCache = new Map<string, CacheEntry>()
const CACHE_TTL = 15 * 60 * 1000

function getCacheKey(input: ValuationInput): string {
  return [
    input.city,
    input.address ?? "",
    input.neighborhood ?? "",
    input.postalCode ?? "",
    input.omiCategory ?? "",
    input.propertyType,
    input.surfaceSqm,
    input.floor ?? 0,
    input.hasElevator ?? false,
    input.condition,
    input.energyClass ?? "",
    input.buildYear ?? 0,
    input.hasParking ?? false,
    input.outdoorSpace ?? "",
  ].join("|")
}

function getCachedValuation(input: ValuationInput): ValuationResult | null {
  const key = getCacheKey(input)
  const cached = valuationCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    valuationCache.delete(key)
    return null
  }
  return cached.result
}

function setCachedValuation(input: ValuationInput, result: ValuationResult): void {
  const key = getCacheKey(input)
  valuationCache.set(key, { result, timestamp: Date.now() })
  if (valuationCache.size > 1000) {
    const now = Date.now()
    for (const [cacheKey, entry] of valuationCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) valuationCache.delete(cacheKey)
    }
  }
}

// ============================================================================
// MAIN CALCULATION
// ============================================================================

export function calculateValuationLocal(input: ValuationInput): ValuationResult {
  const tipoImmobile = mapPropertyTypeToOMI(input.propertyType)
  const warnings: ValuationWarning[] = []

  const autoCategory = selectOMICategory(input.propertyType, input.condition)
  const omiCategory = input.omiCategory || autoCategory

  // Zone mapper: tenta di mappare neighborhood/address a codice OMI noto
  const searchText = [input.neighborhood, input.address].filter(Boolean).join(" ")
  const resolvedZone =
    resolveZoneFromAddress(input.city, searchText, input.postalCode) ||
    input.neighborhood ||
    undefined

  // OMI lookup: 2 tentativi (con categoria → senza categoria)
  let omiAdvanced = getOMIValueByZone(
    input.city,
    resolvedZone,
    input.postalCode,
    tipoImmobile,
    omiCategory
  )
  if (!omiAdvanced && omiCategory) {
    logger.info("OMI category not found, retrying without category", {
      city: input.city,
      omiCategory,
    })
    omiAdvanced = getOMIValueByZone(input.city, resolvedZone, input.postalCode, tipoImmobile)
  }

  // Calcolo adjustments additivi (sempre, anche se OMI non trovato, per il breakdown)
  const condAdj = conditionAdjustment(input.condition)
  const floorAdj = floorAdjustment(input.floor, input.hasElevator, input.propertyType)
  const energyAdj = energyAdjustment(input.energyClass, input.buildYear)
  const extrasAdj = extrasAdjustment(input.hasParking, input.outdoorSpace)

  const rawTotal = condAdj + floorAdj + energyAdj + extrasAdj
  const totalAdj = Math.max(-0.30, Math.min(0.30, rawTotal))

  if (rawTotal !== totalAdj) {
    warnings.push({
      code: "TOTAL_ADJ_CAPPED",
      message: `Aggiustamento totale limitato (raw: ${(rawTotal * 100).toFixed(1)}% → ±30%).`,
      severity: "info",
    })
  }

  const breakdown = {
    cond: condAdj,
    floor: floorAdj,
    energy: energyAdj,
    extras: extrasAdj,
    total: totalAdj,
  }

  // Coefficienti moltiplicativi equivalenti per retrocompatibilità DB
  const floorCoefficient = parseFloat((1 + floorAdj).toFixed(4))
  const pureConditionCoefficient = parseFloat((1 + condAdj).toFixed(4))
  const conditionCoefficient = parseFloat((1 + totalAdj).toFixed(4))

  // Se OMI non trovato → risultato vuoto marcato esplicitamente
  if (!omiAdvanced) {
    logger.warn("OMI data not found", {
      city: input.city,
      neighborhood: input.neighborhood,
      postalCode: input.postalCode,
      tipoImmobile,
      omiCategory,
    })
    warnings.push({
      code: "OMI_NOT_FOUND",
      message:
        "Dati OMI non disponibili per questa zona. Valutazione a bassa attendibilità: contattare un professionista.",
      severity: "critical",
    })
    const completeness = calculateDataCompleteness(input)
    const confidence = calculateConfidence(completeness, "not_found", 0)
    return {
      minPrice: 0,
      maxPrice: 0,
      estimatedPrice: 0,
      baseOMIValue: 0,
      floorCoefficient,
      conditionCoefficient,
      pureConditionCoefficient,
      explanation:
        "Dati OMI non disponibili per la zona specificata. Impossibile fornire una stima affidabile.",
      confidence: confidence.level,
      confidenceScore: confidence.score,
      warnings,
      omiZoneMatch: "not_found",
      dataCompleteness: completeness,
      pricePerSqm: 0,
    }
  }

  // OMI disponibile → calcolo prezzo
  const baseOMIValue = omiAdvanced.valoreMedioMq
  const minOMI = omiAdvanced.valoreMinMq
  const maxOMI = omiAdvanced.valoreMaxMq

  let zoneMatch: ValuationResult["omiZoneMatch"] = "zone_specific"
  if (omiAdvanced.zona === "Media città") zoneMatch = "city_average"
  else if (omiAdvanced.zona === "Media CAP") zoneMatch = "cap_global"
  else if (omiAdvanced.fonte?.includes("CAP") && resolvedZone === undefined) zoneMatch = "cap"

  const multiplier = 1 + totalAdj
  const estimatedPrice = Math.round(baseOMIValue * input.surfaceSqm * multiplier)
  const minPrice = Math.round(minOMI * input.surfaceSqm * multiplier)
  const maxPrice = Math.round(maxOMI * input.surfaceSqm * multiplier)
  const pricePerSqm = Math.round(estimatedPrice / input.surfaceSqm)

  const omiVariancePct =
    baseOMIValue > 0 ? ((maxOMI - minOMI) / baseOMIValue) * 100 : 0

  // Confidence
  const completeness = calculateDataCompleteness(input)
  const confidence = calculateConfidence(completeness, zoneMatch, omiVariancePct)

  // Warning se zona generica
  if (zoneMatch === "city_average" || zoneMatch === "cap_global") {
    warnings.push({
      code: "GENERIC_ZONE",
      message: `Zona OMI poco specifica (${omiAdvanced.zona}): stima meno precisa.`,
      severity: "warning",
    })
  }

  // Sanity checks
  warnings.push(...runSanityChecks(input, estimatedPrice, pricePerSqm))

  logger.info("Valuation calculated (v2 additive)", {
    city: input.city,
    zona: omiAdvanced.zona,
    baseOMIValue,
    rangeOMI: `${minOMI}-${maxOMI}`,
    totalAdj: (totalAdj * 100).toFixed(1) + "%",
    estimatedPrice,
    confidence: confidence.level,
    completeness,
  })

  const result: ValuationResult = {
    minPrice,
    maxPrice,
    estimatedPrice,
    baseOMIValue,
    floorCoefficient,
    conditionCoefficient,
    pureConditionCoefficient,
    explanation: "",
    confidence: confidence.level,
    confidenceScore: confidence.score,
    warnings,
    omiZoneMatch: zoneMatch,
    dataCompleteness: completeness,
    pricePerSqm,
  }
  result.explanation = generateValuationExplanation(input, result, breakdown)
  return result
}

export async function calculateValuation(input: ValuationInput): Promise<ValuationResult> {
  const cached = getCachedValuation(input)
  if (cached) {
    logger.debug("Returning cached valuation", {
      city: input.city,
      type: input.propertyType,
    })
    return cached
  }
  logger.info("Calculating valuation (v2)", {
    city: input.city,
    type: input.propertyType,
  })
  const result = calculateValuationLocal(input)
  setCachedValuation(input, result)
  return result
}
