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

interface ChatWidgetProps {
  widgetId: string
  mode?: 'bubble' | 'inline'
  isDemo?: boolean
  onClose?: () => void
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

export function ChatWidget({ widgetId, mode = 'bubble', isDemo = false, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = React.useState<MessageType[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<ConversationStep>("welcome")
  const [collectedData, setCollectedData] = React.useState<CollectedData>({})
  const [valuation, setValuation] = React.useState<ValuationResult | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

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

  const calculateValuation = () => {
    addBotMessage("Perfetto! Sto calcolando la valutazione...", "calculating")

    // TODO: Call n8n webhook for real calculation
    // Simulate calculation
    setTimeout(() => {
      const basePrice = 3500 // €/m² base (OMI mock)
      const surface = collectedData.surfaceSqm || 100

      let floorCoeff = 1.0
      if (collectedData.floor !== undefined) {
        if (collectedData.floor <= 1) floorCoeff = 0.95
        else if (collectedData.floor >= 3) floorCoeff = 1.05
        if (collectedData.hasElevator) floorCoeff += 0.03
      }

      let conditionCoeff = 1.0
      switch (collectedData.condition) {
        case PropertyCondition.NEW:
          conditionCoeff = 1.2
          break
        case PropertyCondition.EXCELLENT:
          conditionCoeff = 1.1
          break
        case PropertyCondition.GOOD:
          conditionCoeff = 1.0
          break
        case PropertyCondition.TO_RENOVATE:
          conditionCoeff = 0.85
          break
      }

      const estimatedPrice = Math.round(basePrice * surface * floorCoeff * conditionCoeff)
      const minPrice = Math.round(estimatedPrice * 0.93)
      const maxPrice = Math.round(estimatedPrice * 1.07)

      const result: ValuationResult = {
        minPrice,
        maxPrice,
        estimatedPrice,
        explanation: `Valutazione basata su dati OMI zona ${collectedData.city || 'Milano'}. ${
          floorCoeff !== 1.0 ? `Piano ${collectedData.floor} ${collectedData.hasElevator ? 'con' : 'senza'} ascensore.` : ''
        } Condizioni: ${collectedData.condition}.`
      }

      setValuation(result)
      showValuation(result)
    }, 2500)
  }

  const showValuation = (result: ValuationResult) => {
    // Add valuation as special message
    const valuationMessage: MessageType = {
      id: `msg_${Date.now()}`,
      role: "bot",
      text: `🏠 Ecco la valutazione!\n\nRange: ${formatCurrency(result.minPrice)} - ${formatCurrency(result.maxPrice)}\n\n💰 Stima: ${formatCurrency(result.estimatedPrice)}\n\n${result.explanation}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, valuationMessage])

    setTimeout(() => {
      addBotMessage(
        "Per ricevere il report dettagliato, lasciami i tuoi contatti. Come ti chiami?",
        "valuation"
      )
    }, 1500)
  }

  const completeConversation = () => {
    const firstName = collectedData.firstName || "Amico"
    addBotMessage(
      `Grazie ${firstName}! 🎉 Sarai ricontattato a breve da un nostro consulente.`,
      "completed"
    )

    // TODO: Save lead to database via API
    console.log("Lead data:", { ...collectedData, valuation, widgetId })

    // Close widget after 3 seconds
    if (mode === 'bubble' && onClose) {
      setTimeout(() => {
        onClose()
      }, 3000)
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

  return (
    <div
      className={cn(
        "flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden",
        mode === 'bubble'
          ? "fixed bottom-4 right-4 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] md:w-[400px] md:h-[600px] z-50 animate-slide-up"
          : "w-full h-[600px]"
      )}
    >
      {/* Header */}
      <div className="bg-primary px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Valuta la tua casa</h3>
            <p className="text-xs text-white/70">Ti rispondo in pochi secondi</p>
          </div>
        </div>
        {mode === 'bubble' && onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onQuickReply={handleQuickReply}
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
      <div className="border-t border-gray-200 p-4 bg-white">
        {currentStep === "contacts" && !collectedData.email ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isInputDisabled}
              className="flex-1"
              type="email"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isInputDisabled || !inputValue.trim()}
            >
              <Send className="w-4 h-4" />
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
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isInputDisabled || !inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
