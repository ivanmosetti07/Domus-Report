import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/affiliates/[id] - Dettaglio affiliato
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      cognome: true,
      email: true,
      telefono: true,
      attivo: true,
      iban: true,
      ibanAccountHolder: true,
      dataCreazione: true,
      _count: {
        select: {
          referrals: true,
          commissions: true,
          referralCodes: true,
        },
      },
    },
  })

  if (!affiliate) {
    return NextResponse.json({ error: "Affiliato non trovato" }, { status: 404 })
  }

  const totalCommissions = await prisma.commission.aggregate({
    where: { affiliateId: id, status: "transferred" },
    _sum: { amountCents: true },
  })

  const pendingCommissions = await prisma.commission.aggregate({
    where: { affiliateId: id, status: "pending" },
    _sum: { amountCents: true },
  })

  return NextResponse.json({
    affiliate: {
      ...affiliate,
      referralsCount: affiliate._count.referrals,
      commissionsCount: affiliate._count.commissions,
      referralCodesCount: affiliate._count.referralCodes,
      totalEarningsCents: totalCommissions._sum.amountCents || 0,
      pendingEarningsCents: pendingCommissions._sum.amountCents || 0,
    },
  })
}

// PATCH /api/admin/affiliates/[id] - Modifica affiliato
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.affiliate.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Affiliato non trovato" }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  if (typeof body.attivo === "boolean") updateData.attivo = body.attivo
  if (body.nome !== undefined) updateData.nome = body.nome.trim()
  if (body.cognome !== undefined) updateData.cognome = body.cognome.trim()
  if (body.email !== undefined) updateData.email = body.email.trim().toLowerCase()
  if (body.telefono !== undefined) updateData.telefono = body.telefono?.trim() || null
  if (body.iban !== undefined) updateData.iban = body.iban?.trim() || null
  if (body.ibanAccountHolder !== undefined) updateData.ibanAccountHolder = body.ibanAccountHolder?.trim() || null

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 })
  }

  // Verifica email unica se cambiata
  if (updateData.email && updateData.email !== existing.email) {
    const emailExists = await prisma.affiliate.findUnique({
      where: { email: updateData.email as string },
    })
    if (emailExists) {
      return NextResponse.json({ error: "Email già in uso da un altro affiliato" }, { status: 409 })
    }
  }

  const affiliate = await prisma.affiliate.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nome: true,
      cognome: true,
      email: true,
      telefono: true,
      attivo: true,
      iban: true,
      ibanAccountHolder: true,
    },
  })

  return NextResponse.json({ success: true, affiliate })
}

// DELETE /api/admin/affiliates/[id] - Disattiva affiliato
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { admin } = authResult

  if (admin.ruolo !== "superadmin") {
    return NextResponse.json(
      { error: "Solo i superadmin possono eliminare affiliati" },
      { status: 403 }
    )
  }

  const { id } = await params

  const affiliate = await prisma.affiliate.findUnique({ where: { id } })
  if (!affiliate) {
    return NextResponse.json({ error: "Affiliato non trovato" }, { status: 404 })
  }

  await prisma.affiliate.update({
    where: { id },
    data: { attivo: false },
  })

  return NextResponse.json({ success: true, message: "Affiliato disattivato" })
}
