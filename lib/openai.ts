import { Message, PropertyType, PropertyCondition } from "@/types"

export interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface PropertyValuationData {
  address: string
  city: string
  neighborhood?: string
  postalCode?: string
  propertyType: PropertyType
  omiCategory?: string
  surfaceSqm: number
  floor?: number
  hasElevator?: boolean
  condition: PropertyCondition
  rooms?: number
  bathrooms?: number
  hasParking?: boolean
  outdoorSpace?: string
  heatingType?: string
  hasAirConditioning?: boolean
  energyClass?: string
  buildYear?: number
  // Valutazione base calcolata
  baseOMIValue: number
  estimatedPrice: number
  minPrice: number
  maxPrice: number
  floorCoefficient: number
  conditionCoefficient: number
}

export interface ChatCompletionOptions {
  messages: OpenAIMessage[]
  temperature?: number
  maxTokens?: number
}

// System prompt that defines the bot's personality and behavior
export const SYSTEM_PROMPT = `Sei un assistente immobiliare esperto e amichevole che aiuta gli utenti a valutare le loro proprietà.

Il tuo obiettivo è raccogliere informazioni sulla proprietà in modo naturale e conversazionale, ponendo una domanda alla volta.

REGOLE IMPORTANTI:
1. Sii sempre cordiale, professionale ma informale (usa il "tu")
2. Fai SOLO UNA domanda per volta
3. Conferma sempre l'informazione ricevuta prima di passare alla domanda successiva
4. Se l'utente fornisce un'informazione non valida o incompleta, chiedi gentilmente di specificare meglio
5. Non inventare dati - chiedi sempre conferma
6. Usa emoji occasionalmente per rendere la conversazione più amichevole (ma non esagerare)
7. Mantieni un tono entusiasta ma professionale

FLUSSO CONVERSAZIONE:
1. Indirizzo completo (via, numero civico, città)
2. Tipo di immobile (Appartamento, Villa, Ufficio, Altro)
3. Superficie in metri quadri
4. Piano (solo per appartamenti/uffici)
5. Presenza ascensore (solo se al piano > 0)
6. Stato dell'immobile (Nuovo, Ottimo, Buono, Da ristrutturare)
7. Calcolo valutazione
8. Richiesta contatti (nome, cognome, email, telefono opzionale)

ESEMPI DI RISPOSTE:
- "Perfetto! Via Roma 15, Milano - ho capito bene?"
- "Ottimo! Ora dimmi, di che tipo di immobile si tratta?"
- "Capito! Quanti metri quadri ha l'immobile?"
- "Sto calcolando la valutazione della tua proprietà... un attimo di pazienza! ⏳"

Rispondi sempre in italiano e in modo conciso (massimo 2-3 frasi per messaggio).`

/**
 * Sends a message to OpenAI and gets a response
 * This uses the OpenAI Chat Completions API
 */
export async function sendMessageToOpenAI(
  messages: OpenAIMessage[],
  options: Partial<ChatCompletionOptions> = {}
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY non configurata nelle variabili d'ambiente")
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Cost-effective model for conversational AI
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 150,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ""
}

/**
 * Converts our Message type to OpenAI format
 */
export function convertMessagesToOpenAI(messages: Message[]): OpenAIMessage[] {
  return messages.map((msg) => ({
    role: msg.role === "bot" ? "assistant" : "user",
    content: msg.text,
  }))
}

/**
 * Extracts structured data from user input using OpenAI
 * This is useful for parsing addresses, numbers, etc.
 */
export async function extractDataFromInput(
  input: string,
  dataType: "address" | "number" | "email" | "phone"
): Promise<string> {
  const prompts = {
    address: `Estrai l'indirizzo completo da questo testo e restituisci SOLO l'indirizzo formattato: "${input}". Se manca la città, restituisci solo la via.`,
    number: `Estrai il numero da questo testo e restituisci SOLO il numero: "${input}". Se non c'è un numero valido, restituisci "0".`,
    email: `Verifica se questo è un'email valida: "${input}". Rispondi solo "valid" o "invalid".`,
    phone: `Normalizza questo numero di telefono: "${input}". Restituisci solo il numero senza spazi o caratteri speciali.`,
  }

  const response = await sendMessageToOpenAI([
    { role: "user", content: prompts[dataType] },
  ])

  return response.trim()
}

