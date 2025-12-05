import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, FileCheck, Target, Code, BookOpen, Eye } from "lucide-react"
import { getAuthAgency } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WidgetCodeCard } from "@/components/dashboard/widget-code-card"

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Get authenticated agency
  const agency = await getAuthAgency()

  if (!agency) {
    return null // Middleware should prevent this
  }

  // Fetch stats from database
  const [totalLeads, leadsLast7Days, totalValuations] = await Promise.all([
    // Total leads count
    prisma.lead.count({
      where: { agenziaId: agency.agencyId },
    }),

    // Leads in last 7 days
    prisma.lead.count({
      where: {
        agenziaId: agency.agencyId,
        dataRichiesta: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Total valuations (count properties with valuations)
    prisma.valuation.count({
      where: {
        property: {
          lead: {
            agenziaId: agency.agencyId,
          },
        },
      },
    }),
  ])

  const stats = {
    totalLeads,
    leadsLast7Days,
    totalValuations,
    conversionRate: "N/A", // Feature futura
  }

  return (
    <div>
      <PageHeader
        title={`Benvenuto, ${agency.nome}!`}
        subtitle="Ecco una panoramica della tua agenzia"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Lead Totali"
          value={stats.totalLeads}
          icon={<Users className="w-6 h-6 text-primary" />}
        />
        <StatCard
          label="Lead Ultimi 7 Giorni"
          value={stats.leadsLast7Days}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          label="Valutazioni Generate"
          value={stats.totalValuations}
          icon={<FileCheck className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          label="Tasso Conversione"
          value={stats.conversionRate}
          icon={<Target className="w-6 h-6 text-purple-600" />}
        />
      </div>

      {/* Widget Code */}
      <div className="mb-8">
        <WidgetCodeCard widgetId={agency.widgetId} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Azioni Rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/leads">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Vedi tutti i lead</h3>
                  <p className="text-sm text-gray-600">
                    Gestisci e visualizza tutti i tuoi lead
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/docs/html" target="_blank">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-dashed border-gray-300">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Guida installazione</h3>
                  <p className="text-sm text-gray-600">
                    Consulta le istruzioni di integrazione
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Empty State Hint (shown when no leads) */}
      {stats.totalLeads === 0 && (
        <div className="mt-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full flex-shrink-0">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Primi passi con DomusReport
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
                        1
                      </span>
                      Copia il codice del widget qui sopra
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
                        2
                      </span>
                      Incollalo nel tuo sito web (prima del tag &lt;/body&gt;)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
                        3
                      </span>
                      Inizia a ricevere lead qualificati automaticamente!
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
