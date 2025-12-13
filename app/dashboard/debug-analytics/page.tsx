"use client"

import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Activity,
  TrendingUp,
} from "lucide-react"

interface DebugData {
  agency: {
    id: string
    name: string
    widgetId: string
  }
  counts: {
    totalWidgetEvents: number
    analyticsDailyRecords: number
    totalLeads: number
  }
  eventsByType: Record<string, number>
  recentEvents: Array<{
    eventType: string
    createdAt: string
    metadata: any
  }>
  recentAnalytics: Array<any>
  diagnosis: {
    hasWidgetEvents: boolean
    hasAnalyticsRecords: boolean
    hasLeads: boolean
    recommendation: string
  }
}

interface AggregationResult {
  success?: boolean
  message?: string
  agency?: {
    id: string
    name: string
    widgetId: string
  }
  aggregation?: {
    dateRange: {
      start: string
      end: string
      days: number
    }
    widgetEventsFound: number
    analyticsRecordsCreated: number
    totals: {
      totalImpressions: number
      totalClicks: number
      totalLeads: number
      totalValuations: number
    }
  }
  // Campi per popolazione da lead
  leadsProcessed?: number
  daysAggregated?: number
  recordsCreated?: number
  totals?: {
    totalImpressions: number
    totalClicks: number
    totalLeads: number
    totalValuations: number
  }
  note?: string
}

