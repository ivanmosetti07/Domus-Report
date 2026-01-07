import { NextRequest, NextResponse } from "next/server"
import { Message } from "@/types"

export const runtime = "edge"

// System prompt per il chatbot immobiliare AI conversazionale
// IMPORTANTE: I valori degli enum devono essere ESATTAMENTE in italiano come definiti nel database
const CHAT_SYSTEM_PROMPT = `Sei DomusBot, un assistente immobiliare esperto e amichevole. Il tuo obiettivo è raccogliere informazioni sull'immobile dell'utente per fornire una valutazione.

DATI DA RACCOGLIERE (in ordine flessibile):
1. Città/Località (obbligatorio)
2. Indirizzo/Quartiere (obbligatorio)
3. CAP - Codice Avviamento Postale (raccogli se possibile per valutazione precisa)
4. Tipo immobile: Appartamento, Attico, Villa, Ufficio, Negozio, Box, Terreno, Altro (obbligatorio)
5. Categoria OMI (solo per residenziale): Abitazioni signorili, Abitazioni civili, Abitazioni economiche, Ville e villini (chiedi se tipo è Appartamento/Attico/Villa)
6. Superficie in m² (obbligatorio)
7. Numero camere da letto (per residenziale)
8. Numero bagni
9. Piano e presenza ascensore (per appartamenti)
10. Spazi esterni: Nessuno, Balcone, Terrazzo, Giardino
11. Box/Posto auto: Sì/No
12. Stato: Nuovo, Ristrutturato, Buono, Da ristrutturare (obbligatorio)
13. Riscaldamento: Autonomo, Centralizzato, Assente
14. Aria condizionata: Sì/No
15. Classe energetica: A, B, C, D, E, F, G, Non so
16. Anno costruzione
17. Occupato o Libero
18. Nome (obbligatorio - chiedi separatamente)
19. Cognome (obbligatorio - chiedi separatamente)
20. Email (obbligatorio - chiedi separatamente)
21. Telefono (obbligatorio - chiedi separatamente)

REGOLE DI CONVERSAZIONE:
1. Sii cordiale, usa il "tu", e occasionalmente emoji
2. Fai UNA domanda alla volta - IMPORTANTE: chiedi i dati di contatto UNO PER VOLTA in passaggi separati
3. Se l'utente fornisce più informazioni insieme, riconoscile tutte
4. Conferma i dati ricevuti in modo naturale
5. Se un dato non è chiaro, chiedi gentilmente di specificare
6. Adatta le domande al tipo di immobile (es: no piano per ville)
7. Per i contatti, DEVI chiedere in questo ordine preciso: prima nome, poi cognome, poi email, poi telefono
8. IMPORTANTE: Dopo aver raccolto telefono, fai un RECAP completo dei dati e chiedi conferma
9. Solo dopo conferma "sì/corretto/va bene", imposta readyForValuation: true
10. FONDAMENTALE: Se l'utente risponde solo con un NUMERO, interpretalo SEMPRE nel contesto dell'ultima domanda
    - Hai chiesto "quanti mq?" e risponde "60" → surfaceSqm: 60
    - Hai chiesto "quante camere?" e risponde "2" → rooms: 2
    - Hai chiesto "quanti bagni?" e risponde "1" → bathrooms: 1
    - Hai chiesto "che piano?" e risponde "2" → floor: 2
    - NON rispondere mai "non ho capito" quando ricevi solo un numero come risposta

IMPORTANTE - FLUSSO RECAP E CONFERMA:
- Quando hai raccolto telefono (ultimo dato contatto), fai un RECAP COMPLETO
- Il recap deve includere: tipo immobile, città/quartiere/CAP, categoria OMI (se residenziale), superficie, camere, stato, nome completo, email, telefono
- Formatta il recap in modo chiaro e leggibile con emoji
- Chiedi esplicitamente: "I dati sono corretti?"
- Se l'utente conferma (sì/corretto/va bene/ok), SOLO ALLORA imposta readyForValuation: true
- Se l'utente corregge dati, aggiornali in extractedData e chiedi se ora è tutto corretto

FORMATO RISPOSTA:
Rispondi SEMPRE in JSON con questa struttura:
{
  "message": "Il tuo messaggio all'utente",
  "extractedData": {
    "city": "città se menzionata",
    "address": "indirizzo completo se menzionato",
    "neighborhood": "quartiere se menzionato",
    "postalCode": "CAP se menzionato (5 cifre)",
    "propertyType": "Appartamento|Attico|Villa|Ufficio|Negozio|Box|Terreno|Altro",
    "omiCategory": "Abitazioni signorili|Abitazioni civili|Abitazioni economiche|Ville e villini (solo se residenziale)",
    "surfaceSqm": numero se menzionato,
    "rooms": numero camere se menzionato,
    "bathrooms": numero bagni se menzionato,
    "floor": numero piano se menzionato,
    "hasElevator": true/false se menzionato,
    "outdoorSpace": "Nessuno|Balcone|Terrazzo|Giardino",
    "hasParking": true/false se menzionato,
    "condition": "Nuovo|Ristrutturato|Buono|Da ristrutturare",
    "heatingType": "Autonomo|Centralizzato|Assente",
    "hasAirConditioning": true/false se menzionato,
    "energyClass": "A|B|C|D|E|F|G|Non so",
    "buildYear": anno se menzionato,
    "occupancyStatus": "Libero|Occupato",
    "firstName": "nome" se menzionato,
    "lastName": "cognome" se menzionato,
    "email": "email" se menzionata,
    "phone": "telefono" se menzionato
  },
  "readyForValuation": true/false,
  "missingRequired": ["lista campi obbligatori mancanti"]
}

IMPORTANTE - VALORI ESATTI:
- propertyType DEVE essere uno di: "Appartamento", "Attico", "Villa", "Ufficio", "Negozio", "Box", "Terreno", "Altro"
- omiCategory DEVE essere uno di: "Abitazioni signorili", "Abitazioni civili", "Abitazioni economiche", "Ville e villini"
- condition DEVE essere uno di: "Nuovo", "Ristrutturato", "Buono", "Da ristrutturare"
- outdoorSpace DEVE essere uno di: "Nessuno", "Balcone", "Terrazzo", "Giardino"
- heatingType DEVE essere uno di: "Autonomo", "Centralizzato", "Assente"
- occupancyStatus DEVE essere uno di: "Libero", "Occupato"
- postalCode DEVE essere 5 cifre (es: "00100")

ESEMPI:

ESEMPIO 1 - Dati immobile:
Utente: "Ho un appartamento a Milano in zona Navigli, 85mq"
{
  "message": "Perfetto! Un appartamento di 85m² in zona Navigli a Milano, ottima zona! 🏠 Quante camere da letto ha?",
  "extractedData": {
    "city": "Milano",
    "neighborhood": "Navigli",
    "propertyType": "Appartamento",
    "surfaceSqm": 85
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 1b - Risposta solo numero (camere):
Utente: "2"
{
  "message": "Ottimo! 2 camere da letto. 🛏️ Quanti bagni ci sono?",
  "extractedData": {
    "rooms": 2
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 1c - Risposta solo numero (bagni):
Utente: "1"
{
  "message": "Perfetto! 1 bagno. 🚿 A che piano si trova l'appartamento?",
  "extractedData": {
    "bathrooms": 1
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 2 - Richiesta nome:
Utente: "Buono stato"
{
  "message": "Perfetto, immobile in buono stato! 👍 Per inviarti la valutazione dettagliata, come ti chiami?",
  "extractedData": {
    "condition": "Buono"
  },
  "readyForValuation": false,
  "missingRequired": ["firstName", "lastName", "email", "phone"]
}

ESEMPIO 3 - Richiesta cognome dopo nome:
Utente: "Mario"
{
  "message": "Piacere Mario! 😊 E il cognome?",
  "extractedData": {
    "firstName": "Mario"
  },
  "readyForValuation": false,
  "missingRequired": ["lastName", "email", "phone"]
}

ESEMPIO 4 - Richiesta email dopo cognome:
Utente: "Rossi"
{
  "message": "Benissimo Mario Rossi! Qual è la tua email?",
  "extractedData": {
    "lastName": "Rossi"
  },
  "readyForValuation": false,
  "missingRequired": ["email", "phone"]
}

ESEMPIO 5 - Richiesta telefono dopo email:
Utente: "mario.rossi@email.it"
{
  "message": "Perfetto! Ultimo dato: qual è il tuo numero di telefono?",
  "extractedData": {
    "email": "mario.rossi@email.it"
  },
  "readyForValuation": false,
  "missingRequired": ["phone"]
}

ESEMPIO 6 - Telefono ricevuto, fai RECAP:
Utente: "3331234567"
{
  "message": "Perfetto! 📋 Ricapitoliamo i dati del tuo immobile:\n\n🏠 Appartamento a Milano, zona Navigli\n📐 85 m², 2 camere, 1 bagno\n🏢 Piano 3 con ascensore\n✨ Stato: Buono\n\n👤 Mario Rossi\n📧 mario.rossi@email.it\n📱 333 123 4567\n\nI dati sono corretti?",
  "extractedData": {
    "phone": "3331234567"
  },
  "readyForValuation": false,
  "missingRequired": []
}

ESEMPIO 7 - Conferma positiva, procedi con valutazione:
Utente: "Sì, corretto"
{
  "message": "Perfetto! 🎯 Procedo subito con la valutazione del tuo immobile!",
  "extractedData": {},
  "readyForValuation": true,
  "missingRequired": []
}

ESEMPIO 8 - Correzione richiesta:
Utente: "No, sono 90 mq non 85"
{
  "message": "Nessun problema! 📝 Aggiorno: 90 m² invece di 85. Qualcos'altro da correggere?",
  "extractedData": {
    "surfaceSqm": 90
  },
  "readyForValuation": false,
  "missingRequired": []
}`

