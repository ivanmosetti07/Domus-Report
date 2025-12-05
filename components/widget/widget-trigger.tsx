"use client"

import * as React from "react"
import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

// Lazy load chat widget for better performance
const ChatWidget = React.lazy(() =>
  import("./chat-widget").then((mod) => ({ default: mod.ChatWidget }))
)

export interface WidgetThemeConfig {
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
  borderRadius?: string
  buttonStyle?: string
  bubblePosition?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  bubbleIcon?: string
  showBadge?: boolean
  bubbleAnimation?: 'pulse' | 'bounce' | 'none'
  logoUrl?: string
}

interface WidgetTriggerProps {
  widgetId: string
  isDemo?: boolean
  theme?: WidgetThemeConfig
}

export function WidgetTrigger({
  widgetId,
  isDemo = false,
  theme = {},
}: WidgetTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hasNotification, setHasNotification] = React.useState(true)

  // Notify parent when widget loads
  React.useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'DOMUS_WIDGET_LOADED',
        widgetId
      }, '*')
    }
  }, [widgetId])

  // Theme defaults
  const {
    primaryColor = '#2563eb',
    secondaryColor,
    bubblePosition = 'bottom-right',
    showBadge = true,
    bubbleAnimation = 'pulse',
    bubbleIcon,
  } = theme

  const handleOpen = () => {
    setIsOpen(true)
    setHasNotification(false)

    // Notify parent window that widget is open
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'DOMUS_WIDGET_OPEN',
        widgetId
      }, '*')
    }
  }

  const handleClose = () => {
    setIsOpen(false)

    // Notify parent window that widget is closed
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'DOMUS_WIDGET_CLOSE',
        widgetId
      }, '*')
    }
  }

  // Position classes based on bubblePosition
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  }

  // Animation classes
  const getAnimationClasses = () => {
    switch (bubbleAnimation) {
      case 'bounce':
        return 'animate-bounce'
      case 'pulse':
        return ''
      default:
        return ''
    }
  }

  // Gradient background
  const gradientBackground = secondaryColor
    ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
    : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center z-50",
          positionClasses[bubblePosition],
          getAnimationClasses(),
          isOpen && "hidden"
        )}
        style={{ background: gradientBackground }}
        aria-label="Apri chat"
      >
        {bubbleIcon ? (
          <img
            src={bubbleIcon}
            alt="Chat"
            className="w-8 h-8 object-contain"
          />
        ) : (
          <MessageSquare className="w-7 h-7 text-white" />
        )}

        {/* Notification Badge */}
        {showBadge && hasNotification && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">1</span>
          </span>
        )}

        {/* Pulse Animation Ring */}
        {bubbleAnimation === 'pulse' && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: primaryColor }}
          />
        )}
      </button>

      {/* Chat Widget - Lazy loaded */}
      {isOpen && (
        <React.Suspense
          fallback={
            <div
              className={cn(
                "fixed w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-50 pointer-events-none",
                positionClasses[bubblePosition]
              )}
              style={{ background: gradientBackground }}
            >
              <div
                className="w-6 h-6 border-3 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'white', borderTopColor: 'transparent', borderWidth: '3px' }}
              />
            </div>
          }
        >
          <ChatWidget
            widgetId={widgetId}
            mode="bubble"
            isDemo={isDemo}
            onClose={handleClose}
            theme={theme}
          />
        </React.Suspense>
      )}
    </>
  )
}
