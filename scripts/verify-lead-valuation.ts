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

function causaProbabile(field: string, dbValue: number, newValue: number): string {
  // Euristica basata sui 6 bug fix recenti
  if (field === 'floorCoefficient' && newValue < dbValue) {
    return "bug_006: il refinement comparables non applicava floorCoefficient → prezzi piano terra/alti gonfiati"
  }
  if (field === 'baseOMIValue' && newValue < dbValue * 0.75) {
    return "bug_027: RENOVATED promuoveva a 'Abitazioni signorili' (+30-50%)"
  }
  if (field === 'conditionCoefficient' && Math.abs(newValue - dbValue) > 0.05) {
    return "bug_008: refinement usava composite invece di pure condition → doppio conteggio energy/year/extras"
  }
  if (field === 'estimatedPrice' && Math.abs(newValue - dbValue) / dbValue > 0.05) {
    return "combinazione bug_006/bug_008/bug_027 sul prezzo finale"
  }
  return "motore aggiornato (Sprint 1-4 + fix review)"
}

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx tsx scripts/verify-lead-valuation.ts <email>')
    process.exit(1)
  }

  console.log(`\n🔍 Ricerca lead con email: ${email}\n`)

  const lead = await prisma.lead.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: {
      property: { include: { valuation: true } },
      agenzia: { select: { nome: true, email: true, piano: true } },
    },
    orderBy: { dataRichiesta: 'desc' },
  })

  if (!lead) {
    console.log('❌ Non trovato nella tabella Lead. Provo DemoLead...\n')
    const demo = await prisma.demoLead.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      orderBy: { dataRichiesta: 'desc' },
    })
    if (!demo) {
      console.error(`❌ Nessun lead o demo lead trovato per ${email}`)
      process.exit(1)
    }
    console.log('📝 Trovato in DemoLead (valutazione limitata, non salva coefficienti):')
    console.log(JSON.stringify(demo, null, 2))
    process.exit(0)
  }

  const p = lead.property
  const v = p?.valuation

  console.log('═══════════════════════════════════════════════════════════════')
  console.log('LEAD')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`ID:          ${lead.id}`)
  console.log(`Nome:        ${lead.nome} ${lead.cognome}`)
  console.log(`Email:       ${lead.email}`)
  console.log(`Telefono:    ${lead.telefono ?? 'n/d'}`)
  console.log(`Data:        ${lead.dataRichiesta.toISOString()}`)
  console.log(`Agenzia:     ${lead.agenzia.nome} (${lead.agenzia.email}) · piano ${lead.agenzia.piano}`)

  if (!p) {
    console.log('\n⚠️  Lead senza Property: impossibile ricalcolare valutazione.')
    process.exit(0)
  }

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('INPUT IMMOBILE (dal DB)')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`Indirizzo:          ${p.indirizzo}`)
  console.log(`Città:              ${p.citta}`)
  console.log(`CAP:                ${p.cap ?? 'n/d'}`)
  console.log(`Quartiere:          ${p.quartiere ?? 'n/d'}`)
  console.log(`Coordinate:         ${p.latitudine ?? 'n/d'}, ${p.longitudine ?? 'n/d'}`)
  console.log(`Tipo:               ${p.tipo}`)
  console.log(`Superficie:         ${p.superficieMq} m²`)
  console.log(`Locali:             ${p.locali ?? 'n/d'}`)
  console.log(`Bagni:              ${p.bagni ?? 'n/d'}`)
  console.log(`Piano:              ${p.piano ?? 'n/d'} (ascensore: ${p.ascensore === null ? 'n/d' : p.ascensore ? 'sì' : 'no'})`)
  console.log(`Stato:              ${p.stato}`)
  console.log(`Classe energetica:  ${p.classeEnergetica ?? 'n/d'}`)
  console.log(`Anno costruzione:   ${p.annoCostruzione ?? 'n/d'}`)
  console.log(`Posto auto:         ${p.postoAuto === null ? 'n/d' : p.postoAuto ? 'sì' : 'no'}`)
  console.log(`Spazi esterni:      ${p.spaziEsterni ?? 'n/d'}`)
  console.log(`Riscaldamento:      ${p.riscaldamento ?? 'n/d'}`)
  console.log(`A/C:                ${p.ariaCondizionata === null ? 'n/d' : p.ariaCondizionata ? 'sì' : 'no'}`)
  console.log(`Occupazione:        ${p.statoOccupazione ?? 'n/d'}`)

  if (!v) {
    console.log('\n⚠️  Property senza Valuation salvata in DB.')
    process.exit(0)
  }

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('OUTPUT VALUTAZIONE (salvato in DB)')
  console.log('═══════════════════════════════════════════════════════════════')
  const dbPricePerSqm =
    v.pricePerSqm ?? Math.round(v.prezzoStimato / p.superficieMq)
  console.log(`Prezzo stimato:     €${v.prezzoStimato.toLocaleString('it-IT')}`)
  console.log(`Range:              €${v.prezzoMinimo.toLocaleString('it-IT')} – €${v.prezzoMassimo.toLocaleString('it-IT')}`)
  console.log(`€/mq:               ${dbPricePerSqm} (price_per_sqm ${v.pricePerSqm ? 'dal DB' : 'ricavato da stima/superficie'})`)
  console.log(`OMI base:           €${v.valoreOmiBase}/m²`)
  console.log(`Coef. piano:        ${v.coefficientePiano}`)
  console.log(`Coef. stato (composite): ${v.coefficienteStato}`)
  console.log(`Confidence:         ${v.confidence ?? 'n/d'} (score: ${v.confidenceScore ?? 'n/d'})`)
  console.log(`Zone match:         ${v.omiZoneMatch ?? 'n/d'}`)
  console.log(`Data completeness:  ${v.dataCompleteness ?? 'n/d'}%`)
  const dbWarnings = (v.warnings as Array<{ code: string; message: string; severity: string }> | null) ?? []
  console.log(`Warnings salvati:   ${dbWarnings.length}`)
  for (const w of dbWarnings) {
    console.log(`  [${w.severity}] ${w.code}: ${w.message}`)
  }
  const dbCmp = (v.comparablesData as any) || null
  if (dbCmp && dbCmp.sampleSize) {
    console.log(`Comparables:        ${dbCmp.sampleSize} annunci · mediana €${dbCmp.medianPricePerSqm}/m²`)
    if (dbCmp.crossCheck?.deltaPct !== undefined) {
      console.log(`  Delta vs OMI:     ${dbCmp.crossCheck.deltaPct}% (${dbCmp.crossCheck.agreement})`)
    }
  } else {
    console.log(`Comparables:        non presenti`)
  }
  console.log(`Data calcolo DB:    ${v.dataCalcolo.toISOString()}`)

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('RICALCOLO CON MOTORE ATTUALE')
  console.log('═══════════════════════════════════════════════════════════════')

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

  console.log(`Prezzo stimato:     €${recalc.estimatedPrice.toLocaleString('it-IT')}`)
  console.log(`Range:              €${recalc.minPrice.toLocaleString('it-IT')} – €${recalc.maxPrice.toLocaleString('it-IT')}`)
  console.log(`€/mq:               ${recalc.pricePerSqm}`)
  console.log(`OMI base:           €${recalc.baseOMIValue}/m²`)
  console.log(`Coef. piano:        ${recalc.floorCoefficient}`)
  console.log(`Coef. stato (composite): ${recalc.conditionCoefficient}`)
  console.log(`Coef. stato PURO:   ${recalc.pureConditionCoefficient}`)
  console.log(`Confidence:         ${recalc.confidence} (score: ${recalc.confidenceScore})`)
  console.log(`Zone match:         ${recalc.omiZoneMatch}`)
  console.log(`Data completeness:  ${recalc.dataCompleteness}%`)
  console.log(`Warnings motore:    ${recalc.warnings.length}`)
  for (const w of recalc.warnings) {
    console.log(`  [${w.severity}] ${w.code}: ${w.message}`)
  }
  console.log(`Spiegazione: ${recalc.explanation}`)

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('DIFF (DB vs ricalcolo attuale)')
  console.log('═══════════════════════════════════════════════════════════════')

  const diffs: Array<{ field: string; db: number; now: number; diffPct: number }> = [
    { field: 'baseOMIValue', db: v.valoreOmiBase, now: recalc.baseOMIValue, diffPct: absPctDiff(recalc.baseOMIValue, v.valoreOmiBase) },
    { field: 'floorCoefficient', db: v.coefficientePiano, now: recalc.floorCoefficient, diffPct: absPctDiff(recalc.floorCoefficient, v.coefficientePiano) },
    { field: 'conditionCoefficient', db: v.coefficienteStato, now: recalc.conditionCoefficient, diffPct: absPctDiff(recalc.conditionCoefficient, v.coefficienteStato) },
    { field: 'estimatedPrice', db: v.prezzoStimato, now: recalc.estimatedPrice, diffPct: absPctDiff(recalc.estimatedPrice, v.prezzoStimato) },
    { field: 'minPrice', db: v.prezzoMinimo, now: recalc.minPrice, diffPct: absPctDiff(recalc.minPrice, v.prezzoMinimo) },
    { field: 'maxPrice', db: v.prezzoMassimo, now: recalc.maxPrice, diffPct: absPctDiff(recalc.maxPrice, v.prezzoMassimo) },
    { field: 'pricePerSqm', db: dbPricePerSqm, now: recalc.pricePerSqm, diffPct: absPctDiff(recalc.pricePerSqm, dbPricePerSqm) },
  ]

  const TOL = 2 // soglia 2%
  const significant = diffs.filter((d) => d.diffPct > TOL)

  const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n)
  console.log(pad('Campo', 24), pad('DB', 14), pad('Ora', 14), pad('Δ%', 10), 'Signif.')
  console.log('─'.repeat(72))
  for (const d of diffs) {
    const flag = d.diffPct > TOL ? '❌' : '✅'
    console.log(
      pad(d.field, 24),
      pad(String(d.db), 14),
      pad(String(d.now), 14),
      pad(fmtPct(d.now, d.db), 10),
      flag
    )
  }

  // Diff su campi stringa
  if (v.omiZoneMatch !== null && v.omiZoneMatch !== recalc.omiZoneMatch) {
    console.log(`\nomiZoneMatch:       DB="${v.omiZoneMatch}" → Ora="${recalc.omiZoneMatch}"`)
  }
  if (v.confidence && v.confidence !== recalc.confidence) {
    console.log(`confidence:         DB="${v.confidence}" → Ora="${recalc.confidence}"`)
  }

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('VERDETTO')
  console.log('═══════════════════════════════════════════════════════════════')

  if (significant.length === 0) {
    console.log('✅ OK — la valutazione salvata è coerente col motore attuale')
    console.log('   (tutte le differenze sotto il 2%).')
  } else {
    console.log(`❌ DISCREPANZA — ${significant.length} campo/i oltre la soglia ${TOL}%:\n`)
    for (const d of significant) {
      console.log(`  • ${d.field}: ${d.db} → ${d.now} (${fmtPct(d.now, d.db)})`)
      console.log(`    Probabile causa: ${causaProbabile(d.field, d.db, d.now)}`)
    }
    console.log('\n   La valutazione in DB è stata calcolata con una versione PRECEDENTE')
    console.log('   del motore. Per aggiornarla basta aprire la pagina del lead')
    console.log('   (o far generare una nuova valutazione al widget).')
  }

  // Warnings che emetterebbe ora
  if (recalc.warnings.length > 0) {
    console.log('\n📋 Avvertenze che il motore ATTUALE emette per questo immobile:')
    for (const w of recalc.warnings) {
      console.log(`   [${w.severity}] ${w.message}`)
    }
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
