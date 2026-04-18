/**
 * Property Valuation Engine
 * Sistema di calcolo valutazioni immobiliari basato su dati OMI
 * Integrato con sistema OMI avanzato per valutazioni precise e granulari
 */

import { PropertyType, PropertyCondition, OccupancyStatus } from "@/types"
import { getOMIValueByZone, mapPropertyTypeToOMI } from "./omi-advanced"
import { resolveZoneFromAddress } from "./zone-mapper"
import { createLogger } from "./logger"

const logger = createLogger('valuation')

// In-memory cache for valuation results (15 minutes TTL)
interface CacheEntry {
  result: ValuationResult
  timestamp: number
}

const valuationCache = new Map<string, CacheEntry>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

function getCacheKey(input: ValuationInput): string {
  return [
    input.city,
    input.address ?? '',
    input.neighborhood ?? '',
    input.postalCode ?? '',
    input.omiCategory ?? '',
    input.propertyType,
    input.surfaceSqm,
    input.floor ?? 0,
    input.hasElevator ?? false,
    input.condition,
    input.energyClass ?? '',
    input.buildYear ?? 0,
    input.hasParking ?? false,
    input.outdoorSpace ?? '',
    input.heatingType ?? '',
    input.rooms ?? 0,
    input.bathrooms ?? 0,
    input.occupancyStatus ?? '',
  ].join('|')
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
  // Coefficienti qualità
  energyClass?: string
  buildYear?: number
  hasParking?: boolean
  outdoorSpace?: string
  heatingType?: string
  // Nuovi campi usati nel calcolo (Sprint 2)
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
  floorCoefficient: number
  conditionCoefficient: number // Coefficiente qualità complessivo (composite, clamped)
  pureConditionCoefficient: number // Solo calculateConditionCoefficient(condition), per cross-check con comparables
  explanation: string
  // Nuovi campi (Sprint 1+2)
  confidence: "alta" | "media" | "bassa"
  confidenceScore: number // 0-100
  warnings: ValuationWarning[]
  omiZoneMatch: "zone_specific" | "cap" | "city_average" | "cap_global" | "not_found"
  dataCompleteness: number // 0-100, % di campi forniti
  pricePerSqm: number
}

// ============================================================================
// FLOOR COEFFICIENT
// ============================================================================

export function calculateFloorCoefficient(
  floor?: number,
  hasElevator?: boolean,
  propertyType?: PropertyType
): number {
  // Sprint 1.4: Ville non hanno malus piano (il valore è nella categoria OMI)
  if (propertyType === PropertyType.VILLA) {
    return 1.0
  }

  if (floor === undefined || floor === null) {
    return 1.0
  }

  let coefficient = 1.0

  if (floor === 0) coefficient = 0.92
  else if (floor === 1) coefficient = 0.97
  else if (floor === 2) coefficient = 1.0
  else if (floor === 3) coefficient = 1.03
  else if (floor >= 4) coefficient = 1.05

  if (floor > 1) {
    if (hasElevator) coefficient += 0.03
    else coefficient -= 0.05
  }

  return Math.max(0.85, Math.min(1.15, coefficient))
}

// ============================================================================
// CONDITION COEFFICIENT (Sprint 2.3: stati intermedi)
// ============================================================================

export function calculateConditionCoefficient(
  condition: PropertyCondition
): number {
  // Coefficienti calibrati su feedback di valutazioni reali di mercato.
  // Per immobili "da ristrutturare" il mercato applica uno sconto molto piu'
  // aggressivo rispetto ai valori OMI (costo ristrutturazione totale ~1000€/mq
  // + rischio imprevisti + malus commerciale su immobili datati).
  //
  // Calibrazione: lead iva@live.it (attico Alessandrino 180mq "parzialmente
  // da ristrutturare", target mercato €540-590k = ~3000-3280€/mq).
  const coefficients: Record<PropertyCondition, number> = {
    [PropertyCondition.NEW]: 1.25,
    [PropertyCondition.RENOVATED]: 1.12,
    // "Parzialmente ristrutturato" in Italia tipicamente = cucina/bagni rifatti
    // ma impianti elettrici, finestre e pavimenti vecchi → no premium reale
    [PropertyCondition.PARTIALLY_RENOVATED]: 1.00,
    [PropertyCondition.GOOD]: 1.0,
    [PropertyCondition.HABITABLE_OLD]: 0.74,
    [PropertyCondition.TO_RENOVATE]: 0.64,
  }
  return coefficients[condition] ?? 1.0
}

