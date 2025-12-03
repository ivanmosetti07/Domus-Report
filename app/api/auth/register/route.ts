import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { nanoid } from "nanoid"

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Formato email non valido" },
        { status: 400 }
      )
    }

    // Validate password length
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "La password deve essere di almeno 8 caratteri" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingAgency = await prisma.agency.findUnique({
      where: { email: body.email.toLowerCase() },
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
        nome: body.nome,
        email: body.email.toLowerCase(),
        password: hashedPassword,
        citta: body.citta,
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
