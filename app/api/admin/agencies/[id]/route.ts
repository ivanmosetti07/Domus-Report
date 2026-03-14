import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const agency = await prisma.agency.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      citta: true,
      piano: true,
      attiva: true,
      dataCreazione: true,
      telefono: true,
      indirizzo: true,
      sitoWeb: true,
      partitaIva: true,
      widgetId: true,
      subscription: true,
      _count: {
        select: {
          leads: true,
          widgetConfigs: true,
        },
      },
    },
  })

  if (!agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 })
  }

  const recentLeads = await prisma.lead.findMany({
    where: { agenziaId: id },
    orderBy: { dataRichiesta: "desc" },
    take: 10,
    select: {
      id: true,
      nome: true,
      cognome: true,
      email: true,
      dataRichiesta: true,
      property: {
        select: {
          citta: true,
          tipo: true,
          superficieMq: true,
          valuation: {
            select: { prezzoStimato: true },
          },
        },
      },
    },
  })

  return NextResponse.json({
    agency: {
      ...agency,
      leadsCount: agency._count.leads,
      widgetsCount: agency._count.widgetConfigs,
    },
    recentLeads,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.agency.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  // Campi editabili
  if (typeof body.attiva === "boolean") updateData.attiva = body.attiva
  if (body.nome !== undefined) updateData.nome = body.nome.trim()
  if (body.email !== undefined) updateData.email = body.email.trim().toLowerCase()
  if (body.citta !== undefined) updateData.citta = body.citta.trim()
  if (body.telefono !== undefined) updateData.telefono = body.telefono?.trim() || null
  if (body.indirizzo !== undefined) updateData.indirizzo = body.indirizzo?.trim() || null
  if (body.sitoWeb !== undefined) updateData.sitoWeb = body.sitoWeb?.trim() || null
  if (body.partitaIva !== undefined) updateData.partitaIva = body.partitaIva?.trim() || null
  if (body.piano !== undefined) {
    if (!["free", "basic", "premium"].includes(body.piano)) {
      return NextResponse.json({ error: "Piano non valido" }, { status: 400 })
    }
    updateData.piano = body.piano
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 })
  }

  // Verifica email unica se cambiata
  if (updateData.email && updateData.email !== existing.email) {
    const emailExists = await prisma.agency.findUnique({
      where: { email: updateData.email as string },
    })
    if (emailExists) {
      return NextResponse.json({ error: "Email già in uso da un'altra agenzia" }, { status: 409 })
    }
  }

  const agency = await prisma.agency.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nome: true,
      email: true,
      citta: true,
      piano: true,
      attiva: true,
      telefono: true,
      indirizzo: true,
      sitoWeb: true,
      partitaIva: true,
    },
  })

  return NextResponse.json({ success: true, agency })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { admin } = authResult

  if (admin.ruolo !== "superadmin") {
    return NextResponse.json(
      { error: "Solo i superadmin possono eliminare agenzie" },
      { status: 403 }
    )
  }

  const { id } = await params

  const agency = await prisma.agency.findUnique({ where: { id } })
  if (!agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 })
  }

  // Soft delete: disattiva l'agenzia
  await prisma.agency.update({
    where: { id },
    data: { attiva: false },
  })

  return NextResponse.json({ success: true, message: "Agenzia disattivata" })
}