/**
 * Validates numeric input (surface, floor, etc.)
 */
export function validateNumericInput(
  input: string,
  min: number,
  max: number
): { valid: boolean; value: number | null; error?: string } {
  const parsed = parseFloat(input.replace(/[^\d.,]/g, "").replace(",", "."))

  if (isNaN(parsed)) {
    return {
      valid: false,
      value: null,
      error: "Per favore inserisci un numero valido",
    }
  }

  if (parsed < min || parsed > max) {
    return {
      valid: false,
      value: null,
      error: `Il valore deve essere tra ${min} e ${max}`,
    }
  }

  return { valid: true, value: parsed }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates phone number format (Italian format)
 */
export function validatePhone(phone: string): boolean {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-()]/g, "")

  // Italian phone numbers: 10 digits (mobile) or 9-11 digits (landline with prefix)
  // Also accept international format starting with +39
  const phoneRegex = /^(\+39)?[0-9]{9,11}$/

  return phoneRegex.test(cleaned)
}

// System prompt per l'analisi immobiliare AI
const VALUATION_SYSTEM_PROMPT = `Sei un esperto valutatore immobiliare italiano con 20 anni di esperienza nel mercato.
Il tuo compito è analizzare i dati di un immobile e fornire un'analisi professionale della valutazione.

REGOLE:
1. Usa un tono professionale ma accessibile
2. Sii conciso (massimo 3-4 frasi)
3. Menziona 2-3 fattori specifici che influenzano il valore
4. NON ripetere i numeri esatti della valutazione (sono già mostrati)
5. Parla dei trend di mercato della zona se rilevante
6. Suggerisci eventuali punti di forza o debolezza dell'immobile
7. Rispondi SEMPRE in italiano`

/**
 * Genera un'analisi AI professionale della valutazione immobiliare
 * Usa OpenAI per creare una spiegazione contestualizzata e dettagliata
 */
export async function generateAIValuationAnalysis(
  data: PropertyValuationData
): Promise<{ analysis: string; adjustmentFactor: number; confidence: "alta" | "media" | "bassa" }> {
  const apiKey = process.env.OPENAI_API_KEY

  // Se OpenAI non è configurata, ritorna analisi di fallback
  if (!apiKey) {
    console.warn("OPENAI_API_KEY non configurata, usando analisi di fallback")
    return {
      analysis: generateFallbackAnalysis(data),
      adjustmentFactor: 1.0,
      confidence: "media"
    }
  }

  // Costruisci il prompt con tutti i dati dell'immobile
  const propertyDescription = buildPropertyDescription(data)

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: VALUATION_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analizza questa proprietà e fornisci una breve analisi professionale:

${propertyDescription}

VALUTAZIONE CALCOLATA:
- Valore OMI base: ${data.baseOMIValue}€/m²
- Stima: ${formatPrice(data.estimatedPrice)}
- Range: ${formatPrice(data.minPrice)} - ${formatPrice(data.maxPrice)}
- Coeff. piano: ${((data.floorCoefficient - 1) * 100).toFixed(0)}%
- Coeff. stato: ${((data.conditionCoefficient - 1) * 100).toFixed(0)}%

Fornisci:
1. Un'analisi breve (3-4 frasi) dei punti di forza e debolezza
2. Un fattore di aggiustamento suggerito (tra 0.95 e 1.05) basato su elementi non standard
3. Un livello di confidenza (alta/media/bassa) della valutazione

Rispondi in formato JSON:
{
  "analysis": "testo analisi",
  "adjustmentFactor": 1.0,
  "confidence": "media"
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
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

    const parsed = JSON.parse(content)

    // Valida e normalizza i dati
    return {
      analysis: parsed.analysis || generateFallbackAnalysis(data),
      adjustmentFactor: Math.max(0.90, Math.min(1.10, parsed.adjustmentFactor || 1.0)),
      confidence: ["alta", "media", "bassa"].includes(parsed.confidence) ? parsed.confidence : "media"
    }
  } catch (error) {
    console.error("Errore nell'analisi AI:", error)
    return {
      analysis: generateFallbackAnalysis(data),
      adjustmentFactor: 1.0,
      confidence: "media"
    }
  }
}

/**
 * Costruisce una descrizione testuale dell'immobile
 */
