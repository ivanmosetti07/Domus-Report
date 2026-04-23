/**
 * Prende le ultime N valutazioni salvate nel DB e le ricalcola col motore v2
 * "additivo trasparente". Mostra il diff puntuale per ogni campo rilevante.
 *
 * Usage:
 *   npx tsx scripts/verify-last-valuations.ts            # default: 2 ultime
 *   npx tsx scripts/verify-last-valuations.ts 5          # ultime 5
 */

import { PrismaClient } from '@prisma/client'
import { calculateValuationLocal } from '../lib/valuation'
import { PropertyType, PropertyCondition, OccupancyStatus } from '../types'

const prisma = new PrismaClient()

function toPropertyType(s: string | null | undefined): PropertyType {
  return (s && Object.values(PropertyType).includes(s as PropertyType)
    ? s
    : PropertyType.APARTMENT) as PropertyType
}

function toPropertyCondition(s: string | null | undefined): PropertyCondition {
  return (s && Object.values(PropertyCondition).includes(s as PropertyCondition)
    ? s
    : PropertyCondition.GOOD) as PropertyCondition
}

function fmtPct(a: number, b: number): string {
  if (!b) return 'n/d'
  const pct = ((a - b) / b) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

function absPctDiff(a: number, b: number): number {
  if (!b) return 0
  return Math.abs((a - b) / b) * 100
}

function pad(s: string, n: number): string {
  return (s + ' '.repeat(n)).slice(0, n)
}

function fmtEur(n: number): string {
  return '€' + n.toLocaleString('it-IT')
}

async function verifyOne(leadId: string, index: number, total: number) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      property: { include: { valuation: true } },
      agenzia: { select: { nome: true, email: true, piano: true } },
    },
  })
  if (!lead || !lead.property || !lead.property.valuation) {
    console.log(`⚠️  lead ${leadId}: dati incompleti, salto`)
    return
  }

  const p = lead.property
  const v = p.valuation!

  console.log('\n\n╔══════════════════════════════════════════════════════════════════╗')
  console.log(`║  VALUTAZIONE ${index + 1} / ${total}`.padEnd(67) + '║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')
  console.log(`Lead:       ${lead.nome} ${lead.cognome} <${lead.email}>`)
  console.log(`Telefono:   ${lead.telefono ?? 'n/d'}`)
  console.log(`Agenzia:    ${lead.agenzia.nome} (piano ${lead.agenzia.piano})`)
  console.log(`Richiesto:  ${lead.dataRichiesta.toISOString().slice(0, 19)}`)
  console.log(`Calcolato:  ${v.dataCalcolo.toISOString().slice(0, 19)}`)
  console.log(`Lead ID:    ${lead.id}`)

  console.log('\n── INPUT IMMOBILE ─────────────────────────────────────────────────')
  console.log(`Indirizzo:        ${p.indirizzo}`)
  console.log(`Città / CAP:      ${p.citta} ${p.cap ?? ''}`)
  console.log(`Quartiere:        ${p.quartiere ?? 'n/d'}`)
  console.log(`Tipo:             ${p.tipo} (${p.superficieMq} m²)`)
  console.log(`Locali / bagni:   ${p.locali ?? 'n/d'} / ${p.bagni ?? 'n/d'}`)
  console.log(`Piano:            ${p.piano ?? 'n/d'}  ascensore=${p.ascensore === null ? 'n/d' : p.ascensore}`)
  console.log(`Stato:            ${p.stato}`)
  console.log(`Classe / anno:    ${p.classeEnergetica ?? 'n/d'} / ${p.annoCostruzione ?? 'n/d'}`)
  console.log(`Parking / out:    ${p.postoAuto === null ? 'n/d' : p.postoAuto} / ${p.spaziEsterni ?? 'n/d'}`)

  console.log('\n── OUTPUT SALVATO IN DB ──────────────────────────────────────────')
  const dbPricePerSqm = v.pricePerSqm ?? Math.round(v.prezzoStimato / p.superficieMq)
  console.log(`Stima:            ${fmtEur(v.prezzoStimato)}`)
  console.log(`Range:            ${fmtEur(v.prezzoMinimo)} – ${fmtEur(v.prezzoMassimo)}`)
  console.log(`€/mq:             ${dbPricePerSqm}`)
  console.log(`OMI base:         €${v.valoreOmiBase}/m²`)
  console.log(`Coef. piano:      ${v.coefficientePiano}`)
  console.log(`Coef. stato:      ${v.coefficienteStato}`)
  console.log(`Confidence:       ${v.confidence ?? 'n/d'} (${v.confidenceScore ?? 'n/d'})`)
  console.log(`Zone match:       ${v.omiZoneMatch ?? 'n/d'}`)

  console.log('\n── RICALCOLO MOTORE v2 (additivo) ────────────────────────────────')
  const recalc = calculateValuationLocal({
    address: p.indirizzo,
    city: p.citta,
    neighborhood: p.quartiere ?? undefined,
    postalCode: p.cap ?? undefined,
    latitude: p.latitudine ?? undefined,
    longitude: p.longitudine ?? undefined,
    propertyType: toPropertyType(p.tipo),
    surfaceSqm: p.superficieMq,
    floor: p.piano ?? undefined,
    hasElevator: p.ascensore ?? undefined,
    condition: toPropertyCondition(p.stato),
    energyClass: p.classeEnergetica ?? undefined,
    buildYear: p.annoCostruzione ?? undefined,
    hasParking: p.postoAuto ?? undefined,
    outdoorSpace: p.spaziEsterni ?? undefined,
    heatingType: p.riscaldamento ?? undefined,
    rooms: p.locali ?? undefined,
    bathrooms: p.bagni ?? undefined,
    occupancyStatus: (p.statoOccupazione ?? undefined) as OccupancyStatus | string | undefined,
  })
  console.log(`Stima:            ${fmtEur(recalc.estimatedPrice)}`)
  console.log(`Range:            ${fmtEur(recalc.minPrice)} – ${fmtEur(recalc.maxPrice)}`)
  console.log(`€/mq:             ${recalc.pricePerSqm}`)
  console.log(`OMI base:         €${recalc.baseOMIValue}/m²`)
  console.log(`Coef. piano:      ${recalc.floorCoefficient}`)
  console.log(`Coef. stato:      ${recalc.conditionCoefficient} (puro: ${recalc.pureConditionCoefficient})`)
  console.log(`Confidence:       ${recalc.confidence} (${recalc.confidenceScore})`)
  console.log(`Zone match:       ${recalc.omiZoneMatch}`)
  console.log(`Spiegazione:      ${recalc.explanation}`)

  console.log('\n── DIFF ──────────────────────────────────────────────────────────')
  const diffs: Array<{ field: string; db: number; now: number; diffPct: number }> = [
    { field: 'baseOMIValue', db: v.valoreOmiBase, now: recalc.baseOMIValue, diffPct: absPctDiff(recalc.baseOMIValue, v.valoreOmiBase) },
    { field: 'floorCoefficient', db: v.coefficientePiano, now: recalc.floorCoefficient, diffPct: absPctDiff(recalc.floorCoefficient, v.coefficientePiano) },
    { field: 'conditionCoefficient', db: v.coefficienteStato, now: recalc.conditionCoefficient, diffPct: absPctDiff(recalc.conditionCoefficient, v.coefficienteStato) },
    { field: 'estimatedPrice', db: v.prezzoStimato, now: recalc.estimatedPrice, diffPct: absPctDiff(recalc.estimatedPrice, v.prezzoStimato) },
    { field: 'minPrice', db: v.prezzoMinimo, now: recalc.minPrice, diffPct: absPctDiff(recalc.minPrice, v.prezzoMinimo) },
    { field: 'maxPrice', db: v.prezzoMassimo, now: recalc.maxPrice, diffPct: absPctDiff(recalc.maxPrice, v.prezzoMassimo) },
    { field: 'pricePerSqm', db: dbPricePerSqm, now: recalc.pricePerSqm, diffPct: absPctDiff(recalc.pricePerSqm, dbPricePerSqm) },
  ]

  const TOL = 2
  console.log(pad('Campo', 24) + pad('DB', 14) + pad('v2', 14) + pad('Δ%', 10) + 'Ok')
  console.log('─'.repeat(72))
  for (const d of diffs) {
    const flag = d.diffPct > TOL ? '❌' : '✅'
    console.log(
      pad(d.field, 24) +
        pad(String(d.db), 14) +
        pad(String(d.now), 14) +
        pad(fmtPct(d.now, d.db), 10) +
        flag
    )
  }
  if (v.omiZoneMatch && v.omiZoneMatch !== recalc.omiZoneMatch) {
    console.log(`omiZoneMatch:  DB="${v.omiZoneMatch}" → v2="${recalc.omiZoneMatch}"`)
  }
  if (v.confidence && v.confidence !== recalc.confidence) {
    console.log(`confidence:    DB="${v.confidence}" → v2="${recalc.confidence}"`)
  }

  const significant = diffs.filter((d) => d.diffPct > TOL)
  console.log('\n── VERDETTO ──────────────────────────────────────────────────────')
  if (significant.length === 0) {
    console.log('✅ OK: coerente col motore v2 (tutte le diff sotto 2%).')
  } else {
    console.log(`❌ DISCREPANZA: ${significant.length} campo/i oltre 2%.`)
    for (const d of significant) {
      console.log(`   • ${d.field}: ${d.db} → ${d.now} (${fmtPct(d.now, d.db)})`)
    }
    console.log('   → Per aggiornare: POST /api/admin/leads/' + lead.id + '/recalculate')
    console.log('     oppure usa `scripts/update-lead-valuation.ts`.')
  }

  if (recalc.warnings.length > 0) {
    console.log('\n── WARNINGS MOTORE v2 ───────────────────────────────────────────')
    for (const w of recalc.warnings) {
      console.log(`   [${w.severity}] ${w.code}: ${w.message}`)
    }
  }
}

