import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const body = await request.json()
    const { affiliateId, paymentReference } = body

    if (!affiliateId || !paymentReference) {
      return NextResponse.json(
        { error: "affiliateId e paymentReference sono obbligatori" },
        { status: 400 }
      )
    }

    // Trova tutte le commissioni pending dell'affiliato
    const pendingCommissions = await prisma.commission.findMany({
      where: { affiliateId, status: "pending" },
    })

    if (pendingCommissions.length === 0) {
      return NextResponse.json(
        { error: "Nessuna commissione in attesa per questo affiliato" },
        { status: 404 }
      )
    }

    const totalCents = pendingCommissions.reduce((sum, c) => sum + c.amountCents, 0)

    // Aggiorna tutte le commissioni pending come pagate
    const result = await prisma.commission.updateMany({
      where: { affiliateId, status: "pending" },
      data: {
        status: "transferred",
        paymentReference: paymentReference.trim(),
        paidAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      paidCount: result.count,
      totalCents,
      message: `${result.count} commissioni segnate come pagate (€${(totalCents / 100).toFixed(2)})`,
    })
  } catch (error) {
    console.error("Admin commission payout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