// ============================================================================
// ENERGY / BUILD YEAR / EXTRAS
// ============================================================================

export function calculateEnergyClassCoefficient(energyClass?: string): number {
  if (!energyClass || energyClass === 'UNKNOWN' || energyClass === 'NOT_AVAILABLE') {
    return 1.0
  }
  const normalized = energyClass.toUpperCase().trim()
  if (normalized === 'A4' || normalized === 'A3') return 1.10
  if (['A2', 'A1', 'A+', 'A'].includes(normalized)) return 1.07
  if (normalized === 'B') return 1.04
  if (normalized === 'C') return 1.02
  if (normalized === 'D') return 1.00
  if (normalized === 'E') return 0.97
  if (normalized === 'F') return 0.94
  if (normalized === 'G') return 0.90
  return 1.0
}

export function calculateBuildYearCoefficient(buildYear?: number): number {
  if (!buildYear || buildYear < 1800 || buildYear > new Date().getFullYear()) {
    return 1.0
  }
  if (buildYear >= 2015) return 1.05
  if (buildYear >= 2000) return 1.02
  if (buildYear >= 1980) return 1.00
  if (buildYear >= 1960) return 0.95
  // Immobili pre-1960: malus reale nel mercato italiano -12% (impianti
  // vecchi, assenza isolamento, spesso richiedono ristrutturazione
  // complessiva). 0.94 era troppo tenue.
  if (buildYear >= 1930) return 0.88
  // Pre-1930: storici, ma anche molto obsoleti (a meno di vincolo artistico)
  return 0.82
}

export function calculateExtrasCoefficient(
  hasParking?: boolean,
  outdoorSpace?: string,
  heatingType?: string
): number {
  let adjustment = 0
  if (hasParking) adjustment += 0.04
  if (outdoorSpace) {
    // Normalizza rimuovendo accenti e convertendo a uppercase (supporta IT + EN)
    const outdoor = outdoorSpace
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
    if (outdoor === 'GARDEN' || outdoor === 'GIARDINO') adjustment += 0.07
    else if (outdoor === 'ROOF_TERRACE' || outdoor === 'ATTICO CON TERRAZZO' || outdoor === 'LASTRICO SOLARE') adjustment += 0.06
    else if (outdoor === 'TERRACE' || outdoor === 'TERRAZZO' || outdoor === 'TERRAZZA') adjustment += 0.05
    else if (outdoor === 'BALCONY' || outdoor === 'BALCONE' || outdoor === 'BALCONI') adjustment += 0.02
  }
  if (heatingType) {
    const heating = heatingType.toUpperCase().trim()
    if (heating === 'NONE' || heating === 'ABSENT' || heating === 'ASSENTE' || heating === 'NESSUNO') adjustment -= 0.04
  }
  return Math.max(0.90, Math.min(1.20, 1 + adjustment))
}

// ============================================================================
// NEW COEFFICIENTS (Sprint 2.1)
// ============================================================================

/**
 * Coefficiente rooms/superficie
 * Monolocali frazionati (sqm/rooms < 20) → malus
 * Loft con stanze grandi (sqm/rooms > 40) → leggero bonus
 */
export function calculateRoomsCoefficient(rooms?: number, surfaceSqm?: number): number {
  if (!rooms || !surfaceSqm || rooms <= 0 || surfaceSqm <= 0) return 1.0
  const sqmPerRoom = surfaceSqm / rooms
  if (sqmPerRoom < 18) return 0.95 // stanze troppo piccole
  if (sqmPerRoom < 22) return 0.98
  if (sqmPerRoom > 45) return 1.03 // stanze ampie
  return 1.0
}

/**
 * Coefficiente bagni: 2° bagno +3%, 3°+ bagno +5% cumulato
 */
