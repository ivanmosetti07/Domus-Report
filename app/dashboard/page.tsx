import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, FileCheck, Target, Code, BookOpen, Eye } from "lucide-react"
import { getAuthAgency } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WidgetCodeCard } from "@/components/dashboard/widget-code-card"
import { TrialBanner } from "@/components/dashboard/trial-banner"
import { WidgetOverviewCard } from "@/components/dashboard/widget-overview-card"
import { RecentLeadsTable } from "@/components/dashboard/recent-leads-table"
import { StatsChart } from "@/components/dashboard/stats-chart"
import { NotificationsCard, generateNotifications } from "@/components/dashboard/notifications-card"

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Get authenticated agency
  const agency = await getAuthAgency()

  if (!agency) {
    return null // Middleware should prevent this
  }

  // Fetch all data in parallel
  const [
    totalLeads,
    leadsLast7Days,
    totalValuations,
    subscription,
    widgetConfigs,
    recentLeads,
    totalWidgetOpens,
    widgetClicksLast7Days,
    hasWidgetEvents,
    settings,
    newLeadsCount,
    leadsLast30DaysByDay
  ] = await Promise.all([
    // Total leads count
    prisma.lead.count({
      where: { agenziaId: agency.agencyId },
    }),

    // Leads in last 7 days
    prisma.lead.count({
      where: {
        agenziaId: agency.agencyId,
        dataRichiesta: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Total valuations (count properties with valuations)
    prisma.valuation.count({
      where: {
        property: {
          lead: {
            agenziaId: agency.agencyId,
          },
        },
      },
    }),

    // Subscription info
    prisma.subscription.findUnique({
      where: { agencyId: agency.agencyId },
      select: {
        planType: true,
        status: true,
        trialEndsAt: true,
        nextBillingDate: true,
        valuationsUsedThisMonth: true
      }
    }),

    // Widget configs (solo attivi)
    prisma.widgetConfig.findMany({
      where: {
        agencyId: agency.agencyId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        widgetId: true,
        mode: true,
        isActive: true,
        impressions: true,
        leadsGenerated: true
      },
      orderBy: { createdAt: 'desc' }
    }),

    // Recent leads (last 5)
    prisma.lead.findMany({
      where: { agenziaId: agency.agencyId },
      include: {
        property: {
          include: { valuation: true }
        },
        statuses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { dataRichiesta: 'desc' },
      take: 5
    }),

    // Total widget opens (for conversion rate)
    prisma.widgetEvent.count({
      where: {
        widgetId: agency.widgetId,
        eventType: 'OPEN'
      }
    }),

    // Widget clicks last 7 days
    prisma.widgetEvent.count({
      where: {
        widgetId: agency.widgetId,
        eventType: 'OPEN',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Check if any widget events exist
    prisma.widgetEvent.findFirst({
      where: { widgetId: agency.widgetId },
      select: { id: true }
    }).then(result => !!result),

    // Agency settings (for brand colors check)
    prisma.agencySetting.findUnique({
      where: { agencyId: agency.agencyId },
      select: { brandColors: true }
    }),

    // New leads count (status NEW)
    prisma.lead.count({
      where: {
        agenziaId: agency.agencyId,
        statuses: {
          some: {
            status: 'NEW'
          }
        }
      }
    }),

    // Leads by day (last 30 days) for chart
    prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE(data_richiesta) as date,
        COUNT(*)::bigint as count
      FROM leads
      WHERE agenzia_id = ${agency.agencyId}
        AND data_richiesta >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(data_richiesta)
      ORDER BY date ASC
    `
  ])

  // Calculate trial days remaining
  let trialDaysRemaining = null
  if (subscription?.status === 'trial' && subscription.trialEndsAt) {
    const now = new Date()
    const trialEnd = new Date(subscription.trialEndsAt)
    const diffTime = trialEnd.getTime() - now.getTime()
    trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calculate conversion rate
  const conversionRate = totalWidgetOpens > 0
    ? ((totalLeads / totalWidgetOpens) * 100).toFixed(1) + '%'
    : 'N/A'

  // Transform leads by day data for chart
  const chartData = leadsLast30DaysByDay.map(item => ({
    date: item.date.toISOString().split('T')[0],
    count: Number(item.count)
  }))

  // Fill missing days with 0
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  const completeChartData = last30Days.map(date => {
    const existing = chartData.find(d => d.date === date)
    return existing || { date, count: 0 }
  })

  // Get plan limits
  const planLimits: Record<string, number> = {
    'free': 10,
    'basic': 50,
    'premium': 100
  }
  const valuationsLimit = planLimits[subscription?.planType || 'free'] || 10
  const valuationsUsed = subscription?.valuationsUsedThisMonth || 0

  // Generate notifications
  const notifications = generateNotifications({
    totalLeads,
    newLeadsCount,
    hasWidgetEvents,
    trialDaysRemaining,
    hasBrandColors: !!settings?.brandColors,
    planType: subscription?.planType || 'free',
    totalWidgets: widgetConfigs.length
  })

  const stats = {
    totalLeads,
    leadsLast7Days,
    totalValuations,
    conversionRate,
    widgetClicksLast7Days,
    valuationsUsed,
    valuationsLimit
  }

  return (
    <div>
      <PageHeader
        title={`Benvenuto, ${agency.nome}!`}
        subtitle="Ecco una panoramica della tua agenzia"
      />

      {/* Trial/Subscription Banner */}
      {subscription && (
        <TrialBanner
          subscriptionStatus={subscription.status}
          planType={subscription.planType}
          trialDaysRemaining={trialDaysRemaining}
          nextBillingDate={subscription.nextBillingDate}
          trialEndsAt={subscription.trialEndsAt}
        />
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Lead Totali"
          value={stats.totalLeads}
          icon={<Users className="w-6 h-6 text-primary" />}
        />
        <StatCard
          label="Lead Ultimi 7 Giorni"
          value={stats.leadsLast7Days}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          label="Tasso Conversione"
          value={stats.conversionRate}
          icon={<Target className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          label="Valutazioni Usate"
          value={`${stats.valuationsUsed} / ${stats.valuationsLimit}`}
          icon={<FileCheck className="w-6 h-6 text-blue-600" />}
        />
      </div>

      {/* Notifications & Alerts */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <NotificationsCard notifications={notifications} />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Chart + Widget Code */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Chart */}
          {completeChartData.length > 0 && (
            <StatsChart data={completeChartData} />
          )}

          {/* Widget Overview */}
          <WidgetOverviewCard widgets={widgetConfigs} />
        </div>

        {/* Right Column: Recent Leads */}
        <div className="lg:col-span-1">
          <RecentLeadsTable leads={recentLeads} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Azioni Rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/leads">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gestisci Lead</h3>
                  <p className="text-sm text-gray-600">
                    Visualizza e gestisci tutti i lead
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/widgets">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Widget</h3>
                  <p className="text-sm text-gray-600">
                    Configura i tuoi widget
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/docs/html" target="_blank">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-dashed border-gray-300">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Documentazione</h3>
                  <p className="text-sm text-gray-600">
                    Guida installazione widget
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Empty State Hint (shown when no leads) */}
      {stats.totalLeads === 0 && (
        <div className="mt-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full flex-shrink-0">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Primi passi con DomusReport
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
                        1
                      </span>
                      Configura il tuo primo widget
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
                        2
                      </span>
                      Installa il codice sul tuo sito (prima del tag &lt;/body&gt;)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
                        3
                      </span>
                      Inizia a ricevere lead qualificati automaticamente!
                    </li>
                  </ol>
                  <div className="mt-4">
                    <Link href="/dashboard/widgets">
                      <Button>
                        <Code className="w-4 h-4 mr-2" />
                        Crea il tuo primo widget
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