function buildPropertyDescription(data: PropertyValuationData): string {
  const parts: string[] = []

  // Tipo e posizione
  parts.push(`IMMOBILE: ${getPropertyTypeLabel(data.propertyType)}`)
  parts.push(`POSIZIONE: ${data.address}, ${data.city}${data.neighborhood ? ` (${data.neighborhood})` : ""}`)

  // Caratteristiche principali
  parts.push(`SUPERFICIE: ${data.surfaceSqm} m²`)

  if (data.rooms) parts.push(`CAMERE: ${data.rooms}`)
  if (data.bathrooms) parts.push(`BAGNI: ${data.bathrooms}`)

  // Piano e ascensore
  if (data.floor !== undefined) {
    const floorText = data.floor === 0 ? "Piano terra" : `${data.floor}° piano`
    const elevatorText = data.hasElevator ? "con ascensore" : "senza ascensore"
    parts.push(`PIANO: ${floorText} ${elevatorText}`)
  }

  // Stato
  parts.push(`STATO: ${getConditionLabel(data.condition)}`)

  // Caratteristiche extra
  const extras: string[] = []
  if (data.hasParking) extras.push("box/posto auto")
  if (data.outdoorSpace && data.outdoorSpace !== "NONE") extras.push(data.outdoorSpace.toLowerCase())
  if (data.hasAirConditioning) extras.push("aria condizionata")
  if (data.heatingType) extras.push(`riscaldamento ${data.heatingType.toLowerCase()}`)
  if (extras.length > 0) {
    parts.push(`EXTRA: ${extras.join(", ")}`)
  }

  // Classe energetica e anno
  if (data.energyClass && data.energyClass !== "UNKNOWN" && data.energyClass !== "NOT_AVAILABLE") {
    parts.push(`CLASSE ENERGETICA: ${data.energyClass}`)
  }
  if (data.buildYear) {
    parts.push(`ANNO COSTRUZIONE: ${data.buildYear}`)
  }

  return parts.join("\n")
}

/**
 * Genera un'analisi di fallback senza AI
 */
function generateFallbackAnalysis(data: PropertyValuationData): string {
  const parts: string[] = []

  // Analisi base sulla posizione
  parts.push(`Valutazione basata sui dati OMI per ${data.city}.`)

  // Commento su piano/ascensore
  if (data.floor !== undefined && data.floor > 2) {
    if (data.hasElevator) {
      parts.push("L'immobile ai piani alti con ascensore beneficia di una migliore luminosità e tranquillità.")
    } else {
      parts.push("L'assenza di ascensore ai piani alti può limitare l'appetibilità sul mercato.")
    }
  }

  // Commento sullo stato
  if (data.condition === PropertyCondition.NEW || data.condition === PropertyCondition.RENOVATED) {
    parts.push("L'ottimo stato di manutenzione rappresenta un punto di forza significativo.")
  } else if (data.condition === PropertyCondition.TO_RENOVATE) {
    parts.push("I costi di ristrutturazione sono stati considerati nella valutazione.")
  }

  // Commento su caratteristiche extra
  if (data.hasParking) {
    parts.push("La presenza di posto auto aggiunge valore in zone ad alta densità.")
  }

  return parts.join(" ")
}

/**
 * Helper per ottenere label tipo proprietà
 */
function getPropertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    [PropertyType.APARTMENT]: "Appartamento",
    [PropertyType.ATTICO]: "Attico",
    [PropertyType.VILLA]: "Villa",
    [PropertyType.OFFICE]: "Ufficio",
    [PropertyType.SHOP]: "Negozio",
    [PropertyType.BOX]: "Box",
    [PropertyType.LAND]: "Terreno",
    [PropertyType.OTHER]: "Altro"
  }
  return labels[type] || "Immobile"
}

/**
 * Helper per ottenere label condizione
 */
function getConditionLabel(condition: PropertyCondition): string {
  const labels: Record<PropertyCondition, string> = {
    [PropertyCondition.NEW]: "Nuovo/Mai abitato",
    [PropertyCondition.RENOVATED]: "Ristrutturato",
    [PropertyCondition.GOOD]: "Buono stato",
    [PropertyCondition.TO_RENOVATE]: "Da ristrutturare"
  }
  return labels[condition] || "N/D"
}

/**
 * Helper per formattare prezzi
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(price)
}
