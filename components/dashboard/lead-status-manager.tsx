"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Clock, UserCheck, TrendingUp, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LeadStatus {
  id: string
  status: string
  note: string | null
  createdAt: string
  createdByAgencyId: string
}

interface LeadStatusManagerProps {
  leadId: string
  currentStatus: string
  statuses: LeadStatus[]
  onStatusUpdate?: () => void
}

const STATUS_CONFIG = {
  NEW: {
    label: 'Nuovo',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Lead appena acquisito'
  },
  CONTACTED: {
    label: 'Contattato',
    icon: UserCheck,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Cliente contattato'
  },
  INTERESTED: {
    label: 'Interessato',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Cliente interessato'
  },
  CONVERTED: {
    label: 'Convertito',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Lead convertito in cliente'
  },
  LOST: {
    label: 'Perso',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Lead perso'
  },
}

export function LeadStatusManager({
  leadId,
  currentStatus,
  statuses,
  onStatusUpdate
}: LeadStatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = React.useState(currentStatus)
  const [note, setNote] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus && !note.trim()) {
      toast({
        title: "Nessuna modifica",
        description: "Seleziona un nuovo status o aggiungi una nota",
        variant: "destructive",
      })
      return
    }

    // Conferma per status critici
    if ((selectedStatus === 'CONVERTED' || selectedStatus === 'LOST') && selectedStatus !== currentStatus) {
      if (!confirm(`Sei sicuro di voler impostare lo status a "${STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG].label}"? Questa azione segna il lead come concluso.`)) {
        return
      }
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/lead-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId,
          status: selectedStatus,
          note: note.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'aggiornamento')
      }

      toast({
        title: "Status aggiornato",
        description: `Lead impostato come "${STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG].label}"`,
      })

      setNote("")
      if (onStatusUpdate) {
        onStatusUpdate()
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiornare lo status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickStatus = async (status: string) => {
    if (status === currentStatus) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/lead-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId,
          status,
          note: null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'aggiornamento')
      }

      toast({
        title: "Status aggiornato",
        description: `Lead impostato come "${STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}"`,
      })

      setSelectedStatus(status)
      if (onStatusUpdate) {
        onStatusUpdate()
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiornare lo status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Ora"
    if (diffMins < 60) return `${diffMins} minuti fa`
    if (diffHours < 24) return `${diffHours} ore fa`
    if (diffDays === 1) return "Ieri"
    if (diffDays < 7) return `${diffDays} giorni fa`
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Gestione Status</h3>

      {/* Quick Status Buttons */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-2 block">Azioni Rapide</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon
            const isActive = key === currentStatus
            return (
              <Button
                key={key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                disabled={isActive || isLoading}
                onClick={() => handleQuickStatus(key)}
                className={isActive ? config.color.replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-') : ''}
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Form cambio status */}
      <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <Label htmlFor="status-select">Cambia Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger id="status-select" className="mt-1">
              <SelectValue placeholder="Seleziona status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status-note">Nota (opzionale)</Label>
          <Textarea
            id="status-note"
            placeholder="Aggiungi una nota su questo cambio di status..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleStatusChange}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Aggiornamento..." : "Aggiorna Status"}
        </Button>
      </div>

      {/* Timeline attività */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Timeline Attività</Label>
        {statuses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nessuno storico disponibile
          </p>
        ) : (
          <div className="space-y-4">
            {statuses.map((status, index) => {
              const config = STATUS_CONFIG[status.status as keyof typeof STATUS_CONFIG]
              const Icon = config?.icon || Clock
              const isLast = index === statuses.length - 1

              return (
                <div key={status.id} className="flex gap-3">
                  {/* Linea verticale e icona */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config?.color || 'bg-gray-100'} border-2`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                  </div>

                  {/* Contenuto */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className={config?.color + ' border mb-1'}>
                          {config?.label || status.status}
                        </Badge>
                        {status.note && (
                          <p className="text-sm text-gray-700 mt-2">{status.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(status.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
