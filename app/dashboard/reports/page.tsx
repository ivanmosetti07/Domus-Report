import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { FileText, TrendingUp, Users, Calendar } from 'lucide-react'
import { getAuthAgency } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { GenerateReportButton } from '@/components/dashboard/generate-report-button'

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  // Get authenticated agency
  const agency = await getAuthAgency()

  if (!agency) {
    redirect('/login')
  }

  // Fetch agency data
  const agencyData = await prisma.agency.findUnique({
    where: { id: agency.agencyId },
  })

  // Calcola date range per report mensile corrente
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const startOfMonth = new Date(currentYear, currentMonth, 1)
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0)

  // Statistiche rapide
  const totalLeads = await prisma.lead.count({
    where: { agenziaId: agency.agencyId },
  })

  const leadsThisMonth = await prisma.lead.count({
    where: {
      agenziaId: agency.agencyId,
      dataRichiesta: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const convertedLeads = await prisma.lead.count({
    where: {
      agenziaId: agency.agencyId,
      statuses: {
        some: {
          status: 'CONVERTED',
        },
      },
    },
  })

  const leadsToFollow = await prisma.lead.count({
    where: {
      agenziaId: agency.agencyId,
      statuses: {
        some: {
          status: 'INTERESTED',
        },
      },
    },
  })

  // Definizione report predefiniti
  const predefinedReports = [
    {
      id: 'monthly-performance',
      title: 'Performance Mensile',
      description: `Analisi completa del mese di ${now.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}`,
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      stats: [
        { label: 'Lead generati', value: leadsThisMonth },
        { label: 'Totale lead', value: totalLeads },
      ],
      type: 'monthly' as const,
    },
    {
      id: 'converted-leads',
      title: 'Lead Convertiti',
      description: 'Report di tutti i lead che hanno completato il processo di conversione',
      icon: <Users className="w-8 h-8 text-success" />,
      stats: [
        { label: 'Lead convertiti', value: convertedLeads },
        { label: 'Tasso conversione', value: totalLeads > 0 ? `${Math.round((convertedLeads / totalLeads) * 100)}%` : '0%' },
      ],
      type: 'converted' as const,
    },
    {
      id: 'leads-follow-up',
      title: 'Lead da Ricontattare',
      description: 'Lead interessati che necessitano di follow-up',
      icon: <Calendar className="w-8 h-8 text-warning" />,
      stats: [
        { label: 'Lead interessati', value: leadsToFollow },
        { label: 'Priorità alta', value: Math.floor(leadsToFollow * 0.3) },
      ],
      type: 'followup' as const,
    },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-lg)'
    }}>
      <PageHeader
        title="Report e Analisi"
        subtitle="Genera report personalizzati sulle performance della tua agenzia"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 'var(--grid-gap-md)' }}>
        <Card>
          <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
            <div className="text-center">
              <div className="font-bold text-foreground" style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.875rem)'
              }}>{totalLeads}</div>
              <div className="text-foreground-muted" style={{
                marginTop: 'var(--space-1)',
                fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
              }}>Totale Lead</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
            <div className="text-center">
              <div className="font-bold text-primary" style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.875rem)'
              }}>{leadsThisMonth}</div>
              <div className="text-foreground-muted" style={{
                marginTop: 'var(--space-1)',
                fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
              }}>Questo Mese</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
            <div className="text-center">
              <div className="font-bold text-success" style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.875rem)'
              }}>{convertedLeads}</div>
              <div className="text-foreground-muted" style={{
                marginTop: 'var(--space-1)',
                fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
              }}>Convertiti</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
            <div className="text-center">
              <div className="font-bold text-warning" style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.875rem)'
              }}>{leadsToFollow}</div>
              <div className="text-foreground-muted" style={{
                marginTop: 'var(--space-1)',
                fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
              }}>Da Ricontattare</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--grid-gap-md)' }}>
        {predefinedReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center text-xl" style={{ gap: 'var(--space-3)' }}>
                    {report.icon}
                    {report.title}
                  </CardTitle>
                  <CardDescription style={{ marginTop: 'var(--space-2)' }}>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Stats */}
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                  {report.stats.map((stat, index) => (
                    <div key={index} className="bg-surface rounded-lg" style={{ padding: 'var(--space-3)' }}>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-foreground-muted" style={{ marginTop: 'var(--space-1)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <GenerateReportButton
                  agencyId={agency.agencyId}
                  agencyName={agencyData?.nome || 'Agenzia'}
                  reportType={report.type}
                  reportTitle={report.title}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
          <div className="flex items-start" style={{ gap: 'var(--space-md)' }}>
            <FileText style={{
              width: 'clamp(1.25rem, 2.5vw, 1.5rem)',
              height: 'clamp(1.25rem, 2.5vw, 1.5rem)',
              marginTop: 'clamp(0.125rem, 0.5vw, 0.25rem)'
            }} className="text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground" style={{
                marginBottom: 'var(--space-2)',
                fontSize: 'clamp(0.875rem, 1vw, 1rem)'
              }}>Come funzionano i report</h3>
              <p className="text-foreground-muted" style={{
                fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)'
              }}>
                I report vengono generati in formato PDF e includono grafici, tabelle e statistiche dettagliate.
                Puoi scaricare i report o riceverli via email. I dati vengono aggiornati in tempo reale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
