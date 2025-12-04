"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Message } from "./message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X, Send, Building2, Loader2 } from "lucide-react"
import { Message as MessageType, PropertyType, PropertyCondition } from "@/types"
import { formatCurrency } from "@/lib/utils"

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
  showHeader?: boolean
  showBorder?: boolean
  inlineHeight?: string
}

interface ChatWidgetProps {
  widgetId: string
  mode?: 'bubble' | 'inline'
  isDemo?: boolean
  onClose?: () => void
  theme?: WidgetThemeConfig
}

type ConversationStep =
  | "welcome"
  | "address"
  | "type"
  | "surface"
  | "floor"
  | "elevator"
  | "condition"
  | "calculating"
  | "valuation"
  | "contacts"
  | "completed"

interface CollectedData {
  address?: string
  city?: string
  type?: PropertyType
  surfaceSqm?: number
  floor?: number
  hasElevator?: boolean
  condition?: PropertyCondition
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

interface ValuationResult {
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  explanation: string
}

export function ChatWidget({ widgetId, mode = 'bubble', isDemo = false, onClose, theme = {} }: ChatWidgetProps) {
  // Theme configuration with defaults
  const {
    primaryColor = '#2563eb',
    secondaryColor,
    backgroundColor = '#ffffff',
    textColor = '#1f2937',
    fontFamily = 'system-ui, -apple-system, sans-serif',
    borderRadius = '8px',
    logoUrl,
    showHeader = true,
    showBorder = true,
    inlineHeight = '600px',
    bubblePosition = 'bottom-right',
  } = theme

  // CSS variables for theming
  const themeStyles: React.CSSProperties = {
    '--widget-primary': primaryColor,
    '--widget-secondary': secondaryColor || primaryColor,
    '--widget-bg': backgroundColor,
    '--widget-text': textColor,
    '--widget-font': fontFamily,
    '--widget-radius': borderRadius,
  } as React.CSSProperties

  const [messages, setMessages] = React.useState<MessageType[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<ConversationStep>("welcome")
  const [collectedData, setCollectedData] = React.useState<CollectedData>({})
  const [valuation, setValuation] = React.useState<ValuationResult | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Tracking: Event batching queue
  const eventQueueRef = React.useRef<Array<{
    widgetId: string
    eventType: string
    leadId?: string
    metadata?: Record<string, any>
  }>>([])
  const batchTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const leadIdRef = React.useRef<string | null>(null)

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Tracking: Funzione per accodare evento (batching)
  const trackEvent = React.useCallback((
    eventType: string,
    metadata?: Record<string, any>
  ) => {
    // Skip tracking per demo widget
    if (isDemo) return

    // Aggiungi evento alla coda
    eventQueueRef.current.push({
      widgetId,
      eventType,
      leadId: leadIdRef.current || undefined,
      metadata,
    })

    // Resetta timer batch
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current)
    }

    // Invia batch dopo 10 secondi
    batchTimerRef.current = setTimeout(() => {
      sendEventBatch()
    }, 10000)
  }, [widgetId, isDemo])

