/**
 * OMI Advanced - Sistema avanzato per dati Osservatorio Mercato Immobiliare
 * Supporta:
 * - Caricamento dati da CSV
 * - Ricerca per zona specifica
 * - Storico prezzi
 * - Calcolo trend automatico
 */

import { PropertyType } from "@/types"
import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { createLogger } from "./logger"

const logger = createLogger('omi-advanced')

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
 * Carica dati OMI dal CSV nel database
 * Da eseguire una volta per inizializzare il database
 */
export async function loadOMIDataFromCSV(): Promise<number> {
  const csvPath = path.join(process.cwd(), "data", "omi-values.csv")

  if (!fs.existsSync(csvPath)) {
    logger.warn("CSV file not found", { path: csvPath })
    return 0
  }

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

  let count = 0

  for (const record of records) {
    try {
      // Inserisci in OMIValue
      await prisma.oMIValue.upsert({
        where: {
          OMIValue_unique: {
            citta: record.citta,
            zona: record.zona,
            tipoImmobile: record.tipoImmobile,
            categoria: record.categoria || "",
            anno: parseInt(record.anno),
            semestre: parseInt(record.semestre),
          },
        },
        update: {
          valoreMinMq: parseFloat(record.valoreMinMq),
          valoreMaxMq: parseFloat(record.valoreMaxMq),
          valoreMedioMq: parseFloat(record.valoreMedioMq),
          cap: record.cap || null,
          fonte: record.fonte,
          dataAggiornamento: new Date(),
        },
        create: {
          citta: record.citta,
          zona: record.zona,
          cap: record.cap || null,
          tipoImmobile: record.tipoImmobile,
          categoria: record.categoria || null,
          valoreMinMq: parseFloat(record.valoreMinMq),
          valoreMaxMq: parseFloat(record.valoreMaxMq),
          valoreMedioMq: parseFloat(record.valoreMedioMq),
          semestre: parseInt(record.semestre),
          anno: parseInt(record.anno),
          fonte: record.fonte,
        },
      })

      // Inserisci anche in PriceHistory
      await prisma.priceHistory.upsert({
        where: {
          PriceHistory_unique: {
            citta: record.citta,
            zona: record.zona,
            tipoImmobile: record.tipoImmobile,
            anno: parseInt(record.anno),
            semestre: parseInt(record.semestre),
          },
        },
        update: {
          valoreMinMq: parseFloat(record.valoreMinMq),
          valoreMaxMq: parseFloat(record.valoreMaxMq),
          valoreMedioMq: parseFloat(record.valoreMedioMq),
          cap: record.cap || null,
          fonte: record.fonte,
        },
        create: {
          citta: record.citta,
          zona: record.zona,
          cap: record.cap || null,
          tipoImmobile: record.tipoImmobile,
          valoreMinMq: parseFloat(record.valoreMinMq),
          valoreMaxMq: parseFloat(record.valoreMaxMq),
          valoreMedioMq: parseFloat(record.valoreMedioMq),
          semestre: parseInt(record.semestre),
          anno: parseInt(record.anno),
          fonte: record.fonte,
        },
      })

      count++
    } catch (error) {
      logger.error("Error loading OMI record", error, { record })
    }
  }

  return count
}

/**
 * Ottiene valore OMI per una specifica zona
 * Se la zona non è trovata, cerca il valore medio della città
 */
