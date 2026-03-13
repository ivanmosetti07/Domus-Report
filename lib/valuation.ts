/**
 * Property Valuation Engine
 * Sistema di calcolo valutazioni immobiliari basato su dati OMI
 * Integrato con sistema OMI avanzato per valutazioni precise e granulari
 */

import { PropertyType, PropertyCondition } from "@/types"
import { getOMIValueByZone, mapPropertyTypeToOMI } from "./omi-advanced"
import { createLogger } from "./logger"

const logger = createLogger('valuation')

// In-memory cache for valuation results (15 minutes TTL)
interface CacheEntry {
  result: ValuationResult
  timestamp: number
}

const valuationCache = new Map<string, CacheEntry>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

/**
 * Generates a cache key from valuation input
 */
function getCacheKey(input: ValuationInput): string {
  return [
    input.city,
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
  ].join('-')
}

/**
 * Gets cached valuation if available and not expired
 */
function getCachedValuation(input: ValuationInput): ValuationResult | null {
  const key = getCacheKey(input)
  const cached = valuationCache.get(key)

  if (!cached) {
    return null
  }

  // Check if cache expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    valuationCache.delete(key)
    return null
  }

  return cached.result
}

/**
 * Saves valuation to cache
 */
function setCachedValuation(input: ValuationInput, result: ValuationResult): void {
  const key = getCacheKey(input)
  valuationCache.set(key, {
    result,
    timestamp: Date.now(),
  })

  // Clean up old entries periodically (when cache size > 1000)
  if (valuationCache.size > 1000) {
    const now = Date.now()
    for (const [cacheKey, entry] of valuationCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        valuationCache.delete(cacheKey)
      }
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
  // Campi aggiuntivi usati per coefficienti di qualità
  energyClass?: string       // es. "A4", "A3", "B", "C", "D", "E", "F", "G"
  buildYear?: number         // Anno di costruzione
  hasParking?: boolean       // Box/posto auto incluso nel prezzo
  outdoorSpace?: string      // "NONE", "BALCONY", "TERRACE", "GARDEN", "ROOF_TERRACE"
  heatingType?: string       // "AUTONOMOUS", "CENTRALIZED", "NONE", ecc.
}

export interface ValuationResult {
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  baseOMIValue: number
  floorCoefficient: number
  conditionCoefficient: number  // Coefficiente qualità complessivo (stato + energia + anno + extra)
  explanation: string
}

/**
 * Calculates floor coefficient based on floor number and elevator presence
 */
export function calculateFloorCoefficient(
  floor?: number,
  hasElevator?: boolean
): number {
  if (floor === undefined || floor === null) {
    return 1.0 // No floor information
  }

  let coefficient = 1.0

  // Base floor adjustment
  if (floor === 0) {
    coefficient = 0.92 // Ground floor penalty
  } else if (floor === 1) {
    coefficient = 0.97 // First floor slight penalty
  } else if (floor === 2) {
    coefficient = 1.0 // Second floor is baseline
  } else if (floor === 3) {
    coefficient = 1.03 // Third floor bonus
  } else if (floor >= 4) {
    coefficient = 1.05 // High floor bonus
  }

  // Elevator adjustment (only applies to floors > 1)
  if (floor > 1) {
    if (hasElevator) {
      coefficient += 0.03 // Elevator bonus
    } else {
      coefficient -= 0.05 // No elevator penalty for high floors
    }
  }

  return Math.max(0.85, Math.min(1.15, coefficient)) // Cap between 0.85 and 1.15
}

/**
 * Calculates condition coefficient based on property condition
 */
export function calculateConditionCoefficient(
  condition: PropertyCondition
): number {
  const coefficients: Record<PropertyCondition, number> = {
    [PropertyCondition.NEW]: 1.25, // New construction premium
    [PropertyCondition.RENOVATED]: 1.12, // Renovated condition
    [PropertyCondition.GOOD]: 1.0, // Good condition baseline
    [PropertyCondition.TO_RENOVATE]: 0.82, // Needs renovation discount
  }

  return coefficients[condition] || 1.0
}

/**
 * Calculates energy class coefficient based on Italian energy rating
 * Basato su standard OMI e mercato immobiliare italiano
 */
export function calculateEnergyClassCoefficient(energyClass?: string): number {
  if (!energyClass || energyClass === 'UNKNOWN' || energyClass === 'NOT_AVAILABLE') {
    return 1.0
  }

  const normalized = energyClass.toUpperCase().trim()

  if (normalized === 'A4' || normalized === 'A3') return 1.10 // +10%
  if (normalized === 'A2' || normalized === 'A1' || normalized === 'A+' || normalized === 'A') return 1.07 // +7%
  if (normalized === 'B') return 1.04 // +4%
  if (normalized === 'C') return 1.02 // +2%
  if (normalized === 'D') return 1.00 // baseline
  if (normalized === 'E') return 0.97 // -3%
  if (normalized === 'F') return 0.94 // -6%
  if (normalized === 'G') return 0.90 // -10%

  return 1.0
}

/**
 * Calculates build year coefficient based on construction year
 * Edifici recenti hanno premium, edifici datati hanno sconto
 */
export function calculateBuildYearCoefficient(buildYear?: number): number {
  if (!buildYear || buildYear < 1800 || buildYear > new Date().getFullYear()) {
    return 1.0
  }

  if (buildYear >= 2015) return 1.05   // Edificio recente: +5%
  if (buildYear >= 2000) return 1.02   // 2000-2014: +2%
  if (buildYear >= 1980) return 1.00   // 1980-1999: baseline
  if (buildYear >= 1960) return 0.97   // 1960-1979: -3%
  return 0.94                           // Pre-1960: -6%
}

/**
 * Calculates extras coefficient based on parking, outdoor space, heating
 * Somma dei contributi di ogni caratteristica aggiuntiva
 */
export function calculateExtrasCoefficient(
  hasParking?: boolean,
  outdoorSpace?: string,
  heatingType?: string
): number {
  let adjustment = 0

  // Posto auto / box
  if (hasParking) adjustment += 0.04 // +4%

  // Spazi esterni
  if (outdoorSpace) {
    const outdoor = outdoorSpace.toUpperCase()
    if (outdoor === 'GARDEN') adjustment += 0.07          // Giardino: +7%
    else if (outdoor === 'ROOF_TERRACE') adjustment += 0.06 // Terrazzo roof: +6%
    else if (outdoor === 'TERRACE') adjustment += 0.05     // Terrazza: +5%
    else if (outdoor === 'BALCONY') adjustment += 0.02     // Balcone: +2%
  }

  // Riscaldamento
  if (heatingType) {
    const heating = heatingType.toUpperCase()
    if (heating === 'NONE' || heating === 'ABSENT') adjustment -= 0.04 // No riscaldamento: -4%
  }

  // Cap: nessun singolo immobile può avere bonus > +20% o malus > -10% dagli extra
  return Math.max(0.90, Math.min(1.20, 1 + adjustment))
}

/**
 * Selects the most appropriate OMI category based on property characteristics
 * Permette di scegliere tra abitazioni civili, signorili, economiche, ville
 */
function selectOMICategory(
  propertyType: PropertyType,
  condition: PropertyCondition,
  energyClass?: string,
  buildYear?: number
): string | undefined {
  // Ville e villini hanno categoria OMI dedicata
  if (propertyType === PropertyType.VILLA) {
    return 'Ville e Villini'
  }

  if (propertyType === PropertyType.APARTMENT || propertyType === PropertyType.ATTICO) {
    const energyNorm = energyClass?.toUpperCase() ?? ''
    const isHighQuality = (
      ['A4', 'A3', 'A2', 'A1', 'A+', 'A', 'B'].includes(energyNorm) ||
      (buildYear !== undefined && buildYear >= 2010) ||
      condition === PropertyCondition.NEW
    )
    const isLowQuality = (
      condition === PropertyCondition.TO_RENOVATE ||
      (buildYear !== undefined && buildYear < 1960)
    )

    if (isHighQuality) return 'Abitazioni signorili'
    if (isLowQuality) return 'Abitazioni di tipo economico'
    return 'Abitazioni civili'
  }

  // Per altri tipi non residenziali, non specificare categoria
  return undefined
}

/**
 * Generates explanation text for the valuation
 */
export function generateValuationExplanation(
  input: ValuationInput,
  result: ValuationResult
): string {
  const parts: string[] = []

  // Base value
  parts.push(
    `Valutazione basata su dati OMI per ${input.city} (${result.baseOMIValue}€/m²).`
  )

  // Surface
  parts.push(`Superficie: ${input.surfaceSqm}m².`)

  // Floor information
  if (input.floor !== undefined && input.floor !== null) {
    const floorText = input.floor === 0 ? "piano terra" : `${input.floor}° piano`
    const elevatorText = input.hasElevator ? "con ascensore" : "senza ascensore"
    parts.push(`Immobile al ${floorText} ${elevatorText}.`)
  }

  // Condition
  parts.push(`Stato: ${input.condition}.`)

  // Coefficients explanation
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

  // Dettaglio fattori aggiuntivi se presenti
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

/**
 * Calculates property valuation using OMI data
 * Integrated with OMI Advanced for zone-specific valuations
 * Falls back to basic OMI data if zone/CAP not found
 */
export function calculateValuationLocal(
  input: ValuationInput
): ValuationResult {
  const tipoImmobile = mapPropertyTypeToOMI(input.propertyType)
  let baseOMIValue: number
  let minPrice: number
  let maxPrice: number
  let estimatedPrice: number

  // Selezione automatica categoria OMI più precisa
  const autoCategory = selectOMICategory(
    input.propertyType,
    input.condition,
    input.energyClass,
    input.buildYear
  )
  const omiCategory = input.omiCategory || autoCategory

  // Tentativo 1: con categoria specifica
  let omiAdvanced = getOMIValueByZone(
    input.city,
    input.neighborhood,
    input.postalCode,
    tipoImmobile,
    omiCategory
  )

  // Tentativo 2: senza categoria (media città per quel tipo immobile)
  if (!omiAdvanced && omiCategory) {
    logger.info("OMI category not found, retrying without category", {
      city: input.city, omiCategory
    })
    omiAdvanced = getOMIValueByZone(
      input.city,
      input.neighborhood,
      input.postalCode,
      tipoImmobile
    )
  }

  // Calcola coefficienti
  const floorCoefficient = calculateFloorCoefficient(input.floor, input.hasElevator)
  const conditionCoefficient = calculateConditionCoefficient(input.condition)
  const energyClassCoefficient = calculateEnergyClassCoefficient(input.energyClass)
  const buildYearCoefficient = calculateBuildYearCoefficient(input.buildYear)
  const extrasCoefficient = calculateExtrasCoefficient(
    input.hasParking,
    input.outdoorSpace,
    input.heatingType
  )

  // Coefficiente qualità complessivo (tutti i fattori non-piano combinati)
  const qualityCoefficient = parseFloat(
    (conditionCoefficient * energyClassCoefficient * buildYearCoefficient * extrasCoefficient).toFixed(4)
  )

  if (!omiAdvanced) {
    // FALLBACK: usa valori medi generici se OMI non disponibile
    logger.warn("OMI data not found - using generic fallback values", {
      city: input.city,
      neighborhood: input.neighborhood,
      postalCode: input.postalCode,
      tipoImmobile,
      omiCategory,
    })

    const fallbackValues: Record<string, { min: number; medio: number; max: number }> = {
      residenziale: { min: 2975, medio: 3500, max: 4025 },
      box: { min: 1275, medio: 1500, max: 1725 },
      commerciale: { min: 2125, medio: 2500, max: 2875 },
      uffici: { min: 2550, medio: 3000, max: 3450 },
      altro: { min: 2125, medio: 2500, max: 2875 },
    }

    const fallback = fallbackValues[tipoImmobile] || fallbackValues.altro
    baseOMIValue = fallback.medio

    estimatedPrice = Math.round(
      fallback.medio * input.surfaceSqm * floorCoefficient * qualityCoefficient
    )
    minPrice = Math.round(estimatedPrice * 0.90)
    maxPrice = Math.round(estimatedPrice * 1.10)

    const result: ValuationResult = {
      minPrice,
      maxPrice,
      estimatedPrice,
      baseOMIValue,
      floorCoefficient,
      conditionCoefficient: qualityCoefficient,
      explanation: "",
    }

    result.explanation = generateValuationExplanation(input, result) +
      " NOTA: Valutazione basata su dati medi generici. Per una stima più precisa, contatta un professionista."
    return result
  }

  // Usa dati OMI reali
  logger.info("Using OMI Advanced data", {
    city: input.city,
    zona: omiAdvanced.zona,
    omiCategory,
    valoreMedioMq: omiAdvanced.valoreMedioMq,
    qualityCoefficient,
  })

  baseOMIValue = omiAdvanced.valoreMedioMq

  estimatedPrice = Math.round(
    baseOMIValue * input.surfaceSqm * floorCoefficient * qualityCoefficient
  )
  minPrice = Math.round(estimatedPrice * 0.90)
  maxPrice = Math.round(estimatedPrice * 1.10)

  const result: ValuationResult = {
    minPrice,
    maxPrice,
    estimatedPrice,
    baseOMIValue,
    floorCoefficient,
    conditionCoefficient: qualityCoefficient,
    explanation: "",
  }

  result.explanation = generateValuationExplanation(input, result)
  return result
}

/**
 * Calculates property valuation using OMI data + coefficients
 * Uses OpenAI for AI-enhanced analysis (handled separately in API route)
 * Includes in-memory cache to improve performance
 */
export async function calculateValuation(
  input: ValuationInput
): Promise<ValuationResult> {
  // Check cache first
  const cached = getCachedValuation(input)
  if (cached) {
    logger.debug("Returning cached valuation", { city: input.city, type: input.propertyType })
    return cached
  }

  // Calculate valuation using OMI CSV + coefficients
  // OpenAI analysis is handled separately in the API route
  logger.info("Calculating valuation", { city: input.city, type: input.propertyType })
  const result = calculateValuationLocal(input)
  setCachedValuation(input, result)
  return result
}
