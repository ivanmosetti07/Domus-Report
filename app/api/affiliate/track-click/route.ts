import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = body.code

    if (!code || typeof code !== "string") {
      return NextResponse.json({ ok: true })
    }

    await prisma.referralCode.updateMany({
      where: { code: code.toUpperCase(), isActive: true },
      data: { clicks: { increment: 1 } },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
