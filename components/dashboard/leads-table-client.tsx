"use client"

import * as React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Copy, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface LeadStatus {
  id: string
  status: string
  note: string | null
  createdAt: Date
}

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
  statuses?: LeadStatus[]
}

interface LeadsTableClientProps {
  leads: Lead[]
}

export function LeadsTableClient({ leads }: LeadsTableClientProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null)

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Helper per ottenere status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      NEW: { label: 'Nuovo', variant: 'default' as const, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      CONTACTED: { label: 'Contattato', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      INTERESTED: { label: 'Interessato', variant: 'default' as const, color: 'bg-green-100 text-green-800 border-green-200' },
      CONVERTED: { label: 'Convertito', variant: 'default' as const, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      LOST: { label: 'Perso', variant: 'destructive' as const, color: 'bg-red-100 text-red-800 border-red-200' },
    }
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
  }

  // Filtra lead in base al status
  const filteredLeads = React.useMemo(() => {
    if (!filterStatus) return leads
    return leads.filter(lead => {
      const latestStatus = lead.statuses?.[0]?.status
      return latestStatus === filterStatus
    })
  }, [leads, filterStatus])

  // Calcola count per ogni status
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      CONVERTED: 0,
      LOST: 0,
    }
    leads.forEach(lead => {
      const latestStatus = lead.statuses?.[0]?.status || 'NEW'
      if (counts[latestStatus] !== undefined) {
        counts[latestStatus]++
      }
    })
    return counts
  }, [leads])

  return (
    <>
      {/* Filtri Status */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(null)}
          >
            Tutti ({leads.length})
          </Button>
          <Button
            variant={filterStatus === 'NEW' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus('NEW')}
            className={filterStatus === 'NEW' ? 'bg-blue-600' : ''}
          >
            Nuovo ({statusCounts.NEW})
          </Button>
          <Button
            variant={filterStatus === 'CONTACTED' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus('CONTACTED')}
            className={filterStatus === 'CONTACTED' ? 'bg-yellow-600' : ''}
          >
            Contattato ({statusCounts.CONTACTED})
          </Button>
          <Button
            variant={filterStatus === 'INTERESTED' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus('INTERESTED')}
            className={filterStatus === 'INTERESTED' ? 'bg-green-600' : ''}
          >
            Interessato ({statusCounts.INTERESTED})
          </Button>
          <Button
            variant={filterStatus === 'CONVERTED' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus('CONVERTED')}
            className={filterStatus === 'CONVERTED' ? 'bg-emerald-600' : ''}
          >
            Convertito ({statusCounts.CONVERTED})
          </Button>
          <Button
            variant={filterStatus === 'LOST' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus('LOST')}
            className={filterStatus === 'LOST' ? 'bg-red-600' : ''}
          >
            Perso ({statusCounts.LOST})
          </Button>
        </div>
      </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => {
                  const latestStatus = lead.statuses?.[0]?.status || 'NEW'
                  const statusInfo = getStatusBadge(latestStatus)
                  return (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusInfo.color + ' border'}>
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          Dettagli
                        </Button>
                      </Link>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredLeads.map((lead) => {
          const latestStatus = lead.statuses?.[0]?.status || 'NEW'
          const statusInfo = getStatusBadge(latestStatus)
          return (
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(lead.dataRichiesta)}
                  </span>
                  <Badge className={statusInfo.color + ' border text-xs'}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <Link href={`/dashboard/leads/${lead.id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Dettagli
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
          )
        })}
      </div>
    </>
  )
}
