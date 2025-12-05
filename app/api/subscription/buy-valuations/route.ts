import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { EXTRA_VALUATION_PRICE } from '@/lib/plan-limits'

// POST /api/subscription/buy-valuations - Acquista valutazioni extra
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
    const { quantity } = body as { quantity: number }

    // Valida quantità
    if (!quantity || quantity < 1 || quantity > 100) {
      return NextResponse.json({
        error: 'Quantità non valida (min: 1, max: 100)'
      }, { status: 400 })
    }

    // Ottieni info agenzia
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

    // Calcola importo totale (in centesimi)
    const totalAmount = EXTRA_VALUATION_PRICE * quantity

    // Crea Payment Intent per pagamento one-time
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      customer: stripeCustomerId,
      metadata: {
        agencyId: agency.id,
        type: 'extra_valuations',
        quantity: quantity.toString()
      },
      description: `${quantity} valutazioni extra - Domus Report`,
      automatic_payment_methods: {
        enabled: true,
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      quantity,
      unitPrice: EXTRA_VALUATION_PRICE
    })
  } catch (error) {
    console.error('Errore creazione payment intent:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante la creazione del pagamento'
    }, { status: 500 })
  }
}

// GET /api/subscription/buy-valuations - Ottieni info prezzi
export async function GET() {
  return NextResponse.json({
    unitPrice: EXTRA_VALUATION_PRICE, // in centesimi
    unitPriceFormatted: `€${(EXTRA_VALUATION_PRICE / 100).toFixed(2)}`,
    currency: 'EUR',
    minQuantity: 1,
    maxQuantity: 100
  })
}
