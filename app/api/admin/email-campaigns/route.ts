import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { steps: true },
      },
    },
  })

  // Get send stats for each campaign
  const campaignsWithStats = await Promise.all(
    campaigns.map(async (campaign) => {
      const [totalSends, pendingSends, sentSends, failedSends] =
        await Promise.all([
          prisma.emailSend.count({ where: { campaignId: campaign.id } }),
          prisma.emailSend.count({
            where: { campaignId: campaign.id, status: "pending" },
          }),
          prisma.emailSend.count({
            where: { campaignId: campaign.id, status: "sent" },
          }),
          prisma.emailSend.count({
            where: { campaignId: campaign.id, status: "failed" },
          }),
        ])

      return {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        flowType: campaign.flowType,
        isActive: campaign.isActive,
        createdAt: campaign.createdAt,
        stepsCount: campaign._count.steps,
        totalSends,
        pendingSends,
        sentSends,
        failedSends,
      }
    })
  )

  return NextResponse.json({ campaigns: campaignsWithStats })
}
