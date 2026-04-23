import { crossCheckWithOMI, applyComparablesRefinement } from '../lib/comparables'
import type { ComparablesResult } from '../lib/comparables'
import { calculateValuationLocal, locationPremium } from '../lib/valuation'
import { PropertyType, PropertyCondition } from '../types'

// Base valuation (Bologna Centro) usata come immobile di riferimento per
// testare il nudge isolato dal resto della pipeline.
const base = calculateValuationLocal({
  address: 'Via Farini 10',
  city: 'Bologna',
  neighborhood: 'Centro Storico',
  postalCode: '40124',
  propertyType: PropertyType.APARTMENT,
  surfaceSqm: 60,
  floor: 2,
  hasElevator: false,
  condition: PropertyCondition.RENOVATED,
  rooms: 2,
  bathrooms: 1,
  outdoorSpace: 'Balcone',
})

console.log('='.repeat(70))
console.log('BASE valuation Bologna 60mq ristrutturato (post location-premium)')
console.log('='.repeat(70))
console.log('  estimatedPrice:', base.estimatedPrice, '(', base.pricePerSqm, '€/mq)')
console.log('  baseOMIValue:  ', base.baseOMIValue, '€/mq')
const basePremium = locationPremium('Bologna', 'Centro Storico', 'Via Farini 10')
console.log('  premium check: ', basePremium.bonus * 100 + '% matched:', basePremium.matchedKey)

function buildFakeComparables(sampleSize: number, medianPPS: number): ComparablesResult {
  return {
    comparables: Array.from({ length: sampleSize }, (_, i) => ({
      title: `annuncio #${i + 1}`,
      source: 'idealista.it',
      price: Math.round(medianPPS * 55),
      surfaceSqm: 55,
      pricePerSqm: medianPPS,
    })),
    medianPricePerSqm: medianPPS,
    avgPricePerSqm: medianPPS,
    minPricePerSqm: medianPPS - 200,
    maxPricePerSqm: medianPPS + 200,
    sampleSize,
    provider: 'test',
    executionTimeMs: 0,
    warnings: [],
  }
}

function runScenario(
  label: string,
  sampleSize: number,
  deltaPct: number,
  expectedNudgePct: number | null
) {
  console.log('\n' + '-'.repeat(70))
  console.log(label)
  console.log('-'.repeat(70))
  const medianPPS = Math.round(base.pricePerSqm * (1 + deltaPct / 100))
  const cmp = buildFakeComparables(sampleSize, medianPPS)
  const cc = crossCheckWithOMI(base.pricePerSqm, cmp)
  const refined = applyComparablesRefinement(base, cmp, cc, 60)
  const appliedNudge = ((refined.estimatedPrice / base.estimatedPrice - 1) * 100)
  console.log(
    `  sampleSize=${sampleSize} · delta=${deltaPct > 0 ? '+' : ''}${deltaPct}% · agreement=${cc.agreement} · shouldAdjust=${cc.shouldAdjust}`
  )
  console.log(`  prezzo OMI:    €${base.estimatedPrice.toLocaleString('it-IT')}`)
  console.log(
    `  prezzo dopo:   €${refined.estimatedPrice.toLocaleString('it-IT')} (nudge ${
      appliedNudge >= 0 ? '+' : ''
    }${appliedNudge.toFixed(1)}%)`
  )
  if (expectedNudgePct !== null) {
    const tolerance = 0.5
    const ok = Math.abs(appliedNudge - expectedNudgePct) < tolerance
    console.log(`  atteso nudge:  ${expectedNudgePct >= 0 ? '+' : ''}${expectedNudgePct}% → ${ok ? '✅ PASS' : '❌ FAIL'}`)
  }
}

// Scenari v2.2
runScenario('SCENARIO A — sampleSize=5, +33% weak → 60% factor, cap 40% non scatta', 5, 33, 19.8)
runScenario('SCENARIO B — sampleSize=3, +20% medium → 25% factor, cap 15%', 3, 20, 5.0)
runScenario('SCENARIO C — sampleSize=2, +33% weak → 20% factor, cap 12%', 2, 33, 6.6)
runScenario('SCENARIO D — sampleSize=4, -9% strong → nessun nudge', 4, -9, 0)
runScenario('SCENARIO E — sampleSize=5, +80% weak → 60% factor, cap 50% scatta (48% < cap)', 5, 80, 48)
runScenario('SCENARIO E2 — sampleSize=5, +100% weak → 60% factor (60%) → cap 50% scatta', 5, 100, 50)
runScenario('SCENARIO F — sampleSize=1, qualunque delta → nessun nudge', 1, 50, 0)
runScenario('SCENARIO G — sampleSize=2, +121% weak (Vomero-like) → cap 12%', 2, 121, 12)
runScenario('SCENARIO H — sampleSize=6, +50% weak (Napoli-like) → 60% factor, cap 40% non scatta', 6, 50, 30)

// Location premium unit tests
console.log('\n' + '='.repeat(70))
console.log('LOCATION PREMIUM tests')
console.log('='.repeat(70))
const premiumCases: Array<[string, string | undefined, string, number]> = [
  ['Napoli', 'Vomero', 'Via Cilea', 0.20],
  ['Napoli', 'Chiaia', 'Riviera di Chiaia', 0.25],
  ['Roma', 'Prati', 'Via Cola di Rienzo', 0.15],
  ['Roma', 'Parioli', 'Viale Bruno Buozzi', 0.22],
  ['Milano', 'Brera', 'Via Brera', 0.25],
  ['Milano', 'Duomo', 'Corso Italia', 0.25],
  ['Roma', 'Statuario', 'Via Squillace', 0],
  ['Torino', 'Crocetta', 'Via Rosselli', 0.05], // v2.3: ridotto da 0.15 a 0.05 (mercato reale sotto OMI)
  ['Firenze', 'Centro Storico', 'Via del Corso', 0.20],
  ['Ardea', 'Marina di Ardea', 'Lungomare degli Ardeatini', 0.12], // match "lungomare degli ardeatini"
]
for (const [city, nh, addr, expected] of premiumCases) {
  const { bonus, matchedKey } = locationPremium(city, nh, addr)
  const ok = Math.abs(bonus - expected) < 0.001
  console.log(
    `  ${city} / ${nh} / ${addr}: ${(bonus * 100).toFixed(0)}% (key=${matchedKey ?? '-'}) · atteso ${(expected * 100).toFixed(0)}% → ${ok ? '✅' : '❌'}`
  )
}
