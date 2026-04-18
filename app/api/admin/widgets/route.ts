import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import { isValidHexColor, sanitizeCSS } from "@/lib/widget-themes"

// GET /api/admin/widgets - Lista tutti i widget di tutte le agenzie
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = new URL(request.url)
  const agencyId = searchParams.get("agencyId")

  const where: Record<string, unknown> = {}
  if (agencyId) where.agencyId = agencyId

  const widgets = await prisma.widgetConfig.findMany({
    where,
    include: {
      agency: {
        select: {
          id: true,
          nome: true,
          email: true,
          piano: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ widgets })
}

// POST /api/admin/widgets - Crea un widget per un'agenzia
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()

  if (!body.agencyId) {
    return NextResponse.json(
      { error: "agencyId è obbligatorio" },
      { status: 400 }
    )
  }

  const agency = await prisma.agency.findUnique({
    where: { id: body.agencyId },
    select: { id: true },
  })

  if (!agency) {
    return NextResponse.json(
      { error: "Agenzia non trovata" },
      { status: 404 }
    )
  }

  if (!body.name?.trim() || body.name.trim().length < 2) {
    return NextResponse.json(
      { error: "Nome widget richiesto (min 2 caratteri)" },
      { status: 400 }
    )
  }

  if (body.primaryColor && !isValidHexColor(body.primaryColor)) {
    return NextResponse.json(
      { error: "Colore primario non valido" },
      { status: 400 }
    )
  }

  const widgetId = `wgt_${nanoid(16)}`

  const currentCount = await prisma.widgetConfig.count({
    where: { agencyId: body.agencyId, isActive: true },
  })

  const widgetConfig = await prisma.widgetConfig.create({
    data: {
      agencyId: body.agencyId,
      widgetId,
      name: body.name.trim(),
      mode: body.mode || "bubble",
      isDefault: currentCount === 0,
      themeName: body.themeName || "default",
      primaryColor: body.primaryColor || "#2563eb",
      secondaryColor: body.secondaryColor || undefined,
      backgroundColor: body.backgroundColor || "#ffffff",
      textColor: body.textColor || "#1f2937",
      fontFamily: body.fontFamily || "system-ui, -apple-system, sans-serif",
      borderRadius: body.borderRadius || "8px",
      buttonStyle: body.buttonStyle || "rounded",
      bubblePosition: body.bubblePosition || "bottom-right",
      bubbleIcon: body.bubbleIcon || undefined,
      showBadge: body.showBadge !== undefined ? body.showBadge : true,
      bubbleAnimation: body.bubbleAnimation || "pulse",
      inlineHeight: body.inlineHeight || "600px",
      showHeader: body.showHeader !== undefined ? body.showHeader : true,
      showBorder: body.showBorder !== undefined ? body.showBorder : true,
      customCss: body.customCss ? sanitizeCSS(body.customCss) : undefined,
      logoUrl: body.logoUrl || undefined,
      sendButtonColor: body.sendButtonColor || undefined,
      sendButtonIconColor: body.sendButtonIconColor || undefined,
      questionMode: body.questionMode || "long",
      valuationMode: ["hybrid", "omi", "ai_market"].includes(body.valuationMode)
        ? body.valuationMode
        : "hybrid",
    },
  })

  return NextResponse.json({ success: true, widgetConfig }, { status: 201 })
}
