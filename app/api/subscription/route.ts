import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET /api/subscription - Ottieni subscription agenzia
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyAuth(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Ottieni subscription
    const subscription = await prisma.subscription.findUnique({
      where: { agencyId: agency.agencyId },
    })

    // Se non esiste, crea subscription free di default
    if (!subscription) {
      const newSubscription = await prisma.subscription.create({
        data: {
          agencyId: agency.agencyId,
          planType: 'free',
          status: 'active',
        },
      })
      return NextResponse.json({ subscription: newSubscription })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Errore GET subscription:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// POST /api/subscription - Crea/Aggiorna subscription
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyAuth(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const body = await request.json()
    const { planType, status, trialEndsAt, paymentMethodId } = body

    // Valida planType
    const validPlans = ['free', 'basic', 'premium']
    if (planType && !validPlans.includes(planType)) {
      return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })
    }

    // Valida status
    const validStatuses = ['active', 'cancelled', 'expired', 'trial']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status non valido' }, { status: 400 })
    }

    // Verifica se esiste già una subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { agencyId: agency.agencyId },
    })

    let subscription

    if (existingSubscription) {
      // Aggiorna subscription esistente
      subscription = await prisma.subscription.update({
        where: { agencyId: agency.agencyId },
        data: {
          planType: planType || existingSubscription.planType,
          status: status || existingSubscription.status,
          trialEndsAt: trialEndsAt !== undefined ? trialEndsAt : existingSubscription.trialEndsAt,
          paymentMethodId: paymentMethodId !== undefined ? paymentMethodId : existingSubscription.paymentMethodId,
          // Calcola nextBillingDate se passa a piano paid
          nextBillingDate: planType && planType !== 'free'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 giorni
            : null,
        },
      })

      // Aggiorna anche il campo piano su Agency per consistenza
      await prisma.agency.update({
        where: { id: agency.agencyId },
        data: { piano: planType || existingSubscription.planType },
      })
    } else {
      // Crea nuova subscription
      subscription = await prisma.subscription.create({
        data: {
          agencyId: agency.agencyId,
          planType: planType || 'free',
          status: status || 'active',
          trialEndsAt: trialEndsAt || null,
          paymentMethodId: paymentMethodId || null,
          nextBillingDate: planType && planType !== 'free'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
        },
      })

      // Aggiorna piano su Agency
      await prisma.agency.update({
        where: { id: agency.agencyId },
        data: { piano: planType || 'free' },
      })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Errore POST subscription:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// DELETE /api/subscription - Cancella subscription (downgrade a free)
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyAuth(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Aggiorna subscription a cancelled
    const subscription = await prisma.subscription.update({
      where: { agencyId: agency.agencyId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        planType: 'free',
        nextBillingDate: null,
      },
    })

    // Aggiorna piano su Agency
    await prisma.agency.update({
      where: { id: agency.agencyId },
      data: { piano: 'free' },
    })

    return NextResponse.json({ subscription, message: 'Subscription cancellata' })
  } catch (error) {
    console.error('Errore DELETE subscription:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
