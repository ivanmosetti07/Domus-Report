import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAffiliateAuth } from "@/lib/affiliate-auth"
import { sanitizeString } from "@/lib/validation"

function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  // Formato base IBAN: 2 lettere paese + 2 cifre controllo + BBAN
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned)) return false
  // Per IBAN italiani: IT + 2 cifre + 1 lettera CIN + 5 cifre ABI + 5 cifre CAB + 12 cifre conto = 27 caratteri
  if (cleaned.startsWith('IT') && cleaned.length !== 27) return false
  return true
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("affiliate-auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const auth = await verifyAffiliateAuth(token)
    if (!auth) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 })
    }

    const body = await request.json()
    const { iban, ibanAccountHolder } = body

    if (!iban || !ibanAccountHolder) {
      return NextResponse.json({ error: "IBAN e intestatario sono obbligatori" }, { status: 400 })
    }

    const cleanedIban = iban.replace(/\s/g, '').toUpperCase()
    if (!validateIBAN(cleanedIban)) {
      return NextResponse.json({ error: "Formato IBAN non valido" }, { status: 400 })
    }

    const sanitizedHolder = sanitizeString(ibanAccountHolder).trim()
    if (sanitizedHolder.length < 3) {
      return NextResponse.json({ error: "Nome intestatario troppo corto" }, { status: 400 })
    }

    const affiliate = await prisma.affiliate.update({
      where: { id: auth.affiliateId },
      data: {
        iban: cleanedIban,
        ibanAccountHolder: sanitizedHolder,
      },
      select: {
        iban: true,
        ibanAccountHolder: true,
      },
    })

    return NextResponse.json({ success: true, affiliate })
  } catch (error) {
    console.error("IBAN save error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
