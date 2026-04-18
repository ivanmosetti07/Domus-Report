"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

interface Attempt {
  id: string
  widgetId: string | null
  agencyId: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  status: "success" | "failed"
  errorCode: string | null
  errorMessage: string | null
  savedLeadId: string | null
  httpStatus: number | null
  ipAddress: string | null
  bodySnapshot: Record<string, unknown> | null
  createdAt: string
}

type Scope = "failed" | "success"

export default function AdminLeadAttemptsPage() {
  const [attempts, setAttempts] = React.useState<Attempt[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [counts, setCounts] = React.useState({ failed: 0, success: 0 })
  const [scope, setScope] = React.useState<Scope>("failed")
  const [expanded, setExpanded] = React.useState<string | null>(null)

  const fetchAttempts = React.useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", "20")
    params.set("status", scope)
    if (search) params.set("search", search)

    try {
      const res = await fetch(`/api/admin/lead-attempts?${params}`)
      const data = await res.json()
      setAttempts(data.attempts)
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
    fetchAttempts()
  }, [fetchAttempts])

  const handleTabChange = (value: string) => {
    setScope(value as Scope)
    setPage(1)
    setSearch("")
    setExpanded(null)
  }

  const renderTable = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Data</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Email</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">Nome</th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                  {scope === "failed" ? "Errore" : "Lead ID"}
                </th>
                <th className="text-left p-4 text-sm font-medium text-foreground-muted">HTTP</th>
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
              ) : attempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground-muted">
                    {scope === "failed"
                      ? "Nessun tentativo fallito. Ottimo!"
                      : "Nessun lead salvato nel periodo."}
                  </td>
                </tr>
              ) : (
                attempts.map((a) => (
                  <React.Fragment key={a.id}>
                    <tr className="border-b border-border hover:bg-surface/50 transition-colors">
                      <td className="p-4 text-sm text-foreground-muted whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-sm">{a.email || <span className="text-foreground-muted">—</span>}</td>
                      <td className="p-4 text-sm">
                        {a.firstName || a.lastName
                          ? `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim()
                          : <span className="text-foreground-muted">—</span>}
                      </td>
                      <td className="p-4 text-sm">
                        {scope === "failed" ? (
                          <div>
                            <Badge variant="destructive" className="text-[10px] mb-1">
                              {a.errorCode || "ERROR"}
                            </Badge>
                            <p className="text-xs text-foreground-muted truncate max-w-[280px]">
                              {a.errorMessage}
                            </p>
                          </div>
                        ) : a.savedLeadId ? (
                          <Link
                            href={`/admin/dashboard/leads/${a.savedLeadId}`}
                            className="text-xs text-primary hover:underline font-mono"
                          >
                            {a.savedLeadId.slice(0, 10)}…
                          </Link>
                        ) : (
                          <span className="text-foreground-muted">—</span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        <Badge variant={a.httpStatus === 200 ? "success" : "secondary"} className="text-[10px]">
                          {a.httpStatus ?? "n/d"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                        >
                          {expanded === a.id ? "Nascondi" : "Dettagli"}
                        </Button>
                      </td>
                    </tr>
                    {expanded === a.id && (
                      <tr className="border-b border-border bg-surface/30">
                        <td colSpan={6} className="p-4">
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium">Widget ID:</span>{" "}
                              <span className="font-mono text-foreground-muted">
                                {a.widgetId || "n/d"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Agency ID:</span>{" "}
                              <span className="font-mono text-foreground-muted">
                                {a.agencyId || "n/d"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">IP:</span>{" "}
                              <span className="font-mono text-foreground-muted">
                                {a.ipAddress || "n/d"}
                              </span>
                            </div>
                            {a.bodySnapshot && (
                              <details>
                                <summary className="cursor-pointer font-medium">
                                  Payload ricevuto (sanificato)
                                </summary>
                                <pre className="mt-2 p-2 bg-background rounded text-[10px] overflow-x-auto">
                                  {JSON.stringify(a.bodySnapshot, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-foreground-muted">
              Pagina {page} di {totalPages} · {total} risultati
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
  )

  return (
    <div className="page-stack">
      <Link
        href="/admin/dashboard/leads"
        className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna ai Lead
      </Link>
      <PageHeader
        title="Tentativi submission lead"
        subtitle="Log completo di ogni POST a /api/leads (inclusi errori)"
      />

      <Tabs value={scope} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="failed" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Falliti
            <Badge variant="destructive" className="text-[10px] ml-1">
              {counts.failed}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="success" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Riusciti
            <Badge variant="secondary" className="text-[10px] ml-1">
              {counts.success}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="failed" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  placeholder="Cerca per email, errore, ecc..."
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
            Tentativi di creazione lead andati in errore prima del salvataggio. Ogni entry
            include errore, payload ricevuto e IP per debug.
          </p>
          {renderTable()}
        </TabsContent>

        <TabsContent value="success" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  placeholder="Cerca per email..."
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
