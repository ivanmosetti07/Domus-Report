import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "domusreport-jwt-secret-change-in-production"
)

// Routes that require agency authentication
const protectedRoutes = ["/dashboard"]

// Routes that should redirect to dashboard if agency already authenticated
const authRoutes = ["/login", "/register"]

// Routes that require affiliate authentication
const affiliateProtectedRoutes = ["/affiliate/dashboard"]

// Routes that should redirect to affiliate dashboard if affiliate already authenticated
const affiliateAuthRoutes = ["/affiliate/login", "/affiliate/register"]

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const response = NextResponse.next()

  // Handle referral code tracking - store in cookie when ?ref= is present
  const refCode = searchParams.get("ref")
  if (refCode) {
    response.cookies.set("referral_code", refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })
  }

  // Get auth tokens from cookies
  const agencyToken = request.cookies.get("auth-token")?.value
  const affiliateToken = request.cookies.get("affiliate-auth-token")?.value

  // Verify agency token
  let isAgencyAuthenticated = false
  let agencyId: string | null = null

  if (agencyToken) {
    try {
      const verified = await jwtVerify(agencyToken, JWT_SECRET)
      isAgencyAuthenticated = true
      agencyId = verified.payload.agencyId as string
    } catch (error) {
      // Token is invalid or expired
      console.error("Agency JWT verification failed:", error)
    }
  }

  // Verify affiliate token
  let isAffiliateAuthenticated = false
  let affiliateId: string | null = null

  if (affiliateToken) {
    try {
      const verified = await jwtVerify(affiliateToken, JWT_SECRET)
      isAffiliateAuthenticated = true
      affiliateId = verified.payload.affiliateId as string
    } catch (error) {
      // Token is invalid or expired
      console.error("Affiliate JWT verification failed:", error)
    }
  }

  // Check route types
  const isAgencyProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAgencyAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isAffiliateProtectedRoute = affiliateProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAffiliateAuthRoute = affiliateAuthRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Handle agency routes
  if (isAgencyProtectedRoute && !isAgencyAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isAgencyAuthRoute && isAgencyAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Handle affiliate routes
  if (isAffiliateProtectedRoute && !isAffiliateAuthenticated) {
    const url = new URL("/affiliate/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isAffiliateAuthRoute && isAffiliateAuthenticated) {
    return NextResponse.redirect(new URL("/affiliate/dashboard", request.url))
  }

  // Add agency ID to request headers for API routes
  if (isAgencyAuthenticated && agencyId) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-agency-id", agencyId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Add affiliate ID to request headers for API routes
  if (isAffiliateAuthenticated && affiliateId) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-affiliate-id", affiliateId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - api/affiliate (affiliate API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - widget (public widget embed pages)
     */
    "/((?!api/auth|api/affiliate|_next/static|_next/image|favicon.ico|.*\\..*|widget).*)",
  ],
}
