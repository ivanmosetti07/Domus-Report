/**
 * OMI Advanced - Sistema avanzato per dati Osservatorio Mercato Immobiliare
 * Supporta:
 * - Lettura diretta dati da CSV
 * - Ricerca per zona specifica
 * - Storico prezzi
 * - Calcolo trend automatico
 * - Cache in-memory per performance
 */

import { PropertyType } from "@/types"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { createLogger } from "./logger"

const logger = createLogger('omi-advanced')

// Cache in-memory per i dati CSV
let csvCache: OMICSVRecord[] | null = null
let csvCacheTimestamp: number | null = null
const CACHE_TTL = 1000 * 60 * 30 // 30 minuti

interface OMICSVRecord {
  citta: string
  zona: string
  cap: string
  tipoImmobile: string
  categoria: string
  valoreMinMq: number
  valoreMaxMq: number
  valoreMedioMq: number
  semestre: number
  anno: number
  fonte: string
}

export interface OMIValueDetailed {
  citta: string
  zona: string
  cap?: string
  tipoImmobile: string
  categoria?: string
  valoreMinMq: number
  valoreMaxMq: number
  valoreMedioMq: number
  semestre: number
  anno: number
  fonte: string
}

export interface PriceHistoryEntry {
  semestre: string // "2024-S2"
  valoreMedioMq: number
  variazione?: number // % variazione rispetto al periodo precedente
}

export interface ZoneTrend {
  trend: "crescita" | "stabile" | "decrescita"
  variazioneAnnuale: number // %
  variazioneUltimoSemestre?: number // %
  prezzoMedioAttuale: number
  descrizione: string
  icona: string
}

/**
 * Carica e cachea i dati OMI dal CSV
 * Usa cache in-memory per evitare letture ripetute del file
 */
function loadOMIDataFromCSV(): OMICSVRecord[] {
  // Controlla se la cache è valida
  const now = Date.now()
  if (csvCache && csvCacheTimestamp && (now - csvCacheTimestamp) < CACHE_TTL) {
    logger.info("Using cached CSV data")
    return csvCache
  }

  const csvPath = path.join(process.cwd(), "data", "omi-values.csv")

  if (!fs.existsSync(csvPath)) {
    logger.warn("CSV file not found", { path: csvPath })
    return []
  }

  logger.info("Loading OMI data from CSV", { path: csvPath })

  const fileContent = fs.readFileSync(csvPath, "utf-8")
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as Array<{
    citta: string
    zona: string
    cap: string
    tipoImmobile: string
    categoria: string
    valoreMinMq: string
    valoreMaxMq: string
    valoreMedioMq: string
    semestre: string
    anno: string
    fonte: string
  }>

  // Converti in formato tipizzato
  csvCache = records.map(record => ({
    citta: record.citta,
    zona: record.zona,
    cap: record.cap || "",
    tipoImmobile: record.tipoImmobile,
    categoria: record.categoria || "",
    valoreMinMq: parseFloat(record.valoreMinMq),
    valoreMaxMq: parseFloat(record.valoreMaxMq),
    valoreMedioMq: parseFloat(record.valoreMedioMq),
    semestre: parseInt(record.semestre),
    anno: parseInt(record.anno),
    fonte: record.fonte,
  }))

  csvCacheTimestamp = now
  logger.info("CSV data loaded and cached", { recordCount: csvCache.length })

  return csvCache
}

/**
 * Ottiene valore OMI per una specifica zona
 * Se la zona non è trovata, cerca il valore medio della città
 * Legge i dati direttamente dal CSV
 */
