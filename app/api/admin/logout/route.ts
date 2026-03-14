import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token =
      authHeader?.replace("Bearer ", "") ||
      request.cookies.get("admin-auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const auth = await verifyAdminAuth(token)
    if (!auth) {
      return NextResponse.json(
        { error: "Token non valido" },
        { status: 401 }
      )
    }

    const tokenHash = createHash("sha256").update(token).digest("hex")

    await prisma.adminSession.updateMany({
      where: {
        tokenHash,
        adminId: auth.adminId,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    const response = NextResponse.json({
      success: true,
      message: "Logout effettuato con successo",
    })

    response.cookies.delete("admin-auth-token")
    return response
  } catch (error) {
    console.error("Admin logout error:", error)
    const response = NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Errore interno del server",
      },
      { status: 500 }
    )
    response.cookies.delete("admin-auth-token")
    return response
  }
}
