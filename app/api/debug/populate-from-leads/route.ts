import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthAgency } from "@/lib/auth"
import { startOfDay } from "date-fns"

/**
 * POST /api/debug/populate-from-leads
 * Popola i dati analytics basandosi sui lead esistenti
 * Utile quando i lead sono stati creati prima del sistema di tracking eventi
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

    console.log(`[Populate from Leads] Starting for agency ${agency.agencyId}`)

    // Recupera tutti i lead dell'agenzia
    const leads = await prisma.lead.findMany({
      where: { agenziaId: agency.agencyId },
      include: {
        property: {
          include: {
            valuation: true,
          },
        },
      },
      orderBy: { dataRichiesta: "asc" },
    })

    if (leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nessun lead trovato",
        leadsProcessed: 0,
      })
    }

    console.log(`[Populate from Leads] Found ${leads.length} leads`)

    // Aggrega per giorno
    const dailyStats = new Map<string, {
      date: Date
      leads: number
      valuations: number
    }>()

    for (const lead of leads) {
      const dayStart = startOfDay(lead.dataRichiesta)
      const dayKey = dayStart.toISOString()

      if (!dailyStats.has(dayKey)) {
        dailyStats.set(dayKey, {
          date: dayStart,
          leads: 0,
          valuations: 0,
        })
      }

      const stats = dailyStats.get(dayKey)!
      stats.leads++

      // Conta valutazione se esiste
      if (lead.property?.valuation) {
        stats.valuations++
      }
    }

    console.log(`[Populate from Leads] Aggregated into ${dailyStats.size} days`)

    // Salva in AnalyticsDaily
    let recordsCreated = 0
    let recordsUpdated = 0

    for (const [_, stats] of dailyStats) {
      // Stima impressioni (lead * 5 = stima di quante persone hanno aperto il widget)
      const estimatedImpressions = stats.leads * 5
      const estimatedClicks = stats.leads * 2

      const conversionRate = estimatedImpressions > 0
        ? (stats.leads / estimatedImpressions) * 100
        : 0

      const result = await prisma.analyticsDaily.upsert({
        where: {
          agencyId_date: {
            agencyId: agency.agencyId,
            date: stats.date,
          },
        },
        create: {
          agencyId: agency.agencyId,
          date: stats.date,
          widgetImpressions: estimatedImpressions,
          widgetClicks: estimatedClicks,
          leadsGenerated: stats.leads,
          valuationsCompleted: stats.valuations,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
        update: {
          // Usa i valori maggiori tra quelli esistenti e i nuovi
          leadsGenerated: stats.leads,
          valuationsCompleted: stats.valuations,
          widgetImpressions: {
            set: estimatedImpressions,
          },
          widgetClicks: {
            set: estimatedClicks,
          },
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
      })

      if (result) {
        recordsCreated++
      }
    }

    // Calcola totali
    const analyticsData = await prisma.analyticsDaily.findMany({
      where: { agencyId: agency.agencyId },
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

    console.log(`[Populate from Leads] Completed. Records: ${recordsCreated}, Totals:`, totals)

    return NextResponse.json({
      success: true,
      message: "Dati analytics popolati dai lead esistenti",
      leadsProcessed: leads.length,
      daysAggregated: dailyStats.size,
      recordsCreated,
      totals,
      note: "Le impressioni e i click sono stime basate sui lead (impression = lead * 5, click = lead * 2)",
    })
  } catch (error) {
    console.error("Error populating from leads:", error)
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
