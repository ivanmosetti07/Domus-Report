"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

interface Agency {
  id: string
  nome: string
  email: string
  citta: string
  piano: string
  attiva: boolean
  dataCreazione: string
  leadsCount: number
  widgetsCount: number
  subscription: {
    planType: string
    status: string
    billingInterval: string
  } | null
}

const planBadge: Record<string, string> = {
  free: "bg-foreground-muted/20 text-foreground-muted",
  basic: "bg-primary/20 text-primary",
  premium: "bg-warning/20 text-warning",
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = React.useState<Agency[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [plan, setPlan] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const fetchAgencies = React.useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", "20")
    if (search) params.set("search", search)
    if (plan) params.set("plan", plan)
    if (status) params.set("status", status)

    try {
      const res = await fetch(`/api/admin/agencies?${params}`)
      const data = await res.json()
      setAgencies(data.agencies)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, plan, status])

  React.useEffect(() => {
    fetchAgencies()
  }, [fetchAgencies])

  const toggleActive = async (id: string, attiva: boolean) => {
    await fetch(`/api/admin/agencies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attiva: !attiva }),
    })
    fetchAgencies()
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestione Agenzie"
        subtitle={`${total} agenzie registrate`}
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Cerca per nome, email o città..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <select
              value={plan}
              onChange={(e) => {
                setPlan(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 rounded-xl border border-border bg-surface text-sm text-foreground"
            >
              <option value="">Tutti i piani</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 rounded-xl border border-border bg-surface text-sm text-foreground"
            >
              <option value="">Tutti gli stati</option>
              <option value="active">Attive</option>
              <option value="inactive">Inattive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Agenzia
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Piano
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Stato
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Lead
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Data
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-foreground-muted">
                    Azioni
                  </th>
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
                ) : agencies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-foreground-muted"
                    >
                      Nessuna agenzia trovata
                    </td>
                  </tr>
                ) : (
                  agencies.map((agency) => (
                    <tr
                      key={agency.id}
                      className="border-b border-border hover:bg-surface/50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium">{agency.nome}</p>
                          <p className="text-xs text-foreground-muted">
                            {agency.email}
                          </p>
                          {agency.citta && (
                            <p className="text-xs text-foreground-subtle">
                              {agency.citta}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${planBadge[agency.piano] || planBadge.free}`}
                        >
                          {agency.piano.charAt(0).toUpperCase() +
                            agency.piano.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() =>
                            toggleActive(agency.id, agency.attiva)
                          }
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            agency.attiva
                              ? "bg-success/20 text-success hover:bg-success/30"
                              : "bg-destructive/20 text-destructive hover:bg-destructive/30"
                          }`}
                        >
                          {agency.attiva ? "Attiva" : "Inattiva"}
                        </button>
                      </td>
                      <td className="p-4 text-sm">{agency.leadsCount}</td>
                      <td className="p-4 text-sm text-foreground-muted">
                        {new Date(agency.dataCreazione).toLocaleDateString(
                          "it-IT"
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/dashboard/agencies/${agency.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-foreground-muted">
                Pagina {page} di {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
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
