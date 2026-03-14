import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { PLAN_PRICES, BILLING_INTERVALS } from "@/lib/plan-limits"

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalAgencies,
    totalLeads,
    totalDemoLeads,
    totalAffiliates,
    newAgenciesLast30,
    newAgenciesPrev30,
    newLeadsLast30,
    newLeadsPrev30,
    subscriptions,
    agencies30Days,
    pendingCommissions,
    activeReferrals,
    recentDemoLeads,
  ] = await Promise.all([
    prisma.agency.count(),
    prisma.lead.count(),
    prisma.demoLead.count(),
    prisma.affiliate.count(),
    prisma.agency.count({
      where: { dataCreazione: { gte: thirtyDaysAgo } },
    }),
    prisma.agency.count({
      where: {
        dataCreazione: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.lead.count({
      where: { dataRichiesta: { gte: thirtyDaysAgo } },
    }),
    prisma.lead.count({
      where: {
        dataRichiesta: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.subscription.findMany({
      where: { status: "active", planType: { not: "free" } },
      select: { planType: true, billingInterval: true },
    }),
    prisma.agency.findMany({
      where: { dataCreazione: { gte: thirtyDaysAgo } },
      select: { dataCreazione: true },
    }),
    prisma.commission.aggregate({
      where: { status: "pending" },
      _sum: { amountCents: true },
    }),
    prisma.referral.count({
      where: { status: "subscribed" },
    }),
    prisma.demoLead.findMany({
      orderBy: { dataRichiesta: "desc" },
      take: 5,
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
        citta: true,
        prezzoStimato: true,
        dataRichiesta: true,
      },
    }),
  ])

  // Calcolo MRR
  let mrrCents = 0
  for (const sub of subscriptions) {
    const planType = sub.planType as keyof typeof PLAN_PRICES
    const baseMonthly = PLAN_PRICES[planType] || 0
    const interval = sub.billingInterval as keyof typeof BILLING_INTERVALS
    const discount = BILLING_INTERVALS[interval]?.discount || 0
    mrrCents += Math.round(baseMonthly * (1 - discount))
  }

  // Piano breakdown
  const planBreakdown = { free: 0, basic: 0, premium: 0 }
  const allSubs = await prisma.subscription.groupBy({
    by: ["planType"],
    where: { status: { in: ["active", "trial"] } },
    _count: true,
  })
  for (const s of allSubs) {
    const key = s.planType as keyof typeof planBreakdown
    if (key in planBreakdown) planBreakdown[key] = s._count
  }
  // Agenzie senza subscription sono free
  const agenciesWithSub = await prisma.subscription.count({
    where: { status: { in: ["active", "trial"] } },
  })
  planBreakdown.free += totalAgencies - agenciesWithSub

  // Registrazioni chart (ultimi 30 giorni)
  const registrationsChart: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]
    const count = agencies30Days.filter((a) => {
      const d = a.dataCreazione.toISOString().split("T")[0]
      return d === dateStr
    }).length
    registrationsChart.push({ date: dateStr, count })
  }

  // Trend percentuali
  const growthAgencies =
    newAgenciesPrev30 > 0
      ? `${newAgenciesLast30 >= newAgenciesPrev30 ? "+" : ""}${Math.round(((newAgenciesLast30 - newAgenciesPrev30) / newAgenciesPrev30) * 100)}%`
      : newAgenciesLast30 > 0
        ? `+${newAgenciesLast30}`
        : "0%"

  const growthLeads =
    newLeadsPrev30 > 0
      ? `${newLeadsLast30 >= newLeadsPrev30 ? "+" : ""}${Math.round(((newLeadsLast30 - newLeadsPrev30) / newLeadsPrev30) * 100)}%`
      : newLeadsLast30 > 0
        ? `+${newLeadsLast30}`
        : "0%"

  return NextResponse.json({
    totalAgencies,
    totalLeads,
    totalDemoLeads,
    totalAffiliates,
    mrrCents,
    planBreakdown,
    newAgenciesLast30Days: newAgenciesLast30,
    newLeadsLast30Days: newLeadsLast30,
    growthAgencies,
    growthLeads,
    registrationsChart,
    recentDemoLeads,
    affiliateOverview: {
      total: totalAffiliates,
      activeReferrals,
      pendingCommissionsCents: pendingCommissions._sum.amountCents || 0,
    },
  })
}
