import { NextRequest, NextResponse } from "next/server"
import { getPriceHistory, calculateZoneTrend, getZonesByCity } from "@/lib/omi-advanced"

/**
 * GET /api/price-history
 * Ottiene storico prezzi per una zona specifica
 *
 * Query params:
 * - citta: string (required)
 * - zona: string (required)
 * - tipoImmobile: string (optional, default: "residenziale")
 * - numSemestri: number (optional, default: 6)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const citta = searchParams.get("citta")
    const zona = searchParams.get("zona")
    const tipoImmobile = searchParams.get("tipoImmobile") || "residenziale"
    const numSemestri = parseInt(searchParams.get("numSemestri") || "6")

    if (!citta) {
      return NextResponse.json(
        { error: "Parametro 'citta' obbligatorio" },
        { status: 400 }
      )
    }

    // Se zona non è specificata, restituisce le zone disponibili
    if (!zona) {
      const zones = await getZonesByCity(citta)
      return NextResponse.json({
        success: true,
        zones,
      })
    }

    // Ottiene lo storico prezzi
    const history = await getPriceHistory(citta, zona, tipoImmobile, numSemestri)

    if (history.length === 0) {
      return NextResponse.json(
        {
          error: "Nessun dato storico disponibile per questa zona",
          success: false
        },
        { status: 404 }
      )
    }

    // Calcola il trend
    const trend = await calculateZoneTrend(citta, zona, tipoImmobile)

    return NextResponse.json({
      success: true,
      citta,
      zona,
      tipoImmobile,
      history,
      trend,
    })
  } catch (error) {
    console.error("Price history API error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
