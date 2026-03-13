import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "ivan@mainstreamagency.it")
  .split(",")
  .map((e) => e.trim().toLowerCase())

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const auth = await verifyAuth(token)
    if (!auth || !ADMIN_EMAILS.includes(auth.email.toLowerCase())) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 })
    }

    const affiliates = await prisma.affiliate.findMany({
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
        attivo: true,
        stripeConnectOnboarded: true,
        payoutsEnabled: true,
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

        return {
          id: a.id,
          nome: a.nome,
          cognome: a.cognome,
          email: a.email,
          attivo: a.attivo,
          stripeConnectOnboarded: a.stripeConnectOnboarded,
          payoutsEnabled: a.payoutsEnabled,
          dataCreazione: a.dataCreazione,
          referralsCount: a._count.referrals,
          commissionsCount: a._count.commissions,
          totalEarningsCents: totalCommissions._sum.amountCents || 0,
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
