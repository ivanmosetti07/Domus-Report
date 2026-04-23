import { crossCheckWithOMI, applyComparablesRefinement } from '../lib/comparables'
import type { ComparablesResult } from '../lib/comparables'
import { calculateValuationLocal } from '../lib/valuation'
import { PropertyType, PropertyCondition } from '../types'

// Base valuation (Bologna Centro)
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

console.log('BASE valuation Bologna 60mq ristrutturato:')
console.log('  estimatedPrice:', base.estimatedPrice, '(', base.pricePerSqm, '€/mq)')

function buildFakeComparables(sampleSize: number, medianPPS: number): ComparablesResult {
  return {
    comparables: Array.from({ length: sampleSize }, (_, i) => ({
      title: `annuncio #${i+1}`,
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

// Scenario A: 5 annunci +33% sopra OMI (weak agreement) → nudge atteso +13.2%
console.log('\n=== Scenario A: 5 annunci +33% (weak) ===')
const cmpA = buildFakeComparables(5, Math.round(base.pricePerSqm * 1.33))
const ccA = crossCheckWithOMI(base.pricePerSqm, cmpA)
console.log('delta:', ccA.deltaPct + '%', '· agreement:', ccA.agreement, '· shouldAdjust:', ccA.shouldAdjust)
console.log('suggested:', ccA.suggestedPricePerSqm, 'vs OMI:', ccA.omiPricePerSqm, '→ nudge', (((ccA.suggestedPricePerSqm - ccA.omiPricePerSqm) / ccA.omiPricePerSqm) * 100).toFixed(1) + '%')
const refinedA = applyComparablesRefinement(base, cmpA, ccA, 60)
console.log('prezzo prima:', base.estimatedPrice, '→ dopo nudge:', refinedA.estimatedPrice, '(delta', ((refinedA.estimatedPrice / base.estimatedPrice - 1) * 100).toFixed(1) + '%)')
console.log('explanation tail:', refinedA.explanation.slice(-180))

// Scenario B: 3 annunci +20% (medium) → nudge atteso +5%
console.log('\n=== Scenario B: 3 annunci +20% (medium) ===')
const cmpB = buildFakeComparables(3, Math.round(base.pricePerSqm * 1.20))
const ccB = crossCheckWithOMI(base.pricePerSqm, cmpB)
console.log('delta:', ccB.deltaPct + '%', '· agreement:', ccB.agreement, '· shouldAdjust:', ccB.shouldAdjust)
const refinedB = applyComparablesRefinement(base, cmpB, ccB, 60)
console.log('prezzo prima:', base.estimatedPrice, '→ dopo nudge:', refinedB.estimatedPrice, '(delta', ((refinedB.estimatedPrice / base.estimatedPrice - 1) * 100).toFixed(1) + '%)')

// Scenario C: 2 annunci +33% → sampleSize<3, nessun nudge
console.log('\n=== Scenario C: 2 annunci +33% (sampleSize < 3) ===')
const cmpC = buildFakeComparables(2, Math.round(base.pricePerSqm * 1.33))
const ccC = crossCheckWithOMI(base.pricePerSqm, cmpC)
console.log('delta:', ccC.deltaPct + '%', '· agreement:', ccC.agreement, '· shouldAdjust:', ccC.shouldAdjust)
const refinedC = applyComparablesRefinement(base, cmpC, ccC, 60)
console.log('prezzo prima:', base.estimatedPrice, '→ dopo:', refinedC.estimatedPrice, '(INVARIATO:', base.estimatedPrice === refinedC.estimatedPrice, ')')

// Scenario D: 4 annunci -9% (strong) → nessun nudge
console.log('\n=== Scenario D: 4 annunci -9% (strong) ===')
const cmpD = buildFakeComparables(4, Math.round(base.pricePerSqm * 0.91))
const ccD = crossCheckWithOMI(base.pricePerSqm, cmpD)
console.log('delta:', ccD.deltaPct + '%', '· agreement:', ccD.agreement, '· shouldAdjust:', ccD.shouldAdjust)
const refinedD = applyComparablesRefinement(base, cmpD, ccD, 60)
console.log('prezzo prima:', base.estimatedPrice, '→ dopo:', refinedD.estimatedPrice, '(INVARIATO:', base.estimatedPrice === refinedD.estimatedPrice, ')')

// Scenario E: 5 annunci +60% (weak enormous) → cap +20%
console.log('\n=== Scenario E: 5 annunci +60% (weak extreme) → cap ±20% ===')
const cmpE = buildFakeComparables(5, Math.round(base.pricePerSqm * 1.60))
const ccE = crossCheckWithOMI(base.pricePerSqm, cmpE)
console.log('delta:', ccE.deltaPct + '%', '· agreement:', ccE.agreement)
console.log('suggested:', ccE.suggestedPricePerSqm, 'vs OMI:', ccE.omiPricePerSqm, '→ nudge', (((ccE.suggestedPricePerSqm - ccE.omiPricePerSqm) / ccE.omiPricePerSqm) * 100).toFixed(1) + '% (atteso: cap +20%)')
