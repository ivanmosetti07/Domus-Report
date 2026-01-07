/**
 * Script semplificato per importare dati OMI dal CSV al database
 * Usa batch INSERT più piccoli per evitare timeout
 *
 * Usage: npx tsx scripts/import-omi-simple.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🚀 Importazione dati OMI nel database...\n')

  const csvPath = path.join(process.cwd(), 'data', 'omi-values.csv')

  if (!fs.existsSync(csvPath)) {
    console.error('❌ File CSV non trovato:', csvPath)
    process.exit(1)
  }

  console.log('📥 Lettura CSV...')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
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

  console.log(`   Trovati ${records.length.toLocaleString()} record\n`)

  // Batch size piccolo per evitare timeout
  const batchSize = 100
  let imported = 0
  let errors = 0

  console.log('📝 Importazione in corso...')
  const startTime = Date.now()

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)

    try {
      // Usa createMany con skipDuplicates per velocità
      await prisma.oMIValue.createMany({
        data: batch.map(record => ({
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
          dataAggiornamento: new Date(),
        })),
        skipDuplicates: true,
      })

      imported += batch.length

      // Progress ogni 10 batch (1000 record)
      if (i % (batchSize * 10) === 0) {
        const progress = ((imported / records.length) * 100).toFixed(1)
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
        const rate = (imported / (Date.now() - startTime) * 1000).toFixed(0)
        console.log(`   ${progress}% - ${imported.toLocaleString()}/${records.length.toLocaleString()} (${rate} rec/s, ${elapsed}s)`)
      }
    } catch (error) {
      errors++
      console.error(`   ⚠️  Errore batch ${i}-${i + batch.length}:`, error instanceof Error ? error.message : String(error))

      // Se troppi errori, ferma
      if (errors > 10) {
        console.error('   ❌ Troppi errori, interruzione.')
        break
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  const avgRate = (imported / (Date.now() - startTime) * 1000).toFixed(0)

  console.log(`\n✅ Importazione completata!`)
  console.log(`   • Record importati: ${imported.toLocaleString()}`)
  console.log(`   • Errori: ${errors}`)
  console.log(`   • Tempo totale: ${totalTime}s`)
  console.log(`   • Velocità media: ${avgRate} record/s`)

  // Verifica finale
  const finalCount = await prisma.oMIValue.count()
  console.log(`   • Totale record nel database: ${finalCount.toLocaleString()}\n`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('❌ Errore fatale:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
