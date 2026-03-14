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
