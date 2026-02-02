import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { nanoid } from "nanoid"
import { validateEmail, validatePassword, validateCity, sanitizeString } from "@/lib/validation"
import { cookies } from "next/headers"

export interface RegisterRequest {
  nome: string
  email: string
  password: string
  citta: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterRequest

    // Validate required fields
    if (!body.nome || !body.email || !body.password || !body.citta) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      )
    }

    // Sanitize and validate agency name
    const nome = sanitizeString(body.nome)
    if (!nome || nome.length < 2) {
      return NextResponse.json(
        { error: "Nome agenzia deve essere almeno 2 caratteri" },
        { status: 400 }
      )
    }

    if (nome.length > 100) {
      return NextResponse.json(
        { error: "Nome agenzia troppo lungo" },
        { status: 400 }
      )
    }

    // Validate email
    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Validate city
    const cityValidation = validateCity(body.citta)
    if (!cityValidation.valid) {
      return NextResponse.json(
        { error: cityValidation.error },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingAgency = await prisma.agency.findUnique({
      where: { email: emailValidation.sanitized },
    })

    if (existingAgency) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 409 }
      )
    }

    // Check for referral code in cookies
    const cookieStore = await cookies()
    const referralCode = cookieStore.get("referral_code")?.value
    let affiliateId: string | null = null

    if (referralCode) {
      // Find the affiliate by referral code
      const affiliate = await prisma.affiliate.findUnique({
        where: { referralCode },
        select: { id: true },
      })
      if (affiliate) {
        affiliateId = affiliate.id
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Generate unique widget ID
    const widgetId = nanoid(16) // 16 characters unique ID

    // Create agency with optional affiliate link
    const agency = await prisma.agency.create({
      data: {
        nome,
        email: emailValidation.sanitized,
        password: hashedPassword,
        citta: cityValidation.sanitized,
        widgetId,
        piano: "free", // Default free durante onboarding
        attiva: true,
        affiliateId, // Link to affiliate if referral code was valid
      },
      select: {
        id: true,
        nome: true,
        email: true,
        citta: true,
        widgetId: true,
        piano: true,
      },
    })

    // Create response and clear referral cookie after use
    const response = NextResponse.json({
      success: true,
      message: "Registrazione completata! Scegli il tuo piano.",
      agency: {
        id: agency.id,
        nome: agency.nome,
        email: agency.email,
      },
    })

    // Clear the referral code cookie after successful registration
    if (referralCode) {
      response.cookies.delete("referral_code")
    }

    return response
  } catch (error) {
    console.error("Registration error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
