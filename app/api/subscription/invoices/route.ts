import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

// GET /api/subscription/invoices - Ottieni fatture Stripe
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

    // Ottieni subscription con customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { agencyId: authResult.agencyId }
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ invoices: [] })
    }

    // Ottieni fatture da Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 24 // Ultimi 2 anni circa
    })

    // Formatta fatture
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: invoice.amount_paid / 100, // Converti da centesimi
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      description: invoice.lines.data[0]?.description || 'Abbonamento',
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url
    }))

    return NextResponse.json({ invoices: formattedInvoices })
  } catch (error) {
    console.error('Errore recupero fatture:', error)
    return NextResponse.json({
      error: 'Errore durante il recupero delle fatture'
    }, { status: 500 })
  }
}
