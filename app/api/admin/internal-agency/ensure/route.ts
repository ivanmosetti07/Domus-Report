import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { randomBytes } from "crypto"
import { nanoid } from "nanoid"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

const INTERNAL_AGENCY_EMAIL = "info@domusreport.com"
const INTERNAL_AGENCY_NAME = "Domus Report (interno)"
const INTERNAL_AGENCY_CITY = "Milano"
const INTERNAL_AGENCY_PLAN = "enterprise"

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const existing = await prisma.agency.findUnique({
    where: { email: INTERNAL_AGENCY_EMAIL },
    select: { id: true, nome: true, email: true, piano: true, attiva: true },
  })

  if (existing) {
    if (!existing.attiva) {
      await prisma.agency.update({
        where: { id: existing.id },
        data: { attiva: true },
      })
    }
    return NextResponse.json({ agency: { ...existing, attiva: true }, created: false })
  }

  const randomPassword = randomBytes(24).toString("base64url")
  const hashedPassword = await bcrypt.hash(randomPassword, 10)

  const agency = await prisma.agency.create({
    data: {
      nome: INTERNAL_AGENCY_NAME,
      email: INTERNAL_AGENCY_EMAIL,
      password: hashedPassword,
      citta: INTERNAL_AGENCY_CITY,
      widgetId: `wgt_${nanoid(16)}`,
      piano: INTERNAL_AGENCY_PLAN,
      attiva: true,
    },
    select: { id: true, nome: true, email: true, piano: true },
  })

  return NextResponse.json({ agency, created: true }, { status: 201 })
}
