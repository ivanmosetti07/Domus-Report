"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

interface Campaign {
  id: string
  name: string
  description: string | null
  flowType: string
  isActive: boolean
  createdAt: string
  stepsCount: number
  totalSends: number
  pendingSends: number
  sentSends: number
  failedSends: number
}

const flowLabels: Record<string, string> = {
  demo_nurture: "Demo Nurture",
  onboarding_completion: "Onboarding",
  free_upgrade: "Free → Upgrade",
}

export default function AdminEmailCampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/admin/email-campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(data.campaigns || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-stack">
      <PageHeader
        title="Email Marketing"
        subtitle="Panoramica delle campagne automatizzate"
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Campagna</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Tipo</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Steps</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Inviati</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Pending</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Falliti</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">Stato</th>
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
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-foreground-muted">
                      Nessuna campagna configurata
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium">{c.name}</p>
                        {c.description && (
                          <p className="text-xs text-foreground-muted">{c.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          {flowLabels[c.flowType] || c.flowType}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{c.stepsCount}</td>
                      <td className="p-4 text-sm font-medium text-success">{c.sentSends}</td>
                      <td className="p-4 text-sm text-warning">{c.pendingSends}</td>
                      <td className="p-4 text-sm text-destructive">{c.failedSends}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.isActive
                              ? "bg-success/20 text-success"
                              : "bg-foreground-muted/20 text-foreground-muted"
                          }`}
                        >
                          {c.isActive ? "Attiva" : "Inattiva"}
                        </span>
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