export function calculateBathroomsCoefficient(bathrooms?: number): number {
  if (!bathrooms || bathrooms <= 1) return 1.0
  if (bathrooms === 2) return 1.03
  return 1.05 // 3+ bagni
}

/**
 * Coefficiente occupazione: immobile occupato vale meno (mercato investitori)
 */
export function calculateOccupancyCoefficient(status?: OccupancyStatus | string): number {
  if (!status) return 1.0
  const s = String(status).toUpperCase()
  if (s === "OCCUPATO" || s === "OCCUPIED") return 0.82 // -18%
  return 1.0 // Libero / non specificato
}

// ============================================================================
// OMI CATEGORY SELECTION
// ============================================================================

function selectOMICategory(
  propertyType: PropertyType,
  condition: PropertyCondition,
  energyClass?: string,
  buildYear?: number
): string | undefined {
  if (propertyType === PropertyType.VILLA) return 'Ville e Villini'

  if (propertyType === PropertyType.APARTMENT || propertyType === PropertyType.ATTICO) {
    // "Abitazioni signorili" è una categoria OMI che dipende dalla
    // classe del BUILDING (zona centrale + prestigio costruttivo), non
    // dalle caratteristiche dell'immobile singolo. Un classe A costruito
    // in periferia NON è "signorile". Senza un segnale di zona (che il
    // motore non ha nel contesto), NON promuoviamo a signorili: serve
    // essere specificato esplicitamente via `omiCategory`.
    //
    // Classificazione conservativa:
    // - TO_RENOVATE / HABITABLE_OLD / buildYear < 1960 → "economico"
    // - altrimenti → "civili" (fascia centrale, coprire la maggior parte
    //   degli immobili italiani)
    const isLowQuality =
      condition === PropertyCondition.TO_RENOVATE ||
      condition === PropertyCondition.HABITABLE_OLD ||
      (buildYear !== undefined && buildYear < 1960)

    if (isLowQuality) return 'Abitazioni di tipo economico'
    return 'Abitazioni civili'
  }
  return undefined
}

// ============================================================================
// DATA COMPLETENESS + CONFIDENCE (Sprint 2.2)
// ============================================================================

function calculateDataCompleteness(input: ValuationInput): number {
  const fields: Array<[boolean, number]> = [
    [!!input.city, 10],
    [!!input.address, 5],
    [!!input.postalCode, 5],
    [!!input.propertyType, 10],
    [!!input.surfaceSqm && input.surfaceSqm > 0, 15],
    [!!input.condition, 15],
    [input.floor !== undefined && input.floor !== null, 8],
    [input.hasElevator !== undefined, 2],
    [!!input.energyClass && input.energyClass !== 'UNKNOWN', 8],
    [!!input.buildYear, 6],
    [input.hasParking !== undefined, 3],
    [!!input.outdoorSpace, 3],
    [!!input.heatingType, 3],
    [!!input.rooms, 4],
    [!!input.bathrooms, 3],
  ]
  const score = fields.reduce((sum, [hasField, weight]) => sum + (hasField ? weight : 0), 0)
  return Math.min(100, score)
}

function calculateConfidence(
  input: ValuationInput,
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

  if (omiVariancePct > 40) score -= 35
  else if (omiVariancePct > 25) score -= 25

  if (!input.condition) score -= 10
  if (!input.energyClass || input.energyClass === 'UNKNOWN') score -= 5

  score = Math.max(0, Math.min(100, score))

  const level = score >= 80 ? "alta" : score >= 60 ? "media" : "bassa"
  return { level, score }
}

// ============================================================================
// EXPLANATION
// ============================================================================

