import { PrismaClient } from '@prisma/client'
import { calculateValuationLocal } from '../lib/valuation'
import {
  searchComparables,
  crossCheckWithOMI,
  applyComparablesRefinement,
  isComparablesEnabled,
} from '../lib/comparables'
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

async function main() {
  const email = process.argv[2]
  const skipComparables = process.argv.includes('--no-comparables')

  if (!email) {
    console.error('Usage: npx tsx scripts/update-lead-valuation.ts <email> [--no-comparables]')
    process.exit(1)
  }

  const lead = await prisma.lead.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: { property: { include: { valuation: true } } },
    orderBy: { dataRichiesta: 'desc' },
  })

  if (!lead || !lead.property || !lead.property.valuation) {
    console.error(`❌ Lead/property/valuation non trovati per ${email}`)
    process.exit(1)
  }

  const p = lead.property
  const v = p.valuation

  console.log(`🔄 Aggiornamento valutazione per ${lead.nome} ${lead.cognome} (${email})`)
  console.log(`   Lead ID: ${lead.id}`)
  console.log(`   Valuation ID: ${v.id}\n`)

  let valuation = calculateValuationLocal({
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

  if (valuation.omiZoneMatch === 'not_found' || valuation.estimatedPrice <= 0) {
    console.error(
      `❌ Motore non ha prodotto prezzi validi (omiZoneMatch=${valuation.omiZoneMatch}). Update annullato.`
    )
    process.exit(1)
  }

  const before = {
    prezzoMinimo: v.prezzoMinimo,
    prezzoMassimo: v.prezzoMassimo,
    prezzoStimato: v.prezzoStimato,
    valoreOmiBase: v.valoreOmiBase,
  }

  console.log('PRIMA:')
  console.log(`  OMI base:      €${before.valoreOmiBase}/m²`)
  console.log(`  Stima:         €${before.prezzoStimato.toLocaleString('it-IT')}`)
  console.log(`  Range:         €${before.prezzoMinimo.toLocaleString('it-IT')} – €${before.prezzoMassimo.toLocaleString('it-IT')}`)

  console.log('\nDOPO OMI (prima del refinement comparables):')
  console.log(`  OMI base:      €${valuation.baseOMIValue}/m²`)
  console.log(`  Stima:         €${valuation.estimatedPrice.toLocaleString('it-IT')}`)
  console.log(`  Range:         €${valuation.minPrice.toLocaleString('it-IT')} – €${valuation.maxPrice.toLocaleString('it-IT')}`)
  console.log(`  Confidence:    ${valuation.confidence} (${valuation.confidenceScore}/100)`)

  // ============ COMPARABLES (OpenAI web_search_preview) ============
  let comparablesResult = null
  let crossCheck = null
  const wantComparables = !skipComparables && isComparablesEnabled()

  if (wantComparables) {
    console.log('\n🌐 Ricerca comparables reali via OpenAI web_search_preview...')
    try {
      const result = await searchComparables({
        city: p.citta,
        neighborhood: p.quartiere ?? undefined,
        postalCode: p.cap ?? undefined,
        propertyType: toPropertyType(p.tipo),
        surfaceSqm: p.superficieMq,
        condition: toPropertyCondition(p.stato),
        rooms: p.locali ?? undefined,
      })

      if (result && result.sampleSize >= 2) {
        comparablesResult = result
        crossCheck = crossCheckWithOMI(valuation.pricePerSqm, result)
        console.log(`   ✅ ${result.sampleSize} annunci · mediana €${result.medianPricePerSqm}/m²`)
        console.log(`   Delta OMI: ${crossCheck.deltaPct > 0 ? '+' : ''}${crossCheck.deltaPct}% (${crossCheck.agreement})`)

        valuation = applyComparablesRefinement(valuation, result, crossCheck, p.superficieMq)

        console.log('\nDOPO REFINEMENT (OMI + comparables pesati):')
        console.log(`  Stima:         €${valuation.estimatedPrice.toLocaleString('it-IT')}`)
        console.log(`  Range:         €${valuation.minPrice.toLocaleString('it-IT')} – €${valuation.maxPrice.toLocaleString('it-IT')}`)
        console.log(`  €/mq:          ${valuation.pricePerSqm}`)
        console.log(`  Confidence:    ${valuation.confidence} (${valuation.confidenceScore}/100)`)
      } else {
        console.log(`   ⚠️  Nessun comparable valido trovato (sampleSize=${result?.sampleSize ?? 0}). Mantengo OMI puro.`)
      }
    } catch (err) {
      console.log(`   ❌ Errore comparables: ${err instanceof Error ? err.message : err}`)
      console.log(`   Mantengo solo OMI.`)
    }
  } else if (skipComparables) {
    console.log('\nℹ️  Comparables disabilitati via --no-comparables')
  } else {
    console.log('\n⚠️  Comparables disabilitati (OPENAI_API_KEY mancante o COMPARABLES_ENABLED=false)')
  }

  const deltaPct = ((valuation.estimatedPrice - v.prezzoStimato) / v.prezzoStimato) * 100
  console.log(`\nΔ Stima totale: ${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%`)

  const updated = await prisma.valuation.update({
    where: { id: v.id },
    data: {
      prezzoMinimo: valuation.minPrice,
      prezzoMassimo: valuation.maxPrice,
      prezzoStimato: valuation.estimatedPrice,
      valoreOmiBase: valuation.baseOMIValue,
      coefficientePiano: valuation.floorCoefficient,
      coefficienteStato: valuation.conditionCoefficient,
      spiegazione: valuation.explanation,
      confidence: valuation.confidence,
      confidenceScore: valuation.confidenceScore,
      warnings: valuation.warnings as any,
      omiZoneMatch: valuation.omiZoneMatch,
      dataCompleteness: valuation.dataCompleteness,
      pricePerSqm: valuation.pricePerSqm,
      comparablesData: comparablesResult
        ? ({
            provider: comparablesResult.provider,
            sampleSize: comparablesResult.sampleSize,
            medianPricePerSqm: comparablesResult.medianPricePerSqm,
            avgPricePerSqm: comparablesResult.avgPricePerSqm,
            minPricePerSqm: comparablesResult.minPricePerSqm,
            maxPricePerSqm: comparablesResult.maxPricePerSqm,
            items: comparablesResult.comparables,
            crossCheck,
          } as any)
        : undefined,
      dataCalcolo: new Date(),
    },
  })

  console.log(`\n✅ Valutazione aggiornata (valuation ${updated.id}).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
