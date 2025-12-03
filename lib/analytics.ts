import { prisma } from "@/lib/prisma"

/**
 * Aggrega analytics per un range di date
 */
export async function aggregateAnalyticsForDateRange(
  agencyId: string,
  widgetId: string,
  startDate: Date,
  endDate: Date
) {
  // Cicla ogni giorno nel range
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(currentDate)
    dayEnd.setHours(23, 59, 59, 999)

    // Aggrega dati per questo giorno
    const [openEvents, clickEvents, leadsGenerated, valuationsCompleted] =
      await Promise.all([
        // Widget impressions = OPEN eventi
        prisma.widgetEvent.count({
          where: {
            widgetId,
            eventType: "OPEN",
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),

        // Widget clicks = OPEN + MESSAGE eventi
        prisma.widgetEvent.count({
          where: {
            widgetId,
            eventType: { in: ["OPEN", "MESSAGE"] },
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),

        // Leads generati = CONTACT_FORM_SUBMIT eventi
        prisma.widgetEvent.count({
          where: {
            widgetId,
            eventType: "CONTACT_FORM_SUBMIT",
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),

        // Valutazioni completate = VALUATION_VIEW eventi
        prisma.widgetEvent.count({
          where: {
            widgetId,
            eventType: "VALUATION_VIEW",
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),
      ])

    // Calcola conversion rate
    const conversionRate =
      openEvents > 0 ? (leadsGenerated / openEvents) * 100 : 0

    // Salva in AnalyticsDaily (upsert per evitare duplicati)
    await prisma.analyticsDaily.upsert({
      where: {
        agencyId_date: {
          agencyId,
          date: dayStart,
        },
      },
      create: {
        agencyId,
        date: dayStart,
        widgetImpressions: openEvents,
        widgetClicks: clickEvents,
        leadsGenerated,
        valuationsCompleted,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
      update: {
        widgetImpressions: openEvents,
        widgetClicks: clickEvents,
        leadsGenerated,
        valuationsCompleted,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
    })

    // Passa al giorno successivo
    currentDate.setDate(currentDate.getDate() + 1)
  }
}
