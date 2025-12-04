"use client"

import { ChatWidget, WidgetThemeConfig } from "@/components/widget/chat-widget"
import { useParams } from "next/navigation"
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
}

/**
 * Inline Widget Page
 * This page is loaded in an iframe for inline widget embeds
 * It displays the chat widget directly without the bubble trigger
 */
export default function WidgetInlinePage() {
  const params = useParams()
  const widgetId = params.widgetId as string

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
            mode: 'inline',
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 text-sm">Caricamento widget...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
    showHeader: config.showHeader,
    showBorder: config.showBorder,
    inlineHeight: '100vh', // Full height for iframe embed
    logoUrl: config.logoUrl,
  }

  return (
    <div className="min-h-screen">
      <ChatWidget
        widgetId={widgetId}
        mode="inline"
        isDemo={false}
        theme={theme}
      />
    </div>
  )
}
