"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Wallet, Check, AlertCircle, Info } from "lucide-react"

interface PaymentStatus {
  ibanConfigured: boolean
  iban: string | null
  ibanAccountHolder: string | null
  pendingBalanceCents: number
}

export default function AffiliatePaymentsPage() {
  const [status, setStatus] = React.useState<PaymentStatus | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState("")
  const [formData, setFormData] = React.useState({
    iban: "",
    ibanAccountHolder: "",
  })

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("affiliate-token")
        const res = await fetch("/api/affiliate/connect/status", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setStatus(data)
          if (data.ibanAccountHolder) {
            setFormData((prev) => ({ ...prev, ibanAccountHolder: data.ibanAccountHolder }))
          }
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const token = localStorage.getItem("affiliate-token")
      const res = await fetch("/api/affiliate/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Errore nel salvataggio")
      } else {
        setSaved(true)
        // Aggiorna lo stato
        const statusRes = await fetch("/api/affiliate/connect/status", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (statusRes.ok) {
          setStatus(await statusRes.json())
        }
        setFormData({ iban: "", ibanAccountHolder: "" })
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError("Errore di connessione")
    } finally {
      setSaving(false)
    }
  }

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
        <h1 className="text-2xl md:text-3xl font-bold">Pagamenti</h1>
        <p className="text-foreground-muted mt-1">Configura il tuo IBAN per ricevere le commissioni</p>
      </div>

      {/* Stato attuale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Stato Pagamenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>IBAN configurato</span>
              <Badge variant={status?.ibanConfigured ? "success" : "destructive"}>
                {status?.ibanConfigured ? "Si" : "No"}
              </Badge>
            </div>

            {status?.ibanConfigured && (
              <>
                <div className="flex items-center justify-between">
                  <span>IBAN</span>
                  <span className="font-mono text-sm">{status.iban}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Intestatario</span>
                  <span className="text-sm">{status.ibanAccountHolder}</span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="font-medium">Saldo in attesa</span>
              <span className="text-xl font-bold">
                {((status?.pendingBalanceCents || 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form IBAN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {status?.ibanConfigured ? "Aggiorna IBAN" : "Inserisci IBAN"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => setFormData((prev) => ({ ...prev, iban: e.target.value }))}
                placeholder="IT60X0542811101000000123456"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ibanAccountHolder">Intestatario conto</Label>
              <Input
                id="ibanAccountHolder"
                value={formData.ibanAccountHolder}
                onChange={(e) => setFormData((prev) => ({ ...prev, ibanAccountHolder: e.target.value }))}
                placeholder="Mario Rossi"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button onClick={handleSave} loading={saving} disabled={!formData.iban || !formData.ibanAccountHolder}>
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvato!
                </>
              ) : (
                "Salva IBAN"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="bg-surface-2 border-border">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Come funzionano i pagamenti?</h4>
              <p className="text-sm text-foreground-muted">
                Ogni volta che un&apos;agenzia referita effettua un pagamento, ti viene accreditata
                una commissione del 10%. Quando il saldo accumulato supera 50&euro;, riceverai
                un bonifico SEPA sul conto indicato.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
