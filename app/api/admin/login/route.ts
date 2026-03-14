import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { SignJWT } from "jose"
import { createHash } from "crypto"
import type { AdminJWTPayload } from "@/lib/admin-auth"

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

    const email = body.email.trim().toLowerCase()

    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Email o password errati" },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(body.password, admin.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email o password errati" },
        { status: 401 }
      )
    }

    if (!admin.attivo) {
      return NextResponse.json(
        { error: "Account non attivo. Contatta il superadmin." },
        { status: 403 }
      )
    }

    const token = await new SignJWT({
      adminId: admin.id,
      email: admin.email,
      nome: admin.nome,
      ruolo: admin.ruolo,
      role: "admin",
    } satisfies AdminJWTPayload)
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

    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
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
      admin: {
        id: admin.id,
        nome: admin.nome,
        cognome: admin.cognome,
        email: admin.email,
        ruolo: admin.ruolo,
      },
    })

    response.cookies.set("admin-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Errore interno del server",
      },
      { status: 500 }
    )
  }
}
