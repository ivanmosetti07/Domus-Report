import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthAgency } from "@/lib/auth"

/**
 * GET /api/analytics/live
 * Recupera statistiche real-time per oggi (senza aspettare aggregazione notturna)
 *
 * Questo endpoint calcola on-the-fly dai WidgetEvent per mostrare dati aggiornati
 * senza aspettare il job di aggregazione giornaliero
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

    // Recupera widgetId (supporto multi-widget)
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
        data: {
          widgetImpressions: 0,
          widgetClicks: 0,
          leadsGenerated: 0,
          valuationsCompleted: 0,
          conversionRate: 0,
          closeEvents: 0,
          messageEvents: 0,
          contactFormStartEvents: 0,
          valuationToLeadRate: 0,
          formStartToSubmitRate: 0,
          funnel: null,
          hourlyStats: [],
          dateRange: {
            start: new Date().toISOString(),
            end: new Date().toISOString(),
          },
          isLive: true,
        },
      })
    }

    // Crea il filtro per i widget
    const widgetFilter = widgetIds.length === 1
      ? { widgetId: widgetIds[0] }
      : { widgetId: { in: widgetIds } }

    // Date range: oggi (da mezzanotte a ora)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const now = new Date()

    // Calcola statistiche live da WidgetEvent (TUTTI i widget)
    const [
      openEvents,
      closeEvents,
      messageEvents,
      valuationViewEvents,
      contactFormStartEvents,
      contactFormSubmitEvents,
    ] = await Promise.all([
      // OPEN eventi (widget aperti)
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: "OPEN",
          createdAt: { gte: todayStart, lte: now },
        },
      }),

      // CLOSE eventi (widget chiusi)
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: "CLOSE",
          createdAt: { gte: todayStart, lte: now },
        },
      }),

      // MESSAGE eventi (messaggi inviati)
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: "MESSAGE",
          createdAt: { gte: todayStart, lte: now },
        },
      }),

      // VALUATION_VIEW eventi (valutazioni visualizzate)
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: "VALUATION_VIEW",
          createdAt: { gte: todayStart, lte: now },
        },
      }),

      // CONTACT_FORM_START eventi (form contatti iniziato)
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: "CONTACT_FORM_START",
          createdAt: { gte: todayStart, lte: now },
        },
      }),

      // CONTACT_FORM_SUBMIT eventi (lead generati)
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: "CONTACT_FORM_SUBMIT",
          createdAt: { gte: todayStart, lte: now },
        },
      }),
    ])

    // Calcola metriche derivate
    const widgetImpressions = openEvents
    const widgetClicks = openEvents + messageEvents
    const leadsGenerated = contactFormSubmitEvents
    const valuationsCompleted = valuationViewEvents

    // Conversion rates
    const conversionRate =
      widgetImpressions > 0
        ? parseFloat(((leadsGenerated / widgetImpressions) * 100).toFixed(2))
        : 0

    const valuationToLeadRate =
      valuationsCompleted > 0
        ? parseFloat(((leadsGenerated / valuationsCompleted) * 100).toFixed(2))
        : 0

    const formStartToSubmitRate =
      contactFormStartEvents > 0
        ? parseFloat(
            ((leadsGenerated / contactFormStartEvents) * 100).toFixed(2)
          )
        : 0

    // Funnel completo (per analisi drop-off)
    const funnel = {
      step1_opened: widgetImpressions,
      step2_messaged: messageEvents,
      step3_valuation: valuationsCompleted,
      step4_formStarted: contactFormStartEvents,
      step5_leadSubmitted: leadsGenerated,

      // Drop-off percentages
      dropOff_openToMessage:
        widgetImpressions > 0
          ? parseFloat(
              (
                ((widgetImpressions - messageEvents) / widgetImpressions) *
                100
              ).toFixed(2)
            )
          : 0,
      dropOff_messageToValuation:
        messageEvents > 0
          ? parseFloat(
              (
                ((messageEvents - valuationsCompleted) / messageEvents) *
                100
              ).toFixed(2)
            )
          : 0,
      dropOff_valuationToForm:
        valuationsCompleted > 0
          ? parseFloat(
              (
                ((valuationsCompleted - contactFormStartEvents) /
                  valuationsCompleted) *
                100
              ).toFixed(2)
            )
          : 0,
      dropOff_formToSubmit:
        contactFormStartEvents > 0
          ? parseFloat(
              (
                ((contactFormStartEvents - leadsGenerated) /
                  contactFormStartEvents) *
                100
              ).toFixed(2)
            )
          : 0,
    }

    // Statistiche orarie (ultimi 24 ore, raggruppate per ora)
    const hourlyStats = await getHourlyStats(widgetIds, todayStart, now)

    return NextResponse.json({
      success: true,
      data: {
        // Metriche principali
        widgetImpressions,
        widgetClicks,
        leadsGenerated,
        valuationsCompleted,
        conversionRate,

        // Metriche aggiuntive
        closeEvents,
        messageEvents,
        contactFormStartEvents,
        valuationToLeadRate,
        formStartToSubmitRate,

        // Funnel completo
        funnel,

        // Stats orarie
        hourlyStats,

        // Metadata
        dateRange: {
          start: todayStart.toISOString(),
          end: now.toISOString(),
        },
        isLive: true,
      },
    })
  } catch (error) {
    console.error("Error fetching live analytics:", error)
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
 * Ottiene statistiche raggruppate per ora
 */
async function getHourlyStats(
  widgetIds: string[],
  startDate: Date,
  endDate: Date
) {
  // Crea il filtro per i widget
  const widgetFilter = widgetIds.length === 1
    ? { widgetId: widgetIds[0] }
    : { widgetId: { in: widgetIds } }

  // Recupera tutti gli eventi
  const events = await prisma.widgetEvent.findMany({
    where: {
      ...widgetFilter,
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      eventType: true,
      createdAt: true,
    },
  })

  // Raggruppa per ora
  const hourlyMap = new Map<
    number,
    {
      hour: number
      opens: number
      messages: number
      valuations: number
      leads: number
    }
  >()

  for (const event of events) {
    const hour = event.createdAt.getHours()

    if (!hourlyMap.has(hour)) {
      hourlyMap.set(hour, {
        hour,
        opens: 0,
        messages: 0,
        valuations: 0,
        leads: 0,
      })
    }

    const stats = hourlyMap.get(hour)!

    if (event.eventType === "OPEN") stats.opens++
    if (event.eventType === "MESSAGE") stats.messages++
    if (event.eventType === "VALUATION_VIEW") stats.valuations++
    if (event.eventType === "CONTACT_FORM_SUBMIT") stats.leads++
  }

  // Converti in array e ordina per ora
  return Array.from(hourlyMap.values()).sort((a, b) => a.hour - b.hour)
}
