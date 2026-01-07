import { NextRequest, NextResponse } from "next/server"

/**
 * DEPRECATO: Questa API non è più necessaria
 *
 * Il sistema OMI ora legge i dati direttamente dal file CSV (data/omi-values.csv)
 * utilizzando una cache in-memory. Non è più necessario caricare i dati in un database.
 *
 * Il caricamento avviene automaticamente alla prima richiesta di valutazione.
 */

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: "Questa API è deprecata",
    message: "Il sistema OMI ora legge i dati direttamente dal CSV. Non è più necessario caricare i dati manualmente.",
    info: "I dati vengono caricati automaticamente in cache alla prima richiesta di valutazione."
  }, { status: 410 }) // 410 Gone
}

/**
 * GET /api/admin/load-omi-data
 * Mostra informazioni sul sistema OMI
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    deprecated: true,
    message: "Questa API è deprecata. Il sistema OMI ora legge direttamente dal CSV.",
    info: {
      file: "data/omi-values.csv",
      records: "~133.000 record",
      cache: "In-memory con TTL di 30 minuti",
      loadingTime: "~350ms al primo caricamento, <5ms successivamente"
    },
    migration: "Non è necessaria alcuna azione. Il sistema funziona automaticamente."
  })
}
