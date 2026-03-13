import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("account_id")

    if (!accountId) {
      return NextResponse.redirect(new URL("/affiliate/dashboard/connect?status=error", request.url))
    }

    const account = await stripe.accounts.retrieve(accountId)

    await prisma.affiliate.update({
      where: { stripeConnectId: accountId },
      data: {
        stripeConnectOnboarded: account.details_submitted || false,
        payoutsEnabled: account.payouts_enabled || false,
      },
    })

    const status = account.details_submitted ? "success" : "incomplete"
    return NextResponse.redirect(new URL(`/affiliate/dashboard/connect?status=${status}`, request.url))
  } catch (error) {
    console.error("Stripe Connect callback error:", error)
    return NextResponse.redirect(new URL("/affiliate/dashboard/connect?status=error", request.url))
  }
}
