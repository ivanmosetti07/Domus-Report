"use client"

import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  FileCheck,
  Target,
  Calendar,
  Download,
  AlertCircle,
  Lightbulb,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { it } from "date-fns/locale"

// Types
interface AnalyticsDaily {
  id: string
  agencyId: string
  date: string
  widgetImpressions: number
  widgetClicks: number
  leadsGenerated: number
  valuationsCompleted: number
  conversionRate: number
}

interface AnalyticsData {
  data: AnalyticsDaily[]
  totals: {
    totalImpressions: number
    totalClicks: number
    totalLeads: number
    totalValuations: number
    averageConversionRate: number
  }
}

interface FunnelData {
  step1_opened: number
  step2_messaged: number
  step3_valuation: number
  step4_formStarted: number
  step5_leadSubmitted: number
  dropOff_openToMessage: number
  dropOff_messageToValuation: number
  dropOff_valuationToForm: number
  dropOff_formToSubmit: number
}

// Date presets
type DatePreset = "today" | "7days" | "30days" | "thisMonth" | "custom"

interface DateRange {
  start: Date
  end: Date
}

function getDateRange(preset: DatePreset): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case "today":
      return { start: today, end: now }
    case "7days":
      return { start: subDays(today, 7), end: now }
    case "30days":
      return { start: subDays(today, 30), end: now }
    case "thisMonth":
      return { start: startOfMonth(now), end: endOfMonth(now) }
    default:
      return { start: subDays(today, 30), end: now }
  }
}