export function getOMIValueByZone(
  citta: string,
  zona?: string,
  cap?: string,
  tipoImmobile: string = "residenziale",
  categoria?: string
): {
  valoreMinMq: number
  valoreMaxMq: number
  valoreMedioMq: number
  zona: string
  fonte: string
  semestre: number
  anno: number
} | null {
  // Carica dati dal CSV (con cache)
  const allData = loadOMIDataFromCSV()

  if (allData.length === 0) {
    logger.warn("No OMI data available in CSV")
    return null
  }

  // Normalizza città
  const cittaNormalized = citta.trim().toLowerCase()

  // Helper per confronto case-insensitive
  const matchesCaseInsensitive = (a: string, b: string) =>
    a.toLowerCase() === b.toLowerCase()

  // 1. Cerca prima per ZONA specifica (con categoria se fornita)
  if (zona) {
    let filtered = allData.filter(record =>
      matchesCaseInsensitive(record.citta, cittaNormalized) &&
      matchesCaseInsensitive(record.zona, zona) &&
      record.tipoImmobile === tipoImmobile
    )

    // Aggiungi filtro categoria se fornito
    if (categoria) {
      filtered = filtered.filter(record =>
        matchesCaseInsensitive(record.categoria, categoria)
      )
    }

    if (filtered.length > 0) {
      // Ordina per anno e semestre decrescente, prendi il più recente
      filtered.sort((a, b) => {
        if (a.anno !== b.anno) return b.anno - a.anno
        return b.semestre - a.semestre
      })

      const latest = filtered[0]
      return {
        valoreMinMq: latest.valoreMinMq,
        valoreMaxMq: latest.valoreMaxMq,
        valoreMedioMq: latest.valoreMedioMq,
        zona: latest.zona,
        fonte: latest.fonte,
        semestre: latest.semestre,
        anno: latest.anno,
      }
    }
  }

  // 2. Cerca per CAP (con categoria se fornita)
  if (cap) {
    let filtered = allData.filter(record =>
      matchesCaseInsensitive(record.citta, cittaNormalized) &&
      record.cap === cap &&
      record.tipoImmobile === tipoImmobile
    )

    if (categoria) {
      filtered = filtered.filter(record =>
        matchesCaseInsensitive(record.categoria, categoria)
      )
    }

    if (filtered.length > 0) {
      filtered.sort((a, b) => {
        if (a.anno !== b.anno) return b.anno - a.anno
        return b.semestre - a.semestre
      })

      const latest = filtered[0]
      return {
        valoreMinMq: latest.valoreMinMq,
        valoreMaxMq: latest.valoreMaxMq,
        valoreMedioMq: latest.valoreMedioMq,
        zona: latest.zona,
        fonte: latest.fonte,
        semestre: latest.semestre,
        anno: latest.anno,
      }
    }

    // 2b. Se il CAP esiste ma la categoria non è disponibile per quel CAP,
    // cerchiamo lo stesso CAP con QUALSIASI categoria residenziale e applichiamo
    // un fattore di aggiustamento. Meglio restare sulla zona specifica con un
    // adjustment approssimato, che cadere nella media città (troppo generica).
    if (categoria) {
      const capAnyCategory = allData.filter(record =>
        matchesCaseInsensitive(record.citta, cittaNormalized) &&
        record.cap === cap &&
        record.tipoImmobile === tipoImmobile
      )
      if (capAnyCategory.length > 0) {
        // Preferisci "Abitazioni civili" come baseline se disponibile
        const civili = capAnyCategory.filter(r =>
          matchesCaseInsensitive(r.categoria, "Abitazioni civili")
        )
        const baseline = civili.length > 0 ? civili : capAnyCategory
        baseline.sort((a, b) => {
          if (a.anno !== b.anno) return b.anno - a.anno
          return b.semestre - a.semestre
        })
        const base = baseline[0]
        const cat = categoria.toLowerCase()
        // Ratio empirici rispetto a "Abitazioni civili" (baseline 1.0)
        let ratio = 1.0
        if (cat.includes("signorili")) ratio = 1.15
        else if (cat.includes("economic")) ratio = 0.88
        // Se base è già signorili (fallback), converti a civili prima di applicare ratio
        const baseIsSignorili = base.categoria.toLowerCase().includes("signorili")
        const baseIsEconomico = base.categoria.toLowerCase().includes("economic")
        let normalizationFactor = 1.0
        if (baseIsSignorili) normalizationFactor = 1 / 1.15
        else if (baseIsEconomico) normalizationFactor = 1 / 0.88
        const adjMin = Math.round(base.valoreMinMq * normalizationFactor * ratio)
        const adjMax = Math.round(base.valoreMaxMq * normalizationFactor * ratio)
        const adjMed = Math.round(base.valoreMedioMq * normalizationFactor * ratio)
        logger.info("OMI category not available for CAP, adjusted from sibling category", {
          cap, requested: categoria, base: base.categoria, ratio: ratio * normalizationFactor,
        })
        return {
          valoreMinMq: adjMin,
          valoreMaxMq: adjMax,
          valoreMedioMq: adjMed,
          zona: base.zona,
          fonte: `OMI (${base.zona}, categoria adattata da ${base.categoria})`,
          semestre: base.semestre,
          anno: base.anno,
        }
      }
    }
  }

  // 3. Fallback: MEDIA CITTÀ (con categoria se fornita)
  let cityFiltered = allData.filter(record =>
    matchesCaseInsensitive(record.citta, cittaNormalized) &&
    record.tipoImmobile === tipoImmobile
  )

  if (categoria) {
    cityFiltered = cityFiltered.filter(record =>
      matchesCaseInsensitive(record.categoria, categoria)
    )
  }

  if (cityFiltered.length === 0) {
    // 4. Fallback finale: cerca per CAP su TUTTE le città del CSV.
    // Utile quando il nome città fornito non corrisponde esattamente al CSV
    // (es. "Milano" vs "Milano (MI)", varianti, accenti, ecc.)
    if (cap) {
      let capFiltered = allData.filter(record =>
        record.cap === cap &&
        record.tipoImmobile === tipoImmobile
      )

      if (categoria) {
        capFiltered = capFiltered.filter(record =>
          matchesCaseInsensitive(record.categoria, categoria)
        )
      }

      if (capFiltered.length > 0) {
        capFiltered.sort((a, b) => {
          if (a.anno !== b.anno) return b.anno - a.anno
          return b.semestre - a.semestre
        })

        const recentCap = capFiltered.slice(0, Math.min(5, capFiltered.length))
        const avgMin = recentCap.reduce((sum, v) => sum + v.valoreMinMq, 0) / recentCap.length
        const avgMax = recentCap.reduce((sum, v) => sum + v.valoreMaxMq, 0) / recentCap.length
        const avgMedio = recentCap.reduce((sum, v) => sum + v.valoreMedioMq, 0) / recentCap.length

        logger.warn("City not found in OMI data, using CAP fallback", { citta, cap })

        return {
          valoreMinMq: Math.round(avgMin),
          valoreMaxMq: Math.round(avgMax),
          valoreMedioMq: Math.round(avgMedio),
          zona: "Media CAP",
          fonte: "OMI (media CAP)",
          semestre: recentCap[0].semestre,
          anno: recentCap[0].anno,
        }
      }
    }

    return null
  }

  // Ordina e prendi i 5 più recenti
  cityFiltered.sort((a, b) => {
    if (a.anno !== b.anno) return b.anno - a.anno
    return b.semestre - a.semestre
  })

  const recentValues = cityFiltered.slice(0, Math.min(5, cityFiltered.length))

  // Calcola medie
  const avgMin = recentValues.reduce((sum, v) => sum + v.valoreMinMq, 0) / recentValues.length
  const avgMax = recentValues.reduce((sum, v) => sum + v.valoreMaxMq, 0) / recentValues.length
  const avgMedio = recentValues.reduce((sum, v) => sum + v.valoreMedioMq, 0) / recentValues.length

  return {
    valoreMinMq: Math.round(avgMin),
    valoreMaxMq: Math.round(avgMax),
    valoreMedioMq: Math.round(avgMedio),
    zona: "Media città",
    fonte: "OMI (media città)",
    semestre: recentValues[0].semestre,
    anno: recentValues[0].anno,
  }
}

