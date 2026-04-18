import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

const DOMUS_REPORT_DOMAIN = "domusreport.com"

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))
  const search = searchParams.get("search") || ""
  const agencyId = searchParams.get("agencyId") || ""
  const scope = searchParams.get("scope") || "" // "domus" | "external" | ""

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: "insensitive" } },
      { cognome: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  if (agencyId) {
    where.agenziaId = agencyId
  }

  if (scope === "domus") {
    where.agenzia = { email: { endsWith: `@${DOMUS_REPORT_DOMAIN}`, mode: "insensitive" } }
  } else if (scope === "external") {
    where.NOT = {
      agenzia: { email: { endsWith: `@${DOMUS_REPORT_DOMAIN}`, mode: "insensitive" } },
    }
  }

  const domusCountFilter = {
    agenzia: { email: { endsWith: `@${DOMUS_REPORT_DOMAIN}`, mode: "insensitive" as const } },
  }

  const [leads, total, domusTotal, externalTotal] = await Promise.all([
    prisma.lead.findMany({
      where,
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
        telefono: true,
        dataRichiesta: true,
        agenzia: {
          select: { id: true, nome: true, email: true },
        },
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
      orderBy: { dataRichiesta: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
    prisma.lead.count({ where: domusCountFilter }),
    prisma.lead.count({ where: { NOT: domusCountFilter } }),
  ])

  return NextResponse.json({
    leads,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    counts: { domus: domusTotal, external: externalTotal },
  })
}
