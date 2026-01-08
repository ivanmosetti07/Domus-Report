/**
 * Geocoding service using OpenStreetMap Nominatim API (free, public)
 * Converts addresses to coordinates (latitude, longitude)
 */

import { createLogger } from './logger'

const logger = createLogger('geocoding')

export interface GeocodeResult {
  address: string
  city: string
  neighborhood?: string
  postalCode?: string
  latitude: number
  longitude: number
  formattedAddress: string
}

/**
 * Geocodes an address using OpenStreetMap Nominatim API (free, public)
 * https://nominatim.org/release-docs/latest/api/Search/
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  try {
    // Add "Italia" to improve results if not already present
    const searchQuery = address.toLowerCase().includes("italia") ||
      address.toLowerCase().includes("italy")
      ? address
      : `${address}, Italia`

    // Use Nominatim API (free, public)
    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.set("q", searchQuery)
    url.searchParams.set("format", "json")
    url.searchParams.set("addressdetails", "1")
    url.searchParams.set("limit", "1")
    url.searchParams.set("countrycodes", "it") // Restrict to Italy
    url.searchParams.set("accept-language", "it")

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "DomusReport/1.0", // Required by Nominatim usage policy
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      logger.error("Nominatim API error", { status: response.status, statusText: response.statusText })
      return null
    }

    const data = await response.json()

    // Check if we got results
    if (!Array.isArray(data) || data.length === 0) {
      logger.warn(`Geocoding failed for address: ${address}`)
      return null
    }

    // Get the best result (first one)
    const result = data[0]
    const addressDetails = result.address || {}

    // Extract city
    const city =
      addressDetails.city ||
      addressDetails.town ||
      addressDetails.village ||
      addressDetails.municipality ||
      addressDetails.county ||
      extractCityFromAddress(address)

    // Extract neighborhood/quarter
    const neighborhood =
      addressDetails.suburb ||
      addressDetails.neighbourhood ||
      addressDetails.quarter

    // Extract postal code
    const postalCode = addressDetails.postcode

    // Validate coordinates
    const latitude = parseFloat(result.lat)
    const longitude = parseFloat(result.lon)

    if (isNaN(latitude) || isNaN(longitude)) {
      logger.error("Invalid coordinates received from Nominatim")
      return null
    }

    return {
      address: result.display_name,
      city,
      neighborhood,
      postalCode: postalCode || undefined,
      latitude,
      longitude,
      formattedAddress: result.display_name,
    }
  } catch (error) {
    logger.error("Geocoding error", error)
    return null
  }
}

/**
 * Fallback city extraction from address string
 * NOTA: Questa funzione è deprecata, usa invece inferCity da lib/postal-code.ts
 * che include logica più intelligente con CAP
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
