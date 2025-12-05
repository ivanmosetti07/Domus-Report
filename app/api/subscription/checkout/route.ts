import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe, STRIPE_PLANS, PlanType, isPaidPlan } from '@/lib/stripe'
import Stripe from 'stripe'

// POST /api/subscription/checkout - Crea Stripe Checkout Session
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.error('Token mancante nell\'header Authorization')
      return NextResponse.json({ error: 'Non autorizzato - Token mancante' }, { status: 401 })
    }

    const authResult = await verifyAuth(token)
    if (!authResult) {
      console.error('Token non valido o scaduto')
      return NextResponse.json({ error: 'Token non valido o scaduto' }, { status: 401 })
    }

    console.log('Auth OK - AgencyId:', authResult.agencyId)

    const body = await request.json()
    const { planType, promoCode } = body as { planType: PlanType; promoCode?: string }

    // Valida planType
    if (!planType || !['basic', 'premium'].includes(planType)) {
      return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })
    }

    // Verifica che il piano richiesto sia a pagamento
    if (!isPaidPlan(planType)) {
      return NextResponse.json({ error: 'Usa DELETE /api/subscription per passare a free' }, { status: 400 })
    }

    // Ottieni info agenzia
    const agency = await prisma.agency.findUnique({
      where: { id: authResult.agencyId },
      include: { subscription: true }
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

    // Ottieni info piano
    const plan = STRIPE_PLANS[planType]

    console.log('📋 Piano richiesto:', planType, 'Prezzo:', plan.priceMonthly)

    // Crea o recupera Stripe Customer
    let stripeCustomerId = agency.subscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: agency.email,
        name: agency.nome,
        metadata: {
          agencyId: agency.id
        }
      })
      stripeCustomerId = customer.id

      // Salva il customer ID
      await prisma.subscription.upsert({
        where: { agencyId: agency.id },
        create: {
          agencyId: agency.id,
          planType: 'free',
          status: 'active',
          stripeCustomerId: customer.id
        },
        update: {
          stripeCustomerId: customer.id
        }
      })
    }

    // Determina BASE_URL con fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    console.log('🔗 BASE_URL usato:', baseUrl)

    if (!baseUrl.startsWith('http')) {
      throw new Error(`URL non valido: ${baseUrl}. Deve iniziare con http:// o https://`)
    }

    // Prepara parametri checkout con prezzo dinamico
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Piano ${plan.name}`,
              description: plan.features.join(', '),
            },
            unit_amount: plan.priceMonthly * 100, // Converti in centesimi
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        }
      ],
      success_url: `${baseUrl}/dashboard/subscription?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
      cancel_url: `${baseUrl}/dashboard/subscription?upgrade=cancelled`,
      metadata: {
        agencyId: agency.id,
        planType
      },
      subscription_data: {
        metadata: {
          agencyId: agency.id,
          planType
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    }

    // Applica codice promo se fornito
    if (promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: {
          code: promoCode.toUpperCase(),
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      })

      if (promo && promo.stripeCouponId) {
        checkoutParams.discounts = [{ coupon: promo.stripeCouponId }]
        // Disabilita codici promo automatici se ne abbiamo già uno
        delete checkoutParams.allow_promotion_codes
      }
    }

    // Crea Checkout Session
    console.log('🚀 Creazione Checkout Session con parametri:', {
      mode: checkoutParams.mode,
      customer: stripeCustomerId,
      amount: plan.priceMonthly * 100,
      success_url: checkoutParams.success_url,
      cancel_url: checkoutParams.cancel_url
    })

    const session = await stripe.checkout.sessions.create(checkoutParams)

    console.log('✅ Checkout Session creata:', session.id, 'URL:', session.url)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error) {
    console.error('Errore checkout:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante la creazione del checkout'
    }, { status: 500 })
  }
}