/**
 * Ottiene storico prezzi per una zona
 * Restituisce gli ultimi N semestri
 * Legge i dati direttamente dal CSV
 */
export function getPriceHistory(
  citta: string,
  zona: string,
  tipoImmobile: string = "residenziale",
  numSemestri: number = 6
): PriceHistoryEntry[] {
  const allData = loadOMIDataFromCSV()

  const matchesCaseInsensitive = (a: string, b: string) =>
    a.toLowerCase() === b.toLowerCase()

  // Filtra per città, zona e tipo immobile
  let history = allData.filter(record =>
    matchesCaseInsensitive(record.citta, citta) &&
    matchesCaseInsensitive(record.zona, zona) &&
    record.tipoImmobile === tipoImmobile
  )

  // Ordina per anno e semestre decrescente
  history.sort((a, b) => {
    if (a.anno !== b.anno) return b.anno - a.anno
    return b.semestre - a.semestre
  })

  // Prendi solo i primi N
  history = history.slice(0, numSemestri)

  // Calcola variazioni
  const result: PriceHistoryEntry[] = []
  for (let i = 0; i < history.length; i++) {
    const current = history[i]
    const previous = history[i + 1]

    const valoreMedioMq = current.valoreMedioMq
    let variazione: number | undefined

    if (previous) {
      const prevValue = previous.valoreMedioMq
      variazione = ((valoreMedioMq - prevValue) / prevValue) * 100
    }

    result.unshift({
      semestre: `${current.anno}-S${current.semestre}`,
      valoreMedioMq,
      variazione,
    })
  }

  return result
}

