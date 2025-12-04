import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { stripe, PlanType } from '@/lib/stripe'
import Stripe from 'stripe'

// Disabilita body parsing per Stripe webhooks
export const runtime = 'nodejs'

async function sendEmail(to: string, subject: string, html: string) {
  // Usa Resend se configurato
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Domus Report <noreply@domusreport.com>',
        to,
        subject,
        html
      })
    } catch (error) {
      console.error('Errore invio email:', error)
    }
  }
}

// POST /api/webhooks/stripe - Gestisce eventi Stripe
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Signature mancante' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET non configurato')
    return NextResponse.json({ error: 'Webhook non configurato' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Errore verifica signature:', err)
    return NextResponse.json({
      error: `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Evento non gestito: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Errore gestione evento ${event.type}:`, error)
    return NextResponse.json({
      error: `Errore gestione evento: ${error instanceof Error ? error.message : 'Unknown'}`
    }, { status: 500 })
  }
}

// Handler: checkout.session.completed
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completato:', session.id)

  const agencyId = session.metadata?.agencyId
  const planType = session.metadata?.planType as PlanType

  if (!agencyId) {
    // Prova a recuperare da customer
    if (session.customer) {
      const subscription = await prisma.subscription.findFirst({
        where: { stripeCustomerId: session.customer as string }
      })
      if (subscription) {
        await processCheckout(subscription.agencyId, session, planType)
        return
      }
    }
    console.error('AgencyId non trovato nel checkout session')
    return
  }

  await processCheckout(agencyId, session, planType)
}

async function processCheckout(agencyId: string, session: Stripe.Checkout.Session, planType: PlanType) {
  // Recupera subscription Stripe
  const stripeSubscription = session.subscription
    ? await stripe.subscriptions.retrieve(session.subscription as string)
    : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = stripeSubscription as any
  const periodEnd = subData?.current_period_end ? new Date(subData.current_period_end * 1000) : null
  const priceId = subData?.items?.data?.[0]?.price?.id || null

  // Aggiorna subscription nel DB
  await prisma.subscription.upsert({
    where: { agencyId },
    create: {
      agencyId,
      planType: planType || 'basic',
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription?.id || null,
      stripePriceId: priceId,
      nextBillingDate: periodEnd
    },
    update: {
      planType: planType || 'basic',
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription?.id || null,
      stripePriceId: priceId,
      nextBillingDate: periodEnd,
      cancelledAt: null
    }
  })

  // Aggiorna piano agenzia
  await prisma.agency.update({
    where: { id: agencyId },
    data: { piano: planType || 'basic' }
  })

  // Invia email benvenuto
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } })
  if (agency) {
    await sendEmail(
      agency.email,
      `Benvenuto nel piano ${planType?.toUpperCase() || 'BASIC'}!`,
      `
        <h1>Grazie per aver scelto Domus Report!</h1>
        <p>Il tuo abbonamento al piano <strong>${planType?.toUpperCase() || 'BASIC'}</strong> è ora attivo.</p>
        <p>Ecco cosa puoi fare ora:</p>
        <ul>
          <li>Creare widget personalizzati</li>
          <li>Gestire lead illimitati</li>
          <li>Accedere alle analytics avanzate</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Vai alla Dashboard</a></p>
      `
    )
  }

  // Crea notifica
  await prisma.notification.create({
    data: {
      agencyId,
      type: 'SUBSCRIPTION_UPGRADED',
      title: 'Abbonamento attivato',
      message: `Il tuo piano ${planType?.toUpperCase() || 'BASIC'} è ora attivo!`
    }
  })
}

// Handler: customer.subscription.updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription aggiornata:', subscription.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any

  // Trova agenzia
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  })

  if (!dbSubscription) {
    // Prova con customer ID
    const subByCustomer = await prisma.subscription.findFirst({
      where: { stripeCustomerId: subscription.customer as string }
    })
    if (!subByCustomer) {
      console.error('Subscription non trovata per:', subscription.id)
      return
    }
  }

  const agencyId = dbSubscription?.agencyId

  if (!agencyId) return

  // Determina il piano dal price
  let planType: PlanType = 'basic'
  const priceId = subData.items?.data?.[0]?.price?.id
  if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) {
    planType = 'premium'
  }

  // Mappa status Stripe a nostro status
  let status = 'active'
  if (subData.status === 'canceled') status = 'cancelled'
  else if (subData.status === 'past_due') status = 'past_due'
  else if (subData.status === 'trialing') status = 'trial'
  else if (subData.status === 'unpaid') status = 'expired'

  // Aggiorna DB
  await prisma.subscription.update({
    where: { agencyId },
    data: {
      planType,
      status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      nextBillingDate: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null,
      cancelledAt: subData.canceled_at
        ? new Date(subData.canceled_at * 1000)
        : null
    }
  })

  // Aggiorna piano agenzia
  await prisma.agency.update({
    where: { id: agencyId },
    data: { piano: planType }
  })
}

