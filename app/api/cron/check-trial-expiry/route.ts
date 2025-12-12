import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger('cron-trial-expiry')

/**
 * Cron job per gestire scadenza trial
 * Da eseguire giornalmente tramite Vercel Cron Jobs o servizio esterno
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

    logger.info("Inizio check scadenza trial")

    // 2. Trova subscription con trial scaduto
    const now = new Date()
    const expiredTrials = await prisma.subscription.findMany({
      where: {
        status: 'trial',
        trialEndsAt: {
          lte: now
        }
      },
      include: {
        agency: true
      }
    })

    logger.info(`Trovati ${expiredTrials.length} trial scaduti`)

    const results = {
      total: expiredTrials.length,
      converted: 0,
      downgraded: 0,
      errors: 0
    }

    // 3. Processa ogni trial scaduto
    for (const subscription of expiredTrials) {
      try {
        const hasPaymentMethod = !!(
          subscription.stripeCustomerId &&
          subscription.paymentMethodId
        )

        if (hasPaymentMethod) {
          // Ha metodo pagamento → converti a piano attivo
          logger.info(`Converting trial to active for agency ${subscription.agencyId}`)

          // Calcola prossima data fatturazione (30 giorni)
          const nextBillingDate = new Date()
          nextBillingDate.setDate(nextBillingDate.getDate() + 30)

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'active',
              trialEndsAt: null,
              nextBillingDate
            }
          })

          // TODO: Trigger addebito Stripe
          // const stripeInvoice = await stripe.invoices.create({
          //   customer: subscription.stripeCustomerId,
          //   auto_advance: true
          // })
          // await stripe.invoices.finalizeInvoice(stripeInvoice.id)

          // TODO: Invia email conferma
          // await sendEmail({
          //   to: subscription.agency.email,
          //   template: 'trial-converted',
          //   data: {
          //     agencyName: subscription.agency.nome,
          //     planType: subscription.planType,
          //     nextBillingDate
          //   }
          // })

          results.converted++
          logger.info(`Trial convertito a piano attivo per ${subscription.agency.email}`)

        } else {
          // NO metodo pagamento → downgrade a free
          logger.info(`Downgrading to free for agency ${subscription.agencyId}`)

          await prisma.$transaction([
            // Update agency piano
            prisma.agency.update({
              where: { id: subscription.agencyId },
              data: { piano: 'free' }
            }),
            // Update subscription
            prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                planType: 'free',
                status: 'active',
                trialEndsAt: null
              }
            })
          ])

          // TODO: Invia email downgrade
          // await sendEmail({
          //   to: subscription.agency.email,
          //   template: 'trial-expired-downgrade',
          //   data: {
          //     agencyName: subscription.agency.nome,
          //     previousPlanType: subscription.planType
          //   }
          // })

          results.downgraded++
          logger.info(`Trial scaduto, downgrade a free per ${subscription.agency.email}`)
        }

      } catch (error) {
        logger.error(`Errore processando trial per agency ${subscription.agencyId}`, error)
        results.errors++
      }
    }

    logger.info("Check trial expiry completato", results)

    return NextResponse.json({
      success: true,
      message: "Trial expiry check completato",
      results
    })

  } catch (error) {
    logger.error("Errore generale check trial expiry", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
