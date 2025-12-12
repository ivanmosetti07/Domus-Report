"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Message } from "./message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Building2, Loader2 } from "lucide-react"
import { Message as MessageType, PropertyType, PropertyCondition, FloorType, OutdoorSpace, HeatingType, EnergyClass, OccupancyStatus } from "@/types"
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
  | "neighborhood"
  | "type"
  | "surface"
  | "rooms"
  | "bathrooms"
  | "floor_and_elevator"
  | "outdoor_space"
  | "parking"
  | "condition"
  | "heating"
  | "air_conditioning"
  | "energy_class"
  | "build_year"
  | "occupancy"
  | "occupancy_end_date"
  | "contacts_name"
  | "contacts_email"
  | "contacts_phone"
  | "calculating"
  | "valuation"
  | "completed"
  | "ask_restart"

interface CollectedData {
  address?: string
  city?: string
  neighborhood?: string
  type?: PropertyType
  surfaceSqm?: number
  rooms?: number
  bathrooms?: number
  floor?: number
  hasElevator?: boolean
  floorType?: FloorType
  outdoorSpace?: OutdoorSpace
  hasParking?: boolean
  condition?: PropertyCondition
  heatingType?: HeatingType
  hasAirConditioning?: boolean
  energyClass?: EnergyClass
  buildYear?: number
  occupancyStatus?: OccupancyStatus
  occupancyEndDate?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

interface ValuationResult {
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  baseOMIValue: number
  floorCoefficient: number
  conditionCoefficient: number
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

  // Chiave per localStorage (unica per widget)
  const storageKey = `domus-chat-${widgetId}`

