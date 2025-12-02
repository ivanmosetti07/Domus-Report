"use client"

import * as React from "react"
import { use } from "react"
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
  Phone,
  Copy,
  MessageSquare
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { mockLeads } from "@/lib/mock-data"
import { Lead, PropertyCondition } from "@/types"

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  // TODO: Fetch from API
  const lead = mockLeads.find((l) => l.id === resolvedParams.id)
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Lead non trovato</h2>
        <Link href="/dashboard/leads">
          <Button className="mt-4">Torna ai lead</Button>
        </Link>
      </div>
    )
  }

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getConditionBadgeVariant = (condition: PropertyCondition) => {
    switch (condition) {
      case PropertyCondition.NEW:
        return "success"
      case PropertyCondition.EXCELLENT:
        return "default"
      case PropertyCondition.GOOD:
        return "secondary"
      case PropertyCondition.TO_RENOVATE:
        return "warning"
      default:
        return "outline"
    }
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
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Lead ricevuto il {formatDate(lead.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Informazioni Contatto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Nome Completo
              </label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {lead.firstName} {lead.lastName}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email
              </label>
              <div className="flex items-center gap-2 mt-1">
                <a
                  href={`mailto:${lead.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {lead.email}
                </a>
                <button
                  onClick={() => handleCopy(lead.email, "email")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copiedField === "email" ? (
                    <span className="text-xs text-green-600">✓</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {lead.phone && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Telefono
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {lead.phone}
                  </a>
                  <button
                    onClick={() => handleCopy(lead.phone!, "phone")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedField === "phone" ? (
                      <span className="text-xs text-green-600">✓</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <Button className="w-full" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Invia Email
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Property Details */}
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
                {lead.property.address}
                <br />
                {lead.property.postalCode} {lead.property.city}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tipo
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{lead.property.type}</Badge>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Superficie
                </label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {lead.property.surfaceSqm} m²
                </p>
              </div>
            </div>

            {lead.property.floor !== undefined && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Piano
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {lead.property.floor}° piano
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Ascensore
                  </label>
                  <div className="mt-1">
                    <Badge variant={lead.property.hasElevator ? "success" : "secondary"}>
                      {lead.property.hasElevator ? "Sì" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Stato
              </label>
              <div className="mt-1">
                <Badge variant={getConditionBadgeVariant(lead.property.condition)}>
                  {lead.property.condition}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Valuation */}
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
                {formatCurrency(lead.valuation.minPrice)} -{" "}
                {formatCurrency(lead.valuation.maxPrice)}
              </p>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Prezzo Stimato
              </label>
              <p className="text-3xl font-bold text-primary mt-2">
                {formatCurrency(lead.valuation.estimatedPrice)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Valore OMI base:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(lead.valuation.omiBaseValue)}/m²
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Coeff. piano:</span>
                <span className="font-medium text-gray-900">
                  {(lead.valuation.floorCoefficient * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Coeff. stato:</span>
                <span className="font-medium text-gray-900">
                  {(lead.valuation.conditionCoefficient * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Badge variant="success" className="w-full justify-center py-1">
                ✓ Stima Affidabile
              </Badge>
              <p className="text-xs text-gray-500 text-center mt-2">
                Basato su dati OMI zona {lead.property.city}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Conversazione Completa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto pr-4 space-y-4">
            {lead.conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === "bot"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-blue-100 text-gray-900"
                  } rounded-lg p-3`}
                >
                  {message.role === "bot" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white">🤖</span>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Bot
                      </span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.quickReplies && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {message.quickReplies.map((reply, idx) => (
                        <div
                          key={idx}
                          className="text-xs px-2 py-1 border border-gray-300 rounded text-center bg-white text-gray-700"
                        >
                          {reply.label}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {lead.conversation.messages.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nessun messaggio nella conversazione
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
