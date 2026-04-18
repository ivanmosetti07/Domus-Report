import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { isValidHexColor, sanitizeCSS } from "@/lib/widget-themes"

// GET /api/admin/widgets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const widget = await prisma.widgetConfig.findUnique({
    where: { id },
    include: {
      agency: {
        select: { id: true, nome: true, email: true },
      },
    },
  })

  if (!widget) {
    return NextResponse.json({ error: "Widget non trovato" }, { status: 404 })
  }

  return NextResponse.json({ widget })
}

// PATCH /api/admin/widgets/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.widgetConfig.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Widget non trovato" }, { status: 404 })
  }

  if (body.primaryColor && !isValidHexColor(body.primaryColor)) {
    return NextResponse.json({ error: "Colore primario non valido" }, { status: 400 })
  }

  if (body.customCss) {
    body.customCss = sanitizeCSS(body.customCss)
  }

  if (body.valuationMode && !["hybrid", "omi", "ai_market"].includes(body.valuationMode)) {
    return NextResponse.json({ error: "valuationMode non valido" }, { status: 400 })
  }

  // Se imposta isDefault, rimuovi default dagli altri della stessa agenzia
  if (body.isDefault === true) {
    await prisma.widgetConfig.updateMany({
      where: {
        agencyId: existing.agencyId,
        id: { not: id },
      },
      data: { isDefault: false },
    })
  }

  const { agencyId: _a, ...updates } = body

  const widget = await prisma.widgetConfig.update({
    where: { id },
    data: updates,
  })

  return NextResponse.json({ success: true, widget })
}

// DELETE /api/admin/widgets/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const existing = await prisma.widgetConfig.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Widget non trovato" }, { status: 404 })
  }

  // Se era il default, imposta un altro widget come default
  if (existing.isDefault) {
    const nextDefault = await prisma.widgetConfig.findFirst({
      where: {
        agencyId: existing.agencyId,
        id: { not: id },
      },
      orderBy: { createdAt: "asc" },
    })

    if (nextDefault) {
      await prisma.widgetConfig.update({
        where: { id: nextDefault.id },
        data: { isDefault: true },
      })
    }
  }

  await prisma.widgetConfig.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
