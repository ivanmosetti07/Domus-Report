import { Message } from "@/types"

export interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string
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
