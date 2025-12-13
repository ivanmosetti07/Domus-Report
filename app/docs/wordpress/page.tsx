"use client"

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, ArrowLeft, AlertCircle, CheckCircle, Sparkles, Code, Boxes } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export default function WordPressDocsPage() {
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
            <div className="text-5xl">📘</div>
            Installazione Widget su WordPress
          </h1>
          <p className="text-lg text-foreground-muted">
            Guida completa per integrare il widget DomusReport nel tuo sito WordPress
          </p>
        </div>

        {/* Scegli il Tipo di Widget */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-600" />
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
                  <p className="text-xs text-blue-800">Usa la tab "Plugin" o "Editor Tema" qui sotto</p>
                </CardContent>
              </Card>

              {/* Inline Widget */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <Boxes className="w-5 h-5 text-white" />
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
                  <p className="text-xs text-purple-800">Usa la tab "Elementor/Divi" e aggiungi un widget HTML/iFrame</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Metodi */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Passo 2: Scegli il Metodo di Installazione (Widget Bubble)
            </CardTitle>
            <CardDescription>Tre metodi semplici - scegli quello più adatto a te</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="plugin" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="plugin" className="gap-2">
              <Boxes className="w-4 h-4" />
              Plugin (Consigliato)
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              <Code className="w-4 h-4" />
              Editor Tema
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-2">
              Page Builder (Bubble + Inline)
            </TabsTrigger>
          </TabsList>

          {/* METODO 1: PLUGIN */}
          <TabsContent value="plugin" className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-900">
                  <strong>Metodo più semplice e sicuro!</strong> Non richiede modifiche al codice del tema.
                </div>
              </CardContent>
            </Card>

            {/* Step 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  Installa un Plugin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground-muted">
                  Installa uno di questi plugin gratuiti dalla dashboard WordPress:
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">🏆 Insert Headers and Footers (Consigliato)</h4>
                    <p className="text-xs text-foreground-muted mb-2">Plugin ufficiale WordPress, facile da usare</p>
                    <ol className="text-xs text-foreground-muted space-y-1 list-decimal list-inside">
                      <li>Vai su <strong>Plugin → Aggiungi nuovo</strong></li>
                      <li>Cerca "Insert Headers and Footers"</li>
                      <li>Clicca <strong>Installa ora</strong> e poi <strong>Attiva</strong></li>
                    </ol>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">WPCode</h4>
                    <p className="text-xs text-foreground-muted">
                      Alternativa potente con più funzionalità
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">Simple Custom CSS and JS</h4>
                    <p className="text-xs text-foreground-muted">
                      Per chi vuole anche aggiungere CSS personalizzato
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  Copia il Codice Widget
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                  Sostituisci <code className="bg-gray-200 px-1.5 py-0.5 rounded">TUO_WIDGET_ID</code> con il tuo Widget ID dalla dashboard
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  Incolla nel Footer del Plugin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3">Per "Insert Headers and Footers":</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Vai su <strong>Impostazioni → Insert Headers and Footers</strong></li>
                    <li>Scorri fino alla sezione <strong>"Scripts in Footer"</strong></li>
                    <li>Incolla il codice widget nel campo di testo</li>
                    <li>Clicca <strong>"Save"</strong></li>
                  </ol>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3">Per "WPCode":</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Vai su <strong>Code Snippets → + Add Snippet</strong></li>
                    <li>Scegli <strong>"Add Your Custom Code"</strong></li>
                    <li>Seleziona tipo <strong>"JavaScript Snippet"</strong></li>
                    <li>Incolla il codice e attiva <strong>"Auto Insert"</strong></li>
                    <li>Posizione: <strong>"Footer"</strong></li>
                    <li>Salva e attiva lo snippet</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">Fatto! 🎉</h3>
                <p className="text-sm text-foreground-muted mb-4">
                  Visita il tuo sito e vedrai il widget apparire in basso a destra.
                </p>
                <p className="text-xs text-foreground-muted">
                  💡 Il widget apparirà su tutte le pagine del sito automaticamente
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* METODO 2: EDITOR TEMA */}
          <TabsContent value="theme" className="space-y-6">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-900">
                  <strong>⚠️ Metodo avanzato</strong> - Richiede accesso all'editor del tema. Le modifiche potrebbero essere perse con gli aggiornamenti del tema.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  Accedi all'Editor del Tema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Dalla dashboard WordPress, vai su <strong>Aspetto → Editor del Tema</strong></li>
                  <li>Se richiesto, seleziona il tema attivo</li>
                  <li>Nel menu laterale, cerca il file <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">footer.php</code></li>
                </ol>
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs">
                  <strong>⚠️ Attenzione:</strong> Crea un backup del file footer.php prima di modificarlo!
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  Trova il tag &lt;/body&gt;
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted mb-3">
                  Scorri fino alla fine del file footer.php e trova il tag <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code>
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs">
{`<?php wp_footer(); ?>

<!-- Incolla il widget QUI, PRIMA di </body> -->

</body>
</html>`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  Incolla il Codice Widget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <p className="text-sm">Incolla il codice <strong>subito prima</strong> del tag <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code></p>
                <Button className="w-full">Aggiorna File</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* METODO 3: PAGE BUILDER */}
          <TabsContent value="builder" className="space-y-6">
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="text-sm text-purple-900">
                  <strong>Per Elementor, Divi, WPBakery e altri page builder</strong>
                  <p className="mt-2 text-xs">Con i page builder puoi usare sia il widget Bubble (script tag) che il widget Inline (iFrame) a seconda delle tue esigenze.</p>
                </div>
              </CardContent>
            </Card>

            {/* Scelta Bubble vs Inline */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Widget Bubble (Script)</p>
                  <p className="text-xs text-blue-800 mb-3">Usa il widget "HTML Personalizzato" e incolla lo <strong>script tag</strong> (vedi istruzioni dettagliate sotto)</p>
                  <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
{`<script src="..." data-widget-id="..."></script>`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Widget Inline (iFrame)</p>
                  <p className="text-xs text-purple-800 mb-3">Usa il widget "HTML" e incolla l'<strong>iFrame</strong> per incorporare il form direttamente</p>
                  <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
{`<iframe src="..." width="100%" height="600"></iframe>`}
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Elementor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Elementor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Per Widget Bubble (Script):</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Apri la pagina con <strong>Modifica con Elementor</strong></li>
                    <li>Cerca il widget <strong>"HTML"</strong> nella barra laterale</li>
                    <li>Trascinalo in fondo alla pagina (nel footer se possibile)</li>
                    <li>Incolla lo <strong>script tag</strong> nel campo HTML</li>
                    <li>Clicca <strong>Pubblica</strong></li>
                  </ol>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs mt-3">
                    <strong>💡 Per tutte le pagine:</strong> Aggiungilo nel Footer Template globale (Theme Builder → Footer).
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Per Widget Inline (iFrame):</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Apri la pagina dove vuoi il form integrato</li>
                    <li>Cerca il widget <strong>"HTML"</strong></li>
                    <li>Trascinalo <strong>dove vuoi che appaia il form</strong> nella pagina</li>
                    <li>Incolla il <strong>codice iFrame</strong>:</li>
                  </ol>
                  <div className="relative mt-3">
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
                  <div className="bg-purple-50 border border-purple-200 rounded p-3 text-xs mt-3">
                    <strong>💡 Ideale per:</strong> Landing page "Richiedi Valutazione", pagine contatti, sezioni dedicate.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Divi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Divi Builder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground-muted">
                  <strong>Widget Bubble:</strong> Aggiungi modulo "Codice" e incolla lo script tag
                </p>
                <p className="text-sm text-foreground-muted">
                  <strong>Widget Inline:</strong> Aggiungi modulo "Codice" e incolla l'iFrame dove vuoi il form
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs mt-3">
                  <strong>Per tutte le pagine:</strong> Usa Theme Builder → Modelli Globali → Footer (solo per Bubble)
                </div>
              </CardContent>
            </Card>

            {/* WPBakery */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WPBakery Page Builder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground-muted">
                  <strong>Widget Bubble:</strong> Elemento "Raw HTML" con script tag
                </p>
                <p className="text-sm text-foreground-muted">
                  <strong>Widget Inline:</strong> Elemento "Raw HTML" con iFrame nella posizione desiderata
                </p>
              </CardContent>
            </Card>

            {/* Gutenberg */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gutenberg (Editor Blocchi)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground-muted">
                  <strong>Widget Bubble:</strong> Blocco "HTML Personalizzato" con script tag in fondo alla pagina
                </p>
                <p className="text-sm text-foreground-muted">
                  <strong>Widget Inline:</strong> Blocco "HTML Personalizzato" con iFrame dove serve il form
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded p-3 text-xs mt-3">
                  <strong>💡 Widget Inline perfetto per:</strong> Sezioni "Richiedi Valutazione" in mezzo al contenuto
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Troubleshooting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>❓ Risoluzione Problemi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-sm mb-2">Il widget non appare</h4>
              <ul className="text-xs text-foreground-muted space-y-1 list-disc list-inside">
                <li>Verifica di aver sostituito TUO_WIDGET_ID con il tuo vero Widget ID</li>
                <li>Svuota la cache di WordPress e del browser (Ctrl+F5)</li>
                <li>Controlla che il plugin sia attivo</li>
                <li>Se usi un plugin di cache (WP Rocket, W3 Total Cache), svuota anche quella</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-sm mb-2">Il widget appare due volte</h4>
              <ul className="text-xs text-foreground-muted space-y-1 list-disc list-inside">
                <li>Hai probabilmente installato il codice in due posti diversi</li>
                <li>Rimuovi una delle installazioni (dal plugin O dal tema, non entrambi)</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <h4 className="font-semibold text-sm mb-2">Conflitti con altri plugin</h4>
              <ul className="text-xs text-foreground-muted space-y-1 list-disc list-inside">
                <li>Se usi plugin di ottimizzazione JS, escludi widget.js dall'ottimizzazione</li>
                <li>Alcuni plugin di sicurezza potrebbero bloccare script esterni - aggiungi il dominio alla whitelist</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Installazione Completata! 🎉</h3>
            <p className="text-foreground-muted mb-4">
              Il widget è ora attivo sul tuo sito WordPress. Inizia a raccogliere lead.
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
