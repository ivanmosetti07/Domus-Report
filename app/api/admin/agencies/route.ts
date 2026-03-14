import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))
  const search = searchParams.get("search") || ""
  const plan = searchParams.get("plan") || ""
  const status = searchParams.get("status") || ""

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { citta: { contains: search, mode: "insensitive" } },
    ]
  }

  if (plan && ["free", "basic", "premium"].includes(plan)) {
    where.piano = plan
  }

  if (status === "active") {
    where.attiva = true
  } else if (status === "inactive") {
    where.attiva = false
  }

  const [agencies, total] = await Promise.all([
    prisma.agency.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        citta: true,
        piano: true,
        attiva: true,
        dataCreazione: true,
        telefono: true,
        _count: {
          select: {
            leads: true,
            widgetConfigs: true,
          },
        },
        subscription: {
          select: {
            planType: true,
            status: true,
            billingInterval: true,
            stripeSubscriptionId: true,
          },
        },
      },
      orderBy: { dataCreazione: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.agency.count({ where }),
  ])

  const mapped = agencies.map((a) => ({
    id: a.id,
    nome: a.nome,
    email: a.email,
    citta: a.citta,
    piano: a.piano,
    attiva: a.attiva,
    dataCreazione: a.dataCreazione,
    telefono: a.telefono,
    leadsCount: a._count.leads,
    widgetsCount: a._count.widgetConfigs,
    subscription: a.subscription,
  }))

  return NextResponse.json({
    agencies: mapped,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