async function main() {
  const n = parseInt(process.argv[2] ?? '2', 10)
  console.log(`🔍 Cerco le ultime ${n} valutazioni nel DB…`)

  // Prendi le N valuation più recenti per dataCalcolo
  const lastValuations = await prisma.valuation.findMany({
    orderBy: { dataCalcolo: 'desc' },
    take: n,
    include: {
      property: { include: { lead: true } },
    },
  })

  if (lastValuations.length === 0) {
    console.log('❌ Nessuna valutazione trovata nel DB.')
    process.exit(1)
  }

  console.log(`\nTrovate ${lastValuations.length} valutazioni (più recenti prima):`)
  for (let i = 0; i < lastValuations.length; i++) {
    const lv = lastValuations[i]
    const lead = lv.property.lead
    console.log(
      `  ${i + 1}. ${lead?.nome ?? '?'} ${lead?.cognome ?? ''} <${lead?.email ?? 'n/d'}> — ` +
        `${lv.property.citta} ${lv.property.indirizzo} — ${lv.dataCalcolo.toISOString().slice(0, 10)}`
    )
  }

  for (let i = 0; i < lastValuations.length; i++) {
    const lv = lastValuations[i]
    if (!lv.property.lead) {
      console.log(`\n⚠️  valuation ${lv.id}: nessun lead associato, salto.`)
      continue
    }
    await verifyOne(lv.property.lead.id, i, lastValuations.length)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