export default function AnalyticsPage() {
  const [datePreset, setDatePreset] = React.useState<DatePreset>("30days")
  const [dateRange, setDateRange] = React.useState<DateRange>(() =>
    getDateRange("30days")
  )
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null)
  const [previousAnalyticsData, setPreviousAnalyticsData] = React.useState<AnalyticsData | null>(null)
  const [platformAverage, setPlatformAverage] = React.useState<number | null>(null)
  const [liveData, setLiveData] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch analytics data
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)

      try {
        // Calcola periodo precedente (stessa durata)
        const periodDuration = dateRange.end.getTime() - dateRange.start.getTime()
        const previousStart = new Date(dateRange.start.getTime() - periodDuration)
        const previousEnd = new Date(dateRange.start.getTime() - 1)

        // Fetch dati periodo corrente e precedente in parallelo
        const [currentResponse, previousResponse, platformResponse] = await Promise.all([
          fetch(
            `/api/analytics?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
          ),
          fetch(
            `/api/analytics?startDate=${previousStart.toISOString()}&endDate=${previousEnd.toISOString()}`
          ),
          fetch("/api/analytics/platform-average"),
        ])

        if (!currentResponse.ok) {
          throw new Error("Errore nel caricamento dei dati")
        }

        const currentData = await currentResponse.json()
        setAnalyticsData(currentData)

        // Dati periodo precedente
        if (previousResponse.ok) {
          const previousData = await previousResponse.json()
          setPreviousAnalyticsData(previousData)
        }

        // Media piattaforma
        if (platformResponse.ok) {
          const platformData = await platformResponse.json()
          setPlatformAverage(platformData.averageConversionRate)
        }

        // Fetch live data (today only)
        if (datePreset === "today") {
          const liveResponse = await fetch("/api/analytics/live")
          if (liveResponse.ok) {
            const liveJson = await liveResponse.json()
            setLiveData(liveJson.data)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore sconosciuto")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange, datePreset])

  // Handle preset change
  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset)
    setDateRange(getDateRange(preset))
  }

  // Calculate trends (compare with previous period)
  const calculateTrend = (current: number, previous: number): { value: string; isPositive: boolean } => {
    if (previous === 0) return { value: "N/A", isPositive: true }
    const change = ((current - previous) / previous) * 100
    return {
      value: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
      isPositive: change >= 0,
    }
  }

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!analyticsData?.data) return []

    return analyticsData.data.map((day) => ({
      date: format(new Date(day.date), "dd MMM", { locale: it }),
      fullDate: day.date,
      impressioni: day.widgetImpressions,
      lead: day.leadsGenerated,
      valutazioni: day.valuationsCompleted,
      conversionRate: day.conversionRate,
    }))
  }, [analyticsData])

  // Funnel data (from live data if today, else from totals)
  const funnelData: FunnelData | null = React.useMemo(() => {
    if (liveData?.funnel) {
      return liveData.funnel
    }

    // Estimate from totals (no exact funnel without events)
    if (analyticsData?.totals) {
      const totals = analyticsData.totals
      return {
        step1_opened: totals.totalImpressions,
        step2_messaged: totals.totalClicks,
        step3_valuation: totals.totalValuations,
        step4_formStarted: Math.floor(totals.totalLeads * 1.2), // Estimate
        step5_leadSubmitted: totals.totalLeads,
        dropOff_openToMessage: 0,
        dropOff_messageToValuation: 0,
        dropOff_valuationToForm: 0,
        dropOff_formToSubmit: 0,
      }
    }

    return null
  }, [liveData, analyticsData])

  // Download CSV
  const downloadCSV = () => {
    if (!analyticsData?.data) return

    const headers = ["Data", "Impression", "Click", "Lead", "Valutazioni", "Conversion %"]
    const rows = analyticsData.data.map((day) => [
      format(new Date(day.date), "dd/MM/yyyy"),
      day.widgetImpressions,
      day.widgetClicks,
      day.leadsGenerated,
      day.valuationsCompleted,
      day.conversionRate,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `analytics_${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          subtitle="Analizza le performance del tuo widget"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          subtitle="Analizza le performance del tuo widget"
        />
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">Errore</h3>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totals = analyticsData?.totals || {
    totalImpressions: 0,
    totalClicks: 0,
    totalLeads: 0,
    totalValuations: 0,
    averageConversionRate: 0,
  }

  // Dati periodo precedente (reali, non più mock)
  const previousTotals = previousAnalyticsData?.totals || {
    totalImpressions: 0,
    totalLeads: 0,
    totalValuations: 0,
    averageConversionRate: 0,
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Analizza le performance del tuo widget e ottimizza le conversioni"
      />

      {/* Date Range Picker */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-foreground-muted" />
              <span className="font-medium text-foreground">Periodo:</span>
              <div className="flex gap-2">
                <Button
                  variant={datePreset === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange("today")}
                >
                  Oggi
                </Button>
                <Button
                  variant={datePreset === "7days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange("7days")}
                >
                  Ultimi 7 giorni
                </Button>
                <Button
                  variant={datePreset === "30days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange("30days")}
                >
                  Ultimi 30 giorni
                </Button>
                <Button
                  variant={datePreset === "thisMonth" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange("thisMonth")}
                >
                  Questo mese
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="w-4 h-4 mr-2" />
              Esporta CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Impression Widget"
          value={totals.totalImpressions.toLocaleString()}
          icon={<Eye className="w-6 h-6 text-primary" />}
          trend={calculateTrend(totals.totalImpressions, previousTotals.totalImpressions)}
        />
        <StatCard
          label="Lead Generati"
          value={totals.totalLeads.toLocaleString()}
          icon={<Users className="w-6 h-6 text-success" />}
          trend={calculateTrend(totals.totalLeads, previousTotals.totalLeads)}
        />
        <StatCard
          label="Valutazioni Completate"
          value={totals.totalValuations.toLocaleString()}
          icon={<FileCheck className="w-6 h-6 text-primary" />}
          trend={calculateTrend(totals.totalValuations, previousTotals.totalValuations)}
        />
        <StatCard
          label="Conversion Rate"
          value={`${totals.averageConversionRate.toFixed(2)}%`}
          icon={<Target className="w-6 h-6 text-accent" />}
          variant={
            totals.averageConversionRate > 5
              ? "success"
              : totals.averageConversionRate > 2
              ? "default"
              : "warning"
          }
          trend={calculateTrend(
            totals.averageConversionRate,
            previousTotals.averageConversionRate
          )}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart: Impressions vs Lead */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Impression vs Lead
            </CardTitle>
            <CardDescription>
              Andamento nel tempo di impression e lead generati
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--foreground-muted))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--foreground-muted))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground-muted))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="impressioni"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Impressioni"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="lead"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Lead"
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-foreground-muted">
                Nessun dato disponibile per questo periodo
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Funnel di Conversione
            </CardTitle>
            <CardDescription>
              Percorso completo dal widget aperto al lead salvato
            </CardDescription>
          </CardHeader>
          <CardContent>
            {funnelData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "Widget Aperti", value: funnelData.step1_opened },
                    { name: "Messaggi Inviati", value: funnelData.step2_messaged },
                    { name: "Valutazioni Viste", value: funnelData.step3_valuation },
                    { name: "Form Iniziati", value: funnelData.step4_formStarted },
                    { name: "Lead Salvati", value: funnelData.step5_leadSubmitted },
                  ]}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--foreground-muted))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground-muted))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-foreground-muted">
                Dati funnel non disponibili
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel Analysis */}
      {funnelData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Analisi Dettagliata Conversione
            </CardTitle>
            <CardDescription>
              Breakdown step-by-step con drop-off rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FunnelStep
                from="Widget aperto"
                to="Messaggio inviato"
                fromValue={funnelData.step1_opened}
                toValue={funnelData.step2_messaged}
                dropOff={funnelData.dropOff_openToMessage}
              />
              <FunnelStep
                from="Messaggio inviato"
                to="Valutazione completata"
                fromValue={funnelData.step2_messaged}
                toValue={funnelData.step3_valuation}
                dropOff={funnelData.dropOff_messageToValuation}
              />
              <FunnelStep
                from="Valutazione completata"
                to="Form contatti iniziato"
                fromValue={funnelData.step3_valuation}
                toValue={funnelData.step4_formStarted}
                dropOff={funnelData.dropOff_valuationToForm}
              />
              <FunnelStep
                from="Form contatti iniziato"
                to="Lead salvato"
                fromValue={funnelData.step4_formStarted}
                toValue={funnelData.step5_leadSubmitted}
                dropOff={funnelData.dropOff_formToSubmit}
              />
            </div>

            {/* Suggerimenti Ottimizzazione */}
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5" />
                Suggerimenti per Ottimizzare
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                {funnelData.dropOff_openToMessage > 70 && (
                  <li>
                    • <strong>Drop-off alto tra apertura e messaggio ({funnelData.dropOff_openToMessage.toFixed(1)}%):</strong>{" "}
                    Considera di rendere più chiaro il valore del widget nel messaggio di benvenuto.
                  </li>
                )}
                {funnelData.dropOff_messageToValuation > 50 && (
                  <li>
                    • <strong>Drop-off alto tra messaggio e valutazione ({funnelData.dropOff_messageToValuation.toFixed(1)}%):</strong>{" "}
                    Il processo potrebbe essere troppo lungo. Prova a semplificare le domande.
                  </li>
                )}
                {funnelData.dropOff_valuationToForm > 60 && (
                  <li>
                    • <strong>Drop-off alto tra valutazione e form contatti ({funnelData.dropOff_valuationToForm.toFixed(1)}%):</strong>{" "}
                    Gli utenti abbandonano dopo aver visto il prezzo. Considera di rendere più attraente l'offerta successiva.
                  </li>
                )}
                {funnelData.dropOff_formToSubmit > 40 && (
                  <li>
                    • <strong>Drop-off alto nel form contatti ({funnelData.dropOff_formToSubmit.toFixed(1)}%):</strong>{" "}
                    Il form potrebbe essere troppo complesso. Prova a ridurre i campi obbligatori.
                  </li>
                )}
                {funnelData.dropOff_openToMessage <= 70 &&
                  funnelData.dropOff_messageToValuation <= 50 &&
                  funnelData.dropOff_valuationToForm <= 60 &&
                  funnelData.dropOff_formToSubmit <= 40 && (
                    <li>
                      ✅ <strong>Ottimo lavoro!</strong> Il tuo funnel sta performando bene. Continua a monitorare le metriche.
                    </li>
                  )}
              </ul>
            </div>

            {/* Benchmark Comparison */}
            {platformAverage !== null && (
              <div className="mt-4 p-4 bg-surface-2 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Confronto con la Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-muted">Il tuo Conversion Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totals.averageConversionRate.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Media Piattaforma</p>
                    <p className="text-2xl font-bold text-foreground-muted">
                      {platformAverage.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  {totals.averageConversionRate > platformAverage ? (
                    <p className="text-sm text-success flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Il tuo widget performa meglio della media!
                    </p>
                  ) : (
                    <p className="text-sm text-warning flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      C'è margine di miglioramento rispetto alla media
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Daily Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dettagli Giornalieri</CardTitle>
          <CardDescription>
            Breakdown completo per ogni giorno del periodo selezionato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Data</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Impression</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Click</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Lead</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Valutazioni</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Conv %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analyticsData?.data.map((day) => (
                  <tr key={day.id} className="hover:bg-surface-2">
                    <td className="px-4 py-3 text-foreground">
                      {format(new Date(day.date), "dd MMMM yyyy", { locale: it })}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{day.widgetImpressions}</td>
                    <td className="px-4 py-3 text-right text-foreground">{day.widgetClicks}</td>
                    <td className="px-4 py-3 text-right font-medium text-success">
                      {day.leadsGenerated}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{day.valuationsCompleted}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${
                          day.conversionRate > 5
                            ? "text-success"
                            : day.conversionRate > 2
                            ? "text-foreground"
                            : "text-warning"
                        }`}
                      >
                        {day.conversionRate.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Funnel Step Component
function FunnelStep({
  from,
  to,
  fromValue,
  toValue,
  dropOff,
}: {
  from: string
  to: string
  fromValue: number
  toValue: number
  dropOff: number
}) {
  const conversionRate = fromValue > 0 ? ((toValue / fromValue) * 100).toFixed(1) : "0.0"

  return (
    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
      <div className="flex-1">
        <p className="text-sm text-foreground-muted">
          {from} → {to}
        </p>
        <p className="text-xs text-foreground-muted mt-1">
          {fromValue.toLocaleString()} → {toValue.toLocaleString()} utenti
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-foreground">{conversionRate}%</p>
        <p className="text-xs text-destructive">Drop-off: {dropOff.toFixed(1)}%</p>
      </div>
    </div>
  )
}
