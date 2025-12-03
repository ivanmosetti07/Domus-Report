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
  const [liveData, setLiveData] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch analytics data
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch historical data
        const response = await fetch(
          `/api/analytics?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
        )

        if (!response.ok) {
          throw new Error("Errore nel caricamento dei dati")
        }

        const data = await response.json()
        setAnalyticsData(data)

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
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Errore</h3>
              <p className="text-sm text-red-700">{error}</p>
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

  // Mock previous period data (in produzione, fare query separata)
  const previousTotals = {
    totalImpressions: Math.floor(totals.totalImpressions * 0.85),
    totalLeads: Math.floor(totals.totalLeads * 0.9),
    totalValuations: Math.floor(totals.totalValuations * 0.88),
    averageConversionRate: totals.averageConversionRate * 0.92,
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
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Periodo:</span>
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
          icon={<Users className="w-6 h-6 text-green-600" />}
          trend={calculateTrend(totals.totalLeads, previousTotals.totalLeads)}
        />
        <StatCard
          label="Valutazioni Completate"
          value={totals.totalValuations.toLocaleString()}
          icon={<FileCheck className="w-6 h-6 text-blue-600" />}
          trend={calculateTrend(totals.totalValuations, previousTotals.totalValuations)}
        />
        <StatCard
          label="Conversion Rate"
          value={`${totals.averageConversionRate.toFixed(2)}%`}
          icon={<Target className="w-6 h-6 text-purple-600" />}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
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
              <div className="flex items-center justify-center h-64 text-gray-500">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
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
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5" />
                Suggerimenti per Ottimizzare
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
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
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Confronto con la Media</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Il tuo Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totals.averageConversionRate.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Media Piattaforma</p>
                  <p className="text-2xl font-bold text-gray-600">2.80%</p>
                </div>
              </div>
              <div className="mt-3">
                {totals.averageConversionRate > 2.8 ? (
                  <p className="text-sm text-green-700 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Il tuo widget performa meglio della media!
                  </p>
                ) : (
                  <p className="text-sm text-orange-700 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    C'è margine di miglioramento rispetto alla media
                  </p>
                )}
              </div>
            </div>
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Data</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Impression</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Click</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Lead</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Valutazioni</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Conv %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analyticsData?.data.map((day) => (
                  <tr key={day.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {format(new Date(day.date), "dd MMMM yyyy", { locale: it })}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{day.widgetImpressions}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{day.widgetClicks}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">
                      {day.leadsGenerated}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{day.valuationsCompleted}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${
                          day.conversionRate > 5
                            ? "text-green-600"
                            : day.conversionRate > 2
                            ? "text-gray-900"
                            : "text-orange-600"
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
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          {from} → {to}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {fromValue.toLocaleString()} → {toValue.toLocaleString()} utenti
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">{conversionRate}%</p>
        <p className="text-xs text-red-600">Drop-off: {dropOff.toFixed(1)}%</p>
      </div>
    </div>
  )
}
