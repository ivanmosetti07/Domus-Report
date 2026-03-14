"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Pencil, Trash2, X, Save } from "lucide-react"

interface AffiliateData {
  id: string
  nome: string
  cognome: string
  email: string
  attivo: boolean
  iban: string | null
  ibanAccountHolder: string | null
  dataCreazione: string
  totalEarningsCents: number
  pendingEarningsCents: number
  referralsCount: number
  commissionsCount: number
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = React.useState<AffiliateData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [payoutModal, setPayoutModal] = React.useState<string | null>(null)
  const [paymentRef, setPaymentRef] = React.useState("")
  const [payoutLoading, setPayoutLoading] = React.useState(false)
  const [success, setSuccess] = React.useState("")
  const [error, setError] = React.useState("")

  // Edit modal state
  const [editModal, setEditModal] = React.useState<AffiliateData | null>(null)
  const [editForm, setEditForm] = React.useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    iban: "",
    ibanAccountHolder: "",
  })
  const [editLoading, setEditLoading] = React.useState(false)

  const showMsg = (msg: string, isError = false) => {
    if (isError) {
      setError(msg)
      setTimeout(() => setError(""), 5000)
    } else {
      setSuccess(msg)
      setTimeout(() => setSuccess(""), 5000)
    }
  }

  const fetchAffiliates = async () => {
    try {
      const res = await fetch("/api/admin/affiliates")
      const data = await res.json()
      setAffiliates(data.affiliates || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAffiliates()
  }, [])

  const toggleActive = async (id: string, attivo: boolean) => {
    await fetch(`/api/admin/affiliates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attivo: !attivo }),
    })
    fetchAffiliates()
  }

  const handlePayout = async (affiliateId: string) => {
    if (!paymentRef.trim()) return
    setPayoutLoading(true)
    try {
      const res = await fetch("/api/admin/commissions/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId, paymentReference: paymentRef }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg(`Pagati ${data.paidCount} commissioni (€${(data.totalCents / 100).toFixed(2)})`)
        setPaymentRef("")
        setPayoutModal(null)
        fetchAffiliates()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPayoutLoading(false)
    }
  }

  const openEditModal = async (aff: AffiliateData) => {
    try {
      const res = await fetch(`/api/admin/affiliates/${aff.id}`)
      const data = await res.json()
      const a = data.affiliate || aff
      setEditForm({
        nome: a.nome || "",
        cognome: a.cognome || "",
        email: a.email || "",
        telefono: a.telefono || "",
        iban: a.iban || "",
        ibanAccountHolder: a.ibanAccountHolder || "",
      })
      setEditModal(aff)
    } catch {
      setEditForm({
        nome: aff.nome || "",
        cognome: aff.cognome || "",
        email: aff.email || "",
        telefono: "",
        iban: aff.iban || "",
        ibanAccountHolder: aff.ibanAccountHolder || "",
      })
      setEditModal(aff)
    }
  }

  const saveEdit = async () => {
    if (!editModal) return
    setEditLoading(true)
    try {
      const res = await fetch(`/api/admin/affiliates/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (data.success) {
        setEditModal(null)
        showMsg("Affiliato aggiornato")
        fetchAffiliates()
      } else {
        showMsg(data.error || "Errore", true)
      }
    } catch {
      showMsg("Errore di connessione", true)
    } finally {
      setEditLoading(false)
    }
  }

  const deleteAffiliate = async (aff: AffiliateData) => {
    if (!confirm(`Disattivare l'affiliato "${aff.nome} ${aff.cognome}"?`)) return
    try {
      const res = await fetch(`/api/admin/affiliates/${aff.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showMsg("Affiliato disattivato")
        fetchAffiliates()
      } else {
        showMsg(data.error || "Errore", true)
      }
    } catch {
      showMsg("Errore di connessione", true)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestione Affiliati"
        subtitle={`${affiliates.length} affiliati registrati`}
      />

      {success && (
        <div className="rounded-xl border border-success/40 bg-success/10 p-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-2 rounded-xl animate-pulse" />
          ))
        ) : affiliates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-foreground-muted">
              Nessun affiliato registrato
            </CardContent>
          </Card>
        ) : (
          affiliates.map((aff) => (
            <Card key={aff.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{aff.nome} {aff.cognome}</p>
                    <p className="text-xs text-foreground-muted truncate">{aff.email}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(aff.id, aff.attivo)}
                    className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer shrink-0 ${
                      aff.attivo
                        ? "bg-success/20 text-success"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {aff.attivo ? "Attivo" : "Inattivo"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-semibold">{aff.referralsCount}</p>
                    <p className="text-[10px] text-foreground-muted">Referral</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-success">€{(aff.totalEarningsCents / 100).toFixed(2)}</p>
                    <p className="text-[10px] text-foreground-muted">Guadagni</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-warning">€{(aff.pendingEarningsCents / 100).toFixed(2)}</p>
                    <p className="text-[10px] text-foreground-muted">Pending</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(aff)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Modifica
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteAffiliate(aff)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {aff.pendingEarningsCents > 0 && aff.iban && (
                    <Button variant="outline" size="sm" onClick={() => setPayoutModal(aff.id)}>
                      Paga
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Affiliato</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Referral</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Guadagni</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Pending</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">IBAN</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Stato</th>
                  <th className="text-right p-4 text-sm font-medium text-foreground-muted">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={7} className="p-4">
                        <div className="h-5 bg-surface-2 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : affiliates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-foreground-muted">
                      Nessun affiliato registrato
                    </td>
                  </tr>
                ) : (
                  affiliates.map((aff) => (
                    <tr key={aff.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium">{aff.nome} {aff.cognome}</p>
                        <p className="text-xs text-foreground-muted">{aff.email}</p>
                      </td>
                      <td className="p-4 text-sm">{aff.referralsCount}</td>
                      <td className="p-4 text-sm font-semibold text-success">
                        €{(aff.totalEarningsCents / 100).toFixed(2)}
                      </td>
                      <td className="p-4 text-sm font-semibold text-warning">
                        €{(aff.pendingEarningsCents / 100).toFixed(2)}
                      </td>
                      <td className="p-4 text-xs text-foreground-muted">
                        {aff.iban ? `${aff.iban.slice(0, 8)}...` : "Non configurato"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(aff.id, aff.attivo)}
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            aff.attivo
                              ? "bg-success/20 text-success hover:bg-success/30"
                              : "bg-destructive/20 text-destructive hover:bg-destructive/30"
                          }`}
                        >
                          {aff.attivo ? "Attivo" : "Inattivo"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(aff)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAffiliate(aff)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {aff.pendingEarningsCents > 0 && aff.iban && (
                            <Button variant="outline" size="sm" onClick={() => setPayoutModal(aff.id)}>
                              Paga
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payout Modal */}
      {payoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Conferma Pagamento</h3>
              <p className="text-sm text-foreground-muted">
                Inserisci il riferimento del bonifico SEPA per segnare le commissioni come pagate.
              </p>
              <div className="space-y-2">
                <Label>Riferimento Pagamento</Label>
                <Input
                  placeholder="es. SEPA-2026-03-001"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setPayoutModal(null); setPaymentRef("") }}>
                  Annulla
                </Button>
                <Button onClick={() => handlePayout(payoutModal)} loading={payoutLoading} disabled={!paymentRef.trim()}>
                  Conferma Pagamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg mx-4">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-primary" />
                  Modifica Affiliato
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setEditModal(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editForm.nome}
                    onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cognome</Label>
                  <Input
                    value={editForm.cognome}
                    onChange={(e) => setEditForm((f) => ({ ...f, cognome: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input
                  value={editForm.telefono}
                  onChange={(e) => setEditForm((f) => ({ ...f, telefono: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input
                  value={editForm.iban}
                  onChange={(e) => setEditForm((f) => ({ ...f, iban: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Intestatario IBAN</Label>
                <Input
                  value={editForm.ibanAccountHolder}
                  onChange={(e) => setEditForm((f) => ({ ...f, ibanAccountHolder: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditModal(null)}>
                  Annulla
                </Button>
                <Button onClick={saveEdit} loading={editLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Salva
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
