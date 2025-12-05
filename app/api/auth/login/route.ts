import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { SignJWT } from "jose"
import { validateEmail } from "@/lib/validation"

export interface LoginRequest {
  email: string
  password: string
}

// JWT secret from environment or generate one
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "domusreport-jwt-secret-change-in-production"
)

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginRequest

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatori" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: "Formato email non valido" },
        { status: 400 }
      )
    }

    // Find agency by email
    const agency = await prisma.agency.findUnique({
      where: { email: emailValidation.sanitized },
    })

    if (!agency) {
      return NextResponse.json(
        { error: "Email o password errati" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(body.password, agency.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email o password errati" },
        { status: 401 }
      )
    }

    // Check if agency is active
    if (!agency.attiva) {
      return NextResponse.json(
        { error: "Account non attivo. Contatta il supporto." },
        { status: 403 }
      )
    }

    // Create JWT token
    const token = await new SignJWT({
      agencyId: agency.id,
      email: agency.email,
      nome: agency.nome,
      widgetId: agency.widgetId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // Token expires in 7 days
      .sign(JWT_SECRET)

    // Create response with cookie and token in body
    const response = NextResponse.json({
      success: true,
      message: "Login effettuato con successo",
      token, // Restituisce il token anche nel body per localStorage
      agency: {
        id: agency.id,
        nome: agency.nome,
        email: agency.email,
        widgetId: agency.widgetId,
        piano: agency.piano,
      },
    })

    // Set HTTP-only cookie for security (backup)
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
