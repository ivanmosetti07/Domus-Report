import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { nanoid } from "nanoid"
import { validateEmail, validatePassword, validateCity, sanitizeString } from "@/lib/validation"

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

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Generate unique widget ID
    const widgetId = nanoid(16) // 16 characters unique ID

    // Create agency
    const agency = await prisma.agency.create({
      data: {
        nome,
        email: emailValidation.sanitized,
        password: hashedPassword,
        citta: cityValidation.sanitized,
        widgetId,
        piano: "free",
        attiva: true,
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

    return NextResponse.json({
      success: true,
      message: "Registrazione completata con successo",
      agency: {
        id: agency.id,
        nome: agency.nome,
        email: agency.email,
      },
    })
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