// Handler: customer.subscription.deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription cancellata:', subscription.id)

  // Trova agenzia
  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId: subscription.id },
        { stripeCustomerId: subscription.customer as string }
      ]
    }
  })

  if (!dbSubscription) {
    console.error('Subscription non trovata per cancellazione:', subscription.id)
    return
  }

  // Downgrade a free
  await prisma.subscription.update({
    where: { agencyId: dbSubscription.agencyId },
    data: {
      planType: 'free',
      status: 'expired',
      cancelledAt: new Date(),
      stripeSubscriptionId: null,
      stripePriceId: null,
      nextBillingDate: null
    }
  })

  await prisma.agency.update({
    where: { id: dbSubscription.agencyId },
    data: { piano: 'free' }
  })

  // Invia email
  const agency = await prisma.agency.findUnique({
    where: { id: dbSubscription.agencyId }
  })

  if (agency) {
    await sendEmail(
      agency.email,
      'Il tuo abbonamento è terminato',
      `
        <h1>Ci dispiace vederti andare!</h1>
        <p>Il tuo abbonamento a Domus Report è terminato.</p>
        <p>Sei stato riportato al piano Free con funzionalità limitate.</p>
        <p>Puoi riattivare il tuo abbonamento in qualsiasi momento dalla dashboard.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription">Riattiva abbonamento</a></p>
      `
    )
  }

  // Crea notifica
  await prisma.notification.create({
    data: {
      agencyId: dbSubscription.agencyId,
      type: 'SUBSCRIPTION_EXPIRED',
      title: 'Abbonamento terminato',
      message: 'Il tuo abbonamento è terminato. Sei stato riportato al piano Free.'
    }
  })
}

// Handler: invoice.payment_succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Pagamento riuscito:', invoice.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceData = invoice as any

  if (!invoiceData.subscription) return

  // Trova agenzia
  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId: invoiceData.subscription as string },
        { stripeCustomerId: invoiceData.customer as string }
      ]
    }
  })

  if (!dbSubscription) return

  // Aggiorna next billing date
  const stripeSubscription = await stripe.subscriptions.retrieve(
    invoiceData.subscription as string
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = stripeSubscription as any

  await prisma.subscription.update({
    where: { agencyId: dbSubscription.agencyId },
    data: {
      status: 'active',
      nextBillingDate: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null
    }
  })

  // Invia email ricevuta
  const agency = await prisma.agency.findUnique({
    where: { id: dbSubscription.agencyId }
  })

  if (agency && invoiceData.hosted_invoice_url) {
    await sendEmail(
      agency.email,
      `Ricevuta pagamento - €${((invoiceData.amount_paid || 0) / 100).toFixed(2)}`,
      `
        <h1>Pagamento ricevuto!</h1>
        <p>Grazie per il tuo pagamento di <strong>€${((invoiceData.amount_paid || 0) / 100).toFixed(2)}</strong>.</p>
        <p><a href="${invoiceData.hosted_invoice_url}">Visualizza ricevuta</a></p>
        ${invoiceData.invoice_pdf ? `<p><a href="${invoiceData.invoice_pdf}">Scarica PDF</a></p>` : ''}
      `
    )
  }
}

// Handler: invoice.payment_failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Pagamento fallito:', invoice.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceData = invoice as any

  if (!invoiceData.subscription) return

  // Trova agenzia
  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId: invoiceData.subscription as string },
        { stripeCustomerId: invoiceData.customer as string }
      ]
    }
  })

  if (!dbSubscription) return

  // Aggiorna status a past_due
  await prisma.subscription.update({
    where: { agencyId: dbSubscription.agencyId },
    data: { status: 'past_due' }
  })

  // Invia email alert
  const agency = await prisma.agency.findUnique({
    where: { id: dbSubscription.agencyId }
  })

  if (agency) {
    await sendEmail(
      agency.email,
      'Problema con il pagamento',
      `
        <h1>Pagamento non riuscito</h1>
        <p>Non siamo riusciti a processare il pagamento per il tuo abbonamento.</p>
        <p>Per evitare l'interruzione del servizio, aggiorna il tuo metodo di pagamento.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription">Aggiorna metodo di pagamento</a></p>
      `
    )
  }

  // Crea notifica
  await prisma.notification.create({
    data: {
      agencyId: dbSubscription.agencyId,
      type: 'PAYMENT_FAILED',
      title: 'Pagamento fallito',
      message: 'Il pagamento per il tuo abbonamento non è andato a buon fine. Aggiorna il metodo di pagamento.'
    }
  })
}

// Handler: payment_intent.succeeded - Per acquisti one-time (valutazioni extra)
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment Intent riuscito:', paymentIntent.id)

  const { agencyId, type, quantity } = paymentIntent.metadata || {}

  // Gestisci solo acquisti di valutazioni extra
  if (type !== 'extra_valuations' || !agencyId || !quantity) {
    return
  }

  const quantityNum = parseInt(quantity, 10)
  if (isNaN(quantityNum) || quantityNum < 1) return

  // Aggiungi valutazioni extra all'agenzia
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  await prisma.subscription.upsert({
    where: { agencyId },
    create: {
      agencyId,
      planType: 'free',
      status: 'active',
      extraValuationsPurchased: quantityNum,
      valuationsResetDate: startOfMonth
    },
    update: {
      extraValuationsPurchased: { increment: quantityNum }
    }
  })

  // Invia email conferma
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId }
  })

  if (agency) {
    const amount = (paymentIntent.amount / 100).toFixed(2)
    await sendEmail(
      agency.email,
      `Acquisto confermato - ${quantityNum} valutazioni extra`,
      `
        <h1>Acquisto completato!</h1>
        <p>Hai acquistato <strong>${quantityNum} valutazioni extra</strong> per €${amount}.</p>
        <p>Le valutazioni sono già disponibili nel tuo account.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Vai alla Dashboard</a></p>
      `
    )
  }

  // Crea notifica
  await prisma.notification.create({
    data: {
      agencyId,
      type: 'VALUATIONS_PURCHASED',
      title: 'Valutazioni acquistate',
      message: `Hai acquistato ${quantityNum} valutazioni extra.`
    }
  })
}
