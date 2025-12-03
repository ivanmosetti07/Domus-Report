"use client"

import * as React from "react"
import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

// Lazy load chat widget for better performance
const ChatWidget = React.lazy(() =>
  import("./chat-widget").then((mod) => ({ default: mod.ChatWidget }))
)

interface WidgetTriggerProps {
  widgetId: string
  isDemo?: boolean
}

export function WidgetTrigger({ widgetId, isDemo = false }: WidgetTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hasNotification, setHasNotification] = React.useState(true)

  const handleOpen = () => {
    setIsOpen(true)
    setHasNotification(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center z-50",
          isOpen && "hidden"
        )}
        aria-label="Apri chat"
      >
        <MessageSquare className="w-7 h-7 text-white" />

        {/* Notification Badge */}
        {hasNotification && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">1</span>
          </span>
        )}

        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
      </button>

      {/* Chat Widget - Lazy loaded */}
      {isOpen && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[400px] sm:h-[600px] sm:rounded-lg sm:shadow-2xl z-50 bg-white flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Caricamento...</p>
              </div>
            </div>
          }
        >
          <ChatWidget
            widgetId={widgetId}
            mode="bubble"
            isDemo={isDemo}
            onClose={handleClose}
          />
        </React.Suspense>
      )}
    </>
  )
}