export default function DebugAnalyticsPage() {
  const [debugData, setDebugData] = React.useState<DebugData | null>(null)
  const [aggregationResult, setAggregationResult] = React.useState<AggregationResult | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [aggregating, setAggregating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchDebugData = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/analytics")
      if (!response.ok) {
        throw new Error("Errore nel caricamento dei dati di debug")
      }

      const data = await response.json()
      setDebugData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDebugData()
  }, [fetchDebugData])

  const handleForceAggregate = async (days: number = 90) => {
    setAggregating(true)
    setError(null)

    try {
      const response = await fetch(`/api/debug/force-aggregate?days=${days}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Errore nell'aggregazione dei dati")
      }

      const result = await response.json()
      setAggregationResult(result)

      // Ricarica i dati di debug
      await fetchDebugData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setAggregating(false)
    }
  }

  const handlePopulateFromLeads = async () => {
    setAggregating(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/populate-from-leads", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Errore nel popolare i dati dai lead")
      }

      const result = await response.json()
      setAggregationResult(result)

      // Ricarica i dati di debug
      await fetchDebugData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setAggregating(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Debug Analytics"
          subtitle="Diagnostica e risoluzione problemi analytics"
        />
        <div className="grid gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Debug Analytics"
          subtitle="Diagnostica e risoluzione problemi analytics"
        />
        <Card className="border-destructive/20 bg-destructive/5">
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

  if (!debugData) {
    return null
  }

  const StatusIcon = ({ condition }: { condition: boolean }) =>
    condition ? (
      <CheckCircle2 className="w-5 h-5 text-success" />
    ) : (
      <XCircle className="w-5 h-5 text-destructive" />
    )

  return (
    <div>
      <PageHeader
        title="Debug Analytics"
        subtitle="Diagnostica e risoluzione problemi analytics"
      />

      {/* Diagnosis Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Diagnosi Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon condition={debugData.diagnosis.hasWidgetEvents} />
                <div>
                  <p className="font-medium">Widget Events</p>
                  <p className="text-sm text-foreground-muted">
                    {debugData.counts.totalWidgetEvents} eventi trovati
                  </p>
                </div>
              </div>
              <Badge variant={debugData.diagnosis.hasWidgetEvents ? "default" : "destructive"}>
                {debugData.diagnosis.hasWidgetEvents ? "OK" : "Mancanti"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon condition={debugData.diagnosis.hasAnalyticsRecords} />
                <div>
                  <p className="font-medium">Analytics Records</p>
                  <p className="text-sm text-foreground-muted">
                    {debugData.counts.analyticsDailyRecords} record giornalieri
                  </p>
                </div>
              </div>
              <Badge
                variant={debugData.diagnosis.hasAnalyticsRecords ? "default" : "destructive"}
              >
                {debugData.diagnosis.hasAnalyticsRecords ? "OK" : "Mancanti"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon condition={debugData.diagnosis.hasLeads} />
                <div>
                  <p className="font-medium">Leads</p>
                  <p className="text-sm text-foreground-muted">{debugData.counts.totalLeads} lead totali</p>
                </div>
              </div>
              <Badge variant={debugData.diagnosis.hasLeads ? "default" : "secondary"}>
                {debugData.diagnosis.hasLeads ? "OK" : "Nessuno"}
              </Badge>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Raccomandazione</h4>
              <p className="text-sm text-foreground-muted">{debugData.diagnosis.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agency Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Informazioni Agenzia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-foreground-muted">Nome Agenzia</p>
              <p className="font-medium">{debugData.agency.name}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted">ID Agenzia</p>
              <p className="font-mono text-sm">{debugData.agency.id}</p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Widget ID</p>
              <p className="font-mono text-sm">{debugData.agency.widgetId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events by Type */}
      {Object.keys(debugData.eventsByType).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Eventi per Tipo</CardTitle>
            <CardDescription>Breakdown degli eventi widget raccolti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(debugData.eventsByType).map(([type, count]) => (
                <div key={type} className="p-4 bg-surface rounded-lg">
                  <p className="text-sm text-foreground-muted">{type}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Force Aggregate Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Aggregazione Manuale
          </CardTitle>
          <CardDescription>
            Forza l'aggregazione dei dati analytics dai widget events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => handleForceAggregate(7)}
              disabled={aggregating}
            >
              {aggregating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Aggregando...
                </>
              ) : (
                "Aggrega ultimi 7 giorni"
              )}
            </Button>
            <Button
              onClick={() => handleForceAggregate(30)}
              disabled={aggregating}
              variant="outline"
            >
              Aggrega ultimi 30 giorni
            </Button>
            <Button
              onClick={() => handleForceAggregate(90)}
              disabled={aggregating}
              variant="outline"
            >
              Aggrega ultimi 90 giorni
            </Button>
            <Button onClick={fetchDebugData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Ricarica Dati
            </Button>
          </div>

          {/* Popola dai Lead - opzione alternativa se non ci sono widget events */}
          {!debugData.diagnosis.hasWidgetEvents && debugData.diagnosis.hasLeads && (
            <div className="mt-4 p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">
                💡 Nessun evento widget tracciato
              </h4>
              <p className="text-sm text-foreground-muted mb-3">
                Non sono stati trovati eventi widget, ma hai {debugData.counts.totalLeads} lead nel database.
                Puoi popolare i dati analytics basandoti sui lead esistenti (le impressioni e i click saranno stime).
              </p>
              <Button
                onClick={handlePopulateFromLeads}
                disabled={aggregating}
                variant="default"
              >
                {aggregating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Popolando...
                  </>
                ) : (
                  "Popola Analytics dai Lead Esistenti"
                )}
              </Button>
            </div>
          )}

          {aggregationResult && (
            <div className="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                {aggregationResult.message || "Aggregazione Completata"}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {aggregationResult.aggregation?.widgetEventsFound !== undefined && (
                  <div>
                    <p className="text-foreground-muted">Eventi Trovati</p>
                    <p className="text-2xl font-bold text-foreground">
                      {aggregationResult.aggregation.widgetEventsFound}
                    </p>
                  </div>
                )}
                {aggregationResult.leadsProcessed !== undefined && (
                  <div>
                    <p className="text-foreground-muted">Lead Processati</p>
                    <p className="text-2xl font-bold text-foreground">
                      {aggregationResult.leadsProcessed}
                    </p>
                  </div>
                )}
                {aggregationResult.totals && (
                  <>
                    <div>
                      <p className="text-foreground-muted">Impressioni</p>
                      <p className="text-2xl font-bold text-foreground">
                        {aggregationResult.totals.totalImpressions || aggregationResult.aggregation?.totals?.totalImpressions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground-muted">Lead</p>
                      <p className="text-2xl font-bold text-foreground">
                        {aggregationResult.totals.totalLeads || aggregationResult.aggregation?.totals?.totalLeads || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground-muted">Valutazioni</p>
                      <p className="text-2xl font-bold text-foreground">
                        {aggregationResult.totals.totalValuations || aggregationResult.aggregation?.totals?.totalValuations || 0}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {aggregationResult.note && (
                <p className="text-sm text-foreground-muted mt-3">
                  ℹ️ {aggregationResult.note}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      {debugData.recentEvents.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ultimi Eventi Widget</CardTitle>
            <CardDescription>I 5 eventi più recenti raccolti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugData.recentEvents.map((event, idx) => (
                <div key={idx} className="p-3 bg-surface rounded-lg flex justify-between">
                  <div>
                    <Badge variant="outline">{event.eventType}</Badge>
                    <p className="text-xs text-foreground-muted mt-1">
                      {new Date(event.createdAt).toLocaleString("it-IT")}
                    </p>
                  </div>
                  {event.metadata && (
                    <p className="text-xs text-foreground-muted font-mono">
                      {JSON.stringify(event.metadata).substring(0, 50)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analytics */}
      {debugData.recentAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ultimi Record Analytics
            </CardTitle>
            <CardDescription>I 5 giorni più recenti aggregati</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface border-b border-border">
                  <tr>
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-right">Impressioni</th>
                    <th className="px-4 py-2 text-right">Click</th>
                    <th className="px-4 py-2 text-right">Lead</th>
                    <th className="px-4 py-2 text-right">Valutazioni</th>
                    <th className="px-4 py-2 text-right">Conv %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {debugData.recentAnalytics.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">
                        {new Date(row.date).toLocaleDateString("it-IT")}
                      </td>
                      <td className="px-4 py-2 text-right">{row.widgetImpressions}</td>
                      <td className="px-4 py-2 text-right">{row.widgetClicks}</td>
                      <td className="px-4 py-2 text-right font-medium text-success">
                        {row.leadsGenerated}
                      </td>
                      <td className="px-4 py-2 text-right">{row.valuationsCompleted}</td>
                      <td className="px-4 py-2 text-right">{row.conversionRate.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
