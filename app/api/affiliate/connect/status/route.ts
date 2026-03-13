import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { verifyAffiliateAuth } from "@/lib/affiliate-auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("affiliate-auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const auth = await verifyAffiliateAuth(token)
    if (!auth) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 })
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: auth.affiliateId },
      select: {
        stripeConnectId: true,
        stripeConnectOnboarded: true,
        payoutsEnabled: true,
      },
    })

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliato non trovato" }, { status: 404 })
    }

    let dashboardUrl: string | null = null

    if (affiliate.stripeConnectId && affiliate.stripeConnectOnboarded) {
      try {
        const account = await stripe.accounts.retrieve(affiliate.stripeConnectId)
        await prisma.affiliate.update({
          where: { id: auth.affiliateId },
          data: {
            stripeConnectOnboarded: account.details_submitted || false,
            payoutsEnabled: account.payouts_enabled || false,
          },
        })

        const loginLink = await stripe.accounts.createLoginLink(affiliate.stripeConnectId)
        dashboardUrl = loginLink.url
      } catch (error) {
        console.error("Error fetching Stripe Connect status:", error)
      }
    }

    return NextResponse.json({
      connected: !!affiliate.stripeConnectId,
      onboarded: affiliate.stripeConnectOnboarded,
      payoutsEnabled: affiliate.payoutsEnabled,
      dashboardUrl,
    })
  } catch (error) {
    console.error("Stripe Connect status error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
