import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { SignJWT } from "jose"
import { validateEmail } from "@/lib/validation"
import { createHash } from "crypto"

function getJwtSecret() {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET environment variable is required")
  }
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatori" },
        { status: 400 }
      )
    }

    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: "Formato email non valido" },
        { status: 400 }
      )
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { email: emailValidation.sanitized },
    })

    if (!affiliate) {
      return NextResponse.json(
        { error: "Email o password errati" },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(body.password, affiliate.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email o password errati" },
        { status: 401 }
      )
    }

    if (!affiliate.attivo) {
      return NextResponse.json(
        { error: "Account non attivo. Contatta il supporto." },
        { status: 403 }
      )
    }

    const token = await new SignJWT({
      affiliateId: affiliate.id,
      email: affiliate.email,
      nome: affiliate.nome,
      role: 'affiliate',
    } satisfies import("@/lib/affiliate-auth").AffiliateJWTPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getJwtSecret())

    const tokenHash = createHash("sha256").update(token).digest("hex")

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.affiliateSession.create({
      data: {
        affiliateId: affiliate.id,
        tokenHash,
        ipAddress,
        userAgent,
        loginAt: new Date(),
        expiresAt,
        lastActivityAt: new Date(),
      },
    })

    const response = NextResponse.json({
      success: true,
      message: "Login effettuato con successo",
      token,
      affiliate: {
        id: affiliate.id,
        nome: affiliate.nome,
        cognome: affiliate.cognome,
        email: affiliate.email,
      },
    })

    response.cookies.set("affiliate-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Affiliate login error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
