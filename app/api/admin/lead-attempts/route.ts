import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))
  const status = searchParams.get("status") || "" // "failed" | "success" | ""
  const search = searchParams.get("search") || ""

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { errorCode: { contains: search, mode: "insensitive" } },
      { errorMessage: { contains: search, mode: "insensitive" } },
    ]
  }

  const [attempts, total, failedTotal, successTotal] = await Promise.all([
    prisma.leadSubmissionAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.leadSubmissionAttempt.count({ where }),
    prisma.leadSubmissionAttempt.count({ where: { status: "failed" } }),
    prisma.leadSubmissionAttempt.count({ where: { status: "success" } }),
  ])

  return NextResponse.json({
    attempts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    counts: { failed: failedTotal, success: successTotal },
  })
}
