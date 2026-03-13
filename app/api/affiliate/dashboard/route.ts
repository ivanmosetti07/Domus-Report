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
        id: true,
        nome: true,
        cognome: true,
        email: true,
        iban: true,
      },
    })

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliato non trovato" }, { status: 404 })
    }

    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalReferrals,
      activeReferrals,
      totalCommissions,
      pendingCommissions,
      monthlyCommissions,
      referralCodes,
    ] = await Promise.all([
      prisma.referral.count({ where: { affiliateId: auth.affiliateId } }),
      prisma.referral.count({ where: { affiliateId: auth.affiliateId, status: "subscribed" } }),
      prisma.commission.aggregate({
        where: { affiliateId: auth.affiliateId, status: "transferred" },
        _sum: { amountCents: true },
      }),
      prisma.commission.aggregate({
        where: { affiliateId: auth.affiliateId, status: "pending" },
        _sum: { amountCents: true },
      }),
      prisma.commission.aggregate({
        where: {
          affiliateId: auth.affiliateId,
          status: "transferred",
          createdAt: { gte: firstOfMonth },
        },
        _sum: { amountCents: true },
      }),
      prisma.referralCode.findMany({
        where: { affiliateId: auth.affiliateId },
        select: { id: true, code: true, label: true, isActive: true, clicks: true },
        orderBy: { createdAt: "desc" },
      }),
    ])

    const conversionRate = totalReferrals > 0
      ? Math.round((activeReferrals / totalReferrals) * 100)
      : 0

    return NextResponse.json({
      affiliate: {
        nome: affiliate.nome,
        cognome: affiliate.cognome,
        ibanConfigured: !!affiliate.iban,
      },
      stats: {
        totalReferrals,
        activeReferrals,
        totalEarningsCents: totalCommissions._sum.amountCents || 0,
        pendingEarningsCents: pendingCommissions._sum.amountCents || 0,
        monthlyEarningsCents: monthlyCommissions._sum.amountCents || 0,
        conversionRate,
      },
      referralCodes,
    })
  } catch (error) {
    console.error("Affiliate dashboard error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
