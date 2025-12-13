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

  // Collect widgetIds for analytics (support multi-widget + legacy field)
  const widgetIds = widgetConfigs.map(widget => widget.widgetId)
  if (widgetIds.length === 0 && agency.widgetId) {
    widgetIds.push(agency.widgetId)
  }

  // Aggregate widget events across all widgetIds
  let totalWidgetOpens = 0
  let widgetOpensLast7Days = 0
  let leadSubmitEvents = 0
  let hasWidgetEvents = false

  if (widgetIds.length > 0) {
    const widgetFilter = widgetIds.length === 1
      ? { widgetId: widgetIds[0] }
      : { widgetId: { in: widgetIds } }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      opensCount,
      opensLast7Days,
      leadEventsCount,
      firstEvent
    ] = await Promise.all([
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: 'OPEN'
        }
      }),
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: 'OPEN',
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.widgetEvent.count({
        where: {
          ...widgetFilter,
          eventType: 'CONTACT_FORM_SUBMIT'
        }
      }),
      prisma.widgetEvent.findFirst({
        where: widgetFilter,
        select: { id: true }
      })
    ])

    totalWidgetOpens = opensCount
    widgetOpensLast7Days = opensLast7Days
    leadSubmitEvents = leadEventsCount
    hasWidgetEvents = !!firstEvent
  }

  // Calculate conversion rate using tracked lead submissions (fallback to total leads if no events)
  const leadsForConversion = leadSubmitEvents > 0 ? leadSubmitEvents : totalLeads
  const conversionRate = totalWidgetOpens > 0
    ? ((leadsForConversion / totalWidgetOpens) * 100).toFixed(1) + '%'
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
    'premium': 150
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
    widgetOpensLast7Days,
    valuationsUsed,
    valuationsLimit
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-lg)'
    }}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{
        gap: 'var(--grid-gap-md)'
      }}>
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
        <NotificationsCard notifications={notifications} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{
        gap: 'var(--grid-gap-lg)'
      }}>
        {/* Left Column: Chart + Widget Code */}
        <div className="lg:col-span-2" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--grid-gap-md)'
        }}>
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)'
      }}>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: '600',
          color: 'hsl(var(--foreground))',
          lineHeight: 'var(--leading-tight)'
        }}>
          Azioni Rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{
          gap: 'var(--grid-gap-sm)'
        }}>
          <Link href="/dashboard/leads">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center" style={{
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(1rem, 2vw, 1.5rem)'
              }}>
                <div className="flex items-center justify-center bg-primary rounded-lg flex-shrink-0" style={{
                  width: 'clamp(2.5rem, 5vw, 3rem)',
                  height: 'clamp(2.5rem, 5vw, 3rem)'
                }}>
                  <Users style={{
                    width: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                    height: 'clamp(1.25rem, 2.5vw, 1.5rem)'
                  }} className="text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate" style={{
                    fontSize: 'clamp(0.875rem, 1vw, 1rem)'
                  }}>Gestisci Lead</h3>
                  <p className="text-foreground-muted truncate" style={{
                    fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
                  }}>
                    Visualizza e gestisci tutti i lead
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/widgets">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center" style={{
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(1rem, 2vw, 1.5rem)'
              }}>
                <div className="flex items-center justify-center bg-primary rounded-lg flex-shrink-0" style={{
                  width: 'clamp(2.5rem, 5vw, 3rem)',
                  height: 'clamp(2.5rem, 5vw, 3rem)'
                }}>
                  <Code style={{
                    width: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                    height: 'clamp(1.25rem, 2.5vw, 1.5rem)'
                  }} className="text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate" style={{
                    fontSize: 'clamp(0.875rem, 1vw, 1rem)'
                  }}>Widget</h3>
                  <p className="text-foreground-muted truncate" style={{
                    fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
                  }}>
                    Configura i tuoi widget
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/docs/html" target="_blank">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-dashed border-border">
              <CardContent className="flex items-center" style={{
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(1rem, 2vw, 1.5rem)'
              }}>
                <div className="flex items-center justify-center bg-surface-2 rounded-lg flex-shrink-0" style={{
                  width: 'clamp(2.5rem, 5vw, 3rem)',
                  height: 'clamp(2.5rem, 5vw, 3rem)'
                }}>
                  <BookOpen style={{
                    width: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                    height: 'clamp(1.25rem, 2.5vw, 1.5rem)'
                  }} className="text-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate" style={{
                    fontSize: 'clamp(0.875rem, 1vw, 1rem)'
                  }}>Documentazione</h3>
                  <p className="text-foreground-muted truncate" style={{
                    fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
                  }}>
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
        <Card className="bg-surface-2 border-border">
          <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
            <div className="flex flex-col sm:flex-row items-start" style={{
              gap: 'clamp(0.75rem, 2vw, 1rem)'
            }}>
              <div className="flex items-center justify-center bg-primary rounded-full flex-shrink-0" style={{
                width: 'clamp(2.5rem, 5vw, 3rem)',
                height: 'clamp(2.5rem, 5vw, 3rem)'
              }}>
                <span style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>👋</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground" style={{
                  fontSize: 'clamp(1rem, 1.125vw, 1.125rem)',
                  marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                }}>
                  Primi passi con DomusReport
                </h3>
                <ol className="text-foreground" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
                }}>
                  <li className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold flex-shrink-0" style={{
                      width: 'clamp(1.25rem, 3vw, 1.5rem)',
                      height: 'clamp(1.25rem, 3vw, 1.5rem)',
                      fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)'
                    }}>
                      1
                    </span>
                    <span className="flex-1">Configura il tuo primo widget</span>
                  </li>
                  <li className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold flex-shrink-0" style={{
                      width: 'clamp(1.25rem, 3vw, 1.5rem)',
                      height: 'clamp(1.25rem, 3vw, 1.5rem)',
                      fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)'
                    }}>
                      2
                    </span>
                    <span className="flex-1">Installa il codice sul tuo sito (prima del tag &lt;/body&gt;)</span>
                  </li>
                  <li className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold flex-shrink-0" style={{
                      width: 'clamp(1.25rem, 3vw, 1.5rem)',
                      height: 'clamp(1.25rem, 3vw, 1.5rem)',
                      fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)'
                    }}>
                      3
                    </span>
                    <span className="flex-1">Inizia a ricevere lead qualificati automaticamente!</span>
                  </li>
                </ol>
                <div style={{ marginTop: 'clamp(0.75rem, 2vw, 1rem)' }}>
                  <Link href="/dashboard/widgets">
                    <Button className="w-full sm:w-auto" style={{
                      fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
                    }}>
                      <Code style={{
                        width: 'clamp(0.875rem, 1.5vw, 1rem)',
                        height: 'clamp(0.875rem, 1.5vw, 1rem)',
                        marginRight: 'var(--space-2)'
                      }} />
                      Crea il tuo primo widget
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
