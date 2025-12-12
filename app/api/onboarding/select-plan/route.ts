import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export interface SelectPlanRequest {
  planType: 'free' | 'basic' | 'premium'
  trialDays: number // 0-7
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
    const { planType, trialDays } = body

    // 3. Validate input
    if (!planType || !['free', 'basic', 'premium'].includes(planType)) {
      return NextResponse.json(
        { error: "Piano non valido" },
        { status: 400 }
      )
    }

    if (trialDays < 0 || trialDays > 7) {
      return NextResponse.json(
        { error: "Giorni trial non validi (0-7)" },
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
      data: { piano: planType }
    })

    // 6. Create or update subscription
    let trialEndsAt: Date | null = null
    let status: string = 'active'

    if (planType === 'free') {
      // Piano free: nessun trial, attivo immediatamente
      status = 'active'
      trialEndsAt = null
    } else {
      // Piano a pagamento: crea trial
      status = 'trial'
      trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays)
    }

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planType,
          status,
          trialEndsAt,
          trialDays,
          onboardingCompletedAt: new Date()
        }
      })
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          agencyId: auth.agencyId,
          planType,
          status,
          trialEndsAt,
          trialDays,
          onboardingCompletedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Piano selezionato con successo",
      plan: {
        planType,
        status,
        trialDays,
        trialEndsAt
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
