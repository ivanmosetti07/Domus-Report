import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
        iban: true,
        ibanAccountHolder: true,
      },
    })

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliato non trovato" }, { status: 404 })
    }

    // Calcola saldo pending
    const pendingBalance = await prisma.commission.aggregate({
      where: { affiliateId: auth.affiliateId, status: "pending" },
      _sum: { amountCents: true },
    })

    return NextResponse.json({
      ibanConfigured: !!affiliate.iban,
      iban: affiliate.iban ? `${affiliate.iban.slice(0, 4)}****${affiliate.iban.slice(-4)}` : null,
      ibanAccountHolder: affiliate.ibanAccountHolder,
      pendingBalanceCents: pendingBalance._sum.amountCents || 0,
    })
  } catch (error) {
    console.error("IBAN status error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
