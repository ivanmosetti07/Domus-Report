import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { aggregateAnalyticsForDateRange } from "@/lib/analytics"

/**
 * POST /api/analytics/aggregate
 * Job aggregazione giornaliero - esegue aggregazione per tutte le agenzie
 *
 * Questo endpoint è progettato per essere chiamato da:
 * - Vercel Cron Jobs (schedule: "0 2 * * *" = ogni giorno alle 02:00)
 * - External cron service (Zapier, Make.com, etc.)
 *
 * Headers richiesti:
 * - Authorization: Bearer <CRON_SECRET>
 *
 * Body (opzionale):
 * - date: ISO date string (default: ieri)
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica autorizzazione cron job
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "default-secret-change-me"

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autorizzato",
        },
        { status: 401 }
      )
    }

    // Parse body (opzionale)
    let targetDate: Date
    try {
      const body = await req.json().catch(() => ({}))
      targetDate = body.date ? new Date(body.date) : getYesterday()
    } catch {
      targetDate = getYesterday()
    }

    // Normalizza data (inizio giornata)
    targetDate.setHours(0, 0, 0, 0)

    console.log(`[Cron] Aggregating analytics for date: ${targetDate.toISOString()}`)

    // Recupera tutte le agenzie attive
    const agencies = await prisma.agency.findMany({
      where: { attiva: true },
      select: {
        id: true,
        widgetId: true,
        nome: true,
      },
    })

    console.log(`[Cron] Found ${agencies.length} active agencies`)

    const results = {
      total: agencies.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ agencyId: string; error: string }>,
    }

    // Aggrega per ogni agenzia
    for (const agency of agencies) {
      try {
        await aggregateAnalyticsForDateRange(
          agency.id,
          agency.widgetId,
          targetDate,
          targetDate // Single day
        )
        results.success++
        console.log(
          `[Cron] ✓ Aggregated analytics for agency: ${agency.nome} (${agency.id})`
        )
      } catch (error) {
        results.failed++
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        results.errors.push({
          agencyId: agency.id,
          error: errorMessage,
        })
        console.error(
          `[Cron] ✗ Failed to aggregate for agency ${agency.nome}:`,
          errorMessage
        )
      }
    }

    console.log(
      `[Cron] Aggregation completed: ${results.success} success, ${results.failed} failed`
    )

    return NextResponse.json({
      success: true,
      message: "Aggregazione completata",
      date: targetDate.toISOString(),
      results,
    })
  } catch (error) {
    console.error("[Cron] Error in aggregate endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Errore interno del server",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * Ottiene la data di ieri
 */
function getYesterday(): Date {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  return yesterday
}
