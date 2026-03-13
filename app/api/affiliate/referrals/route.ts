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

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const skip = (page - 1) * limit

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where: { affiliateId: auth.affiliateId },
        include: {
          agency: {
            select: { nome: true, email: true, piano: true, dataCreazione: true },
          },
          referralCode: {
            select: { code: true },
          },
          _count: {
            select: { commissions: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.referral.count({ where: { affiliateId: auth.affiliateId } }),
    ])

    return NextResponse.json({
      referrals: referrals.map((r) => ({
        id: r.id,
        agencyName: r.agency.nome,
        agencyEmail: r.agency.email,
        agencyPlan: r.agency.piano,
        referralCode: r.referralCode.code,
        status: r.status,
        convertedAt: r.convertedAt,
        createdAt: r.createdAt,
        commissionsCount: r._count.commissions,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Affiliate referrals error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
