import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { admin } = authResult

  if (admin.ruolo !== "superadmin") {
    return NextResponse.json({ error: "Solo i superadmin possono rimuovere membri" }, { status: 403 })
  }

  const { id } = await params

  if (id === admin.adminId) {
    return NextResponse.json({ error: "Non puoi eliminare te stesso" }, { status: 400 })
  }

  await prisma.admin.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
