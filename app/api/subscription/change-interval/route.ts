import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe, STRIPE_PLANS, getStripeRecurring, getPlanPrice, VALID_BILLING_INTERVALS } from '@/lib/stripe'
import type { BillingInterval } from '@/lib/plan-limits'

// POST /api/subscription/change-interval - Cambia intervallo fatturazione della subscription attiva
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const authResult = await verifyAuth(token)
    if (!authResult) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const body = await request.json()
    const { billingInterval } = body as { billingInterval: BillingInterval }

    // Valida billingInterval
    if (!billingInterval || !VALID_BILLING_INTERVALS.includes(billingInterval)) {
      return NextResponse.json({ error: 'Intervallo di fatturazione non valido' }, { status: 400 })
    }

    // Ottieni subscription dal DB
    const subscription = await prisma.subscription.findUnique({
      where: { agencyId: authResult.agencyId }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription non trovata' }, { status: 404 })
    }

    if (subscription.planType === 'free') {
      return NextResponse.json({ error: 'Il piano gratuito non ha un intervallo di fatturazione' }, { status: 400 })
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Nessuna subscription Stripe attiva' }, { status: 400 })
    }

    // Verifica che l'intervallo sia diverso da quello attuale
    if (subscription.billingInterval === billingInterval) {
      return NextResponse.json({ error: 'L\'intervallo selezionato è già quello attivo' }, { status: 400 })
    }

    // Recupera la subscription Stripe per ottenere l'item corrente
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

    if (stripeSubscription.status === 'canceled') {
      return NextResponse.json({ error: 'La subscription è stata cancellata' }, { status: 400 })
    }

    const currentItem = stripeSubscription.items.data[0]
    if (!currentItem) {
      return NextResponse.json({ error: 'Nessun item nella subscription Stripe' }, { status: 400 })
    }

    // Calcola nuovo prezzo per il piano + intervallo
    const planType = subscription.planType as 'basic' | 'premium'
    const plan = STRIPE_PLANS[planType]
    const totalPriceCents = getPlanPrice(planType, billingInterval)
    const stripeRecurring = getStripeRecurring(billingInterval)

    // Crea un nuovo Price su Stripe con il nuovo intervallo
    const newPrice = await stripe.prices.create({
      currency: 'eur',
      unit_amount: totalPriceCents,
      recurring: stripeRecurring,
      product_data: {
        name: `Piano ${plan.name} (${billingInterval})`
      }
    })

    // Aggiorna la subscription Stripe: sostituisci il price item
    // proration_behavior: 'create_prorations' calcola automaticamente il credito/addebito proporzionale
    const updatedStripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: currentItem.id,
          price: newPrice.id,
        }
      ],
      proration_behavior: 'create_prorations',
      metadata: {
        agencyId: authResult.agencyId,
        planType,
        billingInterval
      }
    })

    // Calcola prossima data di fatturazione
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEnd = (updatedStripeSubscription as any).current_period_end as number | undefined
    const nextBillingDate = periodEnd
      ? new Date(periodEnd * 1000)
      : null

    // Aggiorna il DB
    await prisma.subscription.update({
      where: { agencyId: authResult.agencyId },
      data: {
        billingInterval,
        stripePriceId: newPrice.id,
        nextBillingDate,
      }
    })

    console.log(`✅ Intervallo cambiato per agenzia ${authResult.agencyId}: ${subscription.billingInterval} → ${billingInterval}`)

    return NextResponse.json({
      success: true,
      billingInterval,
      message: `Intervallo aggiornato a ${billingInterval}. Il cambio sarà effettivo dal prossimo ciclo di fatturazione.`
    })
  } catch (error) {
    console.error('Errore cambio intervallo:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante il cambio di intervallo'
    }, { status: 500 })
  }
}
