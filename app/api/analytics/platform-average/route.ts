import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthAgency } from "@/lib/auth"

/**
 * GET /api/analytics/platform-average
 * Calcola il conversion rate medio della piattaforma
 *
 * Questo endpoint calcola la media del conversion rate di tutte le agenzie attive
 * negli ultimi 30 giorni per fornire un benchmark di riferimento
 */
export async function GET() {
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

    // Calcola data di inizio (ultimi 30 giorni)
    const endDate = new Date()
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    // Recupera dati aggregati di tutte le agenzie attive negli ultimi 30 giorni
    const analyticsData = await prisma.analyticsDaily.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        agency: {
          attiva: true,
        },
      },
      select: {
        widgetImpressions: true,
        leadsGenerated: true,
        agencyId: true,
      },
    })

    // Calcola totali per agenzia
    const agencyTotals = new Map<string, { impressions: number; leads: number }>()

    for (const record of analyticsData) {
      const existing = agencyTotals.get(record.agencyId) || { impressions: 0, leads: 0 }
      agencyTotals.set(record.agencyId, {
        impressions: existing.impressions + record.widgetImpressions,
        leads: existing.leads + record.leadsGenerated,
      })
    }

    // Calcola conversion rate per ogni agenzia
    const conversionRates: number[] = []
    for (const [, totals] of agencyTotals) {
      if (totals.impressions > 0) {
        const conversionRate = (totals.leads / totals.impressions) * 100
        conversionRates.push(conversionRate)
      }
    }

    // Calcola media
    const averageConversionRate =
      conversionRates.length > 0
        ? conversionRates.reduce((sum, rate) => sum + rate, 0) / conversionRates.length
        : 0

    return NextResponse.json({
      success: true,
      averageConversionRate: parseFloat(averageConversionRate.toFixed(2)),
      sampleSize: conversionRates.length,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error calculating platform average:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Errore interno del server",
      },
      { status: 500 }
    )
  }
}
