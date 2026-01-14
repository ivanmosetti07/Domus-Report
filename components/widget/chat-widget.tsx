"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Message } from "./message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Building2, Loader2, RotateCcw } from "lucide-react"
import { Message as MessageType, PropertyType, PropertyCondition } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { inferCity } from "@/lib/postal-code"

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
  sendButtonColor?: string
  sendButtonIconColor?: string
}

interface ChatWidgetProps {
  widgetId: string
  mode?: 'bubble' | 'inline'
  isDemo?: boolean
  onClose?: () => void
  theme?: WidgetThemeConfig
}

// Modalità conversazione: AI-driven o calculating/completed
type ConversationMode = "chatting" | "calculating" | "valuation" | "completed" | "ask_restart"

interface CollectedData {
  address?: string
  city?: string
  neighborhood?: string
  postalCode?: string
  type?: PropertyType
  propertyType?: string // Alias per compatibilità AI
  omiCategory?: string
  surfaceSqm?: number
  rooms?: number
  totalRooms?: number
  bathrooms?: number
  floor?: number
  hasElevator?: boolean
  floorType?: string
  outdoorSpace?: string
  hasParking?: boolean
  condition?: PropertyCondition | string
  heatingType?: string
  hasAirConditioning?: boolean
  energyClass?: string
  buildYear?: number | string // L'AI potrebbe restituire stringa
  occupancyStatus?: string
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
    sendButtonColor,
    sendButtonIconColor = '#ffffff',
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
  const [conversationMode, setConversationMode] = React.useState<ConversationMode>("chatting")
  const [collectedData, setCollectedData] = React.useState<CollectedData>({})
  const [valuation, setValuation] = React.useState<ValuationResult | null>(null)
  const [savedLeadId, setSavedLeadId] = React.useState<string | null>(null)
  const messagesContainerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [isWaitingForAI, setIsWaitingForAI] = React.useState(false)

  // Tracking: Event batching queue
  const eventQueueRef = React.useRef<Array<{
    widgetId: string
    eventType: string
    leadId?: string
    metadata?: Record<string, any>
  }>>([])
  const batchTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const leadIdRef = React.useRef<string | null>(null)

  // FIX CRITICO: Ref per phone per evitare problemi di React state batching
  const phoneRef = React.useRef<string | undefined>(undefined)

