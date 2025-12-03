import { NextRequest, NextResponse } from "next/server"
import { calculateValuation, ValuationInput } from "@/lib/n8n"
import { geocodeAddress } from "@/lib/geocoding"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValuationInput

    // Validate required fields
    if (!body.address || !body.city || !body.propertyType || !body.surfaceSqm || !body.condition) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti" },
        { status: 400 }
      )
    }

    // Validate surface range
    if (body.surfaceSqm < 10 || body.surfaceSqm > 2000) {
      return NextResponse.json(
        { error: "Superficie deve essere tra 10 e 2000 m²" },
        { status: 400 }
      )
    }

    // Try to geocode if coordinates not provided
    let geocodeData = null
    if (!body.latitude || !body.longitude) {
      try {
        geocodeData = await geocodeAddress(body.address)
        if (geocodeData) {
          body.latitude = geocodeData.latitude
          body.longitude = geocodeData.longitude
          // Update city with geocoded city if more accurate
          if (geocodeData.city) {
            body.city = geocodeData.city
          }
          if (geocodeData.postalCode) {
            body.postalCode = geocodeData.postalCode
          }
        }
      } catch (error) {
        console.warn("Geocoding failed, continuing without coordinates:", error)
      }
    }

    // Calculate valuation
    const valuation = await calculateValuation(body)

    return NextResponse.json({
      success: true,
      valuation,
      geocoded: geocodeData !== null,
    })
  } catch (error) {
    console.error("Valuation API error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
