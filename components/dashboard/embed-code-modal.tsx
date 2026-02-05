"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Layout,
  Code2,
  Sparkles,
  AlertCircle,
  BookOpen,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

interface WidgetConfig {
  id: string
  widgetId: string
  name: string
  mode: 'bubble' | 'inline'
  isActive: boolean
}

interface EmbedCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widget: WidgetConfig | null
}

export function EmbedCodeModal({
  open,
  onOpenChange,
  widget,
}: EmbedCodeModalProps) {
  const [copiedType, setCopiedType] = React.useState<string | null>(null)

  if (!widget) return null

  const widgetHost = process.env.NEXT_PUBLIC_APP_URL || 'https://domusreport.com'

  // Script tag - metodo principale (bubble)
  const bubbleCode = `<!-- DomusReport Widget - ${widget.name} -->
<script
  src="${widgetHost}/widget.js"
  data-widget-id="${widget.widgetId}"
  async>
</script>`

  // iFrame - metodo inline
  const inlineCode = `<!-- DomusReport Widget Inline - ${widget.name} -->
<iframe
  src="${widgetHost}/widget/inline/${widget.widgetId}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="DomusReport Valutazione Immobiliare">
</iframe>`

  // Next.js App Router
  const nextjsCode = `// app/layout.tsx o app/page.tsx
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Script
        src="${widgetHost}/widget.js"
        data-widget-id="${widget.widgetId}"
        strategy="lazyOnload"
      />
    </>
  )
}`

  // React Component (Vite, CRA)
  const reactCode = `// DomusReportWidget.tsx
import { useEffect } from 'react'

export function DomusReportWidget() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '${widgetHost}/widget.js'
    script.setAttribute('data-widget-id', '${widget.widgetId}')
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return null
}

// Utilizzo in App.tsx
import { DomusReportWidget } from './DomusReportWidget'

function App() {
  return (
    <>
      {/* Tuo contenuto */}
      <DomusReportWidget />
    </>
  )
}`

  // WordPress
  const wordpressCode = `<!-- Metodo 1: Usando un plugin (consigliato) -->
1. Installa "Insert Headers and Footers" o "WPCode"
2. Vai su Impostazioni → Insert Headers and Footers
3. Incolla questo codice nel campo "Scripts in Footer":

${bubbleCode}

<!-- Metodo 2: Modificando theme.liquid (avanzato) -->
1. Vai su Aspetto → Editor del Tema
2. Apri footer.php
3. Incolla il codice PRIMA di </body>
4. Salva le modifiche`

  // Webflow
  const webflowCode = `1. Vai su Project Settings (⚙️)
2. Clicca su "Custom Code"
3. Incolla questo codice nel campo "Footer Code":

${bubbleCode}

4. Clicca "Save Changes"
5. Pubblica il sito`

  // Shopify
  const shopifyCode = `1. Vai su Negozio online → Temi
2. Clicca "Azioni" → "Modifica codice"
3. Apri theme.liquid
4. Incolla questo codice PRIMA di </body>:

${bubbleCode}

5. Salva le modifiche`

  // Wix
  const wixCode = `1. Vai su Impostazioni → Avanzate → Codice Personalizzato
2. Clicca "+ Aggiungi Codice Personalizzato"
3. Incolla il codice, dai un nome, seleziona "Body - end"
4. Applica a "Tutte le pagine"
5. Salva

${bubbleCode}`

  // Squarespace
  const squarespaceCode = `1. Vai su Impostazioni → Avanzate → Iniezione Codice
2. Incolla questo codice nel campo "Footer":

${bubbleCode}

3. Clicca Salva`

  const handleCopy = async (code: string, type: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  const CodeBlock = ({ code, type }: { code: string; type: string }) => (
    <div className="relative group">
      <pre className="bg-surface-2 text-foreground p-4 rounded-lg overflow-x-auto text-xs leading-relaxed border border-border shadow-soft-lg">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-3 right-3 shadow-md opacity-90 hover:opacity-100 transition-opacity"
        onClick={() => handleCopy(code, type)}
      >
        {copiedType === type ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1.5 text-success" />
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
  )

  const InstructionStep = ({ number, title, description }: { number: number; title: string; description: string | React.ReactNode }) => (
    <div className="flex gap-3 items-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground flex items-center justify-center text-sm font-bold shadow-glow-primary">
        {number}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
        <div className="text-sm text-foreground-muted leading-relaxed">{description}</div>
      </div>
    </div>
  )

  const PlatformCard = ({
    icon,
    title,
    description,
    href
  }: {
    icon: string;
    title: string;
    description: string;
    href: string
  }) => (
    <Link href={href} className="block">
      <Card className="h-full hover:shadow-glow-primary hover:border-primary/50 transition-all duration-200 cursor-pointer group bg-card border-border">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
          <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors text-foreground">{title}</h4>
          <p className="text-xs text-foreground-muted">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {widget.mode === 'bubble' ? (
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            ) : (
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layout className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <span className="block">Codice Installazione Widget</span>
              <span className="text-sm font-normal text-foreground-muted">{widget.name}</span>
            </div>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Scegli il metodo di installazione più adatto alla tua piattaforma
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <Tabs defaultValue="platforms" className="w-full">
            {widget.mode === 'bubble' ? (
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-surface p-1">
                <TabsTrigger value="platforms" className="data-[state=active]:bg-card">
                  <Code2 className="w-4 h-4 mr-2" />
                  Piattaforme
                </TabsTrigger>
                <TabsTrigger value="script" className="data-[state=active]:bg-card">
                  Script HTML
                </TabsTrigger>
                <TabsTrigger value="react" className="data-[state=active]:bg-card">
                  React/Next.js
                </TabsTrigger>
              </TabsList>
            ) : (
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-surface p-1">
                <TabsTrigger value="platforms" className="data-[state=active]:bg-card">
                  <Code2 className="w-4 h-4 mr-2" />
                  Piattaforme
                </TabsTrigger>
                <TabsTrigger value="iframe" className="data-[state=active]:bg-card">
                  iFrame
                </TabsTrigger>
              </TabsList>
            )}

            {/* PIATTAFORME POPOLARI */}
            <TabsContent value="platforms" className="space-y-6 mt-0">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Seleziona la tua Piattaforma
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <PlatformCard
                    icon="📘"
                    title="WordPress"
                    description="Guida completa"
                    href="/docs/wordpress"
                  />
                  <PlatformCard
                    icon="🎨"
                    title="Webflow"
                    description="Guida completa"
                    href="/docs/webflow"
                  />
                  <PlatformCard
                    icon="💻"
                    title="HTML"
                    description="Guida completa"
                    href="/docs/html"
                  />
                </div>

                {/* Quick Install per piattaforme */}
                <div className="space-y-4">
                  <Tabs defaultValue="wordpress-quick" className="w-full">
                    <TabsList className="w-full justify-start bg-gray-50 h-auto flex-wrap gap-2 p-2">
                      <TabsTrigger value="wordpress-quick" className="text-xs">WordPress</TabsTrigger>
                      <TabsTrigger value="webflow-quick" className="text-xs">Webflow</TabsTrigger>
                      <TabsTrigger value="shopify-quick" className="text-xs">Shopify</TabsTrigger>
                      <TabsTrigger value="wix-quick" className="text-xs">Wix</TabsTrigger>
                      <TabsTrigger value="squarespace-quick" className="text-xs">Squarespace</TabsTrigger>
                    </TabsList>

                    <TabsContent value="wordpress-quick" className="mt-4 space-y-4">
                      <CodeBlock code={wordpressCode} type="wordpress" />
                      <Card className="bg-surface-2 border-warning/30">
                        <CardContent className="p-4 flex gap-3">
                          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-foreground">
                            <strong>Elementor, Divi o altri builder?</strong> <span className="text-foreground-muted">Usa il widget "HTML Personalizzato" e incolla il codice script.</span>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="webflow-quick" className="mt-4 space-y-4">
                      <CodeBlock code={webflowCode} type="webflow" />
                    </TabsContent>

                    <TabsContent value="shopify-quick" className="mt-4 space-y-4">
                      <CodeBlock code={shopifyCode} type="shopify" />
                    </TabsContent>

                    <TabsContent value="wix-quick" className="mt-4 space-y-4">
                      <CodeBlock code={wixCode} type="wix" />
                    </TabsContent>

                    <TabsContent value="squarespace-quick" className="mt-4 space-y-4">
                      <CodeBlock code={squarespaceCode} type="squarespace" />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>

            {/* SCRIPT TAG - Solo per Bubble */}
            {widget.mode === 'bubble' && (
              <TabsContent value="script" className="space-y-4 mt-0">
              <Card className="border-primary/30 bg-surface-2">
                <CardContent className="p-4 flex gap-3">
                  <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="text-sm text-foreground">
                    <strong>Widget Bubble (Bottone Flottante)</strong>
                    <p className="mt-1 text-foreground-muted">Il widget appare come un bottone flottante in basso a destra della pagina. Quando cliccato, si apre un modale con il form. <strong className="text-foreground">Metodo consigliato</strong> per la maggior parte dei siti.</p>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Codice da Copiare
                </h4>
                <CodeBlock code={bubbleCode} type="script" />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-semibold mb-3">Istruzioni di Installazione</h4>
                <InstructionStep
                  number={1}
                  title="Copia il codice"
                  description="Clicca il pulsante 'Copia' qui sopra per copiare il codice negli appunti"
                />
                <InstructionStep
                  number={2}
                  title="Trova il tag </body>"
                  description={<>Apri il file HTML del tuo sito e cerca il tag di chiusura <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code> (solitamente alla fine del documento)</>}
                />
                <InstructionStep
                  number={3}
                  title="Incolla il codice"
                  description={<>Incolla lo script <strong>subito prima</strong> del tag <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code></>}
                />
                <InstructionStep
                  number={4}
                  title="Salva e pubblica"
                  description="Salva le modifiche e carica il file sul tuo server. Il widget apparirà immediatamente!"
                />
              </div>
              </TabsContent>
            )}

            {/* IFRAME - Solo per Inline */}
            {widget.mode === 'inline' && (
              <TabsContent value="iframe" className="space-y-4 mt-0">
              <Card className="border-accent/30 bg-surface-2">
                <CardContent className="p-4 flex gap-3">
                  <Layout className="w-6 h-6 text-accent flex-shrink-0" />
                  <div className="text-sm text-foreground">
                    <strong>Widget Inline (Incorporato)</strong>
                    <p className="mt-1 text-foreground-muted">Il form di valutazione è incorporato direttamente nella pagina come parte del contenuto. Ideale per pagine di contatto dedicate, landing page o sezioni specifiche del sito dove vuoi massima visibilità.</p>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Codice iFrame
                </h4>
                <CodeBlock code={inlineCode} type="iframe" />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-semibold mb-3">Istruzioni di Utilizzo</h4>
                <InstructionStep
                  number={1}
                  title="Copia il codice iFrame"
                  description="Usa il pulsante 'Copia' per copiare il codice"
                />
                <InstructionStep
                  number={2}
                  title="Scegli la posizione"
                  description="Incolla l'iFrame nella sezione della pagina dove vuoi mostrare il widget"
                />
                <InstructionStep
                  number={3}
                  title="Personalizza dimensioni (opzionale)"
                  description={<>Modifica i parametri <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">width</code> e <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">height</code> secondo le tue esigenze (es: width="800" height="700")</>}
                />
              </div>
              </TabsContent>
            )}

            {/* REACT/NEXT.JS - Solo per Bubble */}
            {widget.mode === 'bubble' && (
              <TabsContent value="react" className="space-y-4 mt-0">
              <Card className="border-primary/30 bg-surface-2">
                <CardContent className="p-4 flex gap-3">
                  <Code2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="text-sm text-foreground">
                    <strong>Per applicazioni React e Next.js</strong> <span className="text-foreground-muted">- Integrazione ottimizzata con lazy loading per performance migliori.</span>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="nextjs" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="nextjs">Next.js (App Router)</TabsTrigger>
                  <TabsTrigger value="react-vite">React (Vite/CRA)</TabsTrigger>
                </TabsList>

                <TabsContent value="nextjs" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Codice per Next.js</h4>
                    <CodeBlock code={nextjsCode} type="nextjs" />
                  </div>

                  <div className="space-y-3">
                    <InstructionStep
                      number={1}
                      title="Apri il layout principale"
                      description={<>Modifica il file <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">app/layout.tsx</code> (o la pagina specifica)</>}
                    />
                    <InstructionStep
                      number={2}
                      title="Importa il componente Script"
                      description="Aggiungi l'import di Script da 'next/script' all'inizio del file"
                    />
                    <InstructionStep
                      number={3}
                      title="Aggiungi lo script"
                      description={<>Inserisci il componente Script con <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">strategy="lazyOnload"</code> per ottimizzare le performance</>}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="react-vite" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Codice per React</h4>
                    <CodeBlock code={reactCode} type="react-vite" />
                  </div>

                  <div className="space-y-3">
                    <InstructionStep
                      number={1}
                      title="Crea il componente"
                      description="Crea un nuovo file DomusReportWidget.tsx con il codice qui sopra"
                    />
                    <InstructionStep
                      number={2}
                      title="Importa nel tuo App"
                      description="Importa e usa il componente nella tua applicazione principale"
                    />
                    <InstructionStep
                      number={3}
                      title="Il widget si attiverà automaticamente"
                      description="Il componente caricherà lo script in modo sicuro con cleanup automatico"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              </TabsContent>
            )}
          </Tabs>

          {/* SEZIONE FOOTER CON INFO E TEST */}
          <div className="mt-8 pt-6 border-t border-border space-y-4">
            {/* Widget ID */}
            <div className="p-4 bg-gradient-to-r from-surface via-surface-2 to-surface rounded-lg border border-border shadow-soft-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">
                    Il tuo Widget ID
                  </p>
                  <p className="text-sm font-mono text-foreground font-semibold">
                    {widget.widgetId}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleCopy(widget.widgetId, 'widgetId')}
                >
                  {copiedType === 'widgetId' ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-xs">Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copia ID</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Test Widget Button */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
              <Link
                href={`/widget/${widget.widgetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="default" className="w-full gap-2 shadow-md" size="lg">
                  <ExternalLink className="w-4 h-4" />
                  Testa il Widget
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Help Notice */}
            <Card className="bg-surface-2 border-success/30">
              <CardContent className="p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-success flex-shrink-0" />
                <div className="text-sm text-foreground">
                  <strong>Hai bisogno di aiuto?</strong> <span className="text-foreground-muted">Consulta le nostre guide dettagliate per ogni piattaforma. Se il widget non appare, verifica di aver incollato il codice prima del tag &lt;/body&gt;.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
