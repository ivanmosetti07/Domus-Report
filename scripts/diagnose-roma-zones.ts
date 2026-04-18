import { readFileSync } from 'fs'
import { join } from 'path'

const csv = readFileSync(join(process.cwd(), 'data/omi-values.csv'), 'utf-8')
const lines = csv.split('\n')
const header = lines[0].split(',')
const idx = {
  citta: header.indexOf('citta'),
  zona: header.indexOf('zona'),
  cap: header.indexOf('cap'),
  categoria: header.indexOf('categoria'),
  tipoImmobile: header.indexOf('tipoImmobile'),
  valoreMinMq: header.indexOf('valoreMinMq'),
  valoreMaxMq: header.indexOf('valoreMaxMq'),
  valoreMedioMq: header.indexOf('valoreMedioMq'),
}

// Cerca tutti i CAP Roma con i loro valori civili medio
const romaRecords = lines.slice(1).map(l => l.split(',')).filter(f =>
  f.length >= header.length &&
  f[idx.citta]?.toLowerCase() === 'roma' &&
  f[idx.tipoImmobile] === 'residenziale' &&
  f[idx.categoria] === 'Abitazioni civili'
)

const byCAP = new Map<string, { zona: string; min: number; max: number; med: number }>()
for (const r of romaRecords) {
  const cap = r[idx.cap]
  const zona = r[idx.zona]
  const med = Number(r[idx.valoreMedioMq])
  if (!cap || !zona) continue
  const key = `${cap}|${zona}`
  if (!byCAP.has(key)) {
    byCAP.set(key, {
      zona,
      min: Number(r[idx.valoreMinMq]),
      max: Number(r[idx.valoreMaxMq]),
      med,
    })
  }
}

// Stampa mapping CAP → zona + prezzo civili
const sorted = Array.from(byCAP.entries()).sort((a, b) => b[1].med - a[1].med)
console.log("Roma CAP → zona OMI (Abitazioni civili, €/mq medio):\n")
for (const [key, v] of sorted.slice(0, 80)) {
  const [cap] = key.split("|")
  console.log(`  ${cap} → ${v.zona.padEnd(8)} €${v.min}-${v.max} (med ${v.med})`)
}
console.log(`\nTotale: ${byCAP.size} CAP/zona distinti a Roma`)
