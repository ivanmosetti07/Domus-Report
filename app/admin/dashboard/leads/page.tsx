"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"
import { Search, ChevronLeft, ChevronRight, TestTube, Building2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"

interface Lead {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string | null
  dataRichiesta: string
  agenzia: { id: string; nome: string; email: string }
  property: {
    citta: string
    tipo: string
    superficieMq: number
    valuation: { prezzoStimato: number } | null
  } | null
}

type Scope = "domus" | "external"

export default function AdminLeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [counts, setCounts] = React.useState({ domus: 0, external: 0 })
  const [scope, setScope] = React.useState<Scope>("external")

  const fetchLeads = React.useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", "20")
    params.set("scope", scope)
    if (search) params.set("search", search)

    try {
      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()
      setLeads(data.leads)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      if (data.counts) setCounts(data.counts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, scope])

  React.useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleTabChange = (value: string) => {
    setScope(value as Scope)
    setPage(1)
    setSearch("")
  }

  const [recalculatingId, setRecalculatingId] = React.useState<string | null>(null)
  const [recalcMessage, setRecalcMessage] = React.useState<string>("")

  const handleRecalculate = async (leadId: string) => {
    setRecalculatingId(leadId)
    setRecalcMessage("")
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/recalculate`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Errore ricalcolo")
      const prev = data.previous?.prezzoStimato ?? 0
      const curr = data.current?.prezzoStimato ?? 0
      const delta = prev > 0 ? ((curr - prev) / prev) * 100 : 0
      const cmpInfo = data.comparables?.enabled
        ? ` · ${data.comparables.sampleSize} comparables (delta OMI ${data.comparables.crossCheck?.deltaPct ?? 0}%)`
        : ""
      setRecalcMessage(
        `Ricalcolato: €${prev.toLocaleString("it-IT")} → €${curr.toLocaleString("it-IT")} (${delta > 0 ? "+" : ""}${delta.toFixed(1)}%)${cmpInfo}`
      )
      setTimeout(() => setRecalcMessage(""), 6000)
      fetchLeads()
    } catch (err) {
      setRecalcMessage(`Errore: ${err instanceof Error ? err.message : String(err)}`)
      setTimeout(() => setRecalcMessage(""), 6000)
    } finally {
      setRecalculatingId(null)
    }
  }

  const renderTable = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Nome</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Agenzia</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Immobile</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Stima</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Data</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={6} className="p-4">
                      <div className="h-5 bg-surface-2 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground-muted">
                    {scope === "domus"
                      ? "Nessun lead dai widget interni. Condividi un widget Domus Report per riceverli qui."
                      : "Nessun lead dalle agenzie iscritte."}
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-medium">{lead.nome} {lead.cognome}</p>
                      <p className="text-xs text-foreground-muted">{lead.email}</p>
                    </td>
                    <td className="p-4 text-sm">{lead.agenzia.nome}</td>
                    <td className="p-4 text-sm">
                      {lead.property ? (
                        <>
                          {lead.property.citta} - {lead.property.tipo} ({lead.property.superficieMq}mq)
                        </>
                      ) : (
                        <span className="text-foreground-muted">N/D</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-semibold text-primary">
                      {lead.property?.valuation
                        ? `€${lead.property.valuation.prezzoStimato.toLocaleString("it-IT")}`
                        : "N/D"}
                    </td>
                    <td className="p-4 text-sm text-foreground-muted">
                      {new Date(lead.dataRichiesta).toLocaleDateString("it-IT")}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecalculate(lead.id)}
                        disabled={recalculatingId === lead.id}
                        title="Ricalcola con motore attuale + comparables reali"
                      >
                        {recalculatingId === lead.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-foreground-muted">Pagina {page} di {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="page-stack">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Tutti i Lead" subtitle={`${total} lead nel tab corrente`} />
        <Link
          href="/admin/dashboard/leads/attempts"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground whitespace-nowrap mt-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Tentativi falliti
        </Link>
      </div>

      {recalcMessage && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          {recalcMessage}
        </div>
      )}

      <Tabs value={scope} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="domus" className="gap-2">
            <TestTube className="w-4 h-4" />
            Domus Report
            <Badge variant="secondary" className="text-[10px] ml-1">{counts.domus}</Badge>
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-2">
            <Building2 className="w-4 h-4" />
            Agenzie Iscritte
            <Badge variant="secondary" className="text-[10px] ml-1">{counts.external}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domus" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  placeholder="Cerca per nome, cognome o email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          <p className="text-sm text-foreground-muted">
            Lead generati dai widget interni Domus Report (test, demo, condivisioni).
          </p>
          {renderTable()}
        </TabsContent>

        <TabsContent value="external" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  placeholder="Cerca per nome, cognome o email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          {renderTable()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
