import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("affiliate-auth-token")

        if (token) {
            // Calculate token hash
            const tokenHash = createHash("sha256").update(token.value).digest("hex")

            // Revoke session in database
            await prisma.affiliateSession.updateMany({
                where: { tokenHash },
                data: { revokedAt: new Date() },
            })
        }

        // Create response and delete cookie
        const response = NextResponse.json({
            success: true,
            message: "Logout effettuato con successo",
        })

        response.cookies.delete("affiliate-auth-token")

        return response
    } catch (error) {
        console.error("Affiliate logout error:", error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Errore interno del server",
                success: false,
            },
            { status: 500 }
        )
    }
}
