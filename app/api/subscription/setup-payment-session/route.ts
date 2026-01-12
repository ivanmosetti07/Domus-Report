import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

// POST /api/subscription/setup-payment-session - Crea Stripe Checkout Session per Setup Mode
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

    // Ottieni info agenzia e subscription
    const agency = await prisma.agency.findUnique({
      where: { id: authResult.agencyId },
      include: { subscription: true }
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

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

      // Salva il customer ID nella subscription
      await prisma.subscription.upsert({
        where: { agencyId: agency.id },
        create: {
          agencyId: agency.id,
          planType: agency.subscription?.planType || 'free',
          status: agency.subscription?.status || 'active',
          stripeCustomerId: customer.id,
          trialEndsAt: agency.subscription?.trialEndsAt || null
        },
        update: {
          stripeCustomerId: customer.id
        }
      })
    }

    // Determina BASE_URL con fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    if (!baseUrl.startsWith('http')) {
      throw new Error(`URL non valido: ${baseUrl}. Deve iniziare con http:// o https://`)
    }

    // Crea Checkout Session in modalità setup
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: `${baseUrl}/dashboard/subscription?payment_setup=success`,
      cancel_url: `${baseUrl}/dashboard/subscription?payment_setup=cancelled`,
      metadata: {
        agencyId: agency.id
      }
    })

    console.log('Setup Checkout Session creata:', session.id, 'URL:', session.url)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error) {
    console.error('Errore setup payment session:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante la creazione della sessione'
    }, { status: 500 })
  }
}
