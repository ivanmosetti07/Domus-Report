"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface Lead {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string | null
  dataRichiesta: string
  agenzia: { id: string; nome: string }
  property: {
    citta: string
    tipo: string
    superficieMq: number
    valuation: { prezzoStimato: number } | null
  } | null
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const fetchLeads = React.useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", "20")
    if (search) params.set("search", search)

    try {
      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()
      setLeads(data.leads)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  React.useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return (
    <div className="page-stack">
      <PageHeader title="Tutti i Lead" subtitle={`${total} lead totali`} />

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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Nome</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Agenzia</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Immobile</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Stima</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={5} className="p-4">
                        <div className="h-5 bg-surface-2 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-foreground-muted">
                      Nessun lead trovato
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
    </div>
  )
}
