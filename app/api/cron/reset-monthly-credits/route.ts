import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger('cron-reset-monthly-credits')

/**
 * Cron job per reset crediti mensili
 * Eseguito il 1° di ogni mese alle 01:00 AM
 *
 * Resetta:
 * - valuationsUsedThisMonth -> 0
 * - valuationsResetDate -> primo giorno del mese corrente
 *
 * NON resetta:
 * - extraValuationsPurchased -> I crediti extra SONO cumulativi e non scadono
 *
 * Endpoint protetto: richiede CRON_SECRET in header Authorization
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verifica autorizzazione cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      logger.error("CRON_SECRET non configurato")
      return NextResponse.json(
        { error: "Configurazione cron mancante" },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Tentativo accesso cron non autorizzato")
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      )
    }

    logger.info("Inizio reset crediti mensili")

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 2. Trova tutte le subscription attive che devono essere resettate
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['active', 'trial', 'past_due']
        }
      },
      include: {
        agency: {
          select: {
            id: true,
            email: true,
            nome: true
          }
        }
      }
    })

    logger.info(`Trovate ${subscriptions.length} subscription da processare`)

    const results = {
      total: subscriptions.length,
      resetted: 0,
      skipped: 0,
      errors: 0
    }

    // 3. Reset crediti per ogni subscription
    for (const subscription of subscriptions) {
      try {
        // Solo subscription che NON hanno già fatto il reset questo mese
        const needsReset = !subscription.valuationsResetDate ||
                          subscription.valuationsResetDate < firstDayOfMonth

        if (!needsReset) {
          logger.info(`Skip subscription ${subscription.id} - già resettata questo mese`)
          results.skipped++
          continue
        }

        // Ottieni crediti del piano
        const planCredits = subscription.planType === 'free' ? 5 :
                           subscription.planType === 'basic' ? 50 : 150
        const extraCredits = subscription.extraValuationsPurchased || 0
        const totalCredits = planCredits + extraCredits

        // Reset crediti mensili (mantiene crediti extra)
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            valuationsUsedThisMonth: 0,
            // extraValuationsPurchased NON viene toccato - crediti extra cumulativi!
            valuationsResetDate: firstDayOfMonth
          }
        })

        logger.info(`Reset crediti per agency ${subscription.agency.email} - Piano: ${planCredits}, Extra: ${extraCredits}, Totale: ${totalCredits}`)
        results.resetted++

        // Crea notifica per l'agenzia
        await prisma.notification.create({
          data: {
            agencyId: subscription.agencyId,
            type: 'CREDITS_RESET',
            title: 'Crediti mensili resettati',
            message: extraCredits > 0
              ? `I tuoi crediti sono stati resettati per il nuovo mese. Crediti disponibili: ${planCredits} (piano) + ${extraCredits} (extra) = ${totalCredits} valutazioni.`
              : `I tuoi crediti sono stati resettati per il nuovo mese. Crediti disponibili: ${planCredits} valutazioni.`
          }
        })

      } catch (error) {
        logger.error(`Errore reset crediti per subscription ${subscription.id}`, error)
        results.errors++
      }
    }

    logger.info("Reset crediti mensili completato", results)

    return NextResponse.json({
      success: true,
      message: "Reset crediti mensili completato",
      results,
      resetDate: firstDayOfMonth
    })

  } catch (error) {
    logger.error("Errore generale reset crediti mensili", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
