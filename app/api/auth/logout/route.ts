import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      )
    }

    // Verify token
    const auth = await verifyAuth(token)
    if (!auth) {
      return NextResponse.json(
        { error: "Token non valido" },
        { status: 401 }
      )
    }

    // Calculate token hash
    const tokenHash = createHash("sha256").update(token).digest("hex")

    // Revoke session in database
    await prisma.agencySession.updateMany({
      where: {
        tokenHash,
        agencyId: auth.agencyId,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logout effettuato con successo",
    })

    // Clear auth cookie
    response.cookies.delete("auth-token")

    return response
  } catch (error) {
    console.error("Logout error:", error)

    const response = NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )

    // Clear cookie anyway in case of error
    response.cookies.delete("auth-token")

    return response
  }
}
