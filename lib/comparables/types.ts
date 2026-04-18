/**
 * Tipi per il sistema Comparables
 * Ricerca annunci immobiliari reali per cross-check delle valutazioni OMI.
 */

import { PropertyType, PropertyCondition } from "@/types"

export interface ComparablesQuery {
  city: string
  neighborhood?: string
  postalCode?: string
  propertyType: PropertyType
  surfaceSqm: number
  condition?: PropertyCondition
  rooms?: number
  maxResults?: number
}

export interface Comparable {
  title: string
  url?: string
  source: string // "immobiliare.it", "casa.it", ecc.
  price: number // prezzo totale €
  surfaceSqm: number
  pricePerSqm: number
  rooms?: number
  floor?: number
  condition?: string
  neighborhood?: string
  distanceKm?: number
}

export interface ComparablesResult {
  comparables: Comparable[]
  medianPricePerSqm: number
  avgPricePerSqm: number
  minPricePerSqm: number
  maxPricePerSqm: number
  sampleSize: number
  provider: string
  executionTimeMs: number
  warnings: string[]
}

export interface ComparablesProvider {
  name: string
  isAvailable(): boolean
  searchComparables(query: ComparablesQuery): Promise<ComparablesResult>
}

/**
 * Cross-check OMI vs Comparables: ritorna il delta percentuale
 * e suggerisce un aggiustamento (se i comparables divergono molto)
 */
export interface CrossCheckResult {
  omiPricePerSqm: number
  comparablesMedianPricePerSqm: number
  deltaPct: number // % di differenza
  agreement: "strong" | "medium" | "weak" // strong <10%, medium 10-25%, weak >25%
  suggestedPricePerSqm: number // media pesata OMI+comparables
  shouldAdjust: boolean
  warnings: string[]
}
