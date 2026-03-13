"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

interface Commission {
  id: string
  agencyName: string
  amountCents: number
  invoiceAmountCents: number
  commissionRate: number
  status: string
  stripeTransferId: string | null
  paidAt: string | null
  failReason: string | null
  createdAt: string
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "destructive" | "warning" }> = {
  pending: { label: "In attesa", variant: "warning" },
  transferred: { label: "Trasferita", variant: "success" },
  failed: { label: "Fallita", variant: "destructive" },
}

export default function AffiliateCommissionsPage() {
  const [commissions, setCommissions] = React.useState<Commission[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<string>("")

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("affiliate-token")
        const params = new URLSearchParams()
        if (filter) params.set("status", filter)
        const res = await fetch(`/api/affiliate/commissions?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setCommissions(data.commissions)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Commissioni</h1>
        <p className="text-foreground-muted mt-1">Storico delle tue commissioni</p>
      </div>

      {/* Filtri */}
      <div className="flex gap-2">
        {[
          { value: "", label: "Tutte" },
          { value: "transferred", label: "Trasferite" },
          { value: "pending", label: "In attesa" },
          { value: "failed", label: "Fallite" },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(f.value); setLoading(true) }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Commissioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-foreground-muted mb-3" />
              <p className="text-foreground-muted">Nessuna commissione trovata.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commissions.map((c) => {
                const statusInfo = STATUS_MAP[c.status] || STATUS_MAP.pending
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border"
                  >
                    <div>
                      <p className="font-medium">{c.agencyName}</p>
                      <p className="text-sm text-foreground-muted">
                        Fattura: {(c.invoiceAmountCents / 100).toFixed(2)} &middot;
                        Commissione: {(c.commissionRate * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-foreground-muted mt-1">
                        {new Date(c.createdAt).toLocaleDateString("it-IT")}
                        {c.failReason && <span className="text-destructive ml-2">{c.failReason}</span>}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold">{(c.amountCents / 100).toFixed(2)}</p>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
