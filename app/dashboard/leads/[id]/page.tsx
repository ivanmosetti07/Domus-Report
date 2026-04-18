import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  User,
  Home,
  DollarSign,
  Mail,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getAuthAgency } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ContactCardClient } from "@/components/dashboard/contact-card-client"
import { ConversationView } from "@/components/dashboard/conversation-view"
import { LeadStatusWrapper } from "@/components/dashboard/lead-status-wrapper"
import { DownloadPDFButton } from "@/components/dashboard/download-pdf-button"
import type { Prisma } from "@prisma/client"

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'
import { SendEmailButton } from "@/components/dashboard/send-email-button"

interface LeadDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params

  // Get authenticated agency
  const agency = await getAuthAgency()

  if (!agency) {
    redirect("/login")
  }

  // Fetch lead with all relations
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          valuation: true,
        },
      },
      conversation: true,
      statuses: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  type LeadStatusType = Prisma.LeadStatusGetPayload<{
    select: {
      id: true
      status: true
      note: true
      createdAt: true
      createdByAgencyId: true
    }
  }>

  // Lead not found
  if (!lead) {
    notFound()
  }

  // Security check: verify lead belongs to authenticated agency
  if (lead.agenziaId !== agency.agencyId) {
    notFound()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna ai lead
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {lead.nome} {lead.cognome}
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              Lead ricevuto il {formatDate(lead.dataRichiesta)}
            </p>
          </div>
          <div className="flex gap-3">
            <DownloadPDFButton
              leadId={lead.id}
              leadName={`${lead.nome} ${lead.cognome}`}
            />
            {lead.property && (
              <SendEmailButton
                leadId={lead.id}
                defaultEmail={lead.email}
                propertyAddress={lead.property.citta}
              />
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Contact Info */}
        <ContactCardClient
          nome={lead.nome}
          cognome={lead.cognome}
          email={lead.email}
          telefono={lead.telefono}
        />

        {/* Card 2: Property Details */}
        {lead.property && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="w-5 h-5 text-primary" />
                Dettagli Immobile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                  Indirizzo Completo
                </label>
                <p className="text-sm text-foreground mt-1">
                  {lead.property.indirizzo}
                  <br />
                  {lead.property.quartiere && (
                    <>
                      {lead.property.quartiere}
                      <br />
                    </>
                  )}
                  {lead.property.cap && `${lead.property.cap} `}
                  {lead.property.citta}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                    Tipo
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline">{lead.property.tipo}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                    Superficie
                  </label>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {lead.property.superficieMq} m²
                  </p>
                </div>
              </div>

              {(lead.property.locali || lead.property.bagni) && (
                <div className="grid grid-cols-2 gap-4">
                  {lead.property.locali && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                        Camere
                      </label>
                      <p className="text-sm text-foreground mt-1">
                        {lead.property.locali} {lead.property.locali === 1 ? 'camera' : 'camere'}
                      </p>
                    </div>
                  )}

                  {lead.property.bagni && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                        Bagni
                      </label>
                      <p className="text-sm text-foreground mt-1">
                        {lead.property.bagni} {lead.property.bagni === 1 ? 'bagno' : 'bagni'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(lead.property.piano !== null && lead.property.piano !== undefined) || lead.property.tipoPiano ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                      Piano {lead.property.ascensore !== null && '& Ascensore'}
                    </label>
                    {lead.property.tipoPiano ? (
                      <div className="mt-1">
                        <Badge variant="outline">{lead.property.tipoPiano}</Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground mt-1">
                        {lead.property.piano}° piano
                        {lead.property.ascensore !== null && (
                          <Badge
                            variant={lead.property.ascensore ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {lead.property.ascensore ? "Con ascensore" : "Senza ascensore"}
                          </Badge>
                        )}
                      </p>
                    )}
                  </div>

                  {lead.property.spaziEsterni && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                        Spazi Esterni
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline">{lead.property.spaziEsterni}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {lead.property.postoAuto !== null && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                      Box/Posto Auto
                    </label>
                    <div className="mt-1">
                      <Badge variant={lead.property.postoAuto ? "default" : "secondary"}>
                        {lead.property.postoAuto ? "Sì" : "No"}
                      </Badge>
                    </div>
                  </div>

                  {lead.property.ariaCondizionata !== null && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                        Aria Condizionata
                      </label>
                      <div className="mt-1">
                        <Badge variant={lead.property.ariaCondizionata ? "default" : "secondary"}>
                          {lead.property.ariaCondizionata ? "Sì" : "No"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                    Stato
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline">{lead.property.stato}</Badge>
                  </div>
                </div>

                {lead.property.riscaldamento && (
                  <div>
                    <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                      Riscaldamento
                    </label>
                    <div className="mt-1">
                      <Badge variant="outline">{lead.property.riscaldamento}</Badge>
                    </div>
                  </div>
                )}
              </div>

              {(lead.property.classeEnergetica || lead.property.annoCostruzione) && (
                <div className="grid grid-cols-2 gap-4">
                  {lead.property.classeEnergetica && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                        Classe Energetica
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline">{lead.property.classeEnergetica}</Badge>
                      </div>
                    </div>
                  )}

                  {lead.property.annoCostruzione && (
                    <div>
                      <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                        Anno Costruzione
                      </label>
                      <p className="text-sm text-foreground mt-1">
                        {lead.property.annoCostruzione}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(lead.property.statoOccupazione || lead.property.dataScadenza) && (
                <div>
                  <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                    Disponibilità
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={lead.property.statoOccupazione === 'Libero' ? "default" : "secondary"}>
                      {lead.property.statoOccupazione}
                    </Badge>
                    {lead.property.dataScadenza && (
                      <span className="text-xs text-foreground-muted">
                        (Scadenza: {lead.property.dataScadenza})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Card 3: Valuation */}
        {lead.property?.valuation && (() => {
          const v = lead.property.valuation
          const warnings = (v.warnings as Array<{ code: string; message: string; severity: string }> | null) || []
          const relevantWarnings = warnings.filter((w) => w.severity !== "info")
          const cmp = (v.comparablesData as any) || null
          const hasComparables = cmp && cmp.sampleSize >= 2 && cmp.medianPricePerSqm
          const confVariant =
            v.confidence === "alta" ? "success" : v.confidence === "bassa" ? "warning" : "default"
          const zoneLabel =
            v.omiZoneMatch === "cap"
              ? "Zona da CAP"
              : v.omiZoneMatch === "city_average"
                ? "Media città"
                : v.omiZoneMatch === "cap_global"
                  ? "CAP nazionale"
                  : v.omiZoneMatch === "not_found"
                    ? "Zona non trovata"
                    : null
          const agreementClass =
            cmp?.crossCheck?.agreement === "strong"
              ? "text-green-600"
              : cmp?.crossCheck?.agreement === "medium"
                ? "text-yellow-600"
                : "text-red-600"

          return (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                Valutazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                  Range di Valore
                </label>
                <p className="text-sm text-foreground-muted mt-1">
                  {formatCurrency(v.prezzoMinimo)} - {formatCurrency(v.prezzoMassimo)}
                </p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                  Prezzo Stimato
                </label>
                <p className="text-3xl font-bold text-primary mt-2">
                  {formatCurrency(v.prezzoStimato)}
                </p>
                {v.pricePerSqm && (
                  <p className="text-xs text-foreground-muted mt-1">
                    {new Intl.NumberFormat("it-IT").format(v.pricePerSqm)} €/m²
                  </p>
                )}
              </div>

              {(v.confidence || zoneLabel || v.dataCompleteness !== null) && (
                <div className="flex flex-wrap gap-2">
                  {v.confidence && (
                    <Badge variant={confVariant as any}>
                      Affidabilità {v.confidence}
                      {v.confidenceScore !== null && v.confidenceScore !== undefined
                        ? ` · ${v.confidenceScore}`
                        : ""}
                    </Badge>
                  )}
                  {zoneLabel && <Badge variant="outline">{zoneLabel}</Badge>}
                  {v.dataCompleteness !== null &&
                    v.dataCompleteness !== undefined &&
                    v.dataCompleteness < 70 && (
                      <Badge variant="outline">Dati: {v.dataCompleteness}%</Badge>
                    )}
                </div>
              )}

              {hasComparables && (
                <div className="p-3 bg-surface-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Riscontro mercato reale
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {new Intl.NumberFormat("it-IT").format(Math.round(cmp.medianPricePerSqm))} €/m²
                    <span className="text-foreground-muted font-normal">
                      {" "}
                      (mediana su {cmp.sampleSize} annunci)
                    </span>
                  </p>
                  {cmp.crossCheck?.deltaPct !== undefined && (
                    <p className={`text-xs mt-1 ${agreementClass}`}>
                      Scostamento OMI: {cmp.crossCheck.deltaPct > 0 ? "+" : ""}
                      {cmp.crossCheck.deltaPct}% · {cmp.crossCheck.agreement}
                    </p>
                  )}
                </div>
              )}

              {relevantWarnings.length > 0 && (
                <div className="space-y-2">
                  {relevantWarnings.map((w, i) => (
                    <Alert
                      key={`${w.code}-${i}`}
                      variant={w.severity === "error" || w.severity === "critical" ? "destructive" : "warning"}
                      className="py-2 px-3"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-xs">{w.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">Valore OMI base:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(v.valoreOmiBase)}/m²
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">Coeff. piano:</span>
                  <span className="font-medium text-foreground">
                    {(v.coefficientePiano * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">Coeff. stato:</span>
                  <span className="font-medium text-foreground">
                    {(v.coefficienteStato * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-foreground-muted">
                  {v.spiegazione}
                </p>
              </div>
            </CardContent>
          </Card>
          )
        })()}
      </div>

      {/* Status Manager Section */}
      <div className="mb-8">
        <LeadStatusWrapper
          leadId={lead.id}
          currentStatus={lead.statuses?.[0]?.status || 'NEW'}
          statuses={lead.statuses.map((s: LeadStatusType) => ({
            id: s.id,
            status: s.status,
            note: s.note,
            createdAt: s.createdAt.toISOString(),
            createdByAgencyId: s.createdByAgencyId,
          }))}
        />
      </div>

      {/* Conversation Section */}
      {lead.conversation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Conversazione Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConversationView messages={lead.conversation.messaggi as any[]} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
