import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthAgency } from "@/lib/auth"
import { aggregateAnalyticsForDateRange } from "@/lib/analytics"

/**
 * GET /api/analytics
 * Recupera dati analytics aggregati per l'agenzia autenticata
 *
 * Query params:
 * - startDate: ISO date string (default: 30 giorni fa)
 * - endDate: ISO date string (default: oggi)
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticazione
    const agency = await getAuthAgency()
    if (!agency) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autenticato",
        },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Default range: ultimi 30 giorni
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Normalizza date (inizio e fine giornata)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    // Query analytics daily
    const analyticsData = await prisma.analyticsDaily.findMany({
      where: {
        agencyId: agency.agencyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Se non ci sono dati, prova a popolare da WidgetEvent storici
    if (analyticsData.length === 0) {
      // Verifica che ci siano widget events per questa agenzia
      const agencyData = await prisma.agency.findUnique({
        where: { id: agency.agencyId },
        select: { widgetId: true },
      })

      if (!agencyData) {
        return NextResponse.json(
          {
            success: false,
            error: "Agenzia non trovata",
          },
          { status: 404 }
        )
      }

      // Popola analytics da eventi storici
      await aggregateAnalyticsForDateRange(
        agency.agencyId,
        agencyData.widgetId,
        startDate,
        endDate
      )

      // Riprova a recuperare i dati
      const newAnalyticsData = await prisma.analyticsDaily.findMany({
        where: {
          agencyId: agency.agencyId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      })

      return NextResponse.json({
        success: true,
        data: newAnalyticsData,
        totals: calculateTotals(newAnalyticsData),
        populated: true, // Indica che i dati sono stati appena popolati
      })
    }

    // Calcola totali aggregati
    const totals = calculateTotals(analyticsData)

    return NextResponse.json({
      success: true,
      data: analyticsData,
      totals,
      populated: false,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Errore interno del server",
      },
      { status: 500 }
    )
  }
}


/**
 * Calcola totali aggregati
 */
function calculateTotals(data: any[]) {
  const totals = {
    totalImpressions: 0,
    totalClicks: 0,
    totalLeads: 0,
    totalValuations: 0,
    averageConversionRate: 0,
  }

  for (const row of data) {
    totals.totalImpressions += row.widgetImpressions
    totals.totalClicks += row.widgetClicks
    totals.totalLeads += row.leadsGenerated
    totals.totalValuations += row.valuationsCompleted
  }

  // Calcola conversion rate medio
  if (totals.totalImpressions > 0) {
    totals.averageConversionRate = parseFloat(
      ((totals.totalLeads / totals.totalImpressions) * 100).toFixed(2)
    )
  }

  return totals
}