// Mappatura per normalizzare i valori AI ai valori enum del database
const PROPERTY_TYPE_MAP: Record<string, string> = {
  "APARTMENT": "Appartamento",
  "ATTICO": "Attico",
  "VILLA": "Villa",
  "OFFICE": "Ufficio",
  "SHOP": "Negozio",
  "BOX": "Box",
  "LAND": "Terreno",
  "OTHER": "Altro",
  // Valori già corretti
  "Appartamento": "Appartamento",
  "Attico": "Attico",
  "Villa": "Villa",
  "Ufficio": "Ufficio",
  "Negozio": "Negozio",
  "Box": "Box",
  "Terreno": "Terreno",
  "Altro": "Altro"
}

const CONDITION_MAP: Record<string, string> = {
  "NEW": "Nuovo",
  "RENOVATED": "Ristrutturato",
  "GOOD": "Buono",
  "TO_RENOVATE": "Da ristrutturare",
  // Valori già corretti
  "Nuovo": "Nuovo",
  "Ristrutturato": "Ristrutturato",
  "Buono": "Buono",
  "Da ristrutturare": "Da ristrutturare",
  // Varianti comuni
  "buono": "Buono",
  "nuovo": "Nuovo",
  "ristrutturato": "Ristrutturato",
  "da ristrutturare": "Da ristrutturare",
  "Buono stato": "Buono"
}

