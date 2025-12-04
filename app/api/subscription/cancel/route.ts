import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

// POST /api/subscription/cancel - Cancella subscription Stripe
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

    // Ottieni subscription
    const subscription = await prisma.subscription.findUnique({
      where: { agencyId: authResult.agencyId }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription non trovata' }, { status: 404 })
    }

    if (subscription.planType === 'free') {
      return NextResponse.json({ error: 'Sei già sul piano gratuito' }, { status: 400 })
    }

    // Se c'è una subscription Stripe attiva, cancellala
    if (subscription.stripeSubscriptionId) {
      try {
        // Cancella alla fine del periodo di fatturazione corrente
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        })

        // Ottieni la subscription aggiornata per il periodo finale
        const stripeSubResponse = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const periodEnd = (stripeSubResponse as any).current_period_end as number

        // Aggiorna DB - mantieni piano attivo fino a fine periodo
        const updatedSubscription = await prisma.subscription.update({
          where: { agencyId: authResult.agencyId },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
            // nextBillingDate rimane per mostrare quando scadrà
            nextBillingDate: new Date(periodEnd * 1000)
          }
        })

        return NextResponse.json({
          subscription: updatedSubscription,
          message: 'Subscription cancellata. Resterà attiva fino al termine del periodo di fatturazione.',
          endsAt: new Date(periodEnd * 1000)
        })
      } catch (stripeError) {
        console.error('Errore cancellazione Stripe:', stripeError)
        // Continua comunque per aggiornare il DB
      }
    }

    // Aggiorna DB per downgrade immediato (se non c'è subscription Stripe)
    const updatedSubscription = await prisma.subscription.update({
      where: { agencyId: authResult.agencyId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        planType: 'free',
        nextBillingDate: null,
        stripeSubscriptionId: null,
        stripePriceId: null
      }
    })

    // Aggiorna piano agenzia
    await prisma.agency.update({
      where: { id: authResult.agencyId },
      data: { piano: 'free' }
    })

    return NextResponse.json({
      subscription: updatedSubscription,
      message: 'Subscription cancellata e piano impostato a Free.'
    })
  } catch (error) {
    console.error('Errore cancellazione subscription:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante la cancellazione'
    }, { status: 500 })
  }
}
