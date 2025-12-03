/**
 * OMI (Osservatorio del Mercato Immobiliare) Database
 * Contains average property values per square meter for Italian cities
 * Data is simplified for MVP - in production this would be a real database
 */

import { PropertyType } from "@/types"

export interface OMIValue {
  city: string
  values: {
    [PropertyType.APARTMENT]: number // €/m²
    [PropertyType.VILLA]: number
    [PropertyType.OFFICE]: number
    [PropertyType.OTHER]: number
  }
}

// Simplified OMI database with average values for major Italian cities
// Values are in €/m² and are approximate averages for 2024
export const OMI_DATABASE: OMIValue[] = [
  {
    city: "Milano",
    values: {
      [PropertyType.APARTMENT]: 4800,
      [PropertyType.VILLA]: 5500,
      [PropertyType.OFFICE]: 4200,
      [PropertyType.OTHER]: 3500,
    },
  },
  {
    city: "Roma",
    values: {
      [PropertyType.APARTMENT]: 3800,
      [PropertyType.VILLA]: 4500,
      [PropertyType.OFFICE]: 3500,
      [PropertyType.OTHER]: 3000,
    },
  },
  {
    city: "Firenze",
    values: {
      [PropertyType.APARTMENT]: 3900,
      [PropertyType.VILLA]: 4800,
      [PropertyType.OFFICE]: 3400,
      [PropertyType.OTHER]: 3200,
    },
  },
  {
    city: "Venezia",
    values: {
      [PropertyType.APARTMENT]: 4200,
      [PropertyType.VILLA]: 5000,
      [PropertyType.OFFICE]: 3600,
      [PropertyType.OTHER]: 3300,
    },
  },
  {
    city: "Bologna",
    values: {
      [PropertyType.APARTMENT]: 3200,
      [PropertyType.VILLA]: 3800,
      [PropertyType.OFFICE]: 2900,
      [PropertyType.OTHER]: 2600,
    },
  },
  {
    city: "Torino",
    values: {
      [PropertyType.APARTMENT]: 2400,
      [PropertyType.VILLA]: 3200,
      [PropertyType.OFFICE]: 2200,
      [PropertyType.OTHER]: 2000,
    },
  },
  {
    city: "Napoli",
    values: {
      [PropertyType.APARTMENT]: 2800,
      [PropertyType.VILLA]: 3500,
      [PropertyType.OFFICE]: 2500,
      [PropertyType.OTHER]: 2200,
    },
  },
  {
    city: "Genova",
    values: {
      [PropertyType.APARTMENT]: 2600,
      [PropertyType.VILLA]: 3400,
      [PropertyType.OFFICE]: 2400,
      [PropertyType.OTHER]: 2100,
    },
  },
  {
    city: "Palermo",
    values: {
      [PropertyType.APARTMENT]: 1800,
      [PropertyType.VILLA]: 2500,
      [PropertyType.OFFICE]: 1600,
      [PropertyType.OTHER]: 1400,
    },
  },
  {
    city: "Bari",
    values: {
      [PropertyType.APARTMENT]: 2000,
      [PropertyType.VILLA]: 2700,
      [PropertyType.OFFICE]: 1800,
      [PropertyType.OTHER]: 1600,
    },
  },
  {
    city: "Catania",
    values: {
      [PropertyType.APARTMENT]: 1600,
      [PropertyType.VILLA]: 2300,
      [PropertyType.OFFICE]: 1500,
      [PropertyType.OTHER]: 1300,
    },
  },
  {
    city: "Verona",
    values: {
      [PropertyType.APARTMENT]: 2900,
      [PropertyType.VILLA]: 3600,
      [PropertyType.OFFICE]: 2600,
      [PropertyType.OTHER]: 2400,
    },
  },
  {
    city: "Padova",
    values: {
      [PropertyType.APARTMENT]: 2700,
      [PropertyType.VILLA]: 3400,
      [PropertyType.OFFICE]: 2500,
      [PropertyType.OTHER]: 2200,
    },
  },
  {
    city: "Trieste",
    values: {
      [PropertyType.APARTMENT]: 2300,
      [PropertyType.VILLA]: 3000,
      [PropertyType.OFFICE]: 2100,
      [PropertyType.OTHER]: 1900,
    },
  },
  {
    city: "Brescia",
    values: {
      [PropertyType.APARTMENT]: 2500,
      [PropertyType.VILLA]: 3200,
      [PropertyType.OFFICE]: 2300,
      [PropertyType.OTHER]: 2000,
    },
  },
  {
    city: "Parma",
    values: {
      [PropertyType.APARTMENT]: 2400,
      [PropertyType.VILLA]: 3100,
      [PropertyType.OFFICE]: 2200,
      [PropertyType.OTHER]: 2000,
    },
  },
  {
    city: "Modena",
    values: {
      [PropertyType.APARTMENT]: 2600,
      [PropertyType.VILLA]: 3300,
      [PropertyType.OFFICE]: 2400,
      [PropertyType.OTHER]: 2100,
    },
  },
  {
    city: "Reggio Emilia",
    values: {
      [PropertyType.APARTMENT]: 2300,
      [PropertyType.VILLA]: 3000,
      [PropertyType.OFFICE]: 2100,
      [PropertyType.OTHER]: 1900,
    },
  },
  {
    city: "Perugia",
    values: {
      [PropertyType.APARTMENT]: 2000,
      [PropertyType.VILLA]: 2700,
      [PropertyType.OFFICE]: 1800,
      [PropertyType.OTHER]: 1600,
    },
  },
  {
    city: "Rimini",
    values: {
      [PropertyType.APARTMENT]: 2800,
      [PropertyType.VILLA]: 3500,
      [PropertyType.OFFICE]: 2500,
      [PropertyType.OTHER]: 2200,
    },
  },
]

// National average fallback value
const NATIONAL_AVERAGE: OMIValue = {
  city: "Italia (media nazionale)",
  values: {
    [PropertyType.APARTMENT]: 2000,
    [PropertyType.VILLA]: 2800,
    [PropertyType.OFFICE]: 1800,
    [PropertyType.OTHER]: 1600,
  },
}

/**
 * Gets OMI value for a specific city and property type
 * Returns national average if city not found
 */
export function getOMIValue(
  city: string,
  propertyType: PropertyType
): { value: number; source: string } {
  // Normalize city name
  const normalizedCity = city.trim()

  // Find exact match
  const cityData = OMI_DATABASE.find(
    (data) => data.city.toLowerCase() === normalizedCity.toLowerCase()
  )

  if (cityData) {
    return {
      value: cityData.values[propertyType],
      source: `OMI ${cityData.city}`,
    }
  }

  // Try partial match
  const partialMatch = OMI_DATABASE.find((data) =>
    data.city.toLowerCase().includes(normalizedCity.toLowerCase())
  )

  if (partialMatch) {
    return {
      value: partialMatch.values[propertyType],
      source: `OMI ${partialMatch.city}`,
    }
  }

  // Return national average
  return {
    value: NATIONAL_AVERAGE.values[propertyType],
    source: NATIONAL_AVERAGE.city,
  }
}

/**
 * Gets all cities in the OMI database
 */
export function getOMICities(): string[] {
  return OMI_DATABASE.map((data) => data.city)
}

/**
 * Searches for cities that match a query
 */
export function searchOMICities(query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim()

  return OMI_DATABASE.filter((data) =>
    data.city.toLowerCase().includes(normalizedQuery)
  ).map((data) => data.city)
}
