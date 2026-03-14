import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}
  if (typeof body.attivo === "boolean") {
    updateData.attivo = body.attivo
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 })
  }

  const affiliate = await prisma.affiliate.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nome: true,
      cognome: true,
      email: true,
      attivo: true,
    },
  })

  return NextResponse.json({ success: true, affiliate })
}
