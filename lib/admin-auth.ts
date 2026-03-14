import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { createLogger } from "./logger"
import { createHash } from "crypto"
import { prisma } from "./prisma"
import { NextRequest, NextResponse } from "next/server"

const logger = createLogger("admin-auth")

function getJwtSecret() {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET environment variable is required")
  }
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
}

export interface AdminJWTPayload {
  adminId: string
  email: string
  nome: string
  ruolo: string
  role: "admin"
}

export async function verifyAdminAuth(
  token: string
): Promise<AdminJWTPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret())
    const payload = verified.payload as unknown as AdminJWTPayload

    if (payload.role !== "admin") {
      return null
    }

    const tokenHash = createHash("sha256").update(token).digest("hex")

    const session = await prisma.adminSession.findFirst({
      where: {
        tokenHash,
        adminId: payload.adminId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (!session) {
      logger.warn("Admin session not found or revoked", {
        adminId: payload.adminId,
      })
      return null
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (session.lastActivityAt < fiveMinutesAgo) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { lastActivityAt: new Date() },
      })
    }

    return payload
  } catch (error) {
    logger.error("Admin JWT verification failed", error)
    return null
  }
}

export async function getAuthAdmin(): Promise<AdminJWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-auth-token")

    if (!token) {
      return null
    }

    return await verifyAdminAuth(token.value)
  } catch (error) {
    logger.error("Get auth admin error", error)
    return null
  }
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ admin: AdminJWTPayload } | NextResponse> {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("admin-auth-token")?.value

  if (!token) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  const admin = await verifyAdminAuth(token)
  if (!admin) {
    return NextResponse.json({ error: "Accesso negato" }, { status: 403 })
  }

  return { admin }
}
