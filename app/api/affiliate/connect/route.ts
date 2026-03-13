import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { verifyAffiliateAuth } from "@/lib/affiliate-auth"

export async function POST(request: NextRequest) {
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
    })

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliato non trovato" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domusreport.it'
    let accountId = affiliate.stripeConnectId

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'IT',
        email: affiliate.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          affiliateId: affiliate.id,
        },
      })

      accountId = account.id

      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: { stripeConnectId: accountId },
      })
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/affiliate/dashboard/connect?status=refresh`,
      return_url: `${baseUrl}/api/affiliate/connect/callback?account_id=${accountId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error("Stripe Connect setup error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
