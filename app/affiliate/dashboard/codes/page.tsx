"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Link2, Copy, Check, Plus } from "lucide-react"
import { generateReferralUrl } from "@/lib/referral"

interface ReferralCode {
  id: string
  code: string
  label: string | null
  isActive: boolean
  clicks: number
  referralsCount: number
  createdAt: string
}

export default function AffiliateCodesPage() {
  const [codes, setCodes] = React.useState<ReferralCode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [creating, setCreating] = React.useState(false)
  const [newLabel, setNewLabel] = React.useState("")
  const [copied, setCopied] = React.useState<string | null>(null)
  const [error, setError] = React.useState("")

  const fetchCodes = async () => {
    try {
      const token = localStorage.getItem("affiliate-token")
      const res = await fetch("/api/affiliate/referral-codes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCodes(data.codes)
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchCodes() }, [])

  const handleCreate = async () => {
    setCreating(true)
    setError("")
    try {
      const token = localStorage.getItem("affiliate-token")
      const res = await fetch("/api/affiliate/referral-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ label: newLabel || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Errore")
      } else {
        setNewLabel("")
        await fetchCodes()
      }
    } catch {
      setError("Errore di connessione")
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(generateReferralUrl(code))
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
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
        <h1 className="text-2xl md:text-3xl font-bold">Codici Referral</h1>
        <p className="text-foreground-muted mt-1">Gestisci i tuoi codici referral (max 5)</p>
      </div>

      {/* Crea nuovo */}
      {codes.length < 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crea nuovo codice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="label">Nome (opzionale)</Label>
                <Input
                  id="label"
                  placeholder="es. Campagna Facebook"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} loading={creating}>
                <Plus className="h-4 w-4 mr-2" />
                Crea
              </Button>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Lista codici */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            I tuoi codici ({codes.length}/5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-center py-8 text-foreground-muted">Nessun codice. Creane uno!</p>
          ) : (
            <div className="space-y-4">
              {codes.map((code) => (
                <div key={code.id} className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-lg">{code.code}</code>
                      {code.label && (
                        <Badge variant="secondary">{code.label}</Badge>
                      )}
                      <Badge variant={code.isActive ? "success" : "destructive"}>
                        {code.isActive ? "Attivo" : "Disattivato"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-surface-2 rounded-lg px-3 py-2 text-sm font-mono overflow-x-auto">
                      {generateReferralUrl(code.code)}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      {copied === code.code ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-foreground-muted">
                    <span>{code.clicks} click</span>
                    <span>{code.referralsCount} referral</span>
                    <span>Creato il {new Date(code.createdAt).toLocaleDateString("it-IT")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
