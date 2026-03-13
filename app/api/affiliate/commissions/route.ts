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
    const status = searchParams.get("status")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { affiliateId: auth.affiliateId }
    if (status && ["pending", "transferred", "failed"].includes(status)) {
      where.status = status
    }

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        include: {
          referral: {
            include: {
              agency: { select: { nome: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.commission.count({ where }),
    ])

    return NextResponse.json({
      commissions: commissions.map((c) => ({
        id: c.id,
        agencyName: c.referral.agency.nome,
        amountCents: c.amountCents,
        invoiceAmountCents: c.invoiceAmountCents,
        commissionRate: c.commissionRate,
        currency: c.currency,
        status: c.status,
        paymentReference: c.paymentReference,
        paidAt: c.paidAt,
        failReason: c.failReason,
        createdAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Affiliate commissions error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
