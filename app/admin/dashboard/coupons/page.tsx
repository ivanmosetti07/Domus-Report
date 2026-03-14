"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Tag } from "lucide-react"

interface Coupon {
  id: string
  code: string
  discountPercent: number
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = React.useState<Coupon[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreate, setShowCreate] = React.useState(false)
  const [createLoading, setCreateLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    code: "",
    discountPercent: "",
    maxUses: "",
    expiresAt: "",
  })
  const [error, setError] = React.useState("")

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons")
      const data = await res.json()
      setCoupons(data.coupons || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCoupons()
  }, [])

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchCoupons()
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo coupon?")) return
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
    fetchCoupons()
  }

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.code.trim() || !form.discountPercent) {
      setError("Codice e sconto sono obbligatori")
      return
    }

    setCreateLoading(true)
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Errore nella creazione")
        return
      }
      setForm({ code: "", discountPercent: "", maxUses: "", expiresAt: "" })
      setShowCreate(false)
      fetchCoupons()
    } catch {
      setError("Errore di connessione")
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestione Coupon"
        subtitle={`${coupons.length} codici promozionali`}
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nuovo Coupon
          </Button>
        }
      />

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Nuovo Coupon
              </h3>
              <form onSubmit={createCoupon} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Codice</Label>
                  <Input
                    placeholder="es. WELCOME20"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sconto %</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="es. 20"
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discountPercent: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usi massimi (opzionale)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Illimitati"
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxUses: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scadenza (opzionale)</Label>
                  <Input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, expiresAt: e.target.value }))
                    }
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setShowCreate(false)
                      setError("")
                    }}
                  >
                    Annulla
                  </Button>
                  <Button type="submit" loading={createLoading}>
                    Crea Coupon
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Codice</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Sconto</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Utilizzi</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Scadenza</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Stato</th>
                  <th className="text-right p-4 text-sm font-medium text-foreground-muted">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={6} className="p-4">
                        <div className="h-5 bg-surface-2 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-foreground-muted">
                      Nessun coupon creato
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                      <td className="p-4">
                        <span className="text-sm font-mono font-semibold bg-surface-2 px-2 py-0.5 rounded">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-primary">{coupon.discountPercent}%</td>
                      <td className="p-4 text-sm">
                        {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ""}
                      </td>
                      <td className="p-4 text-sm text-foreground-muted">
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString("it-IT")
                          : "Mai"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(coupon.id, coupon.isActive)}
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            coupon.isActive
                              ? "bg-success/20 text-success hover:bg-success/30"
                              : "bg-destructive/20 text-destructive hover:bg-destructive/30"
                          }`}
                        >
                          {coupon.isActive ? "Attivo" : "Inattivo"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
