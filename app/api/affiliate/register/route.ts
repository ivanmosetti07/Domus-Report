import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { nanoid } from "nanoid"
import { validateEmail, validatePassword, validateName, sanitizeString } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.nome || !body.cognome || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      )
    }

    const nomeValidation = validateName(body.nome, "Nome")
    if (!nomeValidation.valid) {
      return NextResponse.json({ error: nomeValidation.error }, { status: 400 })
    }

    const cognomeValidation = validateName(body.cognome, "Cognome")
    if (!cognomeValidation.valid) {
      return NextResponse.json({ error: cognomeValidation.error }, { status: 400 })
    }

    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { email: emailValidation.sanitized },
    })

    if (existingAffiliate) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    const referralCode = nanoid(8).toUpperCase()

    const affiliate = await prisma.affiliate.create({
      data: {
        nome: nomeValidation.sanitized,
        cognome: cognomeValidation.sanitized,
        email: emailValidation.sanitized,
        password: hashedPassword,
        telefono: body.telefono ? sanitizeString(body.telefono) : null,
        referralCodes: {
          create: {
            code: referralCode,
            label: "Codice principale",
          },
        },
      },
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Registrazione completata!",
      affiliate,
      referralCode,
    })
  } catch (error) {
    console.error("Affiliate registration error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