  const [messages, setMessages] = React.useState<MessageType[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<ConversationStep>("welcome")
  const [collectedData, setCollectedData] = React.useState<CollectedData>({})
  const [valuation, setValuation] = React.useState<ValuationResult | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Tracking: Event batching queue
  const eventQueueRef = React.useRef<Array<{
    widgetId: string
    eventType: string
    leadId?: string
    metadata?: Record<string, any>
  }>>([])
  const batchTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const leadIdRef = React.useRef<string | null>(null)

  // Auto-scroll interno alla chat (non influenza l'embed esterno)
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
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

  // Load persisted chat state on mount
  React.useEffect(() => {
    if (isDemo) {
      // No persistence for demo
      initializeConversation()
      return
    }

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)

        // Restore state
        if (parsed.messages && Array.isArray(parsed.messages)) {
          setMessages(parsed.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })))
        }

        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep)
        }

        if (parsed.collectedData) {
          setCollectedData(parsed.collectedData)
        }

        if (parsed.valuation) {
          setValuation(parsed.valuation)
        }

        setIsInitialized(true)
      } else {
        // First time - initialize conversation
        initializeConversation()
      }
    } catch (error) {
      console.error('Error loading chat state:', error)
      initializeConversation()
    }
  }, [])

  // Initialize conversation
  const initializeConversation = () => {
    addBotMessage(
      "Ciao! 👋 Ti aiuto a scoprire quanto vale la tua casa. Dove si trova?",
      "welcome"
    )
    setIsInitialized(true)
  }

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    if (!isInitialized || isDemo) return

    try {
      const stateToSave = {
        messages,
        currentStep,
        collectedData,
        valuation,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(storageKey, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Error saving chat state:', error)
    }
  }, [messages, currentStep, collectedData, valuation, isInitialized, isDemo, storageKey])

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
        addBotMessage("Ottimo! In che quartiere/zona si trova? (Se possibile, indica anche via e numero)", "neighborhood")
        break

      case "neighborhood":
        setCollectedData(prev => ({ ...prev, neighborhood: input }))
        addBotMessage(
          "Che tipo di immobile è?",
          "type",
          [
            { label: "Appartamento", value: PropertyType.APARTMENT },
            { label: "Attico", value: PropertyType.ATTICO },
            { label: "Villa", value: PropertyType.VILLA },
            { label: "Ufficio", value: PropertyType.OFFICE },
            { label: "Negozio", value: PropertyType.SHOP },
            { label: "Box", value: PropertyType.BOX },
            { label: "Terreno", value: PropertyType.LAND },
            { label: "Altro", value: PropertyType.OTHER }
          ]
        )
        break

      case "type":
        setCollectedData(prev => ({ ...prev, type: input as PropertyType }))
        addBotMessage("Quanti metri quadri ha? (Mq commerciali o indicativi)", "surface")
        break

      case "surface":
        const surface = parseInt(input)
        if (isNaN(surface) || surface < 10 || surface > 10000) {
          addBotMessage("Per favore inserisci un numero valido tra 10 e 10000 m²")
          return
        }
        setCollectedData(prev => ({ ...prev, surfaceSqm: surface }))

        // Ask for rooms if it's a residential property
        if ([PropertyType.APARTMENT, PropertyType.ATTICO, PropertyType.VILLA].includes(collectedData.type as PropertyType)) {
          addBotMessage("Quanti locali/vani ha? (es. 2, 3, 4, 5+)", "rooms")
        } else {
          // Skip to floor for offices/shops or to condition for other types
          askForFloorOrSkip()
        }
        break

      case "rooms":
        const rooms = parseInt(input.replace('+', ''))
        if (isNaN(rooms) || rooms < 1 || rooms > 20) {
          addBotMessage("Per favore inserisci un numero valido (1-20)")
          return
        }
        setCollectedData(prev => ({ ...prev, rooms }))
        addBotMessage(
          "Quanti bagni ha?",
          "bathrooms",
          [
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "3+", value: "3" }
          ]
        )
        break

      case "bathrooms":
        const bathrooms = parseInt(input.replace('+', ''))
        if (isNaN(bathrooms) || bathrooms < 0 || bathrooms > 10) {
          addBotMessage("Per favore inserisci un numero valido (0-10)")
          return
        }
        setCollectedData(prev => ({ ...prev, bathrooms }))
        askForFloorOrSkip()
        break

      case "floor_and_elevator":
        setCollectedData(prev => ({ ...prev, floorType: input as FloorType }))

        // Extract floor number and elevator from FloorType
        if (input.includes("Terra")) {
          setCollectedData(prev => ({ ...prev, floor: 0, hasElevator: false }))
        } else if (input.includes("1-2")) {
          setCollectedData(prev => ({ ...prev, floor: 1, hasElevator: input.includes("con") }))
        } else if (input.includes("3+")) {
          setCollectedData(prev => ({ ...prev, floor: 3, hasElevator: input.includes("con") }))
        } else if (input.includes("Ultimo")) {
          setCollectedData(prev => ({ ...prev, floor: 5, hasElevator: input.includes("con") }))
        }

        addBotMessage(
          "Ha spazi esterni?",
          "outdoor_space",
          [
            { label: "Nessuno", value: OutdoorSpace.NONE },
            { label: "Balcone", value: OutdoorSpace.BALCONY },
            { label: "Terrazzo", value: OutdoorSpace.TERRACE },
            { label: "Giardino", value: OutdoorSpace.GARDEN }
          ]
        )
        break

      case "outdoor_space":
        setCollectedData(prev => ({ ...prev, outdoorSpace: input as OutdoorSpace }))
        addBotMessage(
          "Ha box o posto auto?",
          "parking",
          [
            { label: "Sì", value: "true" },
            { label: "No", value: "false" }
          ]
        )
        break

      case "parking":
        setCollectedData(prev => ({ ...prev, hasParking: input === "true" }))
        askForCondition()
        break

      case "condition":
        setCollectedData(prev => ({ ...prev, condition: input as PropertyCondition }))
        addBotMessage(
          "Che tipo di riscaldamento ha?",
          "heating",
          [
            { label: "Autonomo", value: HeatingType.AUTONOMOUS },
            { label: "Centralizzato", value: HeatingType.CENTRALIZED },
            { label: "Assente", value: HeatingType.NONE }
          ]
        )
        break

      case "heating":
        setCollectedData(prev => ({ ...prev, heatingType: input as HeatingType }))
        addBotMessage(
          "Ha l'aria condizionata?",
          "air_conditioning",
          [
            { label: "Sì", value: "true" },
            { label: "No", value: "false" }
          ]
        )
        break

      case "air_conditioning":
        setCollectedData(prev => ({ ...prev, hasAirConditioning: input === "true" }))
        addBotMessage(
          "Conosci la classe energetica (APE)?",
          "energy_class",
          [
            { label: "A", value: EnergyClass.A },
            { label: "B", value: EnergyClass.B },
            { label: "C", value: EnergyClass.C },
            { label: "D", value: EnergyClass.D },
            { label: "E", value: EnergyClass.E },
            { label: "F", value: EnergyClass.F },
            { label: "G", value: EnergyClass.G },
            { label: "Non disponibile", value: EnergyClass.NOT_AVAILABLE },
            { label: "Non so", value: EnergyClass.UNKNOWN }
          ]
        )
        break

      case "energy_class":
        setCollectedData(prev => ({ ...prev, energyClass: input as EnergyClass }))
        addBotMessage("Conosci l'anno di costruzione? (Scrivi l'anno o 'non so')", "build_year")
        break

      case "build_year":
        if (input.toLowerCase() === "non so" || input.toLowerCase() === "no") {
          setCollectedData(prev => ({ ...prev, buildYear: undefined }))
        } else {
          const year = parseInt(input)
          if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
            addBotMessage(`Per favore inserisci un anno valido (1800-${new Date().getFullYear()}) o scrivi 'non so'`)
            return
          }
          setCollectedData(prev => ({ ...prev, buildYear: year }))
        }
        addBotMessage(
          "L'immobile è libero o occupato?",
          "occupancy",
          [
            { label: "Libero", value: OccupancyStatus.FREE },
            { label: "Occupato", value: OccupancyStatus.OCCUPIED }
          ]
        )
        break

      case "occupancy":
        setCollectedData(prev => ({ ...prev, occupancyStatus: input as OccupancyStatus }))

        if (input === OccupancyStatus.OCCUPIED) {
          addBotMessage("Quando scade il contratto? (es. 31/12/2025 o scrivi 'non so')", "occupancy_end_date")
        } else {
          // Chiedi contatti PRIMA della valutazione
          addBotMessage("Perfetto! Per inviarti la valutazione, come ti chiami?", "contacts_name")
        }
        break

      case "occupancy_end_date":
        if (input.toLowerCase() !== "non so" && input.toLowerCase() !== "no") {
          setCollectedData(prev => ({ ...prev, occupancyEndDate: input }))
        }
        // Chiedi contatti PRIMA della valutazione
        addBotMessage("Perfetto! Per inviarti la valutazione, come ti chiami?", "contacts_name")
        break

      case "contacts_name":
        const [firstName, ...lastNameParts] = input.trim().split(" ")
        setCollectedData(prev => ({
          ...prev,
          firstName: firstName || input,
          lastName: lastNameParts.join(" ") || ""
        }))
        addBotMessage("Qual è la tua email?", "contacts_email")
        break

      case "contacts_email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(input)) {
          addBotMessage("L'email non sembra valida. Puoi inserirla di nuovo?")
          return
        }
        setCollectedData(prev => ({ ...prev, email: input }))
        addBotMessage("Qual è il tuo numero di telefono?", "contacts_phone")
        break

      case "contacts_phone":
        const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
        const sanitizedPhone = input.replace(/\s/g, "")

        if (!phoneRegex.test(sanitizedPhone)) {
          addBotMessage("Il numero di telefono non sembra valido. Inserisci un numero italiano valido.")
          return
        }

        setCollectedData(prev => ({ ...prev, phone: sanitizedPhone }))
        // DOPO aver raccolto i contatti, calcola la valutazione
        calculateValuation()
        break

      case "ask_restart":
        if (input === "restart") {
          addUserMessage("Sì, rifai valutazione")
          addBotMessage("Perfetto! Ricominciamo da capo. 🔄")
          resetConversation()
        } else {
          addUserMessage("No, grazie")
          addBotMessage("Grazie per aver usato il nostro servizio! A presto! 👋")
          // Opzionalmente chiudi il widget dopo qualche secondo se è in modalità bubble
          if (mode === 'bubble' && onClose) {
            setTimeout(() => {
              onClose()
            }, 3000)
          }
        }
        break
    }
  }

  const askForFloorOrSkip = () => {
    // Ask for floor only for apartments, attics, offices, shops
    const type = collectedData.type
    if ([PropertyType.APARTMENT, PropertyType.ATTICO, PropertyType.OFFICE, PropertyType.SHOP].includes(type as PropertyType)) {
      addBotMessage(
        "A che piano si trova e c'è l'ascensore?",
        "floor_and_elevator",
        [
          { label: "Terra (senza ascensore)", value: FloorType.GROUND_NO_ELEVATOR },
          { label: "1-2 senza ascensore", value: FloorType.FLOOR_1_2_NO_ELEVATOR },
          { label: "1-2 con ascensore", value: FloorType.FLOOR_1_2_WITH_ELEVATOR },
          { label: "3+ senza ascensore", value: FloorType.FLOOR_3_PLUS_NO_ELEVATOR },
          { label: "3+ con ascensore", value: FloorType.FLOOR_3_PLUS_WITH_ELEVATOR },
          { label: "Ultimo piano (senza ascensore)", value: FloorType.TOP_FLOOR_NO_ELEVATOR },
          { label: "Ultimo piano (con ascensore)", value: FloorType.TOP_FLOOR_WITH_ELEVATOR }
        ]
      )
    } else {
      // Skip floor question for villas, boxes, lands
      addBotMessage(
        "Ha spazi esterni?",
        "outdoor_space",
        [
          { label: "Nessuno", value: OutdoorSpace.NONE },
          { label: "Balcone", value: OutdoorSpace.BALCONY },
          { label: "Terrazzo", value: OutdoorSpace.TERRACE },
          { label: "Giardino", value: OutdoorSpace.GARDEN }
        ]
      )
    }
  }

  const extractCity = (address: string): string => {
    // Extract city from address, removing postal codes and numbers
    const parts = address.split(",")
    const lastPart = parts[parts.length - 1]?.trim() || "Milano"

    // Remove postal code (5 digits) if present
    // Es: "20100 Milano" → "Milano"
    const withoutPostalCode = lastPart.replace(/^\d{5}\s*/, '')

    // Remove any remaining numbers at the start
    // Es: "123 Roma" → "Roma"
    const cityName = withoutPostalCode.replace(/^\d+\s*/, '').trim()

    // If nothing left or too short, use default
    return cityName.length >= 2 ? cityName : "Milano"
  }

  const askForCondition = () => {
    addBotMessage(
      "In che stato è l'immobile?",
      "condition",
      [
        { label: "Nuovo", value: PropertyCondition.NEW },
        { label: "Ristrutturato", value: PropertyCondition.RENOVATED },
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
        baseOMIValue: data.valuation.baseOMIValue,
        floorCoefficient: data.valuation.floorCoefficient,
        conditionCoefficient: data.valuation.conditionCoefficient,
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

    // Salva il lead subito dopo aver mostrato la valutazione
    // Passa il result direttamente invece di usare lo stato
    setTimeout(() => {
      completeConversation(result)
    }, 1500)
  }


  const completeConversation = async (valuationResult?: ValuationResult) => {
    const firstName = collectedData.firstName || "Amico"

    // Use passed result or fall back to state
    const finalValuation = valuationResult || valuation

    // Show loading message
    addBotMessage("Sto salvando i tuoi dati... ⏳", "completed")

    try {
      // Determina l'endpoint in base a se è demo o no
      const endpoint = isDemo ? "/api/demo-leads" : "/api/leads"

      // Log dei dati raccolti PRIMA di inviarli
      console.log('[ChatWidget] Phone data before sending:', {
        phone: collectedData.phone,
        phoneType: typeof collectedData.phone,
        phoneIsUndefined: collectedData.phone === undefined,
        phoneValue: JSON.stringify(collectedData.phone)
      })

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
        neighborhood: collectedData.neighborhood,
        type: collectedData.type,
        surfaceSqm: collectedData.surfaceSqm,
        rooms: collectedData.rooms,
        bathrooms: collectedData.bathrooms,
        floor: collectedData.floor,
        hasElevator: collectedData.hasElevator,
        floorType: collectedData.floorType,
        outdoorSpace: collectedData.outdoorSpace,
        hasParking: collectedData.hasParking,
        condition: collectedData.condition,
        heatingType: collectedData.heatingType,
        hasAirConditioning: collectedData.hasAirConditioning,
        energyClass: collectedData.energyClass,
        buildYear: collectedData.buildYear,
        occupancyStatus: collectedData.occupancyStatus,
        occupancyEndDate: collectedData.occupancyEndDate,
        // Valuation data
        minPrice: finalValuation?.minPrice || 0,
        maxPrice: finalValuation?.maxPrice || 0,
        estimatedPrice: finalValuation?.estimatedPrice || 0,
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
            baseOMIValue: finalValuation?.baseOMIValue || 0,
            floorCoefficient: finalValuation?.floorCoefficient || 1.0,
            conditionCoefficient: finalValuation?.conditionCoefficient || 1.0,
            explanation: finalValuation?.explanation || "",
          }

      // Save lead to database with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      console.log('[ChatWidget] Sending lead to API:', {
        endpoint,
        widgetId: isDemo ? 'DEMO' : widgetId,
        hasPhone: !!payload.phone,
        email: payload.email,
        hasValuation: !!finalValuation,
        valuationData: finalValuation ? {
          baseOMIValue: finalValuation.baseOMIValue,
          floorCoefficient: finalValuation.floorCoefficient,
          conditionCoefficient: finalValuation.conditionCoefficient,
          estimatedPrice: finalValuation.estimatedPrice
        } : null,
        timestamp: new Date().toISOString()
      })

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('[ChatWidget] API Response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        console.error('[ChatWidget] API Error:', {
          status: response.status,
          errorData,
          payload: { ...payload, messages: `[${payload.messages?.length || 0} messages]` }
        })

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
        estimatedPrice: finalValuation?.estimatedPrice,
      })

      // Messaggio diverso per demo vs reale
      const successMessage = isDemo
        ? `Grazie ${firstName}! 🎉 Questa è una demo. Per ricevere lead reali, registrati gratuitamente!`
        : `Grazie ${firstName}! 🎉 Il report dettagliato ti è stato inviato via email. Sarai ricontattato a breve da un nostro consulente.`

      addBotMessage(successMessage, "completed")

      // Ask if user wants to restart instead of closing
      setTimeout(() => {
        addBotMessage(
          "Vuoi fare una nuova valutazione?",
          "ask_restart",
          [
            { label: "Sì, rifai valutazione", value: "restart" },
            { label: "No, grazie", value: "done" }
          ]
        )
      }, 2000)
    } catch (error) {
      console.error('[ChatWidget] CRITICAL ERROR saving lead:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        widgetId,
        isDemo,
        hasEmail: !!collectedData.email,
        hasValuation: !!finalValuation,
        timestamp: new Date().toISOString()
      })

      if (error instanceof Error && error.name === 'AbortError') {
        addBotMessage(
          `Mi dispiace ${firstName}, il salvataggio sta richiedendo più tempo del previsto. Riprova per favore.`,
          "completed"
        )
      } else {
        // Mostra errore reale all'utente
        const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto"
        addBotMessage(
          `Si è verificato un errore: ${errorMessage}. Riprova o contattaci direttamente.`,
          "completed"
        )
      }

      // Ask if user wants to restart even on error
      setTimeout(() => {
        addBotMessage(
          "Vuoi riprovare con una nuova valutazione?",
          "ask_restart",
          [
            { label: "Sì, riprova", value: "restart" },
            { label: "No, grazie", value: "done" }
          ]
        )
      }, 2000)
    }
  }

  // Reset conversation to start over
  const resetConversation = () => {
    // Clear state
    setMessages([])
    setCollectedData({})
    setValuation(null)
    setCurrentStep("welcome")
    setInputValue("")

    // Clear localStorage
    if (!isDemo) {
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.error('Error clearing chat state:', error)
      }
    }

    // Re-initialize
    setTimeout(() => {
      initializeConversation()
    }, 500)
  }

  const getPlaceholder = (): string => {
    switch (currentStep) {
      case "welcome":
        return "es. Milano"
      case "neighborhood":
        return "es. Centro, Via Roma 15"
      case "type":
        return "Seleziona il tipo..."
      case "surface":
        return "es. 85"
      case "rooms":
        return "es. 3"
      case "bathrooms":
        return "es. 2"
      case "floor_and_elevator":
        return "Seleziona..."
      case "outdoor_space":
        return "Seleziona..."
      case "parking":
        return "Sì o No"
      case "condition":
        return "Seleziona..."
      case "heating":
        return "Seleziona..."
      case "air_conditioning":
        return "Sì o No"
      case "energy_class":
        return "Seleziona..."
      case "build_year":
        return "es. 1995 o 'non so'"
      case "occupancy":
        return "Seleziona..."
      case "occupancy_end_date":
        return "es. 31/12/2025"
      case "contacts_name":
        return "Nome e cognome"
      case "contacts_email":
        return "tua@email.com"
      case "contacts_phone":
        return "es. 3331234567"
      case "completed":
        return "Conversazione completata"
      case "ask_restart":
        return "Scegli un'opzione..."
      default:
        return "Scrivi qui..."
    }
  }

  const isInputDisabled = currentStep === "calculating" || currentStep === "completed" || currentStep === "ask_restart" || isTyping

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
        {currentStep === "contacts_email" ? (
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
        ) : currentStep === "contacts_phone" ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isInputDisabled}
              className="flex-1 h-11 sm:h-10"
              type="tel"
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