/**
 * Calcola trend automatico per una zona
 * Legge i dati direttamente dal CSV
 */
export function calculateZoneTrend(
  citta: string,
  zona: string,
  tipoImmobile: string = "residenziale"
): ZoneTrend | null {
  const history = getPriceHistory(citta, zona, tipoImmobile, 4) // ultimi 2 anni

  if (history.length < 2) {
    return null
  }

  const current = history[history.length - 1]
  const previous = history[history.length - 2]

  // Calcola variazione ultimo semestre
  const variazioneUltimoSemestre = previous.variazione || 0

  // Calcola variazione annuale (confronto con stesso semestre anno precedente)
  let variazioneAnnuale = 0
  if (history.length >= 3) {
    const yearAgo = history[Math.max(0, history.length - 3)]
    variazioneAnnuale =
      ((current.valoreMedioMq - yearAgo.valoreMedioMq) / yearAgo.valoreMedioMq) * 100
  }

  // Determina trend
  let trend: "crescita" | "stabile" | "decrescita"
  let icona: string
  let descrizione: string

  if (variazioneAnnuale > 2) {
    trend = "crescita"
    icona = "📈"
    descrizione = `Zona in crescita (+${variazioneAnnuale.toFixed(1)}% annuo)`
  } else if (variazioneAnnuale < -2) {
    trend = "decrescita"
    icona = "📉"
    descrizione = `Zona in calo (${variazioneAnnuale.toFixed(1)}% annuo)`
  } else {
    trend = "stabile"
    icona = "📊"
    descrizione = `Zona stabile (${variazioneAnnuale >= 0 ? "+" : ""}${variazioneAnnuale.toFixed(1)}% annuo)`
  }

  return {
    trend,
    variazioneAnnuale,
    variazioneUltimoSemestre,
    prezzoMedioAttuale: current.valoreMedioMq,
    descrizione,
    icona,
  }
}

/**
 * Ottiene tutte le zone disponibili per una città
 * Legge i dati direttamente dal CSV
 */
export function getZonesByCity(citta: string): Array<{
  zona: string
  cap?: string
  numeroValori: number
}> {
  const allData = loadOMIDataFromCSV()

  const matchesCaseInsensitive = (a: string, b: string) =>
    a.toLowerCase() === b.toLowerCase()

  // Filtra per città
  const cityData = allData.filter(record =>
    matchesCaseInsensitive(record.citta, citta)
  )

  // Raggruppa per zona e CAP
  const grouped = new Map<string, { zona: string; cap: string; count: number }>()

  cityData.forEach(record => {
    const key = `${record.zona}_${record.cap}`
    if (grouped.has(key)) {
      grouped.get(key)!.count++
    } else {
      grouped.set(key, {
        zona: record.zona,
        cap: record.cap,
        count: 1,
      })
    }
  })

  // Converti in array e ordina per zona
  return Array.from(grouped.values())
    .map(g => ({
      zona: g.zona,
      cap: g.cap || undefined,
      numeroValori: g.count,
    }))
    .sort((a, b) => a.zona.localeCompare(b.zona))
}

/**
 * Mappa tipo immobile da PropertyType a tipo OMI
 */
export function mapPropertyTypeToOMI(propertyType: PropertyType): string {
  switch (propertyType) {
    case PropertyType.APARTMENT:
    case PropertyType.ATTICO:
    case PropertyType.VILLA:
      return "residenziale"
    case PropertyType.OFFICE:
      return "uffici"
    case PropertyType.SHOP:
      return "commerciale"
    case PropertyType.BOX:
      return "box"
    case PropertyType.OTHER:
    case PropertyType.LAND:
    default:
      return "residenziale"
  }
}
