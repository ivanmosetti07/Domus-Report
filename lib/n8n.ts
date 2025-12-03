/**
 * n8n Integration for Property Valuation
 * This module handles communication with the n8n workflow for calculating property valuations
 */

import { PropertyType, PropertyCondition } from "@/types"
import { getOMIValue } from "./omi"

export interface ValuationInput {
  address: string
  city: string
  postalCode?: string
  latitude?: number
  longitude?: number
  propertyType: PropertyType
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
    [PropertyCondition.EXCELLENT]: 1.12, // Excellent condition
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
 * Calculates property valuation (local fallback)
 * This is used when n8n is not available or as a backup
 */
export function calculateValuationLocal(
  input: ValuationInput
): ValuationResult {
  // Get OMI base value
  const omiData = getOMIValue(input.city, input.propertyType)
  const baseOMIValue = omiData.value

  // Calculate coefficients
  const floorCoefficient = calculateFloorCoefficient(
    input.floor,
    input.hasElevator
  )
  const conditionCoefficient = calculateConditionCoefficient(input.condition)

  // Calculate estimated price
  const estimatedPrice = Math.round(
    baseOMIValue * input.surfaceSqm * floorCoefficient * conditionCoefficient
  )

  // Calculate price range (±7%)
  const minPrice = Math.round(estimatedPrice * 0.93)
  const maxPrice = Math.round(estimatedPrice * 1.07)

  const result: ValuationResult = {
    minPrice,
    maxPrice,
    estimatedPrice,
    baseOMIValue,
    floorCoefficient,
    conditionCoefficient,
    explanation: "",
  }

  // Generate explanation
  result.explanation = generateValuationExplanation(input, result)

  return result
}

/**
 * Calls n8n webhook for property valuation
 * Falls back to local calculation if n8n is unavailable
 */
export async function calculateValuation(
  input: ValuationInput
): Promise<ValuationResult> {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

  // If n8n is not configured, use local calculation
  if (!n8nWebhookUrl) {
    console.warn("N8N_WEBHOOK_URL not configured, using local calculation")
    return calculateValuationLocal(input)
  }

  try {
    // Call n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.statusText}`)
    }

    const data = await response.json()

    // Validate response
    if (
      !data.estimatedPrice ||
      !data.minPrice ||
      !data.maxPrice ||
      !data.baseOMIValue
    ) {
      throw new Error("Invalid response from n8n webhook")
    }

    return {
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      estimatedPrice: data.estimatedPrice,
      baseOMIValue: data.baseOMIValue,
      floorCoefficient: data.floorCoefficient || 1.0,
      conditionCoefficient: data.conditionCoefficient || 1.0,
      explanation: data.explanation || generateValuationExplanation(input, data),
    }
  } catch (error) {
    console.error("n8n webhook error, falling back to local calculation:", error)
    // Fallback to local calculation
    return calculateValuationLocal(input)
  }
}
