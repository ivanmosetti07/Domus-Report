import { readFileSync } from 'fs'
import { join } from 'path'

// Diagnostica: trova tutte le zone OMI per Roma CAP 00155 / codice C14
const csv = readFileSync(join(process.cwd(), 'data/omi-values.csv'), 'utf-8')
const lines = csv.split('\n')
const header = lines[0].split(',')
console.log('Header:', header)

const idx = {
  citta: header.indexOf('citta'),
  zona: header.indexOf('zona'),
  cap: header.indexOf('cap'),
  categoria: header.indexOf('categoria'),
  tipoImmobile: header.indexOf('tipoImmobile'),
  valoreMinMq: header.indexOf('valoreMinMq'),
  valoreMaxMq: header.indexOf('valoreMaxMq'),
  valoreMedioMq: header.indexOf('valoreMedioMq'),
  anno: header.indexOf('anno'),
  semestre: header.indexOf('semestre'),
}

const matches = lines.slice(1).map(l => l.split(',')).filter(f => {
  if (f.length < header.length) return false
  const cittaMatch = f[idx.citta]?.toLowerCase() === 'roma'
  const capMatch = f[idx.cap] === '00155'
  return cittaMatch && capMatch
})

console.log(`\nTrovati ${matches.length} record per Roma CAP 00155:\n`)
const grouped = new Map<string, any[]>()
for (const m of matches) {
  const key = `${m[idx.zona]} | ${m[idx.categoria]} | ${m[idx.tipoImmobile]}`
  if (!grouped.has(key)) grouped.set(key, [])
  grouped.get(key)!.push(m)
}
for (const [key, arr] of grouped) {
  const latest = arr.sort((a, b) => {
    const da = parseInt(a[idx.anno]) * 10 + parseInt(a[idx.semestre])
    const db = parseInt(b[idx.anno]) * 10 + parseInt(b[idx.semestre])
    return db - da
  })[0]
  console.log(`  ${key}:  €${latest[idx.valoreMinMq]}-${latest[idx.valoreMaxMq]}  (med €${latest[idx.valoreMedioMq]})  [${latest[idx.anno]}/${latest[idx.semestre]}]`)
}

// Cerca zona C14 di Roma
const c14 = lines.slice(1).map(l => l.split(',')).filter(f => {
  if (f.length < header.length) return false
  return f[idx.citta]?.toLowerCase() === 'roma' && f[idx.zona] === 'C14'
})
console.log(`\nZona C14 Roma: ${c14.length} record`)
const c14grouped = new Map<string, any[]>()
for (const m of c14) {
  const key = `${m[idx.categoria]} | ${m[idx.tipoImmobile]}`
  if (!c14grouped.has(key)) c14grouped.set(key, [])
  c14grouped.get(key)!.push(m)
}
for (const [key, arr] of c14grouped) {
  const latest = arr.sort((a, b) => {
    const da = parseInt(a[idx.anno]) * 10 + parseInt(a[idx.semestre])
    const db = parseInt(b[idx.anno]) * 10 + parseInt(b[idx.semestre])
    return db - da
  })[0]
  console.log(`  ${key}:  €${latest[idx.valoreMinMq]}-${latest[idx.valoreMaxMq]}  (med €${latest[idx.valoreMedioMq]})`)
}