const OUTDOOR_SPACE_MAP: Record<string, string> = {
  "NONE": "Nessuno",
  "BALCONY": "Balcone",
  "TERRACE": "Terrazzo",
  "GARDEN": "Giardino",
  "Nessuno": "Nessuno",
  "Balcone": "Balcone",
  "Terrazzo": "Terrazzo",
  "Giardino": "Giardino"
}

const HEATING_TYPE_MAP: Record<string, string> = {
  "AUTONOMOUS": "Autonomo",
  "CENTRALIZED": "Centralizzato",
  "NONE": "Assente",
  "Autonomo": "Autonomo",
  "Centralizzato": "Centralizzato",
  "Assente": "Assente"
}

const OCCUPANCY_MAP: Record<string, string> = {
  "FREE": "Libero",
  "OCCUPIED": "Occupato",
  "Libero": "Libero",
  "Occupato": "Occupato"
}

const OMI_CATEGORY_MAP: Record<string, string> = {
  // Valori già corretti
  "Abitazioni signorili": "Abitazioni signorili",
  "Abitazioni civili": "Abitazioni civili",
  "Abitazioni economiche": "Abitazioni economiche",
  "Ville e villini": "Ville e villini",
  // Varianti comuni
  "signorili": "Abitazioni signorili",
  "civili": "Abitazioni civili",
  "economiche": "Abitazioni economiche",
  "ville": "Ville e villini",
  "villini": "Ville e villini"
}

