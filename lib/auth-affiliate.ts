import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { createLogger } from "./logger"
import { createHash } from "crypto"
import { prisma } from "./prisma"

const logger = createLogger('auth-affiliate')

// JWT secret - same as in main auth
const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || "domusreport-jwt-secret-change-in-production"
)

export interface AffiliateJWTPayload {
    affiliateId: string
    email: string
    nome: string
    cognome: string
    referralCode: string
}

/**
 * Verifies Affiliate JWT token and returns payload
 * Includes database session verification
 */
export async function verifyAffiliateAuth(token: string): Promise<AffiliateJWTPayload | null> {
    try {
        // 1. Verify JWT signature
        const verified = await jwtVerify(token, JWT_SECRET)
        const payload = verified.payload as unknown as AffiliateJWTPayload

        // 2. Calculate token hash
        const tokenHash = createHash("sha256").update(token).digest("hex")

        // 3. Verify session exists and is valid in database
        const session = await prisma.affiliateSession.findFirst({
            where: {
                tokenHash,
                affiliateId: payload.affiliateId,
                revokedAt: null, // Not revoked
                expiresAt: {
                    gt: new Date(), // Not expired
                },
            },
        })

        if (!session) {
            // Session revoked or doesn't exist
            logger.warn("Affiliate session not found or revoked", { affiliateId: payload.affiliateId })
            return null
        }

        // 4. Update lastActivityAt (only if older than 5 minutes to reduce DB writes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        if (session.lastActivityAt < fiveMinutesAgo) {
            await prisma.affiliateSession.update({
                where: { id: session.id },
                data: { lastActivityAt: new Date() },
            })
        }

        // 5. Return payload
        return payload
    } catch (error) {
        logger.error("Affiliate JWT verification failed", error)
        return null
    }
}

/**
 * Gets the current authenticated affiliate from cookies
 * Use this in server components and API routes
 */
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

/**
 * Checks if affiliate is authenticated
 */
export async function isAffiliateAuthenticated(): Promise<boolean> {
    const affiliate = await getAuthAffiliate()
    return affiliate !== null
}
