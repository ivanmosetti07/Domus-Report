"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Copy, Check, BookOpen } from "lucide-react"

interface WidgetCodeCardProps {
  widgetId: string
}

export function WidgetCodeCard({ widgetId }: WidgetCodeCardProps) {
  const [copied, setCopied] = React.useState(false)

  const widgetCode = `<script src="https://domusreport.mainstream.agency/widget.js"
        data-widget-id="${widgetId}"
        async></script>`

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
