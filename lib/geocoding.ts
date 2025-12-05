/**
 * Geocoding service using Google Maps Geocoding API
 * Converts addresses to coordinates (latitude, longitude)
 */

import { createLogger } from './logger'

const logger = createLogger('geocoding')

export interface GeocodeResult {
  address: string
  city: string
  postalCode?: string
  latitude: number
  longitude: number
  formattedAddress: string
}

/**
 * Geocodes an address using Google Maps API
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    logger.warn("GOOGLE_MAPS_API_KEY not configured, skipping geocoding")
    return null
  }

  try {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=it&language=it&key=${apiKey}`

    const response = await fetch(url, {
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      logger.warn(`Geocoding failed for address: ${address}`, { status: data.status })
      return null
    }

    const result = data.results[0]
    const location = result.geometry.location

    // Extract city and postal code from address components
    let city = ""
    let postalCode = ""

    for (const component of result.address_components) {
      if (component.types.includes("locality")) {
        city = component.long_name
      } else if (component.types.includes("administrative_area_level_3")) {
        // Fallback for smaller towns
        if (!city) city = component.long_name
      } else if (component.types.includes("postal_code")) {
        postalCode = component.long_name
      }
    }

    return {
      address: result.formatted_address,
      city: city || extractCityFromAddress(address),
      postalCode: postalCode || undefined,
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
    }
  } catch (error) {
    logger.error("Geocoding error", error)
    return null
  }
}

/**
 * Fallback city extraction from address string
 */
export function extractCityFromAddress(address: string): string {
  // Try to extract city from address (usually after the last comma)
  const parts = address.split(",").map((p) => p.trim())

  if (parts.length > 1) {
    // Take the last part (usually the city)
    const lastPart = parts[parts.length - 1]
    // Remove postal code if present
    const cityMatch = lastPart.match(/([A-Za-zÀ-ÿ\s]+)/)
    if (cityMatch) {
      return cityMatch[1].trim()
    }
  }

  // If no comma, try to find Italian city names
  const italianCities = [
    "Roma",
    "Milano",
    "Napoli",
    "Torino",
    "Palermo",
    "Genova",
    "Bologna",
    "Firenze",
    "Bari",
    "Catania",
    "Venezia",
    "Verona",
    "Messina",
    "Padova",
    "Trieste",
    "Brescia",
    "Parma",
    "Modena",
    "Reggio Calabria",
    "Reggio Emilia",
    "Perugia",
    "Livorno",
    "Cagliari",
    "Foggia",
    "Rimini",
    "Salerno",
    "Ferrara",
    "Sassari",
    "Latina",
    "Giugliano in Campania",
    "Monza",
    "Siracusa",
    "Pescara",
    "Bergamo",
    "Forlì",
    "Trento",
    "Vicenza",
    "Terni",
    "Bolzano",
    "Novara",
    "Piacenza",
    "Ancona",
    "Andria",
    "Arezzo",
    "Udine",
    "Cesena",
    "Lecce",
    "Pesaro",
    "Barletta",
    "Alessandria",
    "La Spezia",
    "Pisa",
    "Catanzaro",
    "Pistoia",
    "Lucca",
    "Brindisi",
    "Como",
    "Treviso",
    "Varese",
    "Prato",
    "Ravenna",
  ]

  for (const city of italianCities) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return city
    }
  }

  return "Milano" // Default fallback
}

/**
 * API route handler for geocoding
 */
export async function geocodeAddressAPI(address: string): Promise<Response> {
  try {
    const result = await geocodeAddress(address)

    if (!result) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Impossibile geocodificare l'indirizzo",
        }),
        { status: 400 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      { status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Errore sconosciuto",
      }),
      { status: 500 }
    )
  }
}
