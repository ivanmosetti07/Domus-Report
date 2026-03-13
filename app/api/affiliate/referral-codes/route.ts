import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAffiliateAuth } from "@/lib/affiliate-auth"
import { nanoid } from "nanoid"
import { sanitizeString } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("affiliate-auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const auth = await verifyAffiliateAuth(token)
    if (!auth) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 })
    }

    const codes = await prisma.referralCode.findMany({
      where: { affiliateId: auth.affiliateId },
      include: {
        _count: { select: { referrals: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      codes: codes.map((c) => ({
        id: c.id,
        code: c.code,
        label: c.label,
        isActive: c.isActive,
        clicks: c.clicks,
        referralsCount: c._count.referrals,
        createdAt: c.createdAt,
      })),
    })
  } catch (error) {
    console.error("Affiliate referral codes GET error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("affiliate-auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const auth = await verifyAffiliateAuth(token)
    if (!auth) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 })
    }

    const existingCount = await prisma.referralCode.count({
      where: { affiliateId: auth.affiliateId },
    })

    if (existingCount >= 5) {
      return NextResponse.json(
        { error: "Puoi avere massimo 5 codici referral" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const label = body.label ? sanitizeString(body.label).substring(0, 50) : null

    const code = nanoid(8).toUpperCase()

    const referralCode = await prisma.referralCode.create({
      data: {
        affiliateId: auth.affiliateId,
        code,
        label,
      },
    })

    return NextResponse.json({
      success: true,
      code: {
        id: referralCode.id,
        code: referralCode.code,
        label: referralCode.label,
        isActive: referralCode.isActive,
        clicks: referralCode.clicks,
        createdAt: referralCode.createdAt,
      },
    })
  } catch (error) {
    console.error("Affiliate referral codes POST error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    )
  }
}
