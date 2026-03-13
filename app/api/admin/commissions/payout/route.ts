import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "ivan@mainstreamagency.it")
  .split(",")
  .map((e) => e.trim().toLowerCase())

export async function POST(request: NextRequest) {
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
