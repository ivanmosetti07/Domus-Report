import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

// POST /api/subscription/portal - Crea Stripe Customer Portal Session
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

    // Ottieni subscription con customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { agencyId: authResult.agencyId }
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({
        error: 'Nessun account di fatturazione trovato. Effettua prima un upgrade a un piano a pagamento.'
      }, { status: 400 })
    }

    // Determina URL di ritorno con fallback sicuri
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      request.headers.get('origin')

    if (!baseUrl || !baseUrl.startsWith('http')) {
      console.error('Base URL non valida per il billing portal:', baseUrl)
      return NextResponse.json({
        error: 'Configurazione dominio non valida. Imposta NEXT_PUBLIC_APP_URL o NEXTAUTH_URL.'
      }, { status: 500 })
    }

    // Crea Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/subscription`
    })

    return NextResponse.json({
      url: portalSession.url
    })
  } catch (error) {
    console.error('Errore portal session:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore durante la creazione del portale'
    }, { status: 500 })
  }
}
