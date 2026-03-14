"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import {
  Building2,
  Users,
  Euro,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Minus,
  Handshake,
} from "lucide-react"

interface StatsData {
  totalAgencies: number
  totalLeads: number
  totalDemoLeads: number
  totalAffiliates: number
  mrrCents: number
  planBreakdown: { free: number; basic: number; premium: number }
  newAgenciesLast30Days: number
  newLeadsLast30Days: number
  growthAgencies: string
  growthLeads: string
  registrationsChart: { date: string; count: number }[]
  recentDemoLeads: {
    id: string
    nome: string
    cognome: string
    email: string
    citta: string
    prezzoStimato: number
    dataRichiesta: string
  }[]
  affiliateOverview: {
    total: number
    activeReferrals: number
    pendingCommissionsCents: number
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<StatsData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader title="Dashboard Admin" subtitle="Caricamento..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="page-stack">
        <PageHeader title="Dashboard Admin" subtitle="Errore nel caricamento dati" />
      </div>
    )
  }

  const activeSubscriptions =
    stats.planBreakdown.basic + stats.planBreakdown.premium

  // Registrations chart data
  const chartData = stats.registrationsChart
  const maxCount = Math.max(...chartData.map((d) => d.count), 1)

  // Chart trend
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2))
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2))
  const firstAvg =
    firstHalf.reduce((sum, d) => sum + d.count, 0) / firstHalf.length
  const secondAvg =
    secondHalf.reduce((sum, d) => sum + d.count, 0) / secondHalf.length

  let trendIcon = <Minus className="w-4 h-4 text-foreground-muted" />
  let trendText = "Stabile"
  let trendColor = "text-foreground-muted"

  if (secondAvg > firstAvg * 1.1) {
    trendIcon = <TrendingUp className="w-4 h-4 text-success" />
    trendText = firstAvg > 0 ? `+${Math.round(((secondAvg - firstAvg) / firstAvg) * 100)}%` : `In crescita`
    trendColor = "text-success"
  } else if (secondAvg < firstAvg * 0.9 && firstAvg > 0) {
    trendIcon = <TrendingDown className="w-4 h-4 text-destructive" />
    trendText = `${Math.round(((secondAvg - firstAvg) / firstAvg) * 100)}%`
    trendColor = "text-destructive"
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard Admin"
        subtitle="Panoramica generale della piattaforma"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Agenzie Totali"
          value={stats.totalAgencies}
          icon={<Building2 className="h-5 w-5" />}
          trend={{ value: stats.growthAgencies, isPositive: stats.growthAgencies.startsWith("+") }}
        />
        <StatCard
          label="Lead Totali"
          value={stats.totalLeads}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: stats.growthLeads, isPositive: stats.growthLeads.startsWith("+") }}
        />
        <StatCard
          label="MRR"
          value={`€${(stats.mrrCents / 100).toLocaleString("it-IT")}`}
          icon={<Euro className="h-5 w-5" />}
        />
        <StatCard
          label="Abbonamenti Attivi"
          value={activeSubscriptions}
          icon={<CreditCard className="h-5 w-5" />}
          trend={{ value: `${stats.planBreakdown.basic}B + ${stats.planBreakdown.premium}P`, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Registrazioni 30 giorni */}
        <Card className="lg:col-span-2">
          <CardHeader
            style={{
              paddingBottom: "clamp(0.5rem, 1.5vw, 0.75rem)",
              padding: "clamp(0.75rem, 2vw, 1.5rem)",
            }}
          >
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
              style={{ gap: "var(--space-2)" }}
            >
              <div>
                <CardTitle
                  style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}
                >
                  Nuove Registrazioni
                </CardTitle>
                <p
                  className="text-foreground-muted"
                  style={{
                    fontSize: "clamp(0.625rem, 0.8vw, 0.75rem)",
                    marginTop: "var(--space-1)",
                  }}
                >
                  Ultimi 30 giorni
                </p>
              </div>
              <div
                className={`flex items-center font-medium ${trendColor}`}
                style={{
                  gap: "var(--space-1)",
                  fontSize: "clamp(0.625rem, 0.8vw, 0.75rem)",
                }}
              >
                {trendIcon}
                <span>{trendText}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent
            style={{
              padding: "clamp(0.75rem, 2vw, 1.5rem)",
              paddingTop: "0",
            }}
          >
            <div
              className="flex items-end"
              style={{
                gap: "clamp(0.125rem, 0.5vw, 0.25rem)",
                height: "clamp(6rem, 20vw, 8rem)",
              }}
            >
              {chartData.map((item, index) => {
                const heightPercentage =
                  item.count > 0
                    ? Math.max((item.count / maxCount) * 100, 3)
                    : 1
                const isToday = index === chartData.length - 1

                return (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div className="w-full flex items-end justify-center flex-1">
                      <div
                        className={`w-full rounded-t transition-all duration-180 ${
                          isToday
                            ? "bg-primary"
                            : item.count > 0
                              ? "bg-primary/60 hover:bg-primary/80"
                              : "bg-border"
                        }`}
                        style={{ height: `${heightPercentage}%` }}
                      />
                    </div>
                    <div
                      className="opacity-0 group-hover:opacity-100 absolute bottom-full bg-surface-2 text-foreground rounded-lg whitespace-nowrap pointer-events-none z-10 transition-opacity border border-border shadow-soft-lg"
                      style={{
                        marginBottom: "var(--space-2)",
                        padding:
                          "clamp(0.125rem, 0.5vw, 0.25rem) clamp(0.25rem, 1vw, 0.5rem)",
                        fontSize: "clamp(0.625rem, 0.8vw, 0.75rem)",
                      }}
                    >
                      {new Date(item.date).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                      })}
                      : {item.count}
                    </div>
                  </div>
                )
              })}
            </div>
            <div
              className="flex items-center justify-between text-foreground-subtle"
              style={{
                marginTop: "var(--space-2)",
                fontSize: "clamp(0.625rem, 0.8vw, 0.75rem)",
              }}
            >
              <span>
                {new Date(chartData[0].date).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span>
                {new Date(
                  chartData[chartData.length - 1].date
                ).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <div
              className="border-t border-border flex items-center justify-between"
              style={{
                marginTop: "clamp(0.5rem, 1.5vw, 0.75rem)",
                paddingTop: "clamp(0.5rem, 1.5vw, 0.75rem)",
              }}
            >
              <span
                className="text-foreground-muted"
                style={{ fontSize: "clamp(0.625rem, 0.8vw, 0.75rem)" }}
              >
                Totale periodo
              </span>
              <span
                className="font-semibold text-foreground"
                style={{ fontSize: "clamp(0.75rem, 1vw, 0.875rem)" }}
              >
                {stats.newAgenciesLast30Days} nuove agenzie
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Piano Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}>
              Distribuzione Piani
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                { name: "Free", count: stats.planBreakdown.free, color: "bg-foreground-muted" },
                { name: "Basic", count: stats.planBreakdown.basic, color: "bg-primary" },
                { name: "Premium", count: stats.planBreakdown.premium, color: "bg-warning" },
              ] as const
            ).map((plan) => (
              <div key={plan.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">{plan.name}</span>
                  <span className="font-medium">{plan.count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${plan.color} transition-all`}
                    style={{
                      width: `${stats.totalAgencies > 0 ? (plan.count / stats.totalAgencies) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border text-sm text-foreground-muted">
              {stats.totalAgencies} agenzie totali
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ultimi Demo Lead */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}>
              Ultimi Demo Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentDemoLeads.length === 0 ? (
              <p className="text-sm text-foreground-muted">Nessun demo lead</p>
            ) : (
              <div className="space-y-3">
                {stats.recentDemoLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {lead.nome} {lead.cognome}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {lead.citta} &middot;{" "}
                        {new Date(lead.dataRichiesta).toLocaleDateString(
                          "it-IT"
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      €{lead.prezzoStimato.toLocaleString("it-IT")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panoramica Affiliati */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}>
              <div className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                Panoramica Affiliati
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {stats.affiliateOverview.total}
                </p>
                <p className="text-xs text-foreground-muted">Totale</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {stats.affiliateOverview.activeReferrals}
                </p>
                <p className="text-xs text-foreground-muted">Referral Attivi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  €
                  {(
                    stats.affiliateOverview.pendingCommissionsCents / 100
                  ).toLocaleString("it-IT")}
                </p>
                <p className="text-xs text-foreground-muted">
                  Commissioni Pending
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-foreground-muted">
                Demo Lead totali: {stats.totalDemoLeads}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
