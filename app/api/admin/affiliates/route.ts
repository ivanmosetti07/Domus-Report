import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const affiliates = await prisma.affiliate.findMany({
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
        attivo: true,
        iban: true,
        ibanAccountHolder: true,
        dataCreazione: true,
        _count: {
          select: {
            referrals: true,
            commissions: true,
          },
        },
      },
      orderBy: { dataCreazione: "desc" },
    })

    // Aggregate commissioni per ogni affiliato
    const affiliatesWithStats = await Promise.all(
      affiliates.map(async (a) => {
        const totalCommissions = await prisma.commission.aggregate({
          where: { affiliateId: a.id, status: "transferred" },
          _sum: { amountCents: true },
        })

        const pendingCommissions = await prisma.commission.aggregate({
          where: { affiliateId: a.id, status: "pending" },
          _sum: { amountCents: true },
        })

        return {
          id: a.id,
          nome: a.nome,
          cognome: a.cognome,
          email: a.email,
          attivo: a.attivo,
          iban: a.iban,
          ibanAccountHolder: a.ibanAccountHolder,
          ibanConfigured: !!a.iban,
          dataCreazione: a.dataCreazione,
          referralsCount: a._count.referrals,
          commissionsCount: a._count.commissions,
          totalEarningsCents: totalCommissions._sum.amountCents || 0,
          pendingEarningsCents: pendingCommissions._sum.amountCents || 0,
        }
      })
    )

    return NextResponse.json({ affiliates: affiliatesWithStats })
  } catch (error) {
    console.error("Admin affiliates error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
