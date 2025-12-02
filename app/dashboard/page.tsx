"use client"

import * as React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, FileCheck, Target, Copy, Check, Code, BookOpen, Eye } from "lucide-react"

export default function DashboardPage() {
  const [copied, setCopied] = React.useState(false)

  // TODO: Fetch real data from API
  const widgetId = "wgt_1234567890abcdef"
  const stats = {
    totalLeads: 0,
    leadsLast7Days: 0,
    totalValuations: 0,
    conversionRate: "N/A"
  }

  const widgetCode = `<script src="https://cdn.domusreport.mainstream.agency/widget.js"
        data-widget-id="${widgetId}"
        async></script>`

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(widgetCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Benvenuto!"
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
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Il tuo Widget
                </CardTitle>
                <CardDescription className="mt-1">
                  Copia questo codice e incollalo nel tuo sito. Il widget si attiverà automaticamente.
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Code className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code Box */}
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{widgetCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-white"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Copiato!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copia Codice
                  </>
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Come installare il widget?
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  Segui le nostre guide passo-passo per installare il widget sul tuo sito
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/docs/wordpress">
                    <Button variant="outline" size="sm" className="bg-white">
                      📖 Guida WordPress
                    </Button>
                  </Link>
                  <Link href="/docs/webflow">
                    <Button variant="outline" size="sm" className="bg-white">
                      📖 Guida Webflow
                    </Button>
                  </Link>
                  <Link href="/docs/html">
                    <Button variant="outline" size="sm" className="bg-white">
                      📖 Guida HTML
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Widget ID Info */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Il tuo Widget ID
                  </p>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {widgetId}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(widgetId)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-dashed border-gray-300">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                <Eye className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Testa il widget</h3>
                <p className="text-sm text-gray-600">
                  Prova il widget in modalità demo
                </p>
              </div>
            </CardContent>
          </Card>
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
