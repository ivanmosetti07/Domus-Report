import { NextRequest, NextResponse } from "next/server"
import { loadOMIDataFromCSV } from "@/lib/omi-advanced"

/**
 * POST /api/admin/load-omi-data
 * Carica i dati OMI dal file CSV nel database
 *
 * NOTA: Questa API dovrebbe essere protetta in produzione
 * Per ora è accessibile solo durante lo sviluppo
 */
export async function POST(request: NextRequest) {
  try {
    // In produzione, aggiungi qui controllo autenticazione admin
    // const session = await getServerSession()
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Non autorizzato" }, { status: 403 })
    // }

    console.log("Inizio caricamento dati OMI dal CSV...")

    const count = await loadOMIDataFromCSV()

    console.log(`Caricamento completato: ${count} record inseriti/aggiornati`)

    return NextResponse.json({
      success: true,
      message: `Dati OMI caricati con successo`,
      recordsLoaded: count,
    })
  } catch (error) {
    console.error("Load OMI data error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/load-omi-data
 * Mostra informazioni sul caricamento dati
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Usa il metodo POST per caricare i dati OMI dal CSV",
    info: "Questa operazione leggerà il file data/omi-values.csv e lo caricherà nel database",
    endpoint: "POST /api/admin/load-omi-data",
  })
}
