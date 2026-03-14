"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, Mail, MapPin, Phone, Globe, CreditCard } from "lucide-react"

interface AgencyDetail {
  id: string
  nome: string
  email: string
  citta: string
  piano: string
  attiva: boolean
  dataCreazione: string
  telefono: string | null
  indirizzo: string | null
  sitoWeb: string | null
  partitaIva: string | null
  widgetId: string
  leadsCount: number
  widgetsCount: number
  subscription: {
    planType: string
    status: string
    billingInterval: string
    stripeSubscriptionId: string | null
    stripeCustomerId: string | null
    trialEndsAt: string | null
    nextBillingDate: string | null
    valuationsUsedThisMonth: number
    extraValuationsPurchased: number
  } | null
}

interface RecentLead {
  id: string
  nome: string
  cognome: string
  email: string
  dataRichiesta: string
  property: {
    citta: string
    tipo: string
    superficieMq: number
    valuation: { prezzoStimato: number } | null
  } | null
}

export default function AgencyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [agency, setAgency] = React.useState<AgencyDetail | null>(null)
  const [leads, setLeads] = React.useState<RecentLead[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/admin/agencies/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgency(data.agency)
        setLeads(data.recentLeads || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const toggleActive = async () => {
    if (!agency) return
    await fetch(`/api/admin/agencies/${agency.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attiva: !agency.attiva }),
    })
    setAgency((prev) => (prev ? { ...prev, attiva: !prev.attiva } : null))
  }

  if (loading) {
    return (
      <div className="page-stack">
        <div className="h-8 w-48 bg-surface-2 rounded animate-pulse" />
        <div className="h-64 bg-surface-2 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!agency) {
    return (
      <div className="page-stack">
        <PageHeader title="Agenzia non trovata" />
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Torna indietro
        </Button>
      </div>
    )
  }

  const planBadge: Record<string, string> = {
    free: "bg-foreground-muted/20 text-foreground-muted",
    basic: "bg-primary/20 text-primary",
    premium: "bg-warning/20 text-warning",
  }

  return (
    <div className="page-stack">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={agency.nome} subtitle={agency.email} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info Agenzia */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informazioni
            </CardTitle>
            <button
              onClick={toggleActive}
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                agency.attiva
                  ? "bg-success/20 text-success hover:bg-success/30"
                  : "bg-destructive/20 text-destructive hover:bg-destructive/30"
              }`}
            >
              {agency.attiva ? "Attiva" : "Inattiva"}
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-foreground-muted" />
                {agency.email}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-foreground-muted" />
                {agency.citta}
                {agency.indirizzo && ` - ${agency.indirizzo}`}
              </div>
              {agency.telefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-foreground-muted" />
                  {agency.telefono}
                </div>
              )}
              {agency.sitoWeb && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-foreground-muted" />
                  {agency.sitoWeb}
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-lg font-bold">{agency.leadsCount}</p>
                <p className="text-xs text-foreground-muted">Lead</p>
              </div>
              <div>
                <p className="text-lg font-bold">{agency.widgetsCount}</p>
                <p className="text-xs text-foreground-muted">Widget</p>
              </div>
              <div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${planBadge[agency.piano] || planBadge.free}`}>
                  {agency.piano.charAt(0).toUpperCase() + agency.piano.slice(1)}
                </span>
                <p className="text-xs text-foreground-muted mt-1">Piano</p>
              </div>
              <div>
                <p className="text-sm font-medium">{new Date(agency.dataCreazione).toLocaleDateString("it-IT")}</p>
                <p className="text-xs text-foreground-muted">Registrata</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-primary" />
              Abbonamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {agency.subscription ? (
              <>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Piano</span>
                  <span className="font-medium">{agency.subscription.planType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Stato</span>
                  <span className={`font-medium ${agency.subscription.status === "active" ? "text-success" : "text-warning"}`}>
                    {agency.subscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Fatturazione</span>
                  <span>{agency.subscription.billingInterval}</span>
                </div>
                {agency.subscription.nextBillingDate && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Prossimo rinnovo</span>
                    <span>{new Date(agency.subscription.nextBillingDate).toLocaleDateString("it-IT")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Valutazioni usate</span>
                  <span>{agency.subscription.valuationsUsedThisMonth}</span>
                </div>
                {agency.subscription.extraValuationsPurchased > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Extra acquistate</span>
                    <span>{agency.subscription.extraValuationsPurchased}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-foreground-muted">Nessun abbonamento</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}>
            Ultimi Lead ({leads.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <p className="p-4 text-sm text-foreground-muted">Nessun lead</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Nome</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Immobile</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Stima</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border">
                      <td className="p-4">
                        <p className="text-sm font-medium">{lead.nome} {lead.cognome}</p>
                        <p className="text-xs text-foreground-muted">{lead.email}</p>
                      </td>
                      <td className="p-4 text-sm">
                        {lead.property ? (
                          <>
                            {lead.property.citta} - {lead.property.tipo} ({lead.property.superficieMq}mq)
                          </>
                        ) : (
                          <span className="text-foreground-muted">N/D</span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-semibold text-primary">
                        {lead.property?.valuation
                          ? `€${lead.property.valuation.prezzoStimato.toLocaleString("it-IT")}`
                          : "N/D"}
                      </td>
                      <td className="p-4 text-sm text-foreground-muted">
                        {new Date(lead.dataRichiesta).toLocaleDateString("it-IT")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
