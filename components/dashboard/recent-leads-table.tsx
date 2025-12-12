import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, User, Mail, Home, Calendar, TrendingUp } from "lucide-react"

interface RecentLead {
  id: string
  nome: string
  cognome: string
  email: string
  dataRichiesta: Date
  property: {
    valuation: {
      prezzoStimato: number
    } | null
  } | null
  statuses: Array<{
    status: string
  }>
}

interface RecentLeadsTableProps {
  leads: RecentLead[]
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  'NEW': { label: 'Nuovo', variant: 'default' },
  'CONTACTED': { label: 'Contattato', variant: 'secondary' },
  'INTERESTED': { label: 'Interessato', variant: 'success' },
  'CONVERTED': { label: 'Convertito', variant: 'success' },
  'LOST': { label: 'Perso', variant: 'destructive' }
}

export function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Lead Recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 bg-surface-2 rounded-full mx-auto mb-4">
              <User className="w-8 h-8 text-foreground-subtle" />
            </div>
            <p className="text-sm text-foreground-muted">
              Nessun lead ancora. I nuovi lead appariranno qui.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Lead Recenti
          </CardTitle>
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="sm">
              Vedi tutti
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leads.map((lead) => {
            const currentStatus = lead.statuses[0]?.status || 'NEW'
            const statusInfo = STATUS_LABELS[currentStatus] || STATUS_LABELS['NEW']
            const estimatedValue = lead.property?.valuation?.prezzoStimato

            return (
              <Link
                key={lead.id}
                href={`/dashboard/leads/${lead.id}`}
                className="block"
              >
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border border-border bg-surface hover:border-primary hover:shadow-soft-lg hover:bg-surface-2 transition-all duration-180 cursor-pointer">
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                        {lead.nome} {lead.cognome}
                      </h4>
                      <Badge variant={statusInfo.variant} className="text-[10px] sm:text-xs flex-shrink-0 px-1.5 sm:px-2.5">
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] sm:text-xs text-foreground-muted mb-1 sm:mb-2">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.dataRichiesta).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>

                    {estimatedValue && (
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-success">
                        <TrendingUp className="w-3 h-3" />
                        Stima: €{estimatedValue.toLocaleString('it-IT')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {leads.length >= 5 && (
          <div className="mt-4 pt-3 border-t">
            <Link href="/dashboard/leads">
              <Button variant="outline" className="w-full">
                Vedi tutti i lead
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