// Funzione per normalizzare i dati estratti dall'AI
function normalizeExtractedData(data: CollectedData): CollectedData {
  const normalized = { ...data }

  if (data.propertyType) {
    normalized.propertyType = PROPERTY_TYPE_MAP[data.propertyType] || data.propertyType
  }

  if (data.condition) {
    normalized.condition = CONDITION_MAP[data.condition] || data.condition
  }

  if (data.outdoorSpace) {
    normalized.outdoorSpace = OUTDOOR_SPACE_MAP[data.outdoorSpace] || data.outdoorSpace
  }

  if (data.heatingType) {
    normalized.heatingType = HEATING_TYPE_MAP[data.heatingType] || data.heatingType
  }

  if (data.occupancyStatus) {
    normalized.occupancyStatus = OCCUPANCY_MAP[data.occupancyStatus] || data.occupancyStatus
  }

  if (data.omiCategory) {
    normalized.omiCategory = OMI_CATEGORY_MAP[data.omiCategory] || data.omiCategory
  }

  // Converti "Non so" in undefined per campi numerici/specifici
  if (data.buildYear && typeof data.buildYear === 'string') {
    if (data.buildYear.toLowerCase().includes('non')) {
      normalized.buildYear = undefined
    } else {
      // Prova a convertire la stringa in numero
      const year = parseInt(data.buildYear, 10)
      if (!isNaN(year)) {
        normalized.buildYear = year
      }
    }
  }

  if (data.energyClass && typeof data.energyClass === 'string' && data.energyClass.toLowerCase().includes('non')) {
    normalized.energyClass = undefined
  }

  return normalized
}

interface ChatMessage {
  role: "user" | "bot"
  text: string
}

interface CollectedData {
  city?: string
  address?: string
  neighborhood?: string
  postalCode?: string
  propertyType?: string
  omiCategory?: string
  surfaceSqm?: number
  rooms?: number
  bathrooms?: number
  floor?: number
  hasElevator?: boolean
  outdoorSpace?: string
  hasParking?: boolean
  condition?: string
  heatingType?: string
  hasAirConditioning?: boolean
  energyClass?: string
  buildYear?: number | string // L'AI potrebbe restituire stringa
  occupancyStatus?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, collectedData, widgetId } = body as {
      messages: ChatMessage[]
      collectedData: CollectedData
      widgetId: string
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Costruisci il contesto con i dati già raccolti
    const dataContext = Object.keys(collectedData || {}).length > 0
      ? `\n\nDATI GIÀ RACCOLTI:\n${JSON.stringify(collectedData, null, 2)}`
      : ""

    // Converti messaggi nel formato OpenAI
    const openAIMessages = [
      { role: "system" as const, content: CHAT_SYSTEM_PROMPT + dataContext },
      ...messages.map(msg => ({
        role: msg.role === "bot" ? "assistant" as const : "user" as const,
        content: msg.text
      }))
    ]

    // Chiama OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      throw new Error(error.error?.message || "Errore API OpenAI")
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      console.error("[Chat API] Empty content from OpenAI")
      throw new Error("Risposta vuota da OpenAI")
    }

    console.log("[Chat API] Raw OpenAI response:", content.substring(0, 200))

    // Parse della risposta JSON
    let parsed
    try {
      parsed = JSON.parse(content)
      console.log("[Chat API] Parsed successfully, message:", parsed.message?.substring(0, 100))
    } catch (parseError) {
      console.error("[Chat API] JSON parse failed:", parseError)
      // Se il parsing fallisce, usa la risposta come messaggio semplice
      parsed = {
        message: content,
        extractedData: {},
        readyForValuation: false,
        missingRequired: []
      }
    }

    // Normalizza i dati estratti per assicurarsi che i valori siano quelli corretti degli enum
    const normalizedData = normalizeExtractedData(parsed.extractedData || {})

    // IMPORTANTE: Valida che il messaggio non sia vuoto
    // Se l'AI non fornisce un messaggio valido, usa un fallback
    let finalMessage = parsed.message || ""
    console.log("[Chat API] Message validation - original:", {
      hasMessage: !!parsed.message,
      messageType: typeof parsed.message,
      messageValue: parsed.message,
      afterOr: finalMessage
    })

    if (typeof finalMessage === "string") {
      finalMessage = finalMessage.trim()
    }

    console.log("[Chat API] After trim:", { finalMessage, length: finalMessage.length })

    if (!finalMessage || finalMessage.length === 0) {
      finalMessage = "Mi dispiace, non ho capito bene. Puoi ripetere?"
      console.warn("[Chat API] Empty or invalid message from AI, using fallback")
    }

    return NextResponse.json({
      success: true,
      message: finalMessage,
      extractedData: normalizedData,
      readyForValuation: parsed.readyForValuation || false,
      missingRequired: parsed.missingRequired || []
    })
  } catch (error) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        success: false,
        message: "Mi dispiace, si è verificato un errore. Riprova tra un momento."
      },
      { status: 500 }
    )
  }
}
