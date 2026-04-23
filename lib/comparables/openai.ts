/**
 * OpenAI-based Comparables Provider
 * Usa OpenAI Responses API con il tool web_search
 * per cercare annunci immobiliari reali.
 *
 * Richiede un modello compatibile con web search nella Responses API.
 */

import type {
  Comparable,
  ComparablesProvider,
  ComparablesQuery,
  ComparablesResult,
} from "./types"
import { createLogger } from "../logger"
import { COMPARABLES_MODEL } from "../openai-config"

const logger = createLogger("comparables:openai")

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
const DEFAULT_MODEL = COMPARABLES_MODEL

function buildPrompt(query: ComparablesQuery): string {
  const parts: string[] = []
  parts.push(
    `Cerca sul web annunci di VENDITA immobiliare su portali italiani (immobiliare.it, casa.it, idealista.it) con queste caratteristiche:`
  )
  parts.push(`- Tipo: ${query.propertyType}`)
  parts.push(`- Città: ${query.city}`)
  if (query.neighborhood) parts.push(`- Quartiere: ${query.neighborhood}`)
  if (query.postalCode) parts.push(`- CAP: ${query.postalCode}`)
  parts.push(
    `- Superficie: circa ${query.surfaceSqm} m² (±25%: da ${Math.round(query.surfaceSqm * 0.75)} a ${Math.round(query.surfaceSqm * 1.25)} m²)`
  )
  if (query.rooms) parts.push(`- Locali: circa ${query.rooms}`)
  if (query.condition) parts.push(`- Stato: ${query.condition}`)
  parts.push("")
  parts.push(
    `Restituisci ESCLUSIVAMENTE un JSON valido (nessun testo prima/dopo) con questa struttura:`
  )
  parts.push(`{
  "comparables": [
    {
      "title": "...",
      "url": "https://...",
      "source": "immobiliare.it",
      "price": 320000,
      "surfaceSqm": 85,
      "pricePerSqm": 3765,
      "rooms": 3,
      "condition": "...",
      "neighborhood": "..."
    }
  ],
  "warnings": []
}`)
  parts.push(`Cerca fino a ${query.maxResults || 8} annunci. Non inventare: se non trovi, array vuoto.`)
  return parts.join("\n")
}

function extractJson(text: string): any {
  try {
    return JSON.parse(text)
  } catch {}
  const match = text.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch {}
  }
  return null
}

function normalizeComparable(raw: any): Comparable | null {
  if (!raw || typeof raw !== "object") return null
  const price = Number(raw.price)
  const surfaceSqm = Number(raw.surfaceSqm)
  if (!price || !surfaceSqm || price < 5000 || surfaceSqm < 10) return null
  const pricePerSqm = Number(raw.pricePerSqm) || Math.round(price / surfaceSqm)
  if (pricePerSqm < 300 || pricePerSqm > 30000) return null
  return {
    title: String(raw.title || "Annuncio"),
    url: raw.url ? String(raw.url) : undefined,
    source: String(raw.source || "unknown"),
    price: Math.round(price),
    surfaceSqm: Math.round(surfaceSqm),
    pricePerSqm: Math.round(pricePerSqm),
    rooms: raw.rooms ? Number(raw.rooms) : undefined,
    floor: raw.floor !== undefined && raw.floor !== null ? Number(raw.floor) : undefined,
    condition: raw.condition ? String(raw.condition) : undefined,
    neighborhood: raw.neighborhood ? String(raw.neighborhood) : undefined,
  }
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

export class OpenAIComparablesProvider implements ComparablesProvider {
  readonly name = "openai"

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY
  }

  async searchComparables(query: ComparablesQuery): Promise<ComparablesResult> {
    const start = Date.now()
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("OPENAI_API_KEY non configurata")

    const body = {
      model: DEFAULT_MODEL,
      tools: [
        {
          type: "web_search",
          user_location: {
            type: "approximate",
            country: "IT",
            city: query.city,
            timezone: "Europe/Rome",
          },
        },
      ],
      tool_choice: "auto",
      input: buildPrompt(query),
    }

    logger.info("OpenAI comparables search starting", {
      city: query.city,
      sqm: query.surfaceSqm,
      model: DEFAULT_MODEL,
    })

    let content = ""
    try {
      const response = await fetch(OPENAI_RESPONSES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const errText = await response.text()
        logger.error("OpenAI Responses API error", { status: response.status, body: errText.slice(0, 500) })
        throw new Error(`OpenAI Responses API error: ${response.status}`)
      }
      const data = await response.json()
      // Responses API: output_text è la concatenazione
      content = data.output_text || ""
      if (!content && Array.isArray(data.output)) {
        // Fallback: concatena contenuti testuali
        content = data.output
          .flatMap((block: any) => (block?.content || []))
          .map((c: any) => c?.text || "")
          .join("")
      }
      logger.info("OpenAI comparables raw response", {
        contentLength: content.length,
        contentSample: content.slice(0, 500),
        outputShape: Array.isArray(data.output) ? `array[${data.output.length}]` : typeof data.output,
      })
    } catch (error) {
      logger.error("OpenAI comparables provider failed", { error: String(error) })
      return {
        comparables: [],
        medianPricePerSqm: 0,
        avgPricePerSqm: 0,
        minPricePerSqm: 0,
        maxPricePerSqm: 0,
        sampleSize: 0,
        provider: this.name,
        executionTimeMs: Date.now() - start,
        warnings: [`OpenAI provider error: ${String(error).slice(0, 100)}`],
      }
    }

    const parsed = extractJson(content)
    if (!parsed || !Array.isArray(parsed.comparables)) {
      return {
        comparables: [],
        medianPricePerSqm: 0,
        avgPricePerSqm: 0,
        minPricePerSqm: 0,
        maxPricePerSqm: 0,
        sampleSize: 0,
        provider: this.name,
        executionTimeMs: Date.now() - start,
        warnings: ["Nessun comparable trovato o risposta non valida."],
      }
    }

    const comparables: Comparable[] = parsed.comparables
      .map(normalizeComparable)
      .filter((c: Comparable | null): c is Comparable => c !== null)

    const warnings: string[] = Array.isArray(parsed.warnings) ? parsed.warnings.slice(0, 5) : []

    if (comparables.length === 0) {
      return {
        comparables: [],
        medianPricePerSqm: 0,
        avgPricePerSqm: 0,
        minPricePerSqm: 0,
        maxPricePerSqm: 0,
        sampleSize: 0,
        provider: this.name,
        executionTimeMs: Date.now() - start,
        warnings: [...warnings, "Nessun annuncio valido dopo filtro outlier."],
      }
    }

    const ppsqm = comparables.map((c) => c.pricePerSqm)
    const medianPPS = median(ppsqm)
    const avgPPS = Math.round(ppsqm.reduce((s, v) => s + v, 0) / ppsqm.length)

    return {
      comparables,
      medianPricePerSqm: medianPPS,
      avgPricePerSqm: avgPPS,
      minPricePerSqm: Math.min(...ppsqm),
      maxPricePerSqm: Math.max(...ppsqm),
      sampleSize: comparables.length,
      provider: this.name,
      executionTimeMs: Date.now() - start,
      warnings,
    }
  }
}
