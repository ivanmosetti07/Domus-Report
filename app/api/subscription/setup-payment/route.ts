import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

// POST /api/subscription/setup-payment - Crea Setup Intent per salvare metodo di pagamento
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

    // Crea Setup Intent per salvare il metodo di pagamento
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      metadata: {
        agencyId: agency.id
      }
    })

    console.log('Setup Intent creato:', setupIntent.id)

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    })
  } catch (error) {
    console.error('Errore setup payment:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante il setup del pagamento'
    }, { status: 500 })
  }
}

// GET /api/subscription/setup-payment - Verifica stato Setup Intent
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const authResult = await verifyAuth(token)
    if (!authResult) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const setupIntentId = searchParams.get('setupIntentId')

    if (!setupIntentId) {
      return NextResponse.json({ error: 'Setup Intent ID mancante' }, { status: 400 })
    }

    // Recupera Setup Intent da Stripe
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)

    if (setupIntent.status === 'succeeded' && setupIntent.payment_method) {
      // Salva il payment method nella subscription
      await prisma.subscription.update({
        where: { agencyId: authResult.agencyId },
        data: {
          paymentMethodId: setupIntent.payment_method as string
        }
      })

      return NextResponse.json({
        success: true,
        status: setupIntent.status,
        paymentMethodId: setupIntent.payment_method
      })
    }

    return NextResponse.json({
      success: false,
      status: setupIntent.status
    })
  } catch (error) {
    console.error('Errore verifica setup payment:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante la verifica'
    }, { status: 500 })
  }
}
