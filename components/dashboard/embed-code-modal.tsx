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
import { Copy, Check, ExternalLink, MessageSquare, Layout } from "lucide-react"
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

  const widgetHost = process.env.NEXT_PUBLIC_APP_URL || 'https://domusreport.mainstream.agency'

  // Bubble embed code
  const bubbleCode = `<!-- DomusReport Widget - ${widget.name} -->
<script
  src="${widgetHost}/widget.js"
  data-widget-id="${widget.widgetId}"
  async>
</script>`

  // Inline iframe code
  const inlineCode = `<!-- DomusReport Widget Inline - ${widget.name} -->
<iframe
  src="${widgetHost}/widget/inline/${widget.widgetId}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="DomusReport Valutazione Immobiliare">
</iframe>`

  // React component code
  const reactCode = `// DomusReport Widget per React
import { useEffect } from 'react';

export function DomusReportWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${widgetHost}/widget.js';
    script.setAttribute('data-widget-id', '${widget.widgetId}');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}`

  // Direct embed code (no iframe)
  const directCode = `<!-- DomusReport Widget Direct Embed -->
<div id="domusreport-widget-container"></div>
<script>
  (function() {
    var container = document.getElementById('domusreport-widget-container');
    var iframe = document.createElement('iframe');
    iframe.src = '${widgetHost}/widget/${widget.widgetId}?embed=direct';
    iframe.style.cssText = 'width: 100%; height: 600px; border: none; border-radius: 8px;';
    iframe.setAttribute('title', 'DomusReport Widget');
    container.appendChild(iframe);
  })();
</script>`

  const handleCopy = async (code: string, type: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  const CodeBlock = ({ code, type }: { code: string; type: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-64">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2 bg-white"
        onClick={() => handleCopy(code, type)}
      >
        {copiedType === type ? (
          <>
            <Check className="w-4 h-4 mr-2 text-green-600" />
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
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {widget.mode === 'bubble' ? (
              <MessageSquare className="w-5 h-5 text-primary" />
            ) : (
              <Layout className="w-5 h-5 text-primary" />
            )}
            Codice Embed - {widget.name}
          </DialogTitle>
          <DialogDescription>
            Copia il codice e incollalo nel tuo sito web
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue={widget.mode === 'bubble' ? 'script' : 'iframe'} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="script">Script Tag</TabsTrigger>
              <TabsTrigger value="iframe">iFrame</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
            </TabsList>

            {/* Script Tag */}
            <TabsContent value="script" className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Codice da copiare</h4>
                <CodeBlock code={bubbleCode} type="script" />
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Istruzioni</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Copia il codice qui sopra</li>
                    <li>Incollalo prima del tag <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> nel tuo HTML</li>
                    <li>Il widget apparirà automaticamente</li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            {/* iFrame */}
            <TabsContent value="iframe" className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Codice iFrame</h4>
                <CodeBlock code={inlineCode} type="iframe" />
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Istruzioni</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Copia il codice qui sopra</li>
                    <li>Incollalo dove vuoi mostrare il widget nella tua pagina</li>
                    <li>Personalizza width e height secondo le tue esigenze</li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            {/* React */}
            <TabsContent value="react" className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Componente React</h4>
                <CodeBlock code={reactCode} type="react" />
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Utilizzo</h4>
                  <pre className="bg-blue-100 p-2 rounded text-sm overflow-x-auto">
                    <code>{`import { DomusReportWidget } from './DomusReportWidget';

function App() {
  return (
    <div>
      <DomusReportWidget />
    </div>
  );
}`}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Widget ID */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Widget ID
                </p>
                <p className="text-sm font-mono text-gray-900 mt-1">
                  {widget.widgetId}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(widget.widgetId, 'widgetId')}
              >
                {copiedType === 'widgetId' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Installation guides */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Guide di Installazione</h4>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/docs/wordpress">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <span className="text-2xl mb-2 block">📘</span>
                    <span className="text-sm font-medium">WordPress</span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/webflow">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <span className="text-2xl mb-2 block">🎨</span>
                    <span className="text-sm font-medium">Webflow</span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/html">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <span className="text-2xl mb-2 block">💻</span>
                    <span className="text-sm font-medium">HTML</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Test button */}
          <div className="mt-6 flex justify-center">
            <Link
              href={`/widget/${widget.widgetId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Testa Widget in Nuova Finestra
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
