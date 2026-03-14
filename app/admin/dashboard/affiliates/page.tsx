"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"

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
  const [payoutSuccess, setPayoutSuccess] = React.useState<string | null>(null)

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
        setPayoutSuccess(`Pagati ${data.paidCount} commissioni (€${(data.totalCents / 100).toFixed(2)})`)
        setPaymentRef("")
        setPayoutModal(null)
        fetchAffiliates()
        setTimeout(() => setPayoutSuccess(null), 5000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPayoutLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestione Affiliati"
        subtitle={`${affiliates.length} affiliati registrati`}
      />

      {payoutSuccess && (
        <div className="rounded-xl border border-success/40 bg-success/10 p-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <p className="text-sm text-success">{payoutSuccess}</p>
        </div>
      )}

      <Card>
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
                        {aff.pendingEarningsCents > 0 && aff.iban && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPayoutModal(aff.id)}
                          >
                            Paga
                          </Button>
                        )}
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
    </div>
  )
}