export function generateValuationExplanation(
  input: ValuationInput,
  result: ValuationResult
): string {
  const parts: string[] = []
  parts.push(`Valutazione basata su dati OMI per ${input.city} (${result.baseOMIValue}€/m²).`)
  parts.push(`Superficie: ${input.surfaceSqm}m².`)

  if (input.floor !== undefined && input.floor !== null && input.propertyType !== PropertyType.VILLA) {
    const floorText = input.floor === 0 ? "piano terra" : `${input.floor}° piano`
    const elevatorText = input.hasElevator ? "con ascensore" : "senza ascensore"
    parts.push(`Immobile al ${floorText} ${elevatorText}.`)
  }

  parts.push(`Stato: ${input.condition}.`)

  if (result.floorCoefficient !== 1.0) {
    const percentage = ((result.floorCoefficient - 1) * 100).toFixed(0)
    const sign = result.floorCoefficient > 1 ? "+" : ""
    parts.push(`Coefficiente piano: ${sign}${percentage}%.`)
  }
  if (result.conditionCoefficient !== 1.0) {
    const percentage = ((result.conditionCoefficient - 1) * 100).toFixed(0)
    const sign = result.conditionCoefficient > 1 ? "+" : ""
    parts.push(`Coefficiente qualità complessivo: ${sign}${percentage}%.`)
  }

  const energyCoef = calculateEnergyClassCoefficient(input.energyClass)
  if (energyCoef !== 1.0 && input.energyClass) {
    const percentage = ((energyCoef - 1) * 100).toFixed(0)
    const sign = energyCoef > 1 ? "+" : ""
    parts.push(`Classe energetica ${input.energyClass}: ${sign}${percentage}%.`)
  }

  const buildYearCoef = calculateBuildYearCoefficient(input.buildYear)
  if (buildYearCoef !== 1.0 && input.buildYear) {
    const percentage = ((buildYearCoef - 1) * 100).toFixed(0)
    const sign = buildYearCoef > 1 ? "+" : ""
    parts.push(`Anno costruzione ${input.buildYear}: ${sign}${percentage}%.`)
  }

  return parts.join(" ")
}

// ============================================================================
// SANITY CHECKS (Sprint 1.5)
// ============================================================================

function runSanityChecks(
  input: ValuationInput,
  estimatedPrice: number,
  pricePerSqm: number
): ValuationWarning[] {
  const warnings: ValuationWarning[] = []

  // €/mq vs range nazionale plausibile (500€/mq periferie — 15000€/mq Milano centro)
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

  // Superficie fuori norma per tipo
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
      message: `Superficie di ${input.surfaceSqm}m² piccola per una villa: verifica tipologia.`,
      severity: "info",
    })
  }

  // Prezzo totale fuori range
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

  // Rapporto camere/superficie
  if (input.rooms && input.surfaceSqm) {
    const sqmPerRoom = input.surfaceSqm / input.rooms
    if (sqmPerRoom < 12) {
      warnings.push({
        code: "ROOMS_TOO_MANY",
        message: `${input.rooms} camere in ${input.surfaceSqm}m² sono tante: verifica dati.`,
        severity: "info",
      })
    }
  }

  return warnings
}

// ============================================================================
// MAIN CALCULATION
// ============================================================================

