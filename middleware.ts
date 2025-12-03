import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "domusreport-jwt-secret-change-in-production"
)

// Routes that require authentication
const protectedRoutes = ["/dashboard"]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookies
  const token = request.cookies.get("auth-token")?.value

  // Verify token
  let isAuthenticated = false
  let agencyId: string | null = null

  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      isAuthenticated = true
      agencyId = verified.payload.agencyId as string
    } catch (error) {
      // Token is invalid or expired
      console.error("JWT verification failed:", error)
    }
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if route is auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Add agency ID to request headers for API routes
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
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - widget (public widget embed pages)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|widget).*)",
  ],
}
