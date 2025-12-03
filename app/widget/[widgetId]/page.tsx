"use client"

import { WidgetTrigger } from "@/components/widget/widget-trigger"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * Embedded Widget Page
 * This page is loaded in an iframe when the widget is embedded on external sites
 * It provides an isolated environment for the widget with minimal styling
 */
export default function WidgetEmbedPage() {
  const params = useParams()
  const widgetId = params.widgetId as string
  const [isValidWidget, setIsValidWidget] = useState<boolean | null>(null)

  useEffect(() => {
    // Validate widget ID exists
    // In production, this would check against the database
    if (widgetId && widgetId.length > 0) {
      setIsValidWidget(true)
    } else {
      setIsValidWidget(false)
    }

    // Notify parent window that widget is loaded
    window.parent.postMessage(
      {
        type: "DOMUS_WIDGET_LOADED",
        widgetId,
      },
      "*"
    )
  }, [widgetId])

  if (isValidWidget === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Caricamento widget...</div>
      </div>
    )
  }

  if (!isValidWidget) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Widget ID non valido</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      <WidgetTrigger widgetId={widgetId} isDemo={false} />
    </div>
  )
}
