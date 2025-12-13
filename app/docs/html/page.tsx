"use client"

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code2, Copy, Check, ArrowLeft, AlertCircle, CheckCircle, FileCode, Sparkles } from "lucide-react"
import { useState } from "react"

export default function HTMLDocsPage() {
  const [copied, setCopied] = useState(false)

  const widgetCode = `<!-- DomusReport Widget -->
<script
  src="https://domusreport.mainstream.agency/widget.js"
  data-widget-id="TUO_WIDGET_ID"
  async>
</script>`

  const fullExample = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Il Mio Sito</title>
</head>
<body>

  <!-- Il tuo contenuto qui -->
  <h1>Benvenuto nel mio sito</h1>

  <!-- DomusReport Widget - PRIMA del tag </body> -->
  <script
    src="https://domusreport.mainstream.agency/widget.js"
    data-widget-id="TUO_WIDGET_ID"
    async>
  </script>
</body>
</html>`

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/widgets" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Torna ai Widget
          </Link>
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3 text-foreground">
            <FileCode className="w-10 h-10 text-primary" />
            Installazione Widget su HTML
          </h1>
          <p className="text-lg text-foreground-muted">
            Guida completa per integrare il widget DomusReport nel tuo sito HTML statico
          </p>
        </div>

        {/* Scegli il Tipo di Widget */}
        <Card className="mb-8 border border-border bg-card">
          <CardHeader className="bg-gradient-to-r from-surface via-surface-2 to-surface border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Code2 className="w-5 h-5 text-primary" />
              Scegli il Tipo di Widget
            </CardTitle>
            <CardDescription className="text-foreground-muted">Due modalità diverse per esigenze diverse</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bubble Widget */}
              <Card className="border border-primary/30 bg-surface hover:bg-surface-2 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Widget Bubble
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground font-semibold">Bottone flottante in basso a destra</p>
                  <ul className="text-xs text-foreground-muted space-y-2 list-disc list-inside">
                    <li>Sempre visibile senza occupare spazio</li>
                    <li>Si apre al click con un modale</li>
                    <li>Non invasivo, non disturba il design</li>
                    <li>✅ Consigliato per la maggior parte dei siti</li>
                  </ul>
                  <p className="text-xs font-semibold text-foreground mt-3">Quando usarlo:</p>
                  <p className="text-xs text-foreground-muted">Siti aziendali, blog, portfolio, e-commerce - qualsiasi sito dove vuoi lead sempre disponibili senza occupare spazio</p>
                </CardContent>
              </Card>

              {/* Inline Widget */}
              <Card className="border border-border bg-surface hover:bg-surface-2 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <FileCode className="w-5 h-5 text-accent-foreground" />
                    </div>
                    Widget Inline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground font-semibold">Form incorporato nella pagina</p>
                  <ul className="text-xs text-foreground-muted space-y-2 list-disc list-inside">
                    <li>Parte integrante del contenuto della pagina</li>
                    <li>Sempre visibile, massima visibilità</li>
                    <li>Dimensioni personalizzabili</li>
                    <li>Perfetto per pagine dedicate</li>
                  </ul>
                  <p className="text-xs font-semibold text-foreground mt-3">Quando usarlo:</p>
                  <p className="text-xs text-foreground-muted">Landing page di conversione, pagine "Richiedi Valutazione", sezioni contatti dove vuoi massima attenzione sul form</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start BUBBLE */}
        <Card className="mb-8 border border-primary/40 bg-card shadow-soft-lg">
          <CardHeader className="bg-gradient-to-r from-surface via-surface-2 to-surface border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              Metodo 1: Widget Bubble (Consigliato)
            </CardTitle>
            <CardDescription className="text-foreground-muted">Installa il bottone flottante in 3 semplici passi</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground flex items-center justify-center font-bold shadow-glow-primary">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Ottieni il tuo Widget ID</h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    Vai nella sezione <Link href="/dashboard/widgets" className="text-primary underline">Widget</Link> della dashboard,
                    clicca su "Codice" sul widget che vuoi installare, e copia il tuo Widget ID.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground flex items-center justify-center font-bold shadow-glow-primary">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Copia questo codice</h3>
                  <div className="relative">
                    <pre className="bg-surface-2 text-foreground p-4 rounded-lg overflow-x-auto text-xs border border-border">
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
                  <p className="text-xs text-foreground-muted mt-2">
                    ⚠️ Sostituisci <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">TUO_WIDGET_ID</code> con il tuo Widget ID
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground flex items-center justify-center font-bold shadow-glow-primary">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Incolla prima del tag &lt;/body&gt;</h3>
                  <p className="text-sm text-foreground-muted mb-3">
                    Apri il tuo file HTML e incolla lo script <strong>subito prima</strong> del tag di chiusura <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">&lt;/body&gt;</code>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Esempio Completo */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Code2 className="w-5 h-5 text-primary" />
              Esempio Completo
            </CardTitle>
            <CardDescription className="text-foreground-muted">
              Ecco come dovrebbe apparire il tuo file HTML con il widget installato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-surface-2 text-foreground p-4 rounded-lg overflow-x-auto text-xs border border-border leading-relaxed">
                <code>{fullExample}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3"
                onClick={() => handleCopy(fullExample)}
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
          </CardContent>
        </Card>

        {/* METODO 2: INLINE WIDGET */}
        <Card className="mb-8 border border-accent/40 bg-card shadow-soft-lg">
          <CardHeader className="bg-gradient-to-r from-surface via-surface-2 to-surface border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileCode className="w-5 h-5 text-accent" />
              Metodo 2: Widget Inline (Incorporato)
            </CardTitle>
            <CardDescription className="text-foreground-muted">Per incorporare il form direttamente nella pagina</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="bg-surface-2 border border-border rounded-lg p-4 text-sm">
              <strong className="text-foreground">Quando usare questo metodo:</strong> <span className="text-foreground-muted">Perfetto per landing page dedicate, pagine "Richiedi Valutazione" o sezioni specifiche dove vuoi che il form sia sempre visibile come parte del contenuto.</span>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                <Code2 className="w-4 h-4 text-primary" />
                Codice iFrame da Copiare
              </h4>
              <div className="relative">
                <pre className="bg-surface-2 text-foreground p-4 rounded-lg overflow-x-auto text-xs border border-border leading-relaxed">
                  <code>{`<!-- DomusReport Widget Inline -->
<iframe
  src="https://domusreport.mainstream.agency/widget/inline/TUO_WIDGET_ID"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="DomusReport Valutazione Immobiliare">
</iframe>`}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3"
                  onClick={() => handleCopy(`<!-- DomusReport Widget Inline -->
<iframe
  src="https://domusreport.mainstream.agency/widget/inline/TUO_WIDGET_ID"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="DomusReport Valutazione Immobiliare">
</iframe>`)}
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
              <p className="text-xs text-foreground-muted mt-2">
                ⚠️ Sostituisci <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">TUO_WIDGET_ID</code> con il tuo Widget ID
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Istruzioni:</h4>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground flex items-center justify-center text-sm font-bold shadow-glow-primary">
                  1
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-foreground-muted">Incolla l'iFrame <strong className="text-foreground">dove vuoi che appaia il form</strong> nella tua pagina HTML (non necessariamente prima di &lt;/body&gt;)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground flex items-center justify-center text-sm font-bold shadow-glow-primary">
                  2
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-foreground-muted">Personalizza le dimensioni modificando <code className="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">width</code> e <code className="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">height</code> (es: width="800" height="700")</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground flex items-center justify-center text-sm font-bold shadow-glow-primary">
                  3
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-foreground-muted">Salva e carica il file sul server</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-2 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-foreground"><strong className="text-primary">💡 Pro Tip:</strong> Il widget inline è perfetto per una sezione dedicata "Richiedi Valutazione Gratuita" nel tuo sito!</p>
            </div>
          </CardContent>
        </Card>

        {/* Istruzioni Dettagliate */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">✅ Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-start">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Posizione corretta</p>
                  <p className="text-xs text-foreground-muted">Inserisci lo script prima di &lt;/body&gt; per non rallentare il caricamento della pagina</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Attributo async</p>
                  <p className="text-xs text-foreground-muted">L'attributo async garantisce che il widget non blocchi il rendering della pagina</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Una sola volta</p>
                  <p className="text-xs text-foreground-muted">Inserisci lo script una sola volta per pagina, anche se hai più pagine HTML</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚠️ Problemi Comuni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Widget non appare</p>
                  <p className="text-xs text-foreground-muted">Verifica di aver sostituito TUO_WIDGET_ID con il tuo Widget ID reale</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Script nel &lt;head&gt;</p>
                  <p className="text-xs text-foreground-muted">Non inserire lo script nell'head, ma prima del &lt;/body&gt;</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Cache del browser</p>
                  <p className="text-xs text-foreground-muted">Se hai modificato il codice, svuota la cache (Ctrl+F5) per vedere le modifiche</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload FTP */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Come caricare il file sul server</CardTitle>
            <CardDescription>Se usi un hosting tradizionale con FTP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <p className="text-sm">Apri il tuo client FTP (FileZilla, Cyberduck, o il File Manager del tuo hosting)</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <p className="text-sm">Naviga nella cartella del tuo sito (solitamente <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">public_html</code> o <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">www</code>)</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <p className="text-sm">Carica il file HTML modificato (sovrascrivi quello vecchio)</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <p className="text-sm">Visita il tuo sito e verifica che il widget appaia in basso a destra</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multiple Pages */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6 flex gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Sito con più pagine?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Se il tuo sito ha più pagine HTML (es: index.html, about.html, contact.html), devi aggiungere lo script a <strong>ogni file HTML</strong> in cui vuoi che il widget appaia.
              </p>
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Se le tue pagine includono un footer comune, aggiungi lo script lì per averlo automaticamente su tutte le pagine.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Tutto pronto!</h3>
            <p className="text-foreground-muted mb-4">
              Il widget è ora attivo sul tuo sito. Inizia a raccogliere lead immediatamente.
            </p>
            <Link href="/dashboard/widgets">
              <Button size="lg" className="gap-2">
                <CheckCircle className="w-5 h-5" />
                Torna ai tuoi Widget
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
