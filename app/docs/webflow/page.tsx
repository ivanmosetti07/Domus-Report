"use client"

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowLeft, AlertCircle, CheckCircle, Sparkles, Settings, Globe } from "lucide-react"
import { useState } from "react"

export default function WebflowDocsPage() {
  const [copied, setCopied] = useState(false)

  const widgetCode = `<!-- DomusReport Widget -->
<script
  src="https://domusreport.mainstream.agency/widget.js"
  data-widget-id="TUO_WIDGET_ID"
  async>
</script>`

  const inlineCode = `<!-- DomusReport Widget Inline -->
<iframe
  src="https://domusreport.mainstream.agency/widget/inline/TUO_WIDGET_ID"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="DomusReport Valutazione Immobiliare">
</iframe>`

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/widgets" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Torna ai Widget
          </Link>
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <div className="text-5xl">🎨</div>
            Installazione Widget su Webflow
          </h1>
          <p className="text-lg text-foreground-muted">
            Guida completa per integrare il widget DomusReport nel tuo sito Webflow
          </p>
        </div>

        {/* Scegli il Tipo di Widget */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Passo 1: Scegli il Tipo di Widget
            </CardTitle>
            <CardDescription>Due modalità diverse per esigenze diverse</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bubble Widget */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    Widget Bubble
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-blue-900 font-semibold">Bottone flottante in basso a destra</p>
                  <ul className="text-xs text-blue-800 space-y-2 list-disc list-inside">
                    <li>Sempre visibile senza occupare spazio</li>
                    <li>Si apre al click con un modale</li>
                    <li>Presente su tutte le pagine automaticamente</li>
                    <li>✅ Consigliato per la maggior parte dei siti</li>
                  </ul>
                  <p className="text-xs font-semibold text-blue-900 mt-3">Installazione:</p>
                  <p className="text-xs text-blue-800">Usa Custom Code → Footer Code (vedi sotto)</p>
                </CardContent>
              </Card>

              {/* Inline Widget */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    Widget Inline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-purple-900 font-semibold">Form incorporato nella pagina</p>
                  <ul className="text-xs text-purple-800 space-y-2 list-disc list-inside">
                    <li>Parte integrante del contenuto</li>
                    <li>Sempre visibile, massima visibilità</li>
                    <li>Dimensioni personalizzabili</li>
                    <li>Solo sulle pagine dove lo aggiungi</li>
                  </ul>
                  <p className="text-xs font-semibold text-purple-900 mt-3">Installazione:</p>
                  <p className="text-xs text-purple-800">Usa elemento Embed nella pagina (vedi metodo alternativo)</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start BUBBLE */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Metodo 1: Widget Bubble (Consigliato)
            </CardTitle>
            <CardDescription>Installazione globale in 4 semplici passi - Tempo: 2 minuti</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Apri le Impostazioni del Progetto</h3>
                  <div className="space-y-2 text-sm text-foreground-muted">
                    <p>Nel tuo progetto Webflow:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Clicca sull'icona <strong>Impostazioni ⚙️</strong> in alto a sinistra</li>
                      <li>Oppure usa la scorciatoia da tastiera: <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">E</kbd></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Vai a Custom Code</h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    Nel menu laterale, clicca su <strong>"Custom Code"</strong>
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
                    <strong>💡 Nota:</strong> Se non vedi "Custom Code", assicurati di avere un piano Webflow a pagamento (Basic, CMS, Business o Enterprise). Il custom code non è disponibile nel piano gratuito.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Incolla nel Footer Code</h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    Scorri fino alla sezione <strong>"Footer Code"</strong> e incolla questo codice:
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs border border-gray-700">
                      <code>{widgetCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-3 right-3"
                      onClick={() => handleCopy(widgetCode)}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                          <span className="text-xs">Copiato!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          <span className="text-xs">Copia</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Ricorda di sostituire <code className="bg-gray-200 px-1.5 py-0.5 rounded">TUO_WIDGET_ID</code> con il tuo Widget ID reale
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Salva e Pubblica</h3>
                  <div className="space-y-2 text-sm text-foreground-muted">
                    <p>Per completare l'installazione:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Clicca <strong>"Save Changes"</strong> in basso</li>
                      <li>Torna al Designer (clicca sulla X o premi <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd>)</li>
                      <li>Clicca il pulsante <strong>"Publish"</strong> in alto a destra</li>
                      <li>Seleziona i domini dove pubblicare e conferma</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Perfetto! Il widget è installato 🎉</h3>
            <p className="text-sm text-foreground-muted mb-4">
              Visita il tuo sito pubblicato e vedrai il widget apparire in basso a destra su tutte le pagine.
            </p>
            <p className="text-xs text-foreground-muted">
              💡 Il widget apparirà automaticamente su tutte le pagine del sito
            </p>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">✅ Vantaggi di Footer Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-start">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Globale automaticamente</p>
                  <p className="text-xs text-foreground-muted">Il widget apparirà su tutte le pagine senza doverlo aggiungere manualmente a ciascuna</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Non rallenta il sito</p>
                  <p className="text-xs text-foreground-muted">Lo script si carica in modo asincrono (async) senza bloccare il resto della pagina</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Facile da aggiornare</p>
                  <p className="text-xs text-foreground-muted">Modifica il codice una sola volta per aggiornarlo su tutto il sito</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚠️ Cose da Sapere</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Piano a pagamento richiesto</p>
                  <p className="text-xs text-foreground-muted">Il Custom Code è disponibile solo con piani Basic, CMS, Business o Enterprise</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Non visibile in Designer</p>
                  <p className="text-xs text-foreground-muted">Il widget non appare nel Designer di Webflow, solo sul sito pubblicato</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Devi pubblicare</p>
                  <p className="text-xs text-foreground-muted">Le modifiche al Custom Code richiedono una nuova pubblicazione per essere attive</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* METODO 2: INLINE WIDGET */}
        <Card className="mb-8 border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              Metodo 2: Widget Inline (Incorporato)
            </CardTitle>
            <CardDescription>Per incorporare il form direttamente in pagine specifiche</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
              <strong>Quando usare questo metodo:</strong> Perfetto per landing page dedicate, pagine "Richiedi Valutazione" o sezioni specifiche dove vuoi che il form sia sempre visibile come parte del contenuto della pagina.
            </div>

            <p className="text-sm text-foreground-muted">
              Per il widget inline, usa l'elemento <strong>Embed</strong> di Webflow:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <p className="text-sm pt-0.5">Apri la pagina dove vuoi il widget nel Webflow Designer</p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <p className="text-sm pt-0.5">Cerca "Embed" nel pannello Add Elements (+) o premi <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">E</kbd></p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <p className="text-sm pt-0.5">Trascina l'elemento <strong>Embed</strong> in fondo alla pagina (nel footer se possibile)</p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">Incolla il codice <strong>iFrame</strong> nell'Embed Element</p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                      <code>{inlineCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(inlineCode)}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                          <span className="text-xs">Copiato!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          <span className="text-xs">Copia</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Ricorda di sostituire <code className="bg-gray-200 px-1.5 py-0.5 rounded">TUO_WIDGET_ID</code> con il tuo Widget ID reale
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  5
                </div>
                <p className="text-sm pt-0.5">Clicca <strong>"Save & Close"</strong> e pubblica il sito</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm mt-4">
              <strong>💡 Vantaggi Widget Inline:</strong>
              <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                <li>Form sempre visibile, non richiede click</li>
                <li>Perfetto per landing page di conversione</li>
                <li>Puoi personalizzare width e height dell'iFrame</li>
                <li>Funziona anche con il piano gratuito Webflow</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs mt-4">
              <strong>💡 Nota:</strong> Se vuoi il widget Bubble su pagine specifiche (non globalmente), puoi usare lo stesso metodo Embed ma con lo script tag invece dell'iFrame.
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>❓ Risoluzione Problemi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-sm mb-2">Il widget non appare</h4>
              <ul className="text-xs text-foreground-muted space-y-1 list-disc list-inside">
                <li>Verifica di aver sostituito <code className="bg-gray-200 px-1 rounded">TUO_WIDGET_ID</code> con il tuo Widget ID reale</li>
                <li>Assicurati di aver pubblicato il sito dopo aver aggiunto il codice</li>
                <li>Il widget non appare nel Designer, solo sul sito pubblicato - visita l'URL live</li>
                <li>Svuota la cache del browser (Ctrl+F5 / Cmd+Shift+R)</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-sm mb-2">Non vedo l'opzione Custom Code</h4>
              <ul className="text-xs text-foreground-muted space-y-1 list-disc list-inside">
                <li>Verifica di avere un piano a pagamento (Basic, CMS, Business o Enterprise)</li>
                <li>Il piano gratuito non include Custom Code - usa il metodo Embed Element</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-sm mb-2">Il widget appare due volte</h4>
              <ul className="text-xs text-foreground-muted space-y-1 list-disc list-inside">
                <li>Hai probabilmente aggiunto il codice sia in Custom Code che con Embed Element</li>
                <li>Rimuovi una delle due installazioni</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-sm mb-2">Il widget interferisce con il design</h4>
              <ul className="text-xs text-foreground-muted space-y-1 list-disc list-inside">
                <li>Il widget è progettato per essere non invasivo e fluttare in basso a destra</li>
                <li>Se hai elementi fixed in quella posizione, potrebbero sovrapporsi</li>
                <li>Puoi modificare i colori del widget dalla dashboard per adattarlo al tuo brand</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Video Tutorial Note */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardContent className="p-6 flex gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">📹 Hai bisogno di aiuto visivo?</h3>
              <p className="text-sm text-purple-800 mb-3">
                Webflow University ha ottimi tutorial su come aggiungere Custom Code. Cerca "Webflow Custom Code" su YouTube per guide video dettagliate.
              </p>
              <a
                href="https://university.webflow.com/lesson/custom-code-in-the-head-and-body-tags"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-purple-700 hover:underline inline-flex items-center gap-1"
              >
                Guarda il tutorial ufficiale di Webflow
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Installazione Completata! 🎉</h3>
            <p className="text-foreground-muted mb-4">
              Il widget è ora attivo sul tuo sito Webflow. Inizia a raccogliere lead.
            </p>
            <Link href="/dashboard/widgets">
              <Button size="lg" className="gap-2">
                <CheckCircle className="w-5 h-5" />
                Vai alla Dashboard Widget
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