  // Tracking: Invia batch di eventi
  const sendEventBatch = React.useCallback(async () => {
    if (eventQueueRef.current.length === 0) return

    const eventsToSend = [...eventQueueRef.current]
    eventQueueRef.current = [] // Svuota la coda

    try {
      await fetch("/api/widget-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: eventsToSend }),
      })
    } catch (error) {
      console.error("Error sending widget events:", error)
      // Non bloccare l'esperienza utente se il tracking fallisce
    }
  }, [])

  // Tracking: OPEN - quando widget viene montato
  React.useEffect(() => {
    trackEvent("OPEN")

    // Cleanup: invia eventi rimanenti quando componente viene smontato
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current)
      }
      sendEventBatch()
    }
  }, [trackEvent, sendEventBatch])

  // Initialize conversation
  React.useEffect(() => {
    addBotMessage(
      "Ciao! 👋 Ti aiuto a scoprire quanto vale la tua casa. Dove si trova?",
      "welcome"
    )
  }, [])

  const addBotMessage = (text: string, step?: ConversationStep, quickReplies?: MessageType['quickReplies']) => {
    const newMessage: MessageType = {
      id: `msg_${Date.now()}`,
      role: "bot",
      text,
      timestamp: new Date(),
      quickReplies
    }

    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, newMessage])
      setIsTyping(false)
      if (step) setCurrentStep(step)
    }, 800)
  }

  const addUserMessage = (text: string) => {
    const newMessage: MessageType = {
      id: `msg_${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    setInputValue("")
  }

  const handleQuickReply = (value: string, label: string) => {
    addUserMessage(label)
    processInput(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Track MESSAGE event
    trackEvent("MESSAGE", { messageCount: messages.length + 1 })

    addUserMessage(inputValue)
    processInput(inputValue)
  }

  const processInput = (input: string) => {
    switch (currentStep) {
      case "welcome":
        // Extract address
        setCollectedData(prev => ({
          ...prev,
          address: input,
          city: extractCity(input)
        }))
        addBotMessage(
          "Perfetto! Che tipo di immobile è?",
          "type",
          [
            { label: "Appartamento", value: PropertyType.APARTMENT },
            { label: "Villa", value: PropertyType.VILLA },
            { label: "Ufficio", value: PropertyType.OFFICE },
            { label: "Altro", value: PropertyType.OTHER }
          ]
        )
        break

      case "type":
        setCollectedData(prev => ({ ...prev, type: input as PropertyType }))
        addBotMessage("Quanti metri quadri ha?", "surface")
        break

      case "surface":
        const surface = parseInt(input)
        if (isNaN(surface) || surface < 20 || surface > 1000) {
          addBotMessage("Per favore inserisci un numero valido tra 20 e 1000 m²")
          return
        }
        setCollectedData(prev => ({ ...prev, surfaceSqm: surface }))

        // Check if it's apartment or office to ask for floor
        if (collectedData.type === PropertyType.APARTMENT || collectedData.type === PropertyType.OFFICE) {
          addBotMessage("A che piano si trova?", "floor")
        } else {
          askForCondition()
        }
        break

      case "floor":
        const floor = parseInt(input)
        if (isNaN(floor) || floor < 0 || floor > 30) {
          addBotMessage("Per favore inserisci un numero valido tra 0 e 30")
          return
        }
        setCollectedData(prev => ({ ...prev, floor }))
        addBotMessage(
          "C'è l'ascensore?",
          "elevator",
          [
            { label: "Sì", value: "true" },
            { label: "No", value: "false" }
          ]
        )
        break

      case "elevator":
        setCollectedData(prev => ({ ...prev, hasElevator: input === "true" }))
        askForCondition()
        break

      case "condition":
        setCollectedData(prev => ({ ...prev, condition: input as PropertyCondition }))
        calculateValuation()
        break

      case "valuation":
        // Extract name from first input after valuation
        const [firstName, ...lastNameParts] = input.trim().split(" ")
        setCollectedData(prev => ({
          ...prev,
          firstName: firstName || input,
          lastName: lastNameParts.join(" ") || ""
        }))
        addBotMessage("Perfetto! Qual è la tua email?", "contacts")
        break

      case "contacts":
        // Check if it looks like an email
        if (input.includes("@")) {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(input)) {
            addBotMessage("L'email non sembra valida. Puoi inserirla di nuovo?")
            return
          }
          setCollectedData(prev => ({ ...prev, email: input }))
          addBotMessage("Ottimo! Vuoi lasciare anche un numero di telefono? (Opzionale - scrivi 'no' per saltare)")
        } else {
          // It's a phone number or "no"
          if (input.toLowerCase() !== "no") {
            setCollectedData(prev => ({ ...prev, phone: input }))
          }
          completeConversation()
        }
        break
    }
  }

  const extractCity = (address: string): string => {
    // Simple extraction - take last word
    const parts = address.split(",")
    return parts[parts.length - 1]?.trim() || "Milano"
  }

  const askForCondition = () => {
    addBotMessage(
      "In che stato è l'immobile?",
      "condition",
      [
        { label: "Nuovo", value: PropertyCondition.NEW },
        { label: "Ottimo", value: PropertyCondition.EXCELLENT },
        { label: "Buono", value: PropertyCondition.GOOD },
        { label: "Da ristrutturare", value: PropertyCondition.TO_RENOVATE }
      ]
    )
  }

  const calculateValuation = async () => {
    addBotMessage("Perfetto! Sto calcolando la valutazione... ⏳", "calculating")

    try {
      // Call valuation API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: collectedData.address || "",
          city: collectedData.city || "Milano",
          propertyType: collectedData.type || PropertyType.APARTMENT,
          surfaceSqm: collectedData.surfaceSqm || 100,
          floor: collectedData.floor,
          hasElevator: collectedData.hasElevator,
          condition: collectedData.condition || PropertyCondition.GOOD,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Errore nel calcolo della valutazione")
      }

      const data = await response.json()

      if (!data.success || !data.valuation) {
        throw new Error("Dati di valutazione non validi")
      }

      const result: ValuationResult = {
        minPrice: data.valuation.minPrice,
        maxPrice: data.valuation.maxPrice,
        estimatedPrice: data.valuation.estimatedPrice,
        explanation: data.valuation.explanation,
      }

      setValuation(result)
      showValuation(result)
    } catch (error) {
      console.error("Valuation error:", error)

      if (error instanceof Error && error.name === 'AbortError') {
        addBotMessage(
          "Mi dispiace, il calcolo sta richiedendo più tempo del previsto. Riprova tra un momento.",
          "condition"
        )
      } else {
        addBotMessage(
          "Mi dispiace, si è verificato un errore nel calcolo. Riprova tra qualche minuto.",
          "condition"
        )
      }
    }
  }

  const showValuation = (result: ValuationResult) => {
    // Track VALUATION_VIEW event
    trackEvent("VALUATION_VIEW", {
      estimatedPrice: result.estimatedPrice,
      minPrice: result.minPrice,
      maxPrice: result.maxPrice,
    })

    // Add valuation as special message
    const valuationMessage: MessageType = {
      id: `msg_${Date.now()}`,
      role: "bot",
      text: `🏠 Ecco la valutazione!\n\nRange: ${formatCurrency(result.minPrice)} - ${formatCurrency(result.maxPrice)}\n\n💰 Stima: ${formatCurrency(result.estimatedPrice)}\n\n${result.explanation}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, valuationMessage])

    setTimeout(() => {
      // Track CONTACT_FORM_START event
      trackEvent("CONTACT_FORM_START")

      addBotMessage(
        "Per ricevere il report dettagliato, lasciami i tuoi contatti. Come ti chiami?",
        "valuation"
      )
    }, 1500)
  }

  const completeConversation = async () => {
    const firstName = collectedData.firstName || "Amico"

    // Show loading message
    addBotMessage("Sto salvando i tuoi dati... ⏳", "completed")

    try {
      // Determina l'endpoint in base a se è demo o no
      const endpoint = isDemo ? "/api/demo-leads" : "/api/leads"

      // Prepara il payload base
      const basePayload = {
        // Lead data
        firstName: collectedData.firstName,
        lastName: collectedData.lastName,
        email: collectedData.email,
        phone: collectedData.phone,
        // Property data
        address: collectedData.address,
        city: collectedData.city,
        type: collectedData.type,
        surfaceSqm: collectedData.surfaceSqm,
        floor: collectedData.floor,
        hasElevator: collectedData.hasElevator,
        condition: collectedData.condition,
        // Valuation data
        minPrice: valuation?.minPrice || 0,
        maxPrice: valuation?.maxPrice || 0,
        estimatedPrice: valuation?.estimatedPrice || 0,
        // Conversation
        messages: messages.map((msg) => ({
          role: msg.role,
          text: msg.text,
          timestamp: msg.timestamp,
        })),
      }

      // Aggiungi widgetId e dati extra solo per lead reali
      const payload = isDemo
        ? basePayload
        : {
            ...basePayload,
            widgetId,
            baseOMIValue: 0, // Will be calculated by API
            floorCoefficient: 1.0,
            conditionCoefficient: 1.0,
            explanation: valuation?.explanation || "",
          }

      // Save lead to database with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Handle rate limit
        if (response.status === 429) {
          addBotMessage(
            `Mi dispiace ${firstName}, hai raggiunto il limite di richieste giornaliere. Riprova domani.`,
            "completed"
          )
          return
        }

        throw new Error(errorData.error || "Errore nel salvataggio del lead")
      }

      // Salva leadId dal response per tracking futuro
      const responseData = await response.json()
      if (responseData.lead?.id) {
        leadIdRef.current = responseData.lead.id
      }

      // Track CONTACT_FORM_SUBMIT event
      trackEvent("CONTACT_FORM_SUBMIT", {
        hasPhone: !!collectedData.phone,
        propertyType: collectedData.type,
        estimatedPrice: valuation?.estimatedPrice,
      })

      // Messaggio diverso per demo vs reale
      const successMessage = isDemo
        ? `Grazie ${firstName}! 🎉 Questa è una demo. Per ricevere lead reali, registrati gratuitamente!`
        : `Grazie ${firstName}! 🎉 Sarai ricontattato a breve da un nostro consulente.`

      addBotMessage(successMessage, "completed")

      // Close widget after 3 seconds
      if (mode === 'bubble' && onClose) {
        setTimeout(() => {
          onClose()
        }, 3000)
      }
    } catch (error) {
      console.error("Error saving lead:", error)

      if (error instanceof Error && error.name === 'AbortError') {
        addBotMessage(
          `Mi dispiace ${firstName}, il salvataggio sta richiedendo più tempo del previsto. I tuoi dati sono stati ricevuti.`,
          "completed"
        )
      } else {
        addBotMessage(
          `Grazie ${firstName}! Abbiamo ricevuto i tuoi dati e ti ricontatteremo presto.`,
          "completed"
        )
      }

      // Close widget anyway
      if (mode === 'bubble' && onClose) {
        setTimeout(() => {
          onClose()
        }, 3000)
      }
    }
  }

  const getPlaceholder = (): string => {
    switch (currentStep) {
      case "welcome":
        return "es. Via Roma 15, Milano"
      case "type":
        return "Seleziona o scrivi il tipo..."
      case "surface":
        return "es. 85"
      case "floor":
        return "es. 3"
      case "elevator":
        return "Sì o No"
      case "condition":
        return "Seleziona o scrivi..."
      case "valuation":
        return "Il tuo nome e cognome"
      case "contacts":
        return "La tua email o telefono"
      case "completed":
        return "Conversazione completata"
      default:
        return "Scrivi qui..."
    }
  }

  const isInputDisabled = currentStep === "calculating" || currentStep === "completed" || isTyping

  // Position class for bubble mode
  const bubblePositionClass = bubblePosition === 'bottom-left' ? 'sm:left-4' : 'sm:right-4'

  // Gradient background for header
  const headerGradient = secondaryColor
    ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
    : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden",
        mode === 'bubble'
          ? `fixed inset-0 sm:inset-auto sm:bottom-4 ${bubblePositionClass} sm:w-[400px] sm:h-[600px] sm:rounded-lg sm:shadow-2xl sm:max-w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-2rem)] z-50 animate-fade-in`
          : `w-full rounded-lg ${showBorder ? 'shadow-2xl border border-gray-200' : ''}`
      )}
      style={{
        ...themeStyles,
        backgroundColor,
        fontFamily,
        height: mode === 'inline' ? inlineHeight : undefined,
      }}
    >
      {/* Header */}
      {(mode === 'bubble' || showHeader) && (
        <div
          className="px-4 py-4 sm:py-3 flex items-center justify-between"
          style={{ background: headerGradient }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: backgroundColor }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-6 h-6 sm:w-5 sm:h-5 object-contain" />
              ) : (
                <Building2 className="w-5 h-5 sm:w-4 sm:h-4" style={{ color: primaryColor }} />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold text-base sm:text-sm">Valuta la tua casa</h3>
              <p className="text-xs text-white/70">Ti rispondo in pochi secondi</p>
            </div>
          </div>
          {mode === 'bubble' && onClose && (
            <button
              onClick={() => {
                // Track CLOSE event
                trackEvent("CLOSE", { step: currentStep })
                // Invia subito gli eventi rimanenti
                sendEventBatch()
                // Chiudi widget
                onClose()
              }}
              className="text-white hover:text-white/80 transition-colors p-2 sm:p-1 -mr-2 sm:-mr-1"
              aria-label="Chiudi chat"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundColor: backgroundColor === '#ffffff' ? '#f9fafb' : `${backgroundColor}f5`,
        }}
      >
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onQuickReply={handleQuickReply}
            primaryColor={primaryColor}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              <span className="text-sm text-gray-600">Sto scrivendo...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="border-t border-gray-200 p-4"
        style={{ backgroundColor }}
      >
        {currentStep === "contacts" && !collectedData.email ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isInputDisabled}
              className="flex-1 h-11 sm:h-10"
              type="email"
              style={{ borderColor: primaryColor }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isInputDisabled || !inputValue.trim()}
              className="h-11 w-11 sm:h-10 sm:w-10"
              style={{ backgroundColor: primaryColor }}
              aria-label="Invia messaggio"
            >
              <Send className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isInputDisabled}
              className="flex-1 h-11 sm:h-10"
              style={{ borderColor: `${primaryColor}40` }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isInputDisabled || !inputValue.trim()}
              className="h-11 w-11 sm:h-10 sm:w-10"
              style={{ backgroundColor: primaryColor }}
              aria-label="Invia messaggio"
            >
              <Send className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
