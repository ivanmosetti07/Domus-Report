import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

/**
 * GET /api/auth/sessions
 * Returns all active sessions for the authenticated agency
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    // Verify token
    const auth = await verifyAuth(token)
    if (!auth) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 })
    }

    // Get current token hash to mark current session
    const currentTokenHash = createHash("sha256").update(token).digest("hex")

    // Fetch all active sessions for this agency
    const sessions = await prisma.agencySession.findMany({
      where: {
        agencyId: auth.agencyId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastActivityAt: "desc",
      },
      select: {
        id: true,
        tokenHash: true,
        ipAddress: true,
        userAgent: true,
        loginAt: true,
        expiresAt: true,
        lastActivityAt: true,
      },
    })

    // Mark current session and format response
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      loginAt: session.loginAt,
      expiresAt: session.expiresAt,
      lastActivityAt: session.lastActivityAt,
      isCurrent: session.tokenHash === currentTokenHash,
    }))

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
    })
  } catch (error) {
    console.error("Get sessions error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/sessions?sessionId=xxx
 * Revokes a specific session
 * Or DELETE /api/auth/sessions?all=true to revoke all except current
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    // Verify token
    const auth = await verifyAuth(token)
    if (!auth) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const revokeAll = searchParams.get("all") === "true"

    if (revokeAll) {
      // Revoke all sessions except current one
      const currentTokenHash = createHash("sha256").update(token).digest("hex")

      await prisma.agencySession.updateMany({
        where: {
          agencyId: auth.agencyId,
          revokedAt: null,
          tokenHash: {
            not: currentTokenHash,
          },
        },
        data: {
          revokedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Tutte le altre sessioni sono state revocate",
      })
    } else if (sessionId) {
      // Revoke specific session
      const currentTokenHash = createHash("sha256").update(token).digest("hex")

      // Verify session belongs to this agency
      const session = await prisma.agencySession.findFirst({
        where: {
          id: sessionId,
          agencyId: auth.agencyId,
        },
      })

      if (!session) {
        return NextResponse.json({ error: "Sessione non trovata" }, { status: 404 })
      }

      // Don't allow revoking current session via this endpoint
      if (session.tokenHash === currentTokenHash) {
        return NextResponse.json(
          { error: "Usa /api/auth/logout per terminare la sessione corrente" },
          { status: 400 }
        )
      }

      // Revoke the session
      await prisma.agencySession.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      })

      return NextResponse.json({
        success: true,
        message: "Sessione revocata con successo",
      })
    } else {
      return NextResponse.json(
        { error: "Parametro sessionId o all richiesto" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Delete session error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
