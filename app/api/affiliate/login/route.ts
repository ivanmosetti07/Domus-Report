import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { SignJWT } from "jose"
import { validateEmail } from "@/lib/validation"
import { createHash } from "crypto"

export interface AffiliateLoginRequest {
    email: string
    password: string
}

// JWT secret from environment
const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || "domusreport-jwt-secret-change-in-production"
)

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as AffiliateLoginRequest

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

        // Find affiliate by email
        const affiliate = await prisma.affiliate.findUnique({
            where: { email: emailValidation.sanitized },
        })

        if (!affiliate) {
            return NextResponse.json(
                { error: "Email o password errati" },
                { status: 401 }
            )
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(body.password, affiliate.password)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Email o password errati" },
                { status: 401 }
            )
        }

        // Check if affiliate is active
        if (!affiliate.attivo) {
            return NextResponse.json(
                { error: "Account non attivo. Contatta il supporto." },
                { status: 403 }
            )
        }

        // Create JWT token
        const token = await new SignJWT({
            affiliateId: affiliate.id,
            email: affiliate.email,
            nome: affiliate.nome,
            cognome: affiliate.cognome,
            referralCode: affiliate.referralCode,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(JWT_SECRET)

        // Calculate token hash for database storage
        const tokenHash = createHash("sha256").update(token).digest("hex")

        // Get client IP address
        const ipAddress =
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown"

        // Get User-Agent
        const userAgent = request.headers.get("user-agent") || "unknown"

        // Calculate expiration date (7 days)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // Create session in database
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

        // Create response with cookie and token in body
        const response = NextResponse.json({
            success: true,
            message: "Login effettuato con successo",
            token,
            affiliate: {
                id: affiliate.id,
                nome: affiliate.nome,
                cognome: affiliate.cognome,
                email: affiliate.email,
                referralCode: affiliate.referralCode,
            },
        })

        // Set HTTP-only cookie for security
        response.cookies.set("affiliate-auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        })

        return response
    } catch (error) {
        console.error("Affiliate login error:", error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Errore interno del server",
                success: false,
            },
            { status: 500 }
        )
    }
}
