"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { DollarSign, Users, TrendingUp, Copy, Check, AlertCircle } from "lucide-react"
import Link from "next/link"
import { generateReferralUrl } from "@/lib/referral"

interface DashboardData {
  affiliate: {
    nome: string
    cognome: string
    ibanConfigured: boolean
  }
  stats: {
    totalReferrals: number
    activeReferrals: number
    totalEarningsCents: number
    pendingEarningsCents: number
    monthlyEarningsCents: number
    conversionRate: number
  }
  referralCodes: Array<{
    id: string
    code: string
    label: string | null
    isActive: boolean
    clicks: number
  }>
}

export default function AffiliateDashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [copied, setCopied] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("affiliate-token")
        const res = await fetch("/api/affiliate/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          setData(await res.json())
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(generateReferralUrl(code))
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-muted">Errore nel caricamento dei dati.</p>
      </div>
    )
  }

  const { affiliate, stats, referralCodes } = data
  const primaryCode = referralCodes.find((c) => c.isActive)

  return (
    <div className="page-stack">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Ciao, {affiliate.nome}!</h1>
        <p className="text-foreground-muted mt-1">Ecco il riepilogo del tuo programma affiliati</p>
      </div>

      {/* Banner IBAN */}
      {!affiliate.ibanConfigured && (
        <Card className="border-2 border-warning bg-warning/10">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold">Inserisci il tuo IBAN</h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Per ricevere le commissioni, inserisci il tuo IBAN nella sezione Pagamenti.
                </p>
              </div>
              <Link href="/affiliate/dashboard/connect">
                <Button size="sm">Configura</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "var(--grid-gap-md)" }}>
        <StatCard
          label="Guadagni Totali"
          value={`${(stats.totalEarningsCents / 100).toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatCard
          label="Guadagni Mese"
          value={`${(stats.monthlyEarningsCents / 100).toFixed(2)}`}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          label="Referral Attivi"
          value={stats.activeReferrals}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          label="Tasso Conversione"
          value={`${stats.conversionRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Link Referral */}
      {primaryCode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Il tuo link referral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-surface-2 rounded-lg px-4 py-2.5 text-sm font-mono overflow-x-auto">
                {generateReferralUrl(primaryCode.code)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(primaryCode.code)}
              >
                {copied === primaryCode.code ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-foreground-muted mt-2">
              {primaryCode.clicks} click totali
            </p>
          </CardContent>
        </Card>
      )}

      {/* Riepilogo */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--grid-gap-lg)" }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commissioni in sospeso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(stats.pendingEarningsCents / 100).toFixed(2)}
            </p>
            <p className="text-sm text-foreground-muted mt-1">
              Verranno trasferite al prossimo pagamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-3xl font-bold">{stats.totalReferrals}</p>
                <p className="text-sm text-foreground-muted">Totali</p>
              </div>
              <div>
                <Badge variant="success">{stats.activeReferrals} attivi</Badge>
              </div>
            </div>
            <Link href="/affiliate/dashboard/referrals" className="text-sm text-primary hover:underline mt-3 block">
              Vedi tutti i referral &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
