import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { createLogger } from "./logger"
import { createHash } from "crypto"
import { prisma } from "./prisma"

const logger = createLogger('affiliate-auth')

function getJwtSecret() {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET environment variable is required")
  }
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
}

export interface AffiliateJWTPayload {
  affiliateId: string
  email: string
  nome: string
  role: 'affiliate'
}

export async function verifyAffiliateAuth(token: string): Promise<AffiliateJWTPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret())
    const payload = verified.payload as unknown as AffiliateJWTPayload

    if (payload.role !== 'affiliate') {
      return null
    }

    const tokenHash = createHash("sha256").update(token).digest("hex")

    const session = await prisma.affiliateSession.findFirst({
      where: {
        tokenHash,
        affiliateId: payload.affiliateId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (!session) {
      logger.warn("Affiliate session not found or revoked", { affiliateId: payload.affiliateId })
      return null
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (session.lastActivityAt < fiveMinutesAgo) {
      await prisma.affiliateSession.update({
        where: { id: session.id },
        data: { lastActivityAt: new Date() },
      })
    }

    return payload
  } catch (error) {
    logger.error("Affiliate JWT verification failed", error)
    return null
  }
}

export async function getAuthAffiliate(): Promise<AffiliateJWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("affiliate-auth-token")

    if (!token) {
      return null
    }

    return await verifyAffiliateAuth(token.value)
  } catch (error) {
    logger.error("Get auth affiliate error", error)
    return null
  }
}