export function calculateValuationLocal(input: ValuationInput): ValuationResult {
  const tipoImmobile = mapPropertyTypeToOMI(input.propertyType)
  const warnings: ValuationWarning[] = []

  const autoCategory = selectOMICategory(
    input.propertyType,
    input.condition,
    input.energyClass,
    input.buildYear
  )
  const omiCategory = input.omiCategory || autoCategory

  // Sprint 3: zone mapper intelligente.
  // Priorità: prima proviamo a mappare neighborhood+address verso un codice
  // OMI noto (es. "Degli Eroi" → "B14"). Se il mapper non riconosce, ricade
  // sul neighborhood raw (che però non matcha nei lookup CSV: serve per
  // traccia log). Questo evita che nomi come "Degli Eroi" o "Tor San Lorenzo
  // Lido" bypassino il mapper e vengano usati come codice zona inesistente.
  const searchText = [input.neighborhood, input.address].filter(Boolean).join(" ")
  const resolvedZone =
    resolveZoneFromAddress(input.city, searchText, input.postalCode) ||
    input.neighborhood ||
    undefined

  // Tentativo 1: con categoria specifica + zona risolta
  let omiAdvanced = getOMIValueByZone(
    input.city,
    resolvedZone,
    input.postalCode,
    tipoImmobile,
    omiCategory
  )

  // Tentativo 2: senza categoria (media città per tipo immobile)
  if (!omiAdvanced && omiCategory) {
    logger.info("OMI category not found, retrying without category", {
      city: input.city, omiCategory
    })
    omiAdvanced = getOMIValueByZone(
      input.city,
      resolvedZone,
      input.postalCode,
      tipoImmobile
    )
  }

  // Coefficienti
  const floorCoefficient = calculateFloorCoefficient(input.floor, input.hasElevator, input.propertyType)
  const conditionCoefficient = calculateConditionCoefficient(input.condition)
  const energyClassCoefficient = calculateEnergyClassCoefficient(input.energyClass)
  const buildYearCoefficient = calculateBuildYearCoefficient(input.buildYear)
  const extrasCoefficient = calculateExtrasCoefficient(
    input.hasParking,
    input.outdoorSpace,
    input.heatingType
  )
  const roomsCoefficient = calculateRoomsCoefficient(input.rooms, input.surfaceSqm)
  const bathroomsCoefficient = calculateBathroomsCoefficient(input.bathrooms)
  const occupancyCoefficient = calculateOccupancyCoefficient(input.occupancyStatus)

  // Sprint 1.3: cap globale sul qualityCoefficient per evitare compound explosion
  const rawQuality =
    conditionCoefficient *
    energyClassCoefficient *
    buildYearCoefficient *
    extrasCoefficient *
    roomsCoefficient *
    bathroomsCoefficient *
    occupancyCoefficient

  const qualityCoefficient = parseFloat(
    Math.max(0.55, Math.min(1.40, rawQuality)).toFixed(4)
  )

  if (rawQuality !== qualityCoefficient) {
    warnings.push({
      code: "QUALITY_COEF_CAPPED",
      message: `Coefficiente qualità limitato (raw: ${rawQuality.toFixed(3)} → clamp: ${qualityCoefficient}).`,
      severity: "info",
    })
  }

  // Sprint 1.1: se OMI non trovato, ritorna risultato marcato esplicitamente
  // come "not_found" invece di valori hardcoded obsoleti
  if (!omiAdvanced) {
    logger.warn("OMI data not found for this location", {
      city: input.city,
      neighborhood: input.neighborhood,
      postalCode: input.postalCode,
      tipoImmobile,
      omiCategory,
    })

    warnings.push({
      code: "OMI_NOT_FOUND",
      message: "Dati OMI non disponibili per questa zona. Valutazione a bassa attendibilità: contattare un professionista.",
      severity: "critical",
    })

    const completeness = calculateDataCompleteness(input)
    const confidence = calculateConfidence(input, completeness, "not_found", 0)

    // Returniamo valori null-like ma strutturati (upstream deve controllare confidence/warnings)
    // bug_018: usa confidence.level dal helper invece di hardcoded "bassa" per coerenza
    // col confidenceScore numerico (stesse soglie usate dall'UI).
    const result: ValuationResult = {
      minPrice: 0,
      maxPrice: 0,
      estimatedPrice: 0,
      baseOMIValue: 0,
      floorCoefficient,
      conditionCoefficient: qualityCoefficient,
      pureConditionCoefficient: conditionCoefficient,
      explanation: "Dati OMI non disponibili per la zona specificata. Impossibile fornire una stima affidabile.",
      confidence: confidence.level,
      confidenceScore: confidence.score,
      warnings,
      omiZoneMatch: "not_found",
      dataCompleteness: completeness,
      pricePerSqm: 0,
    }
    return result
  }

  // Uso dati OMI reali
  const baseOMIValue = omiAdvanced.valoreMedioMq
  const minOMI = omiAdvanced.valoreMinMq
  const maxOMI = omiAdvanced.valoreMaxMq

  // Classifica tipo di match (per confidence score)
  let zoneMatch: ValuationResult["omiZoneMatch"] = "zone_specific"
  if (omiAdvanced.zona === "Media città") zoneMatch = "city_average"
  else if (omiAdvanced.zona === "Media CAP") zoneMatch = "cap_global"
  else if (omiAdvanced.fonte?.includes("CAP") && resolvedZone === undefined) zoneMatch = "cap"

  // Sprint 1.2 + fix range: più largo quando la zona è poco specifica o la
  // variance OMI è elevata. La larghezza finale del range dipende dalla
  // confidence (calcolata qui per permettere adjustment dinamico).
  const estimatedPrice = Math.round(
    baseOMIValue * input.surfaceSqm * floorCoefficient * qualityCoefficient
  )

  const rawOmiVariancePct = baseOMIValue > 0
    ? ((maxOMI - minOMI) / baseOMIValue) * 100
    : 0

  const isGenericZone = zoneMatch === "city_average" || zoneMatch === "cap_global"
  const VARIANCE_THRESHOLD = 25

  // Sprint 2.2: confidence calcolata PRIMA del range così possiamo stringerlo
  // proporzionalmente all'affidabilità.
  const completeness = calculateDataCompleteness(input)
  const confidence = calculateConfidence(input, completeness, zoneMatch, rawOmiVariancePct)

  const shouldUseUncertaintyRange = isGenericZone
  const shouldUseOMIRange = rawOmiVariancePct > VARIANCE_THRESHOLD

  let minPrice: number
  let maxPrice: number
  if (shouldUseUncertaintyRange) {
    // Zone generiche: la media città/CAP non rappresenta bene micro-zone e
    // frazioni. Qui il range deve allargarsi, non stringersi.
    const uncertaintyRange =
      confidence.level === "alta" ? 0.18 :
      confidence.level === "bassa" ? 0.35 :
      0.25
    minPrice = Math.round(estimatedPrice * (1 - uncertaintyRange))
    maxPrice = Math.round(estimatedPrice * (1 + uncertaintyRange))
    warnings.push({
      code: "RANGE_WIDENED_GENERIC_ZONE",
      message: `Zona OMI poco specifica (${omiAdvanced.zona}): range allargato a ±${Math.round(uncertaintyRange * 100)}% (confidence ${confidence.level}).`,
      severity: "warning",
    })
  } else if (shouldUseOMIRange) {
    minPrice = Math.round(
      minOMI * input.surfaceSqm * floorCoefficient * qualityCoefficient
    )
    maxPrice = Math.round(
      maxOMI * input.surfaceSqm * floorCoefficient * qualityCoefficient
    )
    warnings.push({
      code: "OMI_RANGE_USED_HIGH_VARIANCE",
      message: `Variance OMI elevata (${Math.round(rawOmiVariancePct)}%): usato range OMI pieno invece di restringere artificialmente.`,
      severity: "warning",
    })
  } else {
    minPrice = Math.round(
      minOMI * input.surfaceSqm * floorCoefficient * qualityCoefficient
    )
    maxPrice = Math.round(
      maxOMI * input.surfaceSqm * floorCoefficient * qualityCoefficient
    )
  }

  const pricePerSqm = estimatedPrice / input.surfaceSqm

  // Sprint 1.5: sanity checks
  const sanityWarnings = runSanityChecks(input, estimatedPrice, pricePerSqm)
  warnings.push(...sanityWarnings)

  // alias per retro-compatibilità con logger qui sotto
  const omiVariancePct = rawOmiVariancePct

  logger.info("Valuation calculated", {
    city: input.city,
    zona: omiAdvanced.zona,
    baseOMIValue,
    rangeOMI: `${minOMI}-${maxOMI}`,
    qualityCoefficient,
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
    conditionCoefficient: qualityCoefficient,
    pureConditionCoefficient: conditionCoefficient,
    explanation: "",
    confidence: confidence.level,
    confidenceScore: confidence.score,
    warnings,
    omiZoneMatch: zoneMatch,
    dataCompleteness: completeness,
    pricePerSqm: Math.round(pricePerSqm),
  }

  result.explanation = generateValuationExplanation(input, result)
  return result
}

export async function calculateValuation(input: ValuationInput): Promise<ValuationResult> {
  const cached = getCachedValuation(input)
  if (cached) {
    logger.debug("Returning cached valuation", { city: input.city, type: input.propertyType })
    return cached
  }
  logger.info("Calculating valuation", { city: input.city, type: input.propertyType })
  const result = calculateValuationLocal(input)
  setCachedValuation(input, result)
  return result
}