  // Auto-scroll interno alla chat (non influenza l'embed esterno)
  const scrollChatToBottom = React.useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    const shouldSmoothScroll = distanceFromBottom <= 120

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: shouldSmoothScroll ? "smooth" : "auto"
      })
    })
  }, [])

  React.useEffect(() => {
    scrollChatToBottom()
  }, [messages, isTyping, scrollChatToBottom])

  // Tracking: Funzione per accodare evento (batching)
  const trackEvent = React.useCallback((
    eventType: string,
    metadata?: Record<string, any>,
    immediate: boolean = false
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

    // Eventi critici vanno inviati immediatamente
    if (immediate || eventType === 'CONTACT_FORM_SUBMIT' || eventType === 'VALUATION_VIEW') {
      sendEventBatch()
      return
    }

    // Resetta timer batch
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current)
    }

    // Invia batch dopo 2 secondi (ridotto da 10 per maggiore affidabilità)
    batchTimerRef.current = setTimeout(() => {
      sendEventBatch()
    }, 2000)
  }, [widgetId, isDemo])

  // Tracking: Invia batch di eventi
  const sendEventBatch = React.useCallback(async () => {
    if (eventQueueRef.current.length === 0) return

    const eventsToSend = [...eventQueueRef.current]
    eventQueueRef.current = [] // Svuota la coda

    try {
      console.log('[ChatWidget] Sending events batch:', eventsToSend.map(e => e.eventType).join(', '))
      const response = await fetch("/api/widget-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: eventsToSend }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[ChatWidget] Failed to send events:', errorData)
      } else {
        console.log('[ChatWidget] Events sent successfully')
      }
    } catch (error) {
      console.error("[ChatWidget] Error sending widget events:", error)
      // Non bloccare l'esperienza utente se il tracking fallisce
    }
  }, [])

  // Tracking: OPEN - quando widget viene montato
  React.useEffect(() => {
    trackEvent("OPEN", undefined, true) // Invia immediatamente

    // Cleanup: invia eventi rimanenti quando componente viene smontato
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current)
      }
      // Usa sendBeacon per garantire l'invio anche durante l'unload
      if (eventQueueRef.current.length > 0 && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const eventsToSend = [...eventQueueRef.current]
        const blob = new Blob([JSON.stringify({ events: eventsToSend })], { type: 'application/json' })
        navigator.sendBeacon('/api/widget-events', blob)
        eventQueueRef.current = []
      } else {
        sendEventBatch()
      }
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

        if (parsed.conversationMode) {
          setConversationMode(parsed.conversationMode)
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

  // Initialize conversation - ora usa AI
  const initializeConversation = () => {
    const welcomeMessage: MessageType = {
      id: `msg_${Date.now()}`,
      role: "bot",
      text: "Ciao! 👋 Sono DomusBot, il tuo assistente per la valutazione immobiliare. Dimmi tutto quello che sai sulla tua casa: dove si trova, che tipo di immobile è, quanti metri quadri... Più informazioni mi dai, più precisa sarà la valutazione!",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    setConversationMode("chatting")
    setIsInitialized(true)
  }

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    if (!isInitialized || isDemo) return

    try {
      const stateToSave = {
        messages,
        conversationMode,
        collectedData,
        valuation,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(storageKey, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Error saving chat state:', error)
    }
  }, [messages, conversationMode, collectedData, valuation, isInitialized, isDemo, storageKey])

  const addBotMessage = (text: string, quickReplies?: MessageType['quickReplies']) => {
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
    }, 500)
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

  // Gestisce quick reply (per modalità ask_restart)
  const handleQuickReply = (value: string, label: string) => {
    addUserMessage(label)

    // Gestisci solo le azioni speciali (restart, download_pdf)
    if (conversationMode === "ask_restart") {
      if (value === "restart") {
        addBotMessage("Perfetto! Ricominciamo da capo. 🔄")
        resetConversation()
      } else if (value === "download_pdf") {
        downloadPDF()
      } else {
        addBotMessage("Grazie per aver usato il nostro servizio! A presto! 👋")
        if (mode === 'bubble' && onClose) {
          setTimeout(() => onClose(), 3000)
        }
      }
    } else {
      // In modalità chatting, invia alla AI
      processWithAI(label)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isWaitingForAI) return

    // Track MESSAGE event
    trackEvent("MESSAGE", { messageCount: messages.length + 1 })

    const userInput = inputValue.trim()
    addUserMessage(userInput)
    setInputValue("")

    // Se siamo in modalità chatting, usa l'AI
    if (conversationMode === "chatting") {
      processWithAI(userInput)
    }
  }

  // Funzione principale che chiama l'API AI per processare il messaggio
  const processWithAI = async (userInput: string) => {
    setIsWaitingForAI(true)
    setIsTyping(true)

    try {
      // Prepara i messaggi per l'API (ultimi 20 messaggi per contesto)
      const recentMessages = messages.slice(-20).map(msg => ({
        role: msg.role,
        text: msg.text
      }))

      // Aggiungi il nuovo messaggio utente
      recentMessages.push({ role: "user" as const, text: userInput })

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: recentMessages,
          collectedData,
          widgetId
        })
      })

      if (!response.ok) {
        throw new Error("Errore nella risposta AI")
      }

      const data = await response.json()

      // Se l'API restituisce success: false, tratta come errore
      if (data.success === false) {
        throw new Error(data.error || "Errore nella risposta AI")
      }

      // Aggiorna i dati raccolti con quelli estratti dall'AI
      if (data.extractedData && Object.keys(data.extractedData).length > 0) {
        setCollectedData(prev => {
          const updated = { ...prev }
          // Merge solo i campi non nulli/undefined
          Object.entries(data.extractedData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              (updated as any)[key] = value
            }
          })
          return updated
        })
      }

      // Mostra la risposta del bot
      setIsTyping(false)

      // IMPORTANTE: Valida che il messaggio non sia vuoto
      // Se l'API restituisce un messaggio vuoto, usa un fallback
      let messageText = data.message || ""
      if (typeof messageText === "string") {
        messageText = messageText.trim()
      }

      if (!messageText || messageText.length === 0) {
        messageText = "Mi dispiace, non ho capito bene. Puoi ripetere?"
        console.warn("[ChatWidget] Empty message from API, using fallback")
      }

      const botMessage: MessageType = {
        id: `msg_${Date.now()}`,
        role: "bot",
        text: messageText,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])

      // Se l'AI dice che siamo pronti per la valutazione, procedi
      if (data.readyForValuation) {
        // Aggiorna i dati finali prima di calcolare
        const finalData = { ...collectedData, ...data.extractedData }
        // Salva phone nella ref se presente
        if (finalData.phone) {
          phoneRef.current = finalData.phone
        }
        setCollectedData(finalData)

        // Piccolo delay e poi calcola valutazione
        setTimeout(() => {
          calculateValuation()
        }, 1000)
      }

    } catch (error) {
      console.error("Errore AI:", error)
      setIsTyping(false)
      const errorMessage: MessageType = {
        id: `msg_${Date.now()}`,
        role: "bot",
        text: "Mi dispiace, ho avuto un problema. Puoi riprovare?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsWaitingForAI(false)
    }
  }

  const calculateValuation = async () => {
    setConversationMode("calculating")
    addBotMessage("Perfetto! Sto calcolando la valutazione con AI... ⏳")

    // DEBUG: Log collectedData PRIMA della chiamata API
    console.log('[calculateValuation] CollectedData BEFORE API call:', {
      phone: collectedData.phone,
      email: collectedData.email,
      firstName: collectedData.firstName,
      allData: collectedData
    })

    try {
      // Call valuation API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      // Invia TUTTI i dati raccolti per un'analisi AI più accurata
      // L'AI popola propertyType, ma per compatibilità controlliamo anche type
      const propertyType = collectedData.propertyType || collectedData.type || PropertyType.APARTMENT
      const condition = collectedData.condition || PropertyCondition.GOOD

      // MIGLIORA ESTRAZIONE CITTÀ: usa inferCity per dedurre la città da CAP, indirizzo o quartiere
      const inferredCity = inferCity({
        city: collectedData.city,
        postalCode: collectedData.postalCode,
        address: collectedData.address,
        neighborhood: collectedData.neighborhood
      })

      console.log('[calculateValuation] Città dedotta:', {
        original: collectedData.city,
        inferred: inferredCity,
        postalCode: collectedData.postalCode,
        address: collectedData.address
      })

      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Dati base obbligatori
          address: collectedData.address || "",
          city: inferredCity || collectedData.city || "",
          propertyType: propertyType,
          surfaceSqm: collectedData.surfaceSqm || 100,
          floor: collectedData.floor,
          hasElevator: collectedData.hasElevator,
          condition: condition,
          // Dati aggiuntivi per analisi AI
          neighborhood: collectedData.neighborhood,
          postalCode: collectedData.postalCode,
          omiCategory: collectedData.omiCategory,
          rooms: collectedData.rooms,
          bathrooms: collectedData.bathrooms,
          hasParking: collectedData.hasParking,
          outdoorSpace: collectedData.outdoorSpace,
          heatingType: collectedData.heatingType,
          hasAirConditioning: collectedData.hasAirConditioning,
          energyClass: collectedData.energyClass,
          buildYear: collectedData.buildYear,
          // Abilita analisi AI
          useAI: true,
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
        setConversationMode("ask_restart")
        addBotMessage(
          "Mi dispiace, il calcolo sta richiedendo più tempo del previsto. Vuoi riprovare?",
          [
            { label: "Sì, riprova", value: "restart" },
            { label: "No, grazie", value: "done" }
          ]
        )
      } else {
        setConversationMode("ask_restart")
        addBotMessage(
          "Mi dispiace, si è verificato un errore nel calcolo. Vuoi fare una nuova valutazione?",
          [
            { label: "Sì, nuova valutazione", value: "restart" },
            { label: "No, grazie", value: "done" }
          ]
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

  // Funzione per scaricare il PDF della valutazione (stesso PDF dell'agenzia)
  const downloadPDF = async () => {
    if (!savedLeadId) {
      addBotMessage("Errore: impossibile generare il PDF. ID lead non disponibile.")
      return
    }

    try {
      // Mostra messaggio di loading
      const loadingMsg: MessageType = {
        id: `msg_${Date.now()}`,
        role: "bot",
        text: "Sto generando il PDF... ⏳",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, loadingMsg])

      // Determina l'URL base assoluto (importante per widget embeddati in siti esterni)
      const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://domusreport.mainstream.agency'

      // Chiama l'API per generare il PDF usando URL assoluto
      const pdfUrl = `${baseUrl}/api/leads/${savedLeadId}/download-pdf`
      console.log('[downloadPDF] Fetching PDF from:', pdfUrl)

      const response = await fetch(pdfUrl)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[downloadPDF] Error response:', errorText)
        throw new Error("Errore nella generazione del PDF")
      }

      // Scarica il file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `valutazione-${collectedData.lastName || "immobile"}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Rimuovi il messaggio di loading e aggiungi conferma
      setMessages(prev => prev.filter(msg => msg.id !== loadingMsg.id))
      addBotMessage("✅ PDF scaricato con successo!")

      // Track PDF download event
      trackEvent("PDF_DOWNLOAD", { leadId: savedLeadId })
    } catch (error) {
      console.error("[downloadPDF] Error:", error)
      addBotMessage("Si è verificato un errore nel download del PDF. Riprova o contattaci.")
    }
  }


  const completeConversation = async (valuationResult?: ValuationResult) => {
    const firstName = collectedData.firstName || "Amico"

    // Use passed result or fall back to state
    const finalValuation = valuationResult || valuation

    // DEBUG: Log COMPLETO di collectedData
    console.log('[completeConversation] 🔍 CRITICAL DEBUG - CollectedData at start:', {
      phone: collectedData.phone,
      email: collectedData.email,
      firstName: collectedData.firstName,
      lastName: collectedData.lastName,
      FULL_collectedData: JSON.stringify(collectedData, null, 2)
    })

    // Show loading message
    addBotMessage("Sto salvando i tuoi dati... ⏳")

    try {
      // Determina l'endpoint in base a se è demo o no
      const endpoint = isDemo ? "/api/demo-leads" : "/api/leads"

      // Log dei dati raccolti PRIMA di inviarli
      console.log('[ChatWidget] Phone data before sending:', {
        phoneFromState: collectedData.phone,
        phoneFromRef: phoneRef.current,
        phoneToUse: phoneRef.current || collectedData.phone,
        phoneType: typeof (phoneRef.current || collectedData.phone),
        phoneValue: JSON.stringify(phoneRef.current || collectedData.phone)
      })

      // MIGLIORA ESTRAZIONE CITTÀ: usa inferCity anche per il salvataggio
      const inferredCity = inferCity({
        city: collectedData.city,
        postalCode: collectedData.postalCode,
        address: collectedData.address,
        neighborhood: collectedData.neighborhood
      })

      console.log('[completeConversation] Città dedotta per salvataggio:', {
        original: collectedData.city,
        inferred: inferredCity,
        willUse: inferredCity || collectedData.city
      })

      // Prepara il payload base
      const basePayload = {
        // Lead data
        firstName: collectedData.firstName,
        lastName: collectedData.lastName,
        email: collectedData.email,
        // FIX CRITICO: Usa phoneRef invece di collectedData.phone per evitare state batching
        phone: phoneRef.current || collectedData.phone,
        // Property data
        address: collectedData.address,
        city: inferredCity || collectedData.city,
        neighborhood: collectedData.neighborhood,
        postalCode: collectedData.postalCode, // CRITICO: Include CAP per validazione città/geocoding
        type: collectedData.propertyType || collectedData.type,
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
        energyClass: collectedData.energyClass && !collectedData.energyClass.toLowerCase().includes('non') ? collectedData.energyClass : undefined,
        buildYear: typeof collectedData.buildYear === 'number' ? collectedData.buildYear :
                   (typeof collectedData.buildYear === 'string' && !collectedData.buildYear.toLowerCase().includes('non') ?
                    parseInt(collectedData.buildYear, 10) : undefined),
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
          setConversationMode("completed")
          addBotMessage(
            `Mi dispiace ${firstName}, hai raggiunto il limite di richieste giornaliere. Riprova domani.`
          )
          return
        }

        throw new Error(errorData.error || "Errore nel salvataggio del lead")
      }

      // Salva leadId dal response per tracking futuro e per il PDF
      const responseData = await response.json()
      if (responseData.lead?.id) {
        leadIdRef.current = responseData.lead.id
        setSavedLeadId(responseData.lead.id)
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
        : `Grazie ${firstName}! 🎉 Sarai ricontattato a breve da un nostro consulente.`

      setConversationMode("completed")
      addBotMessage(successMessage)

      // Aggiungi opzione download PDF se NON è demo
      if (!isDemo) {
        setTimeout(() => {
          addBotMessage(
            "Vuoi scaricare il PDF della valutazione?",
            [
              { label: "📥 Scarica PDF", value: "download_pdf" },
              { label: "No, grazie", value: "skip_pdf" }
            ]
          )
        }, 1500)
      }

      // Ask if user wants to restart instead of closing
      setTimeout(() => {
        setConversationMode("ask_restart")
        addBotMessage(
          "Vuoi fare una nuova valutazione?",
          [
            { label: "Sì, rifai valutazione", value: "restart" },
            { label: "No, grazie", value: "done" }
          ]
        )
      }, isDemo ? 2000 : 3500)
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
          `Mi dispiace ${firstName}, il salvataggio sta richiedendo più tempo del previsto. Riprova per favore.`
        )
      } else {
        // Mostra errore reale all'utente
        const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto"
        addBotMessage(
          `Si è verificato un errore: ${errorMessage}. Riprova o contattaci direttamente.`
        )
      }

      // Ask if user wants to restart even on error
      setTimeout(() => {
        setConversationMode("ask_restart")
        addBotMessage(
          "Vuoi riprovare con una nuova valutazione?",
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
    setConversationMode("chatting")
    setInputValue("")
    setSavedLeadId(null)
    phoneRef.current = undefined

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
    switch (conversationMode) {
      case "chatting":
        return "Scrivi qui..."
      case "calculating":
        return "Calcolo in corso..."
      case "valuation":
      case "completed":
        return "Conversazione completata"
      case "ask_restart":
        return "Scegli un'opzione..."
      default:
        return "Scrivi qui..."
    }
  }

  const isInputDisabled = conversationMode === "calculating" || conversationMode === "completed" || conversationMode === "ask_restart" || isTyping || isWaitingForAI

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
          ? `fixed inset-0 sm:inset-auto sm:bottom-4 ${bubblePositionClass} sm:rounded-lg sm:shadow-2xl z-50 animate-fade-in`
          : `w-full rounded-lg ${showBorder ? 'shadow-2xl border border-gray-200' : ''}`
      )}
      style={{
        ...themeStyles,
        backgroundColor,
        fontFamily,
        overscrollBehavior: 'contain', // lo scroll resta confinato al widget
        WebkitOverflowScrolling: 'touch', // smooth scrolling iOS
        // Responsive sizing per bubble mode
        ...(mode === 'bubble' ? {
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh'
        } : {
          height: inlineHeight || 'clamp(500px, 60vh, 650px)',
          minHeight: '500px'
        })
      }}
    >
      {/* Header */}
      {(mode === 'bubble' || showHeader) && (
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            background: headerGradient,
            padding: mode === 'bubble' ? '16px' : 'clamp(12px, 2vw, 16px)'
          }}
        >
          <div className="flex items-center" style={{
            gap: mode === 'bubble' ? '12px' : 'clamp(8px, 2vw, 12px)'
          }}>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: backgroundColor,
                width: mode === 'bubble' ? '40px' : 'clamp(32px, 8vw, 40px)',
                height: mode === 'bubble' ? '40px' : 'clamp(32px, 8vw, 40px)'
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="object-cover rounded-full" style={{
                  width: '100%',
                  height: '100%'
                }} />
              ) : (
                <Building2 style={{
                  color: primaryColor,
                  width: mode === 'bubble' ? '24px' : 'clamp(20px, 6vw, 24px)',
                  height: mode === 'bubble' ? '24px' : 'clamp(20px, 6vw, 24px)'
                }} />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold" style={{
                fontSize: mode === 'bubble' ? '16px' : 'clamp(14px, 2vw, 16px)',
                lineHeight: '1.3'
              }}>Valuta la tua casa</h3>
              <p className="text-white/70" style={{
                fontSize: mode === 'bubble' ? '13px' : 'clamp(11px, 1.5vw, 13px)',
                lineHeight: '1.3'
              }}>Ti rispondo in pochi secondi</p>
            </div>
          </div>
          <div className="flex items-center" style={{
            gap: mode === 'bubble' ? '8px' : 'clamp(4px, 1vw, 8px)'
          }}>
            {/* Reset button - visibile sia in bubble che inline */}
            <button
              onClick={() => {
                // Track RESET event
                trackEvent("RESET", { mode: conversationMode })
                // Reset conversation
                resetConversation()
              }}
              className="text-white hover:text-white/80 transition-colors flex-shrink-0"
              style={{
                padding: mode === 'bubble' ? '8px' : 'clamp(4px, 1vw, 8px)',
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Ricomincia chat"
              title="Ricomincia da capo"
            >
              <RotateCcw style={{
                width: mode === 'bubble' ? '20px' : 'clamp(18px, 4.5vw, 20px)',
                height: mode === 'bubble' ? '20px' : 'clamp(18px, 4.5vw, 20px)'
              }} />
            </button>
            {/* Close button - solo in modalità bubble */}
            {mode === 'bubble' && onClose && (
              <button
                onClick={() => {
                  // Track CLOSE event
                  trackEvent("CLOSE", { mode: conversationMode })
                  // Invia subito gli eventi rimanenti
                  sendEventBatch()
                  // Chiudi widget
                  onClose()
                }}
                className="text-white hover:text-white/80 transition-colors flex-shrink-0"
                style={{
                  padding: '8px',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Chiudi chat"
              >
                <X style={{
                  width: '22px',
                  height: '22px'
                }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        style={{
          backgroundColor: backgroundColor === '#ffffff' ? '#f9fafb' : `${backgroundColor}f5`,
          padding: mode === 'bubble' ? '16px' : 'clamp(12px, 2vw, 16px)',
          overscrollBehavior: 'contain', // evita che lo scroll interno trascini la pagina
          WebkitOverflowScrolling: 'touch' // smooth scrolling iOS
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
            <div className="bg-surface rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-foreground-muted" />
              <span className="text-sm text-foreground-muted">Sto scrivendo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="border-t border-border flex-shrink-0"
        style={{
          backgroundColor,
          padding: mode === 'bubble' ? '16px' : 'clamp(12px, 2vw, 16px)'
        }}
      >
        <form onSubmit={handleSubmit} className="flex" data-form-type="other" style={{
          gap: mode === 'bubble' ? '12px' : 'clamp(8px, 1.5vw, 12px)'
        }}>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isInputDisabled}
            className="flex-1"
            style={{
              borderColor: `${primaryColor}40`,
              height: mode === 'bubble' ? '48px' : 'clamp(44px, 10vw, 48px)',
              fontSize: '16px', // CRITICO: 16px previene zoom automatico su iOS
              padding: '0 14px'
            }}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isInputDisabled || !inputValue.trim()}
            style={{
              backgroundColor: sendButtonColor || primaryColor,
              width: mode === 'bubble' ? '48px' : 'clamp(44px, 10vw, 48px)',
              height: mode === 'bubble' ? '48px' : 'clamp(44px, 10vw, 48px)',
              minWidth: '48px',
              minHeight: '48px',
              flexShrink: 0
            }}
            aria-label="Invia messaggio"
          >
            <Send style={{
              color: sendButtonIconColor,
              width: mode === 'bubble' ? '20px' : 'clamp(18px, 4vw, 20px)',
              height: mode === 'bubble' ? '20px' : 'clamp(18px, 4vw, 20px)'
            }} />
          </Button>
        </form>
      </div>
    </div>
  )
}