export async function getOMIValueByZone(
  citta: string,
  zona?: string,
  cap?: string,
  tipoImmobile: string = "residenziale"
): Promise<{
  valoreMinMq: number
  valoreMaxMq: number
  valoreMedioMq: number
  zona: string
  fonte: string
  semestre: number
  anno: number
} | null> {
  // Normalizza città
  const cittaNormalized = citta.trim()

  // Cerca prima per zona specifica
  if (zona) {
    const omiValue = await prisma.oMIValue.findFirst({
      where: {
        citta: {
          equals: cittaNormalized,
          mode: "insensitive",
        },
        zona: {
          equals: zona,
          mode: "insensitive",
        },
        tipoImmobile,
      },
      orderBy: [{ anno: "desc" }, { semestre: "desc" }],
    })

    if (omiValue) {
      return {
        valoreMinMq: parseFloat(omiValue.valoreMinMq.toString()),
        valoreMaxMq: parseFloat(omiValue.valoreMaxMq.toString()),
        valoreMedioMq: parseFloat(omiValue.valoreMedioMq.toString()),
        zona: omiValue.zona,
        fonte: omiValue.fonte,
        semestre: omiValue.semestre,
        anno: omiValue.anno,
      }
    }
  }

  // Cerca per CAP
  if (cap) {
    const omiValue = await prisma.oMIValue.findFirst({
      where: {
        citta: {
          equals: cittaNormalized,
          mode: "insensitive",
        },
        cap,
        tipoImmobile,
      },
      orderBy: [{ anno: "desc" }, { semestre: "desc" }],
    })

    if (omiValue) {
      return {
        valoreMinMq: parseFloat(omiValue.valoreMinMq.toString()),
        valoreMaxMq: parseFloat(omiValue.valoreMaxMq.toString()),
        valoreMedioMq: parseFloat(omiValue.valoreMedioMq.toString()),
        zona: omiValue.zona,
        fonte: omiValue.fonte,
        semestre: omiValue.semestre,
        anno: omiValue.anno,
      }
    }
  }

  // Fallback: media città
  const avgValues = await prisma.oMIValue.findMany({
    where: {
      citta: {
        equals: cittaNormalized,
        mode: "insensitive",
      },
      tipoImmobile,
    },
    orderBy: [{ anno: "desc" }, { semestre: "desc" }],
  })

  if (avgValues.length === 0) {
    return null
  }

  // Calcola media dei valori più recenti
  const recentValues = avgValues.slice(0, Math.min(5, avgValues.length))
  const avgMin =
    recentValues.reduce((sum, v) => sum + parseFloat(v.valoreMinMq.toString()), 0) /
    recentValues.length
  const avgMax =
    recentValues.reduce((sum, v) => sum + parseFloat(v.valoreMaxMq.toString()), 0) /
    recentValues.length
  const avgMedio =
    recentValues.reduce((sum, v) => sum + parseFloat(v.valoreMedioMq.toString()), 0) /
    recentValues.length

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
 */
export async function getPriceHistory(
  citta: string,
  zona: string,
  tipoImmobile: string = "residenziale",
  numSemestri: number = 6
): Promise<PriceHistoryEntry[]> {
  const history = await prisma.priceHistory.findMany({
    where: {
      citta: {
        equals: citta,
        mode: "insensitive",
      },
      zona: {
        equals: zona,
        mode: "insensitive",
      },
      tipoImmobile,
    },
    orderBy: [{ anno: "desc" }, { semestre: "desc" }],
    take: numSemestri,
  })

  // Calcola variazioni
  const result: PriceHistoryEntry[] = []
  for (let i = 0; i < history.length; i++) {
    const current = history[i]
    const previous = history[i + 1]

    const valoreMedioMq = parseFloat(current.valoreMedioMq.toString())
    let variazione: number | undefined

    if (previous) {
      const prevValue = parseFloat(previous.valoreMedioMq.toString())
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
 */
export async function calculateZoneTrend(
  citta: string,
  zona: string,
  tipoImmobile: string = "residenziale"
): Promise<ZoneTrend | null> {
  const history = await getPriceHistory(citta, zona, tipoImmobile, 4) // ultimi 2 anni

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

  // Salva insight nel database
  await prisma.zoneInsight.upsert({
    where: {
      ZoneInsight_unique: {
        citta,
        zona,
        dataCalcolo: new Date(),
      },
    },
    update: {
      trend,
      variazioneAnnuale,
      variazioneUltimoSemestre,
      prezzoMedioAttuale: current.valoreMedioMq,
      descrizione,
      icona,
    },
    create: {
      citta,
      zona,
      trend,
      variazioneAnnuale,
      variazioneUltimoSemestre,
      prezzoMedioAttuale: current.valoreMedioMq,
      descrizione,
      icona,
    },
  })

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
 */
export async function getZonesByCity(citta: string): Promise<
  Array<{
    zona: string
    cap?: string
    numeroValori: number
  }>
> {
  const zones = await prisma.oMIValue.groupBy({
    by: ["zona", "cap"],
    where: {
      citta: {
        equals: citta,
        mode: "insensitive",
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      zona: "asc",
    },
  })

  return zones.map((z) => ({
    zona: z.zona,
    cap: z.cap || undefined,
    numeroValori: z._count.id,
  }))
}

/**
 * Mappa tipo immobile da PropertyType a tipo OMI
 */
export function mapPropertyTypeToOMI(propertyType: PropertyType): string {
  switch (propertyType) {
    case PropertyType.APARTMENT:
    case PropertyType.VILLA:
      return "residenziale"
    case PropertyType.OFFICE:
      return "uffici"
    case PropertyType.OTHER:
      return "commerciale"
    default:
      return "residenziale"
  }
}
