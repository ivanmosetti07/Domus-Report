import { PrismaClient } from '@prisma/client'
import { calculateValuationLocal } from '../lib/valuation'
import { PropertyType, PropertyCondition } from '../types'

const prisma = new PrismaClient()

function toPropertyType(s: string): PropertyType {
  return (Object.values(PropertyType).includes(s as PropertyType)
    ? s : PropertyType.APARTMENT) as PropertyType
}
function toPropertyCondition(s: string): PropertyCondition {
  return (Object.values(PropertyCondition).includes(s as PropertyCondition)
    ? s : PropertyCondition.GOOD) as PropertyCondition
}

async function main() {
  const leads = await prisma.lead.findMany({
    include: { property: { include: { valuation: true } } }
  })

  let wrong = 0, ok = 0
  for (const lead of leads) {
    const p = lead.property
    const v = p?.valuation
    if (!p || !v) continue

    const result = calculateValuationLocal({
      address: p.indirizzo,
      city: p.citta,
      neighborhood: p.quartiere ?? undefined,
      postalCode: p.cap ?? undefined,
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
    })

    const diffPct = Math.abs(result.baseOMIValue - v.valoreOmiBase) / v.valoreOmiBase * 100
    if (diffPct > 2) {
      wrong++
      console.log(`  ERRORE: ${lead.nome} ${lead.cognome} [${p.citta}] OMI DB:${v.valoreOmiBase} → calcolato:${result.baseOMIValue}`)
    } else {
      ok++
    }
  }

  const total = ok + wrong
  console.log(`\n=== RISULTATO FINALE ===`)
  console.log(`✅ Corretti: ${ok} / ${total}`)
  console.log(`❌ Errati:   ${wrong} / ${total}`)
  if (wrong === 0) {
    console.log('TUTTE LE VALUTAZIONI SONO CORRETTE ✅')
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
