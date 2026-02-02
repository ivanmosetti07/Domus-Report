import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { nanoid } from "nanoid"
import { validateEmail, validatePassword, sanitizeString } from "@/lib/validation"

export interface AffiliateRegisterRequest {
    nome: string
    cognome: string
    email: string
    password: string
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as AffiliateRegisterRequest

        // Validate required fields
        if (!body.nome || !body.cognome || !body.email || !body.password) {
            return NextResponse.json(
                { error: "Tutti i campi sono obbligatori" },
                { status: 400 }
            )
        }

        // Sanitize and validate nome
        const nome = sanitizeString(body.nome)
        if (!nome || nome.length < 2) {
            return NextResponse.json(
                { error: "Nome deve essere almeno 2 caratteri" },
                { status: 400 }
            )
        }

        if (nome.length > 50) {
            return NextResponse.json(
                { error: "Nome troppo lungo" },
                { status: 400 }
            )
        }

        // Sanitize and validate cognome
        const cognome = sanitizeString(body.cognome)
        if (!cognome || cognome.length < 2) {
            return NextResponse.json(
                { error: "Cognome deve essere almeno 2 caratteri" },
                { status: 400 }
            )
        }

        if (cognome.length > 50) {
            return NextResponse.json(
                { error: "Cognome troppo lungo" },
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

        // Check if email already exists
        const existingAffiliate = await prisma.affiliate.findUnique({
            where: { email: emailValidation.sanitized },
        })

        if (existingAffiliate) {
            return NextResponse.json(
                { error: "Email già registrata" },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 10)

        // Generate unique referral code
        const referralCode = nanoid(8).toUpperCase() // 8 characters uppercase code

        // Create affiliate
        const affiliate = await prisma.affiliate.create({
            data: {
                nome,
                cognome,
                email: emailValidation.sanitized,
                password: hashedPassword,
                referralCode,
                attivo: true,
            },
            select: {
                id: true,
                nome: true,
                cognome: true,
                email: true,
                referralCode: true,
            },
        })

        return NextResponse.json({
            success: true,
            message: "Registrazione completata!",
            affiliate: {
                id: affiliate.id,
                nome: affiliate.nome,
                cognome: affiliate.cognome,
                email: affiliate.email,
                referralCode: affiliate.referralCode,
            },
        })
    } catch (error) {
        console.error("Affiliate registration error:", error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Errore interno del server",
                success: false,
            },
            { status: 500 }
        )
    }
}
