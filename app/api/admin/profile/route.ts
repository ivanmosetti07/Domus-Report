import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { admin } = authResult

  const adminData = await prisma.admin.findUnique({
    where: { id: admin.adminId },
    select: {
      id: true,
      nome: true,
      cognome: true,
      email: true,
      ruolo: true,
      dataCreazione: true,
    },
  })

  if (!adminData) {
    return NextResponse.json({ error: "Admin non trovato" }, { status: 404 })
  }

  return NextResponse.json({ admin: adminData })
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { admin } = authResult

  const body = await request.json()
  const updateData: Record<string, string> = {}

  if (body.nome?.trim()) updateData.nome = body.nome.trim()
  if (body.cognome?.trim()) updateData.cognome = body.cognome.trim()

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 })
  }

  const updated = await prisma.admin.update({
    where: { id: admin.adminId },
    data: updateData,
    select: {
      id: true,
      nome: true,
      cognome: true,
      email: true,
      ruolo: true,
    },
  })

  return NextResponse.json({ success: true, admin: updated })
}
