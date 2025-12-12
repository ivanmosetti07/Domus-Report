"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Copy, Check, BookOpen, AlertCircle, Sparkles, ExternalLink } from "lucide-react"

interface WidgetCodeCardProps {
  widgetId: string
}

export function WidgetCodeCard({ widgetId }: WidgetCodeCardProps) {
  const [copied, setCopied] = React.useState(false)

  // Usa il dominio corretto in base all'ambiente
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://domusreport.mainstream.agency'

  const widgetCode = `<script src="${baseUrl}/widget-embed.js?widgetId=${widgetId}"></script>`

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(widgetCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
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

        {/* Installation Instructions with Tabs */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Guida Installazione</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Scegli la tua piattaforma e segui i passaggi
            </p>
          </div>

          <Tabs defaultValue="wordpress" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 h-auto p-0">
              <TabsTrigger value="wordpress" className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3">
                WordPress
              </TabsTrigger>
              <TabsTrigger value="html" className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3">
                HTML/Siti Statici
              </TabsTrigger>
              <TabsTrigger value="react" className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3">
                React/Next.js
              </TabsTrigger>
              <TabsTrigger value="other" className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 px-6 py-3">
                Altre Piattaforme
              </TabsTrigger>
            </TabsList>

            {/* WordPress */}
            <TabsContent value="wordpress" className="p-4 space-y-3 m-0">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Accedi al tuo WordPress</p>
                    <p className="text-sm text-gray-600 mt-1">Vai su <strong>Aspetto → Editor del Tema</strong> oppure usa un plugin come <strong>"Insert Headers and Footers"</strong></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Incolla il codice</p>
                    <p className="text-sm text-gray-600 mt-1">Aggiungi lo script <strong>prima del tag &lt;/body&gt;</strong> nel file <code className="bg-gray-100 px-1 rounded">footer.php</code> oppure nel campo "Scripts in Footer" del plugin</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Salva e verifica</p>
                    <p className="text-sm text-gray-600 mt-1">Salva le modifiche e visita il tuo sito. Il bottone widget apparirà in basso a destra!</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Elementor?</strong> Usa il widget "HTML Personalizzato" e incolla il codice nella sezione desiderata.
                </p>
              </div>
            </TabsContent>

            {/* HTML/Static Sites */}
            <TabsContent value="html" className="p-4 space-y-3 m-0">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Apri il file HTML</p>
                    <p className="text-sm text-gray-600 mt-1">Apri il file HTML del tuo sito web con un editor di testo (es: VS Code, Sublime Text, Notepad++)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Trova il tag &lt;/body&gt;</p>
                    <p className="text-sm text-gray-600 mt-1">Cerca il tag di chiusura <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> alla fine del documento</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Incolla lo script PRIMA del &lt;/body&gt;</p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>Inserisci lo script widget subito prima del tag di chiusura:</p>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs mt-2 overflow-x-auto">
{`  <!-- DomusReport Widget -->
  ${widgetCode}
</body>
</html>`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Carica il file</p>
                    <p className="text-sm text-gray-600 mt-1">Salva il file e caricalo sul tuo server (via FTP, cPanel, o il tuo hosting). Il widget apparirà immediatamente!</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* React/Next.js */}
            <TabsContent value="react" className="p-4 space-y-3 m-0">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Crea un componente Script</p>
                    <p className="text-sm text-gray-600 mt-1">Aggiungi lo script nel layout principale o nella pagina desiderata</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Next.js App Router</p>
                    <div className="text-sm text-gray-600 mt-1">
                      <p className="mb-2">In <code className="bg-gray-100 px-1 rounded">app/layout.tsx</code>:</p>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="${baseUrl}/widget-embed.js?widgetId=${widgetId}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">React (Vite, CRA)</p>
                    <div className="text-sm text-gray-600 mt-1">
                      <p className="mb-2">Nel file <code className="bg-gray-100 px-1 rounded">index.html</code>:</p>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`<body>
  <div id="root"></div>
  ${widgetCode}
</body>`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Il widget si caricherà automaticamente quando l'utente naviga sul sito. Usa <code className="bg-white px-1 rounded">strategy="lazyOnload"</code> per ottimizzare le performance.
                </p>
              </div>
            </TabsContent>

            {/* Other Platforms */}
            <TabsContent value="other" className="p-4 space-y-4 m-0">
              <div className="space-y-4">
                {/* Wix */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Wix</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Vai su <strong>Impostazioni → Avanzate → Codice Personalizzato</strong></li>
                    <li>Clicca <strong>"+ Aggiungi Codice Personalizzato"</strong></li>
                    <li>Incolla lo script, seleziona <strong>"Body - end"</strong></li>
                    <li>Applica a <strong>"Tutte le pagine"</strong> e salva</li>
                  </ol>
                </div>

                {/* Squarespace */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Squarespace</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Vai su <strong>Impostazioni → Avanzate → Iniezione Codice</strong></li>
                    <li>Incolla lo script nel campo <strong>"Footer"</strong></li>
                    <li>Clicca <strong>Salva</strong></li>
                  </ol>
                </div>

                {/* Shopify */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Shopify</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Vai su <strong>Negozio online → Temi → Azioni → Modifica codice</strong></li>
                    <li>Apri <code className="bg-gray-100 px-1 rounded">theme.liquid</code></li>
                    <li>Incolla lo script prima di <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code></li>
                    <li>Salva</li>
                  </ol>
                </div>

                {/* Webflow */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Webflow</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Vai su <strong>Project Settings → Custom Code</strong></li>
                    <li>Incolla lo script nel campo <strong>"Footer Code"</strong></li>
                    <li>Clicca <strong>Save Changes</strong> e pubblica il sito</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">La tua piattaforma non è elencata?</p>
                  <p>Cerca "Come aggiungere codice personalizzato a [nome piattaforma]" su Google. Nella maggior parte dei casi, dovrai incollare lo script nel footer del sito.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
              onClick={() => {
                navigator.clipboard.writeText(widgetId)
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
