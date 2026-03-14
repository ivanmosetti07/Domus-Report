import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { admin } = authResult

  const body = await request.json()

  if (!body.currentPassword || !body.newPassword) {
    return NextResponse.json(
      { error: "Password attuale e nuova password sono obbligatorie" },
      { status: 400 }
    )
  }

  if (body.newPassword.length < 8) {
    return NextResponse.json(
      { error: "La nuova password deve essere di almeno 8 caratteri" },
      { status: 400 }
    )
  }

  const adminData = await prisma.admin.findUnique({
    where: { id: admin.adminId },
    select: { password: true },
  })

  if (!adminData) {
    return NextResponse.json({ error: "Admin non trovato" }, { status: 404 })
  }

  const isValid = await bcrypt.compare(body.currentPassword, adminData.password)
  if (!isValid) {
    return NextResponse.json(
      { error: "Password attuale errata" },
      { status: 401 }
    )
  }

  const newHash = await bcrypt.hash(body.newPassword, 12)

  await prisma.admin.update({
    where: { id: admin.adminId },
    data: { password: newHash },
  })

  return NextResponse.json({ success: true, message: "Password aggiornata con successo" })
}
