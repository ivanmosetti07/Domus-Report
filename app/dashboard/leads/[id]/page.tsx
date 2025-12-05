import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  User,
  Home,
  DollarSign,
  Mail,
  MessageSquare,
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getAuthAgency } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ContactCardClient } from "@/components/dashboard/contact-card-client"
import { ConversationView } from "@/components/dashboard/conversation-view"
import { LeadStatusWrapper } from "@/components/dashboard/lead-status-wrapper"
import { DownloadPDFButton } from "@/components/dashboard/download-pdf-button"

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
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna ai lead
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lead.nome} {lead.cognome}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
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
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Indirizzo Completo
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {lead.property.indirizzo}
                  <br />
                  {lead.property.cap && `${lead.property.cap} `}
                  {lead.property.citta}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tipo
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline">{lead.property.tipo}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Superficie
                  </label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {lead.property.superficieMq} m²
                  </p>
                </div>
              </div>

              {lead.property.piano !== null && lead.property.piano !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Piano
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {lead.property.piano}° piano
                    </p>
                  </div>

                  {lead.property.ascensore !== null && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Ascensore
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={lead.property.ascensore ? "default" : "secondary"}
                        >
                          {lead.property.ascensore ? "Sì" : "No"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Stato
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{lead.property.stato}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 3: Valuation */}
        {lead.property?.valuation && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                Valutazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Range di Valore
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {formatCurrency(lead.property.valuation.prezzoMinimo)} -{" "}
                  {formatCurrency(lead.property.valuation.prezzoMassimo)}
                </p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Prezzo Stimato
                </label>
                <p className="text-3xl font-bold text-primary mt-2">
                  {formatCurrency(lead.property.valuation.prezzoStimato)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Valore OMI base:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(lead.property.valuation.valoreOmiBase)}/m²
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Coeff. piano:</span>
                  <span className="font-medium text-gray-900">
                    {(lead.property.valuation.coefficientePiano * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Coeff. stato:</span>
                  <span className="font-medium text-gray-900">
                    {(lead.property.valuation.coefficienteStato * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  {lead.property.valuation.spiegazione}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Manager Section */}
      <div className="mb-8">
        <LeadStatusWrapper
          leadId={lead.id}
          currentStatus={lead.statuses?.[0]?.status || 'NEW'}
          statuses={lead.statuses.map(s => ({
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
