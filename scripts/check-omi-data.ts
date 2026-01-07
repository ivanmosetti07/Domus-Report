/**
 * Script veloce per verificare quanti record OMI sono presenti nel database
 * Usage: npx tsx scripts/check-omi-data.ts
 */

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { prisma } from '../lib/prisma'

async function main() {
  try {
    console.log('🔍 Controllo dati OMI nel database...\n')

    const count = await prisma.oMIValue.count()
    console.log(`📊 Record OMI presenti: ${count.toLocaleString()}`)

    if (count === 0) {
      console.log('\n❌ Il database è VUOTO!')
      console.log('   Esegui: npx tsx scripts/load-omi-data.ts')
    } else if (count < 130000) {
      console.log('\n⚠️  Il database contiene POCHI record (attesi ~133.000)')
      console.log('   Potrebbe essere necessario ricaricare i dati.')
    } else {
      console.log('\n✅ Il database contiene tutti i dati OMI!')

      // Mostra alcuni esempi per Roma CAP 00133
      const romaExamples = await prisma.oMIValue.findMany({
        where: {
          citta: { equals: 'Roma', mode: 'insensitive' },
          cap: '00133'
        },
        take: 3,
        orderBy: { anno: 'desc' }
      })

      if (romaExamples.length > 0) {
        console.log('\n📍 Esempi per Roma CAP 00133:')
        romaExamples.forEach(record => {
          console.log(`   • ${record.zona} - ${record.categoria || 'N/A'}`)
          console.log(`     ${record.valoreMedioMq.toLocaleString()} €/m² (${record.anno}-S${record.semestre})`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Errore:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
