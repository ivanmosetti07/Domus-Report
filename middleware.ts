import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is required")
}

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

// Routes that require agency authentication
const protectedRoutes = ["/dashboard", "/onboarding"]

// Routes that should redirect to dashboard if already authenticated (agency)
const authRoutes = ["/login", "/register"]

// Routes that require affiliate authentication
const affiliateProtectedRoutes = ["/affiliate/dashboard"]

// Routes that should redirect to affiliate dashboard if already authenticated
const affiliateAuthRoutes = ["/affiliate/login", "/affiliate/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // === AFFILIATE ROUTES ===
  const isAffiliateProtected = affiliateProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAffiliateAuth = affiliateAuthRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isAffiliateProtected || isAffiliateAuth) {
    const affiliateToken = request.cookies.get("affiliate-auth-token")?.value
    let isAffiliateAuthenticated = false

    if (affiliateToken) {
      try {
        const verified = await jwtVerify(affiliateToken, JWT_SECRET)
        if (verified.payload.role === 'affiliate') {
          isAffiliateAuthenticated = true
        }
      } catch {
        // Token invalid
      }
    }

    if (isAffiliateProtected && !isAffiliateAuthenticated) {
      const url = new URL("/affiliate/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    if (isAffiliateAuth && isAffiliateAuthenticated) {
      return NextResponse.redirect(new URL("/affiliate/dashboard", request.url))
    }

    return NextResponse.next()
  }

  // === AGENCY ROUTES ===
  const token = request.cookies.get("auth-token")?.value

  let isAuthenticated = false
  let agencyId: string | null = null

  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      isAuthenticated = true
      agencyId = verified.payload.agencyId as string
    } catch (error) {
      console.error("JWT verification failed:", error)
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isAuthenticated && agencyId) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-agency-id", agencyId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/auth|api/affiliate/register|api/affiliate/login|api/affiliate/track-click|api/affiliate/connect/callback|_next/static|_next/image|favicon.ico|.*\\..*|widget).*)",
  ],
}
