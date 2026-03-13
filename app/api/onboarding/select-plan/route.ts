import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export interface SelectPlanRequest {
  planType: 'free'
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: "Token di autenticazione mancante" },
        { status: 401 }
      )
    }

    const auth = await verifyAuth(token)
    if (!auth) {
      return NextResponse.json(
        { error: "Token non valido o scaduto" },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = (await request.json()) as SelectPlanRequest
    const { planType } = body

    // 3. Validate input — solo piano free ammesso (i piani a pagamento passano da create-trial-subscription con Stripe)
    if (planType !== 'free') {
      return NextResponse.json(
        { error: "Questa API supporta solo il piano free. Per i piani a pagamento usa il flusso Stripe." },
        { status: 400 }
      )
    }

    // 4. Check if agency already has subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { agencyId: auth.agencyId }
    })

    if (existingSubscription && existingSubscription.onboardingCompletedAt) {
      return NextResponse.json(
        { error: "Onboarding già completato" },
        { status: 400 }
      )
    }

    // 5. Update agency piano
    await prisma.agency.update({
      where: { id: auth.agencyId },
      data: { piano: 'free' }
    })

    // 6. Create or update subscription (piano free: attivo immediatamente, nessun trial)
    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planType: 'free',
          status: 'active',
          trialEndsAt: null,
          trialDays: 0,
          onboardingCompletedAt: new Date()
        }
      })
    } else {
      await prisma.subscription.create({
        data: {
          agencyId: auth.agencyId,
          planType: 'free',
          status: 'active',
          trialEndsAt: null,
          trialDays: 0,
          onboardingCompletedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Piano selezionato con successo",
      plan: {
        planType: 'free',
        status: 'active',
        trialDays: 0,
        trialEndsAt: null
      }
    })

  } catch (error) {
    console.error("Select plan error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
