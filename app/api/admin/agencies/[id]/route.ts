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

  const updateData: Record<string, unknown> = {}
  if (typeof body.attiva === "boolean") {
    updateData.attiva = body.attiva
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 })
  }

  const agency = await prisma.agency.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nome: true,
      email: true,
      attiva: true,
    },
  })

  return NextResponse.json({ success: true, agency })
}
