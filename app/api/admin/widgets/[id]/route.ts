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

  // Whitelist esplicita dei campi aggiornabili. Previene errori Prisma
  // quando il client manda campi read-only (id, widgetId, createdAt, ecc)
  // o relazioni (agency, agencyName dal pubblico).
  const allowedFields = [
    "name",
    "mode",
    "isActive",
    "isDefault",
    "themeName",
    "primaryColor",
    "secondaryColor",
    "backgroundColor",
    "textColor",
    "fontFamily",
    "borderRadius",
    "buttonStyle",
    "bubblePosition",
    "bubbleIcon",
    "showBadge",
    "bubbleAnimation",
    "inlineHeight",
    "showHeader",
    "showBorder",
    "customCss",
    "logoUrl",
    "sendButtonColor",
    "sendButtonIconColor",
    "questionMode",
    "valuationMode",
  ] as const

  const updates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body && body[key] !== undefined) {
      updates[key] = body[key]
    }
  }

  // Motore unificato: normalizza tutti i widget alla modalità legacy "hybrid".
  updates.valuationMode = "hybrid"

  try {
    const widget = await prisma.widgetConfig.update({
      where: { id },
      data: updates,
    })
    return NextResponse.json({ success: true, widget })
  } catch (err) {
    console.error("[PATCH /api/admin/widgets/:id] DB error:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Errore aggiornamento widget",
        fieldsAttempted: Object.keys(updates),
      },
      { status: 500 }
    )
  }
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
