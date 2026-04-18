/**
 * Brave Search–based Comparables Provider
 *
 * Pipeline:
 * 1. Brave Search API ritorna 10-20 risultati web con title/description/url
 *    da portali immobiliari italiani (immobiliare.it, idealista.it, casa.it).
 * 2. Passa i risultati a gpt-4o-mini per estrazione JSON strutturata
 *    (prezzo, mq, locali, quartiere, ecc.).
 * 3. Outlier filtering + median aggregation.
 *
 * Vantaggi vs OpenAI web_search_preview:
 * - Affidabilità: Brave Search è stateless e deterministico (ritorna sempre
 *   risultati), non dipende da un LLM che decide cosa cercare.
 * - Velocità: ~5-10s totali (3s Brave + 4s LLM parsing) vs 30-45s OpenAI.
 * - Costi: Brave free tier 2000 query/mese; gpt-4o-mini parsing ~$0.003/call.
 * - Separation of concerns: Brave fa il web, LLM fa il parsing.
 */

import type {
  Comparable,
  ComparablesProvider,
  ComparablesQuery,
  ComparablesResult,
} from "./types"
import { createLogger } from "../logger"
import { PARSING_MODEL } from "../openai-config"

const logger = createLogger("comparables:brave")

const BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search"
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

interface BraveWebResult {
  title: string
  description: string
  url: string
}

function buildBraveQueries(query: ComparablesQuery): string[] {
  const parts: string[] = []
  parts.push(query.propertyType.toLowerCase())
  parts.push(`${query.surfaceSqm}mq`)
  if (query.rooms) parts.push(`${query.rooms} locali`)
  if (query.neighborhood) parts.push(query.neighborhood)
  parts.push(query.city)
  parts.push("vendita prezzo")
  const base = parts.join(" ")

  return [
    `${base} site:immobiliare.it/annunci`,
    `${base} site:idealista.it/immobile`,
    `${base} site:casa.it/immobile`,
  ]
}

async function braveSearch(
  apiKey: string,
  query: string,
  count: number
): Promise<BraveWebResult[]> {
  const url = new URL(BRAVE_SEARCH_URL)
  url.searchParams.set("q", query)
  url.searchParams.set("count", String(count))
  url.searchParams.set("country", "IT")
  url.searchParams.set("search_lang", "it")
  url.searchParams.set("result_filter", "web")

  const r = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-Subscription-Token": apiKey,
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
    },
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`Brave Search API ${r.status}: ${txt.slice(0, 200)}`)
  }
  const data = await r.json()
  const results: BraveWebResult[] = (data?.web?.results || []).map((x: any) => ({
    title: x.title || "",
    description: x.description || "",
    url: x.url || "",
  }))
  return results
}

