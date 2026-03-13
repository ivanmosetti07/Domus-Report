"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface Referral {
  id: string
  agencyName: string
  agencyEmail: string
  agencyPlan: string
  referralCode: string
  status: string
  convertedAt: string | null
  createdAt: string
  commissionsCount: number
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "destructive" }> = {
  registered: { label: "Registrata", variant: "default" },
  subscribed: { label: "Abbonata", variant: "success" },
  churned: { label: "Cancellata", variant: "destructive" },
}

export default function AffiliateReferralsPage() {
  const [referrals, setReferrals] = React.useState<Referral[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("affiliate-token")
        const res = await fetch("/api/affiliate/referrals", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setReferrals(data.referrals)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
        <h1 className="text-2xl md:text-3xl font-bold">Referral</h1>
        <p className="text-foreground-muted mt-1">Agenzie registrate tramite i tuoi link</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {referrals.length} referral totali
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-foreground-muted mb-3" />
              <p className="text-foreground-muted">Nessun referral ancora. Condividi il tuo link!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((r) => {
                const statusInfo = STATUS_MAP[r.status] || STATUS_MAP.registered
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-all"
                  >
                    <div>
                      <p className="font-medium">{r.agencyName}</p>
                      <p className="text-sm text-foreground-muted">{r.agencyEmail}</p>
                      <p className="text-xs text-foreground-muted mt-1">
                        Registrata il {new Date(r.createdAt).toLocaleDateString("it-IT")} &middot; Codice: {r.referralCode}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <p className="text-xs text-foreground-muted">
                        Piano: {r.agencyPlan.toUpperCase()}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {r.commissionsCount} commissioni
                      </p>
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
