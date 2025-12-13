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
    const defaultEndDate = new Date()
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Normalizza date in UTC per evitare shift di fuso orario
    const normalizeDate = (
      param: string | null,
      fallback: Date,
      endOfDay: boolean = false
    ) => {
      const base = param ? new Date(param) : new Date(fallback)
      if (isNaN(base.getTime())) {
        return new Date(fallback)
      }

      const normalized = new Date(base)
      if (endOfDay) {
        normalized.setUTCHours(23, 59, 59, 999)
      } else {
        normalized.setUTCHours(0, 0, 0, 0)
      }
      return normalized
    }

    const startDate = normalizeDate(startDateParam, defaultStartDate, false)
    const endDate = normalizeDate(endDateParam, defaultEndDate, true)

    // Recupera tutti i widget IDs dell'agenzia PRIMA (necessario per verificare eventi)
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

    // Recupera widget configs per questa agenzia
    const widgetConfigs = await prisma.widgetConfig.findMany({
      where: { agencyId: agency.agencyId, isActive: true },
      select: { widgetId: true },
    })

    // Raccogli tutti i widget IDs (legacy + configs)
    const widgetIds: string[] = []
    if (agencyData.widgetId) {
      widgetIds.push(agencyData.widgetId)
    }
    widgetConfigs.forEach(config => {
      if (config.widgetId && !widgetIds.includes(config.widgetId)) {
        widgetIds.push(config.widgetId)
      }
    })

    // Se non ci sono widget IDs, ritorna dati vuoti
    if (widgetIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        totals: calculateTotals([]),
        populated: false,
      })
    }

    // Crea il filtro per i widget
    const widgetFilter = widgetIds.length === 1
      ? { widgetId: widgetIds[0] }
      : { widgetId: { in: widgetIds } }

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

    // Calcola quanti giorni dovrebbero esserci nel range
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const expectedDays = daysDiff + 1

    // Verifica se ci sono eventi widget nel periodo
    const hasWidgetEvents = await prisma.widgetEvent.findFirst({
      where: {
        ...widgetFilter,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { id: true },
    })

    // Aggrega SE:
    // 1. Non ci sono dati analytics MA ci sono eventi widget, OPPURE
    // 2. Il numero di giorni aggregati è inferiore all'atteso E ci sono eventi widget
    const shouldAggregate = (analyticsData.length === 0 && hasWidgetEvents) ||
                           (analyticsData.length < expectedDays && hasWidgetEvents)

    if (shouldAggregate) {
      console.log(`[Analytics] Auto-aggregating for agency ${agency.agencyId}, period: ${startDate.toISOString()} to ${endDate.toISOString()}`)
      console.log(`[Analytics] Found ${analyticsData.length} existing records, expected ${expectedDays} days`)

      // Popola analytics da eventi storici per TUTTI i widget
      await aggregateAnalyticsForDateRange(
        agency.agencyId,
        widgetIds,
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
