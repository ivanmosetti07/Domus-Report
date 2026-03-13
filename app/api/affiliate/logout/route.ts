import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { verifyAffiliateAuth } from "@/lib/affiliate-auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("affiliate-auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const auth = await verifyAffiliateAuth(token)
    if (!auth) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 })
    }

    const tokenHash = createHash("sha256").update(token).digest("hex")

    await prisma.affiliateSession.updateMany({
      where: {
        tokenHash,
        affiliateId: auth.affiliateId,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    const response = NextResponse.json({
      success: true,
      message: "Logout effettuato con successo",
    })

    response.cookies.delete("affiliate-auth-token")
    return response
  } catch (error) {
    console.error("Affiliate logout error:", error)
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
    response.cookies.delete("affiliate-auth-token")
    return response
  }
}
