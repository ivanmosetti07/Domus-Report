"use client"

import * as React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Code, BookOpen, Eye, Zap } from "lucide-react"

export default function WidgetPage() {
  const [copied, setCopied] = React.useState(false)

  // TODO: Fetch from API
  const widgetId = "wgt_1234567890abcdef"

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
        title="Il tuo Widget"
        subtitle="Installa il widget sul tuo sito per iniziare a raccogliere lead"
      />

      <div className="max-w-4xl space-y-6">
        {/* Widget Code Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Codice di Integrazione
                </CardTitle>
                <CardDescription className="mt-1">
                  Copia e incolla questo codice nel tuo sito web, prima del tag &lt;/body&gt;
                </CardDescription>
              </div>
              <Badge variant="success">Attivo</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code Box */}
            <div className="relative">
              <pre className="bg-foreground text-background p-4 rounded-lg overflow-x-auto text-sm">
                <code>{widgetCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-card"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-success" />
                    Copiato!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copia
                  </>
                )}
              </Button>
            </div>

            {/* Widget ID */}
            <div className="p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
                    Il tuo Widget ID
                  </p>
                  <p className="text-sm font-mono text-foreground mt-1">
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

        {/* Installation Guides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Guide di Installazione
            </CardTitle>
            <CardDescription>
              Segui la guida passo-passo per la tua piattaforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/docs/wordpress">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">📘</div>
                    <h3 className="font-semibold text-foreground mb-2">WordPress</h3>
                    <p className="text-sm text-foreground-muted">
                      Installa tramite widget HTML personalizzato
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/webflow">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">🎨</div>
                    <h3 className="font-semibold text-foreground mb-2">Webflow</h3>
                    <p className="text-sm text-foreground-muted">
                      Aggiungi tramite Custom Code
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/html">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">💻</div>
                    <h3 className="font-semibold text-foreground mb-2">HTML</h3>
                    <p className="text-sm text-foreground-muted">
                      Incolla prima del tag &lt;/body&gt;
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Widget Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Caratteristiche del Widget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Responsive</h4>
                  <p className="text-sm text-foreground-muted">
                    Si adatta automaticamente a desktop e mobile
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Caricamento Asincrono</h4>
                  <p className="text-sm text-foreground-muted">
                    Non rallenta il tuo sito web
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Conversazionale</h4>
                  <p className="text-sm text-foreground-muted">
                    Esperienza utente simile a WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Valutazioni OMI</h4>
                  <p className="text-sm text-foreground-muted">
                    Basato su dati ufficiali del mercato
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Widget */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Vuoi vedere il widget in azione?
            </h3>
            <p className="text-foreground-muted mb-4">
              Testa il widget in modalità demo sulla landing page
            </p>
            <Link href="/">
              <Button variant="outline" className="bg-card">
                Vai alla Demo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
