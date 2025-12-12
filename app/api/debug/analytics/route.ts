import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthAgency } from "@/lib/auth"

/**
 * GET /api/debug/analytics
 * Debug endpoint per verificare lo stato dei dati analytics
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticazione
    const agency = await getAuthAgency()
    if (!agency) {
      return NextResponse.json(
        { success: false, error: "Non autenticato" },
        { status: 401 }
      )
    }

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

    // Conta WidgetEvent per questa agenzia
    const widgetEventsCount = await prisma.widgetEvent.count({
      where: { widgetId: agencyData.widgetId },
    })

    // Conta per tipo di evento
    const eventsByType = await prisma.widgetEvent.groupBy({
      by: ['eventType'],
      where: { widgetId: agencyData.widgetId },
      _count: true,
    })

    // Conta AnalyticsDaily entries
    const analyticsDailyCount = await prisma.analyticsDaily.count({
      where: { agencyId: agency.agencyId },
    })

    // Conta lead generati
    const leadsCount = await prisma.lead.count({
      where: { agenziaId: agency.agencyId },
    })

    // Ultimi 5 widget events
    const recentEvents = await prisma.widgetEvent.findMany({
      where: { widgetId: agencyData.widgetId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        eventType: true,
        createdAt: true,
        metadata: true,
      },
    })

    // Ultimi 5 analytics daily
    const recentAnalytics = await prisma.analyticsDaily.findMany({
      where: { agencyId: agency.agencyId },
      orderBy: { date: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      success: true,
      agency: {
        id: agency.agencyId,
        name: agencyData.nome,
        widgetId: agencyData.widgetId,
      },
      counts: {
        totalWidgetEvents: widgetEventsCount,
        analyticsDailyRecords: analyticsDailyCount,
        totalLeads: leadsCount,
      },
      eventsByType: eventsByType.reduce((acc, item) => {
        acc[item.eventType] = item._count
        return acc
      }, {} as Record<string, number>),
      recentEvents,
      recentAnalytics,
      diagnosis: {
        hasWidgetEvents: widgetEventsCount > 0,
        hasAnalyticsRecords: analyticsDailyCount > 0,
        hasLeads: leadsCount > 0,
        recommendation: widgetEventsCount === 0
          ? "Nessun evento widget trovato. Il widget potrebbe non essere installato correttamente o non è stato mai utilizzato."
          : analyticsDailyCount === 0
          ? "Eventi widget presenti ma non aggregati. Eseguire aggregazione manuale."
          : "Dati presenti. Verificare la query della dashboard.",
      },
    })
  } catch (error) {
    console.error("Error in debug analytics:", error)
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
