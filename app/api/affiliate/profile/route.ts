import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAffiliateAuth } from "@/lib/affiliate-auth"
import { validateName, sanitizeString } from "@/lib/validation"

export async function GET(request: NextRequest) {
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

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: auth.affiliateId },
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
        telefono: true,
        iban: true,
        ibanAccountHolder: true,
        dataCreazione: true,
      },
    })

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliato non trovato" }, { status: 404 })
    }

    return NextResponse.json({ affiliate })
  } catch (error) {
    console.error("Affiliate profile GET error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const updateData: Record<string, string | null> = {}

    if (body.nome) {
      const v = validateName(body.nome, "Nome")
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 })
      updateData.nome = v.sanitized
    }

    if (body.cognome) {
      const v = validateName(body.cognome, "Cognome")
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 })
      updateData.cognome = v.sanitized
    }

    if (body.telefono !== undefined) {
      updateData.telefono = body.telefono ? sanitizeString(body.telefono) : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nessun dato da aggiornare" }, { status: 400 })
    }

    const affiliate = await prisma.affiliate.update({
      where: { id: auth.affiliateId },
      data: updateData,
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
        telefono: true,
      },
    })

    return NextResponse.json({ success: true, affiliate })
  } catch (error) {
    console.error("Affiliate profile PUT error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
