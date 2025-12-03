"use client"

import * as React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Copy, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Lead {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string | null
  dataRichiesta: Date
  property: {
    indirizzo: string
    citta: string
    tipo: string
  } | null
}

interface LeadsTableClientProps {
  leads: Lead[]
}

export function LeadsTableClient({ leads }: LeadsTableClientProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indirizzo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {lead.nome} {lead.cognome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{lead.email}</span>
                        <button
                          onClick={() => handleCopy(lead.email, `email-${lead.id}`)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedId === `email-${lead.id}` ? (
                            <span className="text-xs text-green-600">✓</span>
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.telefono ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${lead.telefono}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {lead.telefono}
                          </a>
                          <a
                            href={`tel:${lead.telefono}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/D</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {lead.property
                          ? `${lead.property.indirizzo}, ${lead.property.citta}`
                          : "N/D"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {formatDate(lead.dataRichiesta)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          Dettagli
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lead.nome} {lead.cognome}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {lead.property
                      ? `${lead.property.indirizzo}, ${lead.property.citta}`
                      : "Indirizzo non disponibile"}
                  </p>
                </div>
                {lead.property && (
                  <Badge variant="outline" className="text-xs">
                    {lead.property.tipo}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-primary hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
                {lead.telefono && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${lead.telefono}`}
                      className="text-primary hover:underline"
                    >
                      {lead.telefono}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {formatDate(lead.dataRichiesta)}
                </span>
                <Link href={`/dashboard/leads/${lead.id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Dettagli
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
