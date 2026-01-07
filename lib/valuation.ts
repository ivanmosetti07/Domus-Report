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
  return `${input.city}-${input.propertyType}-${input.surfaceSqm}-${input.floor || 0}-${input.hasElevator || false}-${input.condition}`
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
}

export interface ValuationResult {
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  baseOMIValue: number
  floorCoefficient: number
  conditionCoefficient: number
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
    parts.push(`Coefficiente stato: ${sign}${percentage}%.`)
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
  // Try to get advanced OMI data first
  const tipoImmobile = mapPropertyTypeToOMI(input.propertyType)
  let baseOMIValue: number
  let minPrice: number
  let maxPrice: number
  let estimatedPrice: number

  // Get OMI Advanced data (with fallback if not available)
  const omiAdvanced = getOMIValueByZone(
    input.city,
    input.neighborhood,
    input.postalCode,
    tipoImmobile,
    input.omiCategory
  )

  if (!omiAdvanced) {
    // FALLBACK: Se i dati OMI avanzati non sono disponibili, usa valori medi generici
    // Questo evita che il chatbot si blocchi quando i dati OMI non sono ancora caricati nel database
    logger.warn("OMI Advanced data not found - using generic fallback values", {
      city: input.city,
      neighborhood: input.neighborhood,
      postalCode: input.postalCode,
      tipoImmobile,
      omiCategory: input.omiCategory,
    })

    // Valori medi generici per tipo di immobile (€/m²)
    const fallbackValues: Record<string, { min: number; medio: number; max: number }> = {
      residenziale: { min: 2000, medio: 3500, max: 5000 },
      box: { min: 1000, medio: 1500, max: 2000 },
      commerciale: { min: 1500, medio: 2500, max: 3500 },
      uffici: { min: 2000, medio: 3000, max: 4000 },
      altro: { min: 1500, medio: 2500, max: 3500 },
    }

    const fallback = fallbackValues[tipoImmobile] || fallbackValues.altro
    baseOMIValue = fallback.medio

    // Calculate coefficients
    const floorCoefficient = calculateFloorCoefficient(
      input.floor,
      input.hasElevator
    )
    const conditionCoefficient = calculateConditionCoefficient(input.condition)

    // Calculate prices using fallback values + coefficients
    estimatedPrice = Math.round(
      fallback.medio * input.surfaceSqm * floorCoefficient * conditionCoefficient
    )
    minPrice = Math.round(
      fallback.min * input.surfaceSqm * floorCoefficient * conditionCoefficient
    )
    maxPrice = Math.round(
      fallback.max * input.surfaceSqm * floorCoefficient * conditionCoefficient
    )

    const result: ValuationResult = {
      minPrice,
      maxPrice,
      estimatedPrice,
      baseOMIValue,
      floorCoefficient,
      conditionCoefficient,
      explanation: "",
    }

    result.explanation = generateValuationExplanation(input, result) +
      " NOTA: Valutazione basata su dati medi generici. Per una stima più precisa, contatta un professionista."
    return result
  }

  // Use OMI Advanced data with min/max ranges
  logger.info("Using OMI Advanced data", {
    city: input.city,
    zona: omiAdvanced.zona,
    categoria: input.omiCategory,
    valoreMedioMq: omiAdvanced.valoreMedioMq,
  })

  baseOMIValue = omiAdvanced.valoreMedioMq

  // Calculate coefficients
  const floorCoefficient = calculateFloorCoefficient(
    input.floor,
    input.hasElevator
  )
  const conditionCoefficient = calculateConditionCoefficient(input.condition)

  // Calculate prices using OMI min/max ranges + coefficients
  estimatedPrice = Math.round(
    baseOMIValue * input.surfaceSqm * floorCoefficient * conditionCoefficient
  )
  minPrice = Math.round(
    omiAdvanced.valoreMinMq * input.surfaceSqm * floorCoefficient * conditionCoefficient
  )
  maxPrice = Math.round(
    omiAdvanced.valoreMaxMq * input.surfaceSqm * floorCoefficient * conditionCoefficient
  )

  const result: ValuationResult = {
    minPrice,
    maxPrice,
    estimatedPrice,
    baseOMIValue,
    floorCoefficient,
    conditionCoefficient,
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
