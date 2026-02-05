"use client"

import { WidgetTrigger, WidgetThemeConfig } from "@/components/widget/widget-trigger"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface WidgetConfigData {
  id: string
  widgetId: string
  name: string
  mode: 'bubble' | 'inline'
  isActive: boolean
  themeName: string
  primaryColor: string
  secondaryColor?: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: string
  buttonStyle: string
  bubblePosition: string
  bubbleIcon?: string
  showBadge: boolean
  bubbleAnimation: string
  inlineHeight: string
  showHeader: boolean
  showBorder: boolean
  customCss?: string
  logoUrl?: string
  agencyName?: string
}

/**
 * Embedded Widget Page
 * This page is loaded in an iframe when the widget is embedded on external sites
 * It provides an isolated environment for the widget with minimal styling
 */
export default function WidgetEmbedPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const widgetId = params.widgetId as string
  const embedMode = searchParams.get('embed')

  const [config, setConfig] = useState<WidgetConfigData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWidgetConfig() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch widget configuration from API
        const response = await fetch(`/api/widget-config/public?widgetId=${widgetId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Widget non trovato')
          }
          throw new Error('Errore nel caricamento del widget')
        }

        const data = await response.json()

        if (!data.widgetConfig?.isActive) {
          throw new Error('Widget non attivo')
        }

        setConfig(data.widgetConfig)

        // Notify parent window that widget is loaded
        window.parent.postMessage(
          {
            type: "DOMUS_WIDGET_LOADED",
            widgetId,
          },
          "*"
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setIsLoading(false)
      }
    }

    if (widgetId) {
      fetchWidgetConfig()
    }
  }, [widgetId])

  // Inject custom CSS if present
  useEffect(() => {
    if (config?.customCss) {
      const styleElement = document.createElement('style')
      styleElement.textContent = config.customCss
      document.head.appendChild(styleElement)

      return () => {
        document.head.removeChild(styleElement)
      }
    }
  }, [config?.customCss])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 text-sm">Caricamento widget...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="text-center text-red-600">
          <p className="font-medium">{error}</p>
          <p className="text-sm text-gray-500 mt-1">Verifica l'ID del widget</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return null
  }

  // Convert config to theme
  const theme: WidgetThemeConfig = {
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    backgroundColor: config.backgroundColor,
    textColor: config.textColor,
    fontFamily: config.fontFamily,
    borderRadius: config.borderRadius,
    buttonStyle: config.buttonStyle,
    bubblePosition: config.bubblePosition as 'bottom-right' | 'bottom-left' | 'bottom-center',
    bubbleIcon: config.bubbleIcon,
    showBadge: config.showBadge,
    bubbleAnimation: config.bubbleAnimation as 'pulse' | 'bounce' | 'none',
    logoUrl: config.logoUrl,
    showHeader: config.showHeader,
    showBorder: config.showBorder,
    inlineHeight: config.inlineHeight,
    agencyName: config.agencyName,
  }

  // Determina il mode: usa la configurazione salvata, non il parametro URL
  // Il parametro embedMode è solo per compatibilità con l'iframe interno
  const widgetMode = config.mode || 'bubble'

  return (
    <div
      className="w-full h-full z-50"
      style={{
        backgroundColor: 'transparent',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <WidgetTrigger
        widgetId={widgetId}
        isDemo={false}
        theme={theme}
        mode={widgetMode}
      />
    </div>
  )
}
