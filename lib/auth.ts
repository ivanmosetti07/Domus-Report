import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { createLogger } from "./logger"

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
 */
export async function verifyAuth(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as unknown as JWTPayload
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
