"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface ConnectStatus {
  connected: boolean
  onboarded: boolean
  payoutsEnabled: boolean
  dashboardUrl: string | null
}

function AffiliateConnectContent() {
  const [status, setStatus] = React.useState<ConnectStatus | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [connecting, setConnecting] = React.useState(false)
  const searchParams = useSearchParams()
  const urlStatus = searchParams.get("status")

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("affiliate-token")
        const res = await fetch("/api/affiliate/connect/status", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          setStatus(await res.json())
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const token = localStorage.getItem("affiliate-token")
      const res = await fetch("/api/affiliate/connect", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error:", error)
      setConnecting(false)
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
        <h1 className="text-2xl md:text-3xl font-bold">Stripe Connect</h1>
        <p className="text-foreground-muted mt-1">Gestisci il tuo account per ricevere i pagamenti</p>
      </div>

      {/* Status messages */}
      {urlStatus === "success" && (
        <Card className="border-success bg-success/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <p className="font-medium">Account Stripe Connect configurato con successo!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {urlStatus === "incomplete" && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="font-medium">Configurazione non completa. Riprova per completare la verifica.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stato Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Collegamento</span>
              <Badge variant={status?.connected ? "success" : "destructive"}>
                {status?.connected ? "Collegato" : "Non collegato"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Verifica identita</span>
              <Badge variant={status?.onboarded ? "success" : "warning"}>
                {status?.onboarded ? "Completata" : "Incompleta"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Payout abilitati</span>
              <Badge variant={status?.payoutsEnabled ? "success" : "destructive"}>
                {status?.payoutsEnabled ? "Si" : "No"}
              </Badge>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {!status?.connected || !status?.onboarded ? (
              <Button onClick={handleConnect} loading={connecting} className="w-full">
                {status?.connected ? "Completa Verifica" : "Collega Stripe Connect"}
              </Button>
            ) : null}

            {status?.dashboardUrl && (
              <a href={status.dashboardUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apri Dashboard Stripe
                </Button>
              </a>
            )}
          </div>

          <div className="mt-6 p-4 bg-surface-2 rounded-xl">
            <h4 className="font-medium text-sm mb-2">Come funzionano i payout?</h4>
            <p className="text-sm text-foreground-muted">
              Ogni volta che un&apos;agenzia referita effettua un pagamento mensile,
              il 10% viene automaticamente trasferito al tuo account Stripe.
              I payout dal tuo account Stripe al conto bancario avvengono automaticamente
              secondo la schedule configurata (di default giornaliera).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AffiliateConnectPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <AffiliateConnectContent />
    </React.Suspense>
  )
}
