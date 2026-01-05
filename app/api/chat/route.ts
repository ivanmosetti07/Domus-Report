import { NextRequest, NextResponse } from "next/server"
import { Message } from "@/types"

export const runtime = "edge"

// System prompt per il chatbot immobiliare AI conversazionale
const CHAT_SYSTEM_PROMPT = `Sei DomusBot, un assistente immobiliare esperto e amichevole. Il tuo obiettivo è raccogliere informazioni sull'immobile dell'utente per fornire una valutazione.

DATI DA RACCOGLIERE (in ordine flessibile):
1. Città/Località (obbligatorio)
2. Indirizzo/Quartiere (obbligatorio)
3. Tipo immobile: Appartamento, Attico, Villa, Ufficio, Negozio, Box, Terreno, Altro (obbligatorio)
4. Superficie in m² (obbligatorio)
5. Numero camere da letto (per residenziale)
6. Numero bagni
7. Piano e presenza ascensore (per appartamenti)
8. Spazi esterni: Nessuno, Balcone, Terrazzo, Giardino
9. Box/Posto auto: Sì/No
10. Stato: Nuovo, Ristrutturato, Buono, Da ristrutturare (obbligatorio)
11. Riscaldamento: Autonomo, Centralizzato, Assente
12. Aria condizionata: Sì/No
13. Classe energetica: A, B, C, D, E, F, G, Non so
14. Anno costruzione
15. Occupato o Libero
16. Contatti: Nome, Cognome, Email, Telefono (obbligatori per inviare valutazione)

REGOLE DI CONVERSAZIONE:
1. Sii cordiale, usa il "tu", e occasionalmente emoji
2. Fai UNA domanda alla volta, ma puoi raggruppare domande correlate
3. Se l'utente fornisce più informazioni insieme, riconoscile tutte
4. Conferma i dati ricevuti in modo naturale
5. Se un dato non è chiaro, chiedi gentilmente di specificare
6. Adatta le domande al tipo di immobile (es: no piano per ville)
7. Quando hai TUTTI i dati obbligatori + contatti, rispondi con "VALUTAZIONE_PRONTA"

FORMATO RISPOSTA:
Rispondi SEMPRE in JSON con questa struttura:
{
  "message": "Il tuo messaggio all'utente",
  "extractedData": {
    "city": "città se menzionata",
    "address": "indirizzo se menzionato",
    "neighborhood": "quartiere se menzionato",
    "propertyType": "APARTMENT|ATTICO|VILLA|OFFICE|SHOP|BOX|LAND|OTHER se menzionato",
    "surfaceSqm": numero se menzionato,
    "rooms": numero camere se menzionato,
    "bathrooms": numero bagni se menzionato,
    "floor": numero piano se menzionato,
    "hasElevator": true/false se menzionato,
    "outdoorSpace": "NONE|BALCONY|TERRACE|GARDEN" se menzionato,
    "hasParking": true/false se menzionato,
    "condition": "NEW|RENOVATED|GOOD|TO_RENOVATE" se menzionato,
    "heatingType": "AUTONOMOUS|CENTRALIZED|NONE" se menzionato,
    "hasAirConditioning": true/false se menzionato,
    "energyClass": "A|B|C|D|E|F|G|UNKNOWN" se menzionato,
    "buildYear": anno se menzionato,
    "occupancyStatus": "FREE|OCCUPIED" se menzionato,
    "firstName": "nome" se menzionato,
    "lastName": "cognome" se menzionato,
    "email": "email" se menzionata,
    "phone": "telefono" se menzionato
  },
  "readyForValuation": true/false,
  "missingRequired": ["lista campi obbligatori mancanti"]
}

ESEMPIO:
Utente: "Ho un appartamento a Milano in zona Navigli, 85mq"
{
  "message": "Perfetto! Un appartamento di 85m² in zona Navigli a Milano, ottima zona! 🏠 Quante camere da letto ha?",
  "extractedData": {
    "city": "Milano",
    "neighborhood": "Navigli",
    "propertyType": "APARTMENT",
    "surfaceSqm": 85
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}`

interface ChatMessage {
  role: "user" | "bot"
  text: string
}

interface CollectedData {
  city?: string
  address?: string
  neighborhood?: string
  propertyType?: string
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
  buildYear?: number
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
      throw new Error("Risposta vuota da OpenAI")
    }

    // Parse della risposta JSON
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      // Se il parsing fallisce, usa la risposta come messaggio semplice
      parsed = {
        message: content,
        extractedData: {},
        readyForValuation: false,
        missingRequired: []
      }
    }

    return NextResponse.json({
      success: true,
      message: parsed.message || "Mi dispiace, non ho capito. Puoi ripetere?",
      extractedData: parsed.extractedData || {},
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
