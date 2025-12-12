import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthAgency } from "@/lib/auth"
import { aggregateAnalyticsForDateRange } from "@/lib/analytics"
import { subDays } from "date-fns"

/**
 * POST /api/debug/force-aggregate
 * Forza l'aggregazione dei dati analytics per l'agenzia autenticata
 * Query params:
 * - days: numero di giorni da aggregare (default: 90)
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica autenticazione
    const agency = await getAuthAgency()
    if (!agency) {
      return NextResponse.json(
        { success: false, error: "Non autenticato" },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const daysParam = searchParams.get("days")
    const days = daysParam ? parseInt(daysParam, 10) : 90

    // Recupera widgetId dell'agenzia
    const agencyData = await prisma.agency.findUnique({
      where: { id: agency.agencyId },
      select: { widgetId: true, nome: true },
    })

    if (!agencyData) {
      return NextResponse.json(
        { success: false, error: "Agenzia non trovata" },
        { status: 404 }
      )
    }

    // Calcola range date
    const endDate = new Date()
    const startDate = subDays(endDate, days)

    console.log(
      `[Force Aggregate] Aggregating analytics for agency ${agencyData.nome} (${agency.agencyId})`
    )
    console.log(
      `[Force Aggregate] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
    )

    // Conta eventi prima dell'aggregazione
    const eventsBefore = await prisma.widgetEvent.count({
      where: { widgetId: agencyData.widgetId },
    })

    // Esegui aggregazione
    await aggregateAnalyticsForDateRange(
      agency.agencyId,
      agencyData.widgetId,
      startDate,
      endDate
    )

    // Conta record analytics dopo aggregazione
    const analyticsAfter = await prisma.analyticsDaily.count({
      where: { agencyId: agency.agencyId },
    })

    // Recupera totali
    const analyticsData = await prisma.analyticsDaily.findMany({
      where: {
        agencyId: agency.agencyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    })

    const totals = {
      totalImpressions: 0,
      totalClicks: 0,
      totalLeads: 0,
      totalValuations: 0,
    }

    for (const row of analyticsData) {
      totals.totalImpressions += row.widgetImpressions
      totals.totalClicks += row.widgetClicks
      totals.totalLeads += row.leadsGenerated
      totals.totalValuations += row.valuationsCompleted
    }

    console.log(`[Force Aggregate] Aggregation completed. Totals:`, totals)

    return NextResponse.json({
      success: true,
      message: "Aggregazione completata con successo",
      agency: {
        id: agency.agencyId,
        name: agencyData.nome,
        widgetId: agencyData.widgetId,
      },
      aggregation: {
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days,
        },
        widgetEventsFound: eventsBefore,
        analyticsRecordsCreated: analyticsAfter,
        totals,
      },
    })
  } catch (error) {
    console.error("Error in force aggregate:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Errore interno del server",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
