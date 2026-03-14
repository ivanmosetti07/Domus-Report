import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { admin } = authResult

  if (admin.ruolo !== "superadmin") {
    return NextResponse.json({ error: "Solo i superadmin possono gestire i membri" }, { status: 403 })
  }

  const members = await prisma.admin.findMany({
    select: {
      id: true,
      nome: true,
      cognome: true,
      email: true,
      ruolo: true,
      attivo: true,
      dataCreazione: true,
    },
    orderBy: { dataCreazione: "asc" },
  })

  return NextResponse.json({ members })
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult
  const { admin } = authResult

  if (admin.ruolo !== "superadmin") {
    return NextResponse.json({ error: "Solo i superadmin possono aggiungere membri" }, { status: 403 })
  }

  const body = await request.json()

  if (!body.nome?.trim() || !body.cognome?.trim() || !body.email?.trim() || !body.password) {
    return NextResponse.json(
      { error: "Nome, cognome, email e password sono obbligatori" },
      { status: 400 }
    )
  }

  const email = body.email.trim().toLowerCase()

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "Un admin con questa email esiste già" },
      { status: 409 }
    )
  }

  if (body.password.length < 8) {
    return NextResponse.json(
      { error: "La password deve essere di almeno 8 caratteri" },
      { status: 400 }
    )
  }

  const passwordHash = await bcrypt.hash(body.password, 12)

  const member = await prisma.admin.create({
    data: {
      nome: body.nome.trim(),
      cognome: body.cognome.trim(),
      email,
      password: passwordHash,
      ruolo: "admin",
      attivo: true,
    },
    select: {
      id: true,
      nome: true,
      cognome: true,
      email: true,
      ruolo: true,
      dataCreazione: true,
    },
  })

  return NextResponse.json({ success: true, member })
}
