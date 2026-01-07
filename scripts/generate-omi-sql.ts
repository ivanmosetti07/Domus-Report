/**
 * Script per generare un file SQL di importazione dati OMI
 * Converte il CSV in INSERT statements per PostgreSQL
 *
 * Usage: npx tsx scripts/generate-omi-sql.ts
 * Output: data/import-omi.sql
 */

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

async function main() {
  console.log('🔧 Generazione SQL per importazione dati OMI...\n')

  const csvPath = path.join(process.cwd(), 'data', 'omi-values.csv')
  const sqlPath = path.join(process.cwd(), 'data', 'import-omi.sql')

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

  console.log('✍️  Generazione SQL...')

  // Apri file SQL per scrittura
  const stream = fs.createWriteStream(sqlPath)

  // Header SQL
  stream.write(`-- Import OMI Data\n`)
  stream.write(`-- Generated: ${new Date().toISOString()}\n`)
  stream.write(`-- Records: ${records.length}\n\n`)

  // Crea tabelle se non esistono (per sicurezza)
  stream.write(`-- Ensure tables exist\n`)
  stream.write(`-- (Tables should already exist from Prisma migrations)\n\n`)

  // Usa COPY per performance migliori
  stream.write(`-- Use COPY command for fast bulk insert\n`)
  stream.write(`BEGIN;\n\n`)

  // Batch di 1000 record per volta per evitare query troppo lunghe
  const batchSize = 1000
  let processed = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)

    // INSERT con ON CONFLICT per gestire duplicati
    stream.write(`-- Batch ${Math.floor(i / batchSize) + 1} (records ${i + 1}-${Math.min(i + batchSize, records.length)})\n`)
    stream.write(`INSERT INTO "OMIValue" (\n`)
    stream.write(`  citta, zona, cap, "tipoImmobile", categoria,\n`)
    stream.write(`  "valoreMinMq", "valoreMaxMq", "valoreMedioMq",\n`)
    stream.write(`  semestre, anno, fonte, "dataAggiornamento"\n`)
    stream.write(`) VALUES\n`)

    batch.forEach((record, idx) => {
      const cap = record.cap ? `'${record.cap.replace(/'/g, "''")}'` : 'NULL'
      const categoria = record.categoria ? `'${record.categoria.replace(/'/g, "''")}'` : 'NULL'

      stream.write(`  ('${record.citta.replace(/'/g, "''")}', `)
      stream.write(`'${record.zona.replace(/'/g, "''")}', `)
      stream.write(`${cap}, `)
      stream.write(`'${record.tipoImmobile.replace(/'/g, "''")}', `)
      stream.write(`${categoria}, `)
      stream.write(`${parseFloat(record.valoreMinMq)}, `)
      stream.write(`${parseFloat(record.valoreMaxMq)}, `)
      stream.write(`${parseFloat(record.valoreMedioMq)}, `)
      stream.write(`${parseInt(record.semestre)}, `)
      stream.write(`${parseInt(record.anno)}, `)
      stream.write(`'${record.fonte.replace(/'/g, "''")}', `)
      stream.write(`NOW())`)

      if (idx < batch.length - 1) {
        stream.write(',\n')
      } else {
        stream.write('\n')
      }
    })

    // ON CONFLICT per gestire duplicati
    stream.write(`ON CONFLICT (citta, zona, "tipoImmobile", categoria, anno, semestre)\n`)
    stream.write(`DO UPDATE SET\n`)
    stream.write(`  "valoreMinMq" = EXCLUDED."valoreMinMq",\n`)
    stream.write(`  "valoreMaxMq" = EXCLUDED."valoreMaxMq",\n`)
    stream.write(`  "valoreMedioMq" = EXCLUDED."valoreMedioMq",\n`)
    stream.write(`  cap = EXCLUDED.cap,\n`)
    stream.write(`  fonte = EXCLUDED.fonte,\n`)
    stream.write(`  "dataAggiornamento" = NOW();\n\n`)

    processed += batch.length

    // Progress
    if (i % (batchSize * 10) === 0) {
      const progress = ((processed / records.length) * 100).toFixed(1)
      console.log(`   ${progress}% (${processed.toLocaleString()}/${records.length.toLocaleString()})`)
    }
  }

  // Aggiungi anche PriceHistory
  stream.write(`\n-- Insert into PriceHistory\n`)
  stream.write(`INSERT INTO "PriceHistory" (\n`)
  stream.write(`  citta, zona, cap, "tipoImmobile",\n`)
  stream.write(`  "valoreMinMq", "valoreMaxMq", "valoreMedioMq",\n`)
  stream.write(`  semestre, anno, fonte\n`)
  stream.write(`)\n`)
  stream.write(`SELECT DISTINCT\n`)
  stream.write(`  citta, zona, cap, "tipoImmobile",\n`)
  stream.write(`  "valoreMinMq", "valoreMaxMq", "valoreMedioMq",\n`)
  stream.write(`  semestre, anno, fonte\n`)
  stream.write(`FROM "OMIValue"\n`)
  stream.write(`ON CONFLICT (citta, zona, "tipoImmobile", anno, semestre)\n`)
  stream.write(`DO UPDATE SET\n`)
  stream.write(`  "valoreMinMq" = EXCLUDED."valoreMinMq",\n`)
  stream.write(`  "valoreMaxMq" = EXCLUDED."valoreMaxMq",\n`)
  stream.write(`  "valoreMedioMq" = EXCLUDED."valoreMedioMq",\n`)
  stream.write(`  cap = EXCLUDED.cap,\n`)
  stream.write(`  fonte = EXCLUDED.fonte;\n\n`)

  stream.write(`COMMIT;\n\n`)
  stream.write(`-- Done! Imported ${records.length} OMI records.\n`)

  stream.end()

  console.log(`\n✅ File SQL generato: ${sqlPath}`)
  console.log(`   Dimensione: ${(fs.statSync(sqlPath).size / 1024 / 1024).toFixed(2)} MB`)
  console.log(`\n📌 Per importare nel database PostgreSQL:\n`)
  console.log(`   psql $DATABASE_URL -f data/import-omi.sql\n`)
  console.log(`   Oppure da Vercel/Neon dashboard: copia e incolla il contenuto del file SQL\n`)
}

main()
  .then(() => {
    console.log('✅ Completato!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Errore:', error)
    process.exit(1)
  })
