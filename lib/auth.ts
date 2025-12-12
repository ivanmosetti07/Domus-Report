import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { createLogger } from "./logger"
import { createHash } from "crypto"
import { prisma } from "./prisma"

const logger = createLogger('auth')

// JWT secret - same as in login route
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "domusreport-jwt-secret-change-in-production"
)

export interface JWTPayload {
  agencyId: string
  email: string
  nome: string
  widgetId: string
}

/**
 * Verifies JWT token and returns payload
 * Now includes database session verification
 */
export async function verifyAuth(token: string): Promise<JWTPayload | null> {
  try {
    // 1. Verify JWT signature
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload as unknown as JWTPayload

    // 2. Calculate token hash
    const tokenHash = createHash("sha256").update(token).digest("hex")

    // 3. Verify session exists and is valid in database
    const session = await prisma.agencySession.findFirst({
      where: {
        tokenHash,
        agencyId: payload.agencyId,
        revokedAt: null, // Not revoked
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
    })

    if (!session) {
      // Session revoked or doesn't exist
      logger.warn("Session not found or revoked", { agencyId: payload.agencyId })
      return null
    }

    // 4. Update lastActivityAt (only if older than 5 minutes to reduce DB writes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (session.lastActivityAt < fiveMinutesAgo) {
      await prisma.agencySession.update({
        where: { id: session.id },
        data: { lastActivityAt: new Date() },
      })
    }

    // 5. Return payload
    return payload
  } catch (error) {
    logger.error("JWT verification failed", error)
    return null
  }
}

/**
 * Gets the current authenticated agency from cookies
 * Use this in server components and API routes
 */
export async function getAuthAgency(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return null
    }

    return await verifyAuth(token.value)
  } catch (error) {
    logger.error("Get auth agency error", error)
    return null
  }
}

/**
 * Checks if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const agency = await getAuthAgency()
  return agency !== null
}