function sourceFromUrl(url: string): string {
  if (url.includes("immobiliare.it")) return "immobiliare.it"
  if (url.includes("idealista.it")) return "idealista.it"
  if (url.includes("casa.it")) return "casa.it"
  return "web"
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parseItalianNumber(value: string): number {
  const compact = value
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(/,(?=\d{3}(\D|$))/g, "")
    .replace(/[,.]\d{1,2}$/g, "")
    .replace(/\D/g, "")
  return Number(compact)
}

function parsePrice(text: string): number | null {
  const patterns = [
    /(?:€|eur|euro)\s*([0-9][0-9.\s,]{3,})/i,
    /([0-9][0-9.\s,]{3,})\s*(?:€|eur|euro)/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (!match) continue
    const price = parseItalianNumber(match[1])
    if (price >= 5000 && price <= 20_000_000) return price
  }
  return null
}

function parseSurface(text: string): number | null {
  const match = text.match(/(\d{2,4})\s*(?:m²|mq|m2|metri quadrati)/i)
  if (!match) return null
  const surface = Number(match[1])
  return surface >= 10 && surface <= 2000 ? surface : null
}

function parseRooms(text: string): number | undefined {
  const match = text.match(/(\d{1,2})\s*(?:locali|locale|stanze|vani)/i)
  if (!match) return undefined
  const rooms = Number(match[1])
  return rooms > 0 && rooms <= 30 ? rooms : undefined
}

function comparableFromSearchResult(result: BraveWebResult): Comparable | null {
  const text = cleanText(`${result.title} ${result.description}`)
  const lower = text.toLowerCase()
  if (/asta|nuda propriet|usufrutto|intero stabile|palazzo|terreno/.test(lower)) {
    return null
  }
  const price = parsePrice(text)
  const surfaceSqm = parseSurface(text)
  if (!price || !surfaceSqm) return null
  const pricePerSqm = Math.round(price / surfaceSqm)
  if (pricePerSqm < 300 || pricePerSqm > 30000) return null
  return {
    title: cleanText(result.title).slice(0, 160) || "Annuncio",
    url: result.url,
    source: sourceFromUrl(result.url),
    price,
    surfaceSqm,
    pricePerSqm,
    rooms: parseRooms(text),
  }
}

function normalizeUrl(url?: string): string {
  if (!url) return ""
  try {
    const u = new URL(url)
    u.hash = ""
    u.search = ""
    return u.toString().replace(/\/$/, "")
  } catch {
    return url
  }
}

function filterAndDedupeComparables(
  comparables: Comparable[],
  query: ComparablesQuery
): Comparable[] {
  const minSqm = Math.round(query.surfaceSqm * 0.65)
  const maxSqm = Math.round(query.surfaceSqm * 1.35)
  const seen = new Set<string>()
  const filtered: Comparable[] = []

  for (const comparable of comparables) {
    if (comparable.surfaceSqm < minSqm || comparable.surfaceSqm > maxSqm) continue
    const title = comparable.title.toLowerCase()
    if (/asta|nuda propriet|usufrutto|intero stabile|palazzo|terreno/.test(title)) continue
    const key = normalizeUrl(comparable.url) ||
      `${title}|${comparable.price}|${comparable.surfaceSqm}`
    if (seen.has(key)) continue
    seen.add(key)
    filtered.push(comparable)
  }

  return filtered
}

function buildExtractionPrompt(
  results: BraveWebResult[],
  query: ComparablesQuery
): string {
  const resultsBlock = results
    .slice(0, 20)
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.description}\n   ${r.url}`)
    .join("\n\n")

  return `Sei un estrattore di dati immobiliari. Dai seguenti risultati di ricerca web (annunci italiani di vendita immobili), estrai SOLO quelli che sono annunci reali di vendita di immobili SIMILI a questo target:

TARGET: ${query.propertyType} di circa ${query.surfaceSqm}m² a ${query.city}${
    query.neighborhood ? ` (${query.neighborhood})` : ""
  }${query.rooms ? `, ~${query.rooms} locali` : ""}.

RISULTATI WEB:
${resultsBlock}

Per ogni annuncio VALIDO che trovi (scarta pagine categoria, elenchi generici, risultati non pertinenti), estrai:
- title (breve)
- url
- price (prezzo totale €, solo numero)
- surfaceSqm (metri quadrati, solo numero)
- rooms (numero locali, se presente)
- neighborhood (quartiere/zona)
- source ("immobiliare.it" / "idealista.it" / "casa.it")

Considera validi solo annunci con PREZZO esplicito in € e MQ chiaramente indicati. Se un risultato non ha prezzo o mq, scartalo.

Rispondi SOLO con JSON valido (nessun testo prima/dopo):
{
  "comparables": [
    { "title": "...", "url": "...", "price": 320000, "surfaceSqm": 85, "rooms": 3, "neighborhood": "...", "source": "immobiliare.it" }
  ]
}

Se nessun annuncio è valido: {"comparables": []}`
}

async function extractComparablesFromResults(
  apiKey: string,
  results: BraveWebResult[],
  query: ComparablesQuery
): Promise<Comparable[]> {
  if (results.length === 0) return []

  const prompt = buildExtractionPrompt(results, query)
  const r = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: PARSING_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    }),
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`OpenAI parsing ${r.status}: ${txt.slice(0, 200)}`)
  }
  const data = await r.json()
  const content = data.choices?.[0]?.message?.content || "{}"
  let parsed: any = null
  try {
    parsed = JSON.parse(content)
  } catch {
    logger.warn("Failed to parse LLM extraction response", { contentSample: content.slice(0, 200) })
    return []
  }
  if (!parsed || !Array.isArray(parsed.comparables)) return []

  return parsed.comparables
    .map((raw: any): Comparable | null => {
      const price = Number(raw.price)
      const surfaceSqm = Number(raw.surfaceSqm)
      if (!price || !surfaceSqm || price < 5000 || surfaceSqm < 10) return null
      const pricePerSqm = Math.round(price / surfaceSqm)
      if (pricePerSqm < 300 || pricePerSqm > 30000) return null
      return {
        title: String(raw.title || "Annuncio"),
        url: raw.url ? String(raw.url) : undefined,
        source: String(raw.source || "web"),
        price: Math.round(price),
        surfaceSqm: Math.round(surfaceSqm),
        pricePerSqm,
        rooms: raw.rooms ? Number(raw.rooms) : undefined,
        neighborhood: raw.neighborhood ? String(raw.neighborhood) : undefined,
      }
    })
    .filter((c: Comparable | null): c is Comparable => c !== null)
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

export class BraveComparablesProvider implements ComparablesProvider {
  readonly name = "brave"

  isAvailable(): boolean {
    // Serve anche OPENAI_API_KEY per il parsing LLM
    return !!process.env.BRAVE_API_KEY && !!process.env.OPENAI_API_KEY
  }

  async searchComparables(query: ComparablesQuery): Promise<ComparablesResult> {
    const start = Date.now()
    const braveKey = process.env.BRAVE_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    if (!braveKey) throw new Error("BRAVE_API_KEY non configurata")
    if (!openaiKey) throw new Error("OPENAI_API_KEY non configurata (serve per parsing)")

    const queries = buildBraveQueries(query)
    logger.info("Brave search starting", {
      city: query.city,
      sqm: query.surfaceSqm,
      neighborhood: query.neighborhood,
      queries,
    })

    const warnings: string[] = []
    let webResults: BraveWebResult[] = []
    try {
      const resultsByQuery = await Promise.all(
        queries.map((q) =>
          braveSearch(braveKey, q, query.maxResults ? Math.max(query.maxResults, 8) : 10)
        )
      )
      const byUrl = new Map<string, BraveWebResult>()
      for (const result of resultsByQuery.flat()) {
        if (!result.url) continue
        byUrl.set(normalizeUrl(result.url), result)
      }
      webResults = [...byUrl.values()]
      logger.info("Brave results", { count: webResults.length })
    } catch (err) {
      logger.error("Brave Search API error", { error: String(err) })
      return {
        comparables: [],
        medianPricePerSqm: 0,
        avgPricePerSqm: 0,
        minPricePerSqm: 0,
        maxPricePerSqm: 0,
        sampleSize: 0,
        provider: this.name,
        executionTimeMs: Date.now() - start,
        warnings: [`Brave search error: ${String(err).slice(0, 100)}`],
      }
    }

    if (webResults.length === 0) {
      return {
        comparables: [],
        medianPricePerSqm: 0,
        avgPricePerSqm: 0,
        minPricePerSqm: 0,
        maxPricePerSqm: 0,
        sampleSize: 0,
        provider: this.name,
        executionTimeMs: Date.now() - start,
        warnings: ["Nessun risultato web da Brave Search."],
      }
    }

    const snippetComparables = webResults
      .map(comparableFromSearchResult)
      .filter((c: Comparable | null): c is Comparable => c !== null)

    let comparables: Comparable[] = snippetComparables
    try {
      const llmComparables = await extractComparablesFromResults(openaiKey, webResults, query)
      comparables = [...comparables, ...llmComparables]
      logger.info("Extraction done", {
        snippets: snippetComparables.length,
        llm: llmComparables.length,
      })
    } catch (err) {
      logger.error("LLM extraction error", { error: String(err) })
      warnings.push(`Parsing LLM fallito: ${String(err).slice(0, 80)}`)
    }

    const beforeFilter = comparables.length
    comparables = filterAndDedupeComparables(comparables, query)
    if (beforeFilter > comparables.length) {
      warnings.push(
        `${beforeFilter - comparables.length} annunci scartati per duplicati, superficie fuori range o tipologia non pertinente.`
      )
    }

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
        warnings: [...warnings, `Nessun annuncio estratto dai ${webResults.length} risultati web.`],
      }
    }

    const ppsqm = comparables.map((c) => c.pricePerSqm)
    return {
      comparables,
      medianPricePerSqm: median(ppsqm),
      avgPricePerSqm: Math.round(ppsqm.reduce((s, v) => s + v, 0) / ppsqm.length),
      minPricePerSqm: Math.min(...ppsqm),
      maxPricePerSqm: Math.max(...ppsqm),
      sampleSize: comparables.length,
      provider: this.name,
      executionTimeMs: Date.now() - start,
      warnings,
    }
  }
}
