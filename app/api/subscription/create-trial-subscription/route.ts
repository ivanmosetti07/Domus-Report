import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe, STRIPE_PLANS, PlanType } from '@/lib/stripe'

// POST /api/subscription/create-trial-subscription
// Crea una subscription Stripe in modalità trial con il metodo di pagamento già configurato
// L'addebito avverrà automaticamente alla fine del trial
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
    const { planType, paymentMethodId, trialDays = 14 } = body as {
      planType: PlanType
      paymentMethodId: string
      trialDays?: number
    }

    // Valida planType
    if (!planType || !['basic', 'premium'].includes(planType)) {
      return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })
    }

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment Method ID richiesto' }, { status: 400 })
    }

    // Ottieni info agenzia
    const agency = await prisma.agency.findUnique({
      where: { id: authResult.agencyId },
      include: { subscription: true }
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

    // Verifica se esiste già una subscription Stripe attiva
    if (agency.subscription?.stripeSubscriptionId) {
      return NextResponse.json({
        error: 'Esiste già una subscription Stripe attiva'
      }, { status: 400 })
    }

    // Ottieni o crea Stripe Customer
    let stripeCustomerId = agency.subscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: agency.email,
        name: agency.nome,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        },
        metadata: {
          agencyId: agency.id
        }
      })
      stripeCustomerId = customer.id
    } else {
      // Attacca il payment method al customer esistente
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId
      })

      // Imposta come default
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      })
    }

    // Ottieni info piano
    const plan = STRIPE_PLANS[planType]

    // Crea un Price per la subscription
    const price = await stripe.prices.create({
      currency: 'eur',
      unit_amount: plan.priceMonthly * 100,
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      product_data: {
        name: `Piano ${plan.name}`,
        description: plan.features.join(', ')
      }
    })

    // Crea subscription Stripe con trial
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: price.id
        }
      ],
      trial_period_days: trialDays,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      metadata: {
        agencyId: agency.id,
        planType
      }
    })

    // Calcola la data di fine trial
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

    // Salva/aggiorna subscription nel DB
    await prisma.subscription.upsert({
      where: { agencyId: agency.id },
      create: {
        agencyId: agency.id,
        planType,
        status: 'trial',
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: price.id,
        paymentMethodId,
        trialEndsAt: trialEnd,
        nextBillingDate: trialEnd,
        trialDays
      },
      update: {
        planType,
        status: 'trial',
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: price.id,
        paymentMethodId,
        trialEndsAt: trialEnd,
        nextBillingDate: trialEnd,
        trialDays
      }
    })

    // Aggiorna piano agenzia
    await prisma.agency.update({
      where: { id: agency.id },
      data: { piano: planType }
    })

    console.log('Subscription trial creata:', subscription.id, 'Trial fino a:', trialEnd)

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trialEnd: trialEnd.toISOString(),
        planType
      }
    })
  } catch (error) {
    console.error('Errore creazione trial subscription:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante la creazione del trial'
    }, { status: 500 })
  }
}
