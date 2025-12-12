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
    [PropertyType.ATTICO]: number
    [PropertyType.VILLA]: number
    [PropertyType.OFFICE]: number
    [PropertyType.SHOP]: number
    [PropertyType.BOX]: number
    [PropertyType.LAND]: number
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
      [PropertyType.ATTICO]: 6000,
      [PropertyType.VILLA]: 5500,
      [PropertyType.OFFICE]: 4200,
      [PropertyType.SHOP]: 3800,
      [PropertyType.BOX]: 2000,
      [PropertyType.LAND]: 1200,
      [PropertyType.OTHER]: 3500,
    },
  },
  {
    city: "Roma",
    values: {
      [PropertyType.APARTMENT]: 3800,
      [PropertyType.ATTICO]: 4800,
      [PropertyType.VILLA]: 4500,
      [PropertyType.OFFICE]: 3500,
      [PropertyType.SHOP]: 3200,
      [PropertyType.BOX]: 1800,
      [PropertyType.LAND]: 1000,
      [PropertyType.OTHER]: 3000,
    },
  },
  {
    city: "Firenze",
    values: {
      [PropertyType.APARTMENT]: 3900,
      [PropertyType.ATTICO]: 5000,
      [PropertyType.VILLA]: 4800,
      [PropertyType.OFFICE]: 3400,
      [PropertyType.SHOP]: 3000,
      [PropertyType.BOX]: 1700,
      [PropertyType.LAND]: 900,
      [PropertyType.OTHER]: 3200,
    },
  },
  {
    city: "Venezia",
    values: {
      [PropertyType.APARTMENT]: 4200,
      [PropertyType.ATTICO]: 5500,
      [PropertyType.VILLA]: 5000,
      [PropertyType.OFFICE]: 3600,
      [PropertyType.SHOP]: 3300,
      [PropertyType.BOX]: 1900,
      [PropertyType.LAND]: 1000,
      [PropertyType.OTHER]: 3300,
    },
  },
  {
    city: "Bologna",
    values: {
      [PropertyType.APARTMENT]: 3200,
      [PropertyType.ATTICO]: 4200,
      [PropertyType.VILLA]: 3800,
      [PropertyType.OFFICE]: 2900,
      [PropertyType.SHOP]: 2600,
      [PropertyType.BOX]: 1500,
      [PropertyType.LAND]: 800,
      [PropertyType.OTHER]: 2600,
    },
  },
  {
    city: "Torino",
    values: {
      [PropertyType.APARTMENT]: 2400,
      [PropertyType.ATTICO]: 3200,
      [PropertyType.VILLA]: 3200,
      [PropertyType.OFFICE]: 2200,
      [PropertyType.SHOP]: 2000,
      [PropertyType.BOX]: 1200,
      [PropertyType.LAND]: 600,
      [PropertyType.OTHER]: 2000,
    },
  },
  {
    city: "Napoli",
    values: {
      [PropertyType.APARTMENT]: 2800,
      [PropertyType.ATTICO]: 3600,
      [PropertyType.VILLA]: 3500,
      [PropertyType.OFFICE]: 2500,
      [PropertyType.SHOP]: 2200,
      [PropertyType.BOX]: 1300,
      [PropertyType.LAND]: 700,
      [PropertyType.OTHER]: 2200,
    },
  },
  {
    city: "Genova",
    values: {
      [PropertyType.APARTMENT]: 2600,
      [PropertyType.ATTICO]: 3400,
      [PropertyType.VILLA]: 3400,
      [PropertyType.OFFICE]: 2400,
      [PropertyType.SHOP]: 2100,
      [PropertyType.BOX]: 1200,
      [PropertyType.LAND]: 600,
      [PropertyType.OTHER]: 2100,
    },
  },
  {
    city: "Palermo",
    values: {
      [PropertyType.APARTMENT]: 1800,
      [PropertyType.ATTICO]: 2400,
      [PropertyType.VILLA]: 2500,
      [PropertyType.OFFICE]: 1600,
      [PropertyType.SHOP]: 1400,
      [PropertyType.BOX]: 900,
      [PropertyType.LAND]: 400,
      [PropertyType.OTHER]: 1400,
    },
  },
  {
    city: "Bari",
    values: {
      [PropertyType.APARTMENT]: 2000,
      [PropertyType.ATTICO]: 2700,
      [PropertyType.VILLA]: 2700,
      [PropertyType.OFFICE]: 1800,
      [PropertyType.SHOP]: 1600,
      [PropertyType.BOX]: 1000,
      [PropertyType.LAND]: 500,
      [PropertyType.OTHER]: 1600,
    },
  },
  {
    city: "Catania",
    values: {
      [PropertyType.APARTMENT]: 1600,
      [PropertyType.ATTICO]: 2200,
      [PropertyType.VILLA]: 2300,
      [PropertyType.OFFICE]: 1500,
      [PropertyType.SHOP]: 1300,
      [PropertyType.BOX]: 800,
      [PropertyType.LAND]: 400,
      [PropertyType.OTHER]: 1300,
    },
  },
  {
    city: "Verona",
    values: {
      [PropertyType.APARTMENT]: 2900,
      [PropertyType.ATTICO]: 3800,
      [PropertyType.VILLA]: 3600,
      [PropertyType.OFFICE]: 2600,
      [PropertyType.SHOP]: 2400,
      [PropertyType.BOX]: 1400,
      [PropertyType.LAND]: 700,
      [PropertyType.OTHER]: 2400,
    },
  },
  {
    city: "Padova",
    values: {
      [PropertyType.APARTMENT]: 2700,
      [PropertyType.ATTICO]: 3500,
      [PropertyType.VILLA]: 3400,
      [PropertyType.OFFICE]: 2500,
      [PropertyType.SHOP]: 2200,
      [PropertyType.BOX]: 1300,
      [PropertyType.LAND]: 700,
      [PropertyType.OTHER]: 2200,
    },
  },
  {
    city: "Trieste",
    values: {
      [PropertyType.APARTMENT]: 2300,
      [PropertyType.ATTICO]: 3000,
      [PropertyType.VILLA]: 3000,
      [PropertyType.OFFICE]: 2100,
      [PropertyType.SHOP]: 1900,
      [PropertyType.BOX]: 1100,
      [PropertyType.LAND]: 600,
      [PropertyType.OTHER]: 1900,
    },
  },
  {
    city: "Brescia",
    values: {
      [PropertyType.APARTMENT]: 2500,
      [PropertyType.ATTICO]: 3300,
      [PropertyType.VILLA]: 3200,
      [PropertyType.OFFICE]: 2300,
      [PropertyType.SHOP]: 2000,
      [PropertyType.BOX]: 1200,
      [PropertyType.LAND]: 600,
      [PropertyType.OTHER]: 2000,
    },
  },
  {
    city: "Parma",
    values: {
      [PropertyType.APARTMENT]: 2400,
      [PropertyType.ATTICO]: 3200,
      [PropertyType.VILLA]: 3100,
      [PropertyType.OFFICE]: 2200,
      [PropertyType.SHOP]: 2000,
      [PropertyType.BOX]: 1200,
      [PropertyType.LAND]: 600,
      [PropertyType.OTHER]: 2000,
    },
  },
  {
    city: "Modena",
    values: {
      [PropertyType.APARTMENT]: 2600,
      [PropertyType.ATTICO]: 3400,
      [PropertyType.VILLA]: 3300,
      [PropertyType.OFFICE]: 2400,
      [PropertyType.SHOP]: 2100,
      [PropertyType.BOX]: 1300,
      [PropertyType.LAND]: 700,
      [PropertyType.OTHER]: 2100,
    },
  },
  {
    city: "Reggio Emilia",
    values: {
      [PropertyType.APARTMENT]: 2300,
      [PropertyType.ATTICO]: 3000,
      [PropertyType.VILLA]: 3000,
      [PropertyType.OFFICE]: 2100,
      [PropertyType.SHOP]: 1900,
      [PropertyType.BOX]: 1100,
      [PropertyType.LAND]: 600,
      [PropertyType.OTHER]: 1900,
    },
  },
  {
    city: "Perugia",
    values: {
      [PropertyType.APARTMENT]: 2000,
      [PropertyType.ATTICO]: 2700,
      [PropertyType.VILLA]: 2700,
      [PropertyType.OFFICE]: 1800,
      [PropertyType.SHOP]: 1600,
      [PropertyType.BOX]: 1000,
      [PropertyType.LAND]: 500,
      [PropertyType.OTHER]: 1600,
    },
  },
  {
    city: "Rimini",
    values: {
      [PropertyType.APARTMENT]: 2800,
      [PropertyType.ATTICO]: 3600,
      [PropertyType.VILLA]: 3500,
      [PropertyType.OFFICE]: 2500,
      [PropertyType.SHOP]: 2200,
      [PropertyType.BOX]: 1300,
      [PropertyType.LAND]: 700,
      [PropertyType.OTHER]: 2200,
    },
  },
]

// National average fallback value
const NATIONAL_AVERAGE: OMIValue = {
  city: "Italia (media nazionale)",
  values: {
    [PropertyType.APARTMENT]: 2000,
    [PropertyType.ATTICO]: 2700,
    [PropertyType.VILLA]: 2800,
    [PropertyType.OFFICE]: 1800,
    [PropertyType.SHOP]: 1600,
    [PropertyType.BOX]: 1000,
    [PropertyType.LAND]: 500,
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
 * Search cities by partial name
 */
export function searchOMICities(query: string): string[] {
  if (!query.trim()) return []

  const normalizedQuery = query.toLowerCase().trim()
  return OMI_DATABASE.filter((data) =>
    data.city.toLowerCase().includes(normalizedQuery)
  ).map((data) => data.city)
}
