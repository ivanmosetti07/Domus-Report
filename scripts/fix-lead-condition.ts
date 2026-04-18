import { PrismaClient } from '@prisma/client'
import { normalizeCondition } from '../lib/normalize-property'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const newCondition = process.argv[3]
  if (!email || !newCondition) {
    console.error('Usage: npx tsx scripts/fix-lead-condition.ts <email> <newCondition>')
    process.exit(1)
  }

  const normalized = normalizeCondition(newCondition)
  if (!normalized) {
    console.error(`❌ Condition "${newCondition}" non normalizzabile.`)
    process.exit(1)
  }

  const lead = await prisma.lead.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: { property: true },
    orderBy: { dataRichiesta: 'desc' },
  })

  if (!lead || !lead.property) {
    console.error(`❌ Lead/property non trovato.`)
    process.exit(1)
  }

  console.log(`Lead: ${lead.nome} ${lead.cognome} <${lead.email}>`)
  console.log(`  Stato attuale: "${lead.property.stato}"`)
  console.log(`  Nuovo stato: "${normalized}" (normalizzato da "${newCondition}")`)

  await prisma.property.update({
    where: { id: lead.property.id },
    data: { stato: normalized },
  })

  console.log(`✅ Stato aggiornato. Ora lancia update-lead-valuation per ricalcolare.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
