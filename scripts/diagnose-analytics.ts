import { prisma } from "@/lib/prisma"
import { aggregateAnalyticsForDateRange } from "@/lib/analytics"

async function diagnoseAnalytics() {
  console.log("=== Diagnosi Analytics ===\n")

  // 1. Recupera tutte le agenzie
  const agencies = await prisma.agency.findMany({
    where: { attiva: true },
    select: {
      id: true,
      nome: true,
      widgetId: true,
    },
  })

  console.log(`Trovate ${agencies.length} agenzie attive\n`)

  for (const agency of agencies) {
    console.log(`\n--- Agenzia: ${agency.nome} (${agency.id}) ---`)
    console.log(`Widget ID: ${agency.widgetId}`)

    // 2. Verifica eventi widget
    const totalEvents = await prisma.widgetEvent.count({
      where: { widgetId: agency.widgetId },
    })
    console.log(`Eventi widget totali: ${totalEvents}`)

    if (totalEvents > 0) {
      // Conta eventi per tipo
      const eventTypes = await prisma.widgetEvent.groupBy({
        by: ["eventType"],
        where: { widgetId: agency.widgetId },
        _count: { eventType: true },
      })

      console.log("\nEventi per tipo:")
      eventTypes.forEach((et) => {
        console.log(`  - ${et.eventType}: ${et._count.eventType}`)
      })

      // Mostra gli ultimi 5 eventi
      const recentEvents = await prisma.widgetEvent.findMany({
        where: { widgetId: agency.widgetId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          eventType: true,
          createdAt: true,
        },
      })

      console.log("\nUltimi 5 eventi:")
      recentEvents.forEach((e) => {
        console.log(`  - ${e.eventType} - ${e.createdAt.toISOString()}`)
      })
    }

    // 3. Verifica dati analytics aggregati
    const analyticsRecords = await prisma.analyticsDaily.count({
      where: { agencyId: agency.id },
    })
    console.log(`\nRecord analytics aggregati: ${analyticsRecords}`)

    if (analyticsRecords > 0) {
      // Mostra ultimi 5 record
      const recentAnalytics = await prisma.analyticsDaily.findMany({
        where: { agencyId: agency.id },
        orderBy: { date: "desc" },
        take: 5,
        select: {
          date: true,
          widgetImpressions: true,
          widgetClicks: true,
          leadsGenerated: true,
          valuationsCompleted: true,
          conversionRate: true,
        },
      })

      console.log("\nUltimi 5 record analytics:")
      recentAnalytics.forEach((a) => {
        console.log(
          `  - ${a.date.toISOString().split("T")[0]}: ${a.widgetImpressions} impressions, ${a.leadsGenerated} leads, ${a.conversionRate}% conversion`
        )
      })
    }

    // 4. Proponi fix
    if (totalEvents > 0 && analyticsRecords === 0) {
      console.log(
        "\n⚠️  PROBLEMA TROVATO: Ci sono eventi widget ma nessun dato aggregato!"
      )
      console.log("Soluzione: Eseguire aggregazione manuale dei dati storici")
      console.log(
        "\nEseguo aggregazione per gli ultimi 30 giorni automaticamente...\n"
      )

      const endDate = new Date()
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      try {
        await aggregateAnalyticsForDateRange(
          agency.id,
          agency.widgetId,
          startDate,
          endDate
        )
        console.log("✅ Aggregazione completata con successo!")

        // Verifica che ora ci siano dati
        const newAnalyticsCount = await prisma.analyticsDaily.count({
          where: { agencyId: agency.id },
        })
        console.log(`Nuovi record analytics: ${newAnalyticsCount}`)
      } catch (error) {
        console.error("❌ Errore durante l'aggregazione:", error)
      }
    } else if (totalEvents === 0) {
      console.log(
        "\n⚠️  Nessun evento widget trovato. Il widget potrebbe non essere installato o non ancora utilizzato."
      )
    } else {
      console.log("\n✅ Dati analytics presenti e corretti")
    }
  }

  console.log("\n\n=== Fine Diagnosi ===")
}

diagnoseAnalytics()
  .then(() => {
    console.log("\nDiagnosi completata")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Errore:", error)
    process.exit(1)
  })
