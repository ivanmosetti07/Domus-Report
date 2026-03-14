import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const coupons = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ coupons })
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()

  if (!body.code || !body.discountPercent) {
    return NextResponse.json(
      { error: "Codice e percentuale di sconto sono obbligatori" },
      { status: 400 }
    )
  }

  const code = body.code.trim().toUpperCase()
  const discountPercent = Math.min(100, Math.max(1, parseInt(body.discountPercent)))

  const existing = await prisma.promoCode.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json(
      { error: "Questo codice esiste già" },
      { status: 409 }
    )
  }

  const coupon = await prisma.promoCode.create({
    data: {
      code,
      discountPercent,
      maxUses: body.maxUses ? parseInt(body.maxUses) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: true,
    },
  })

  return NextResponse.json({ success: true, coupon })
}
