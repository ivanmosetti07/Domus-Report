import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const lead = await prisma.lead.findFirst({
    orderBy: { dataRichiesta: 'desc' },
    include: {
      property: { include: { valuation: true } },
      agenzia: { select: { nome: true, email: true } },
    },
  })
  if (!lead) {
    console.log('Nessun lead trovato')
    return
  }
  console.log(`Lead più recente:`)
  console.log(`  ID: ${lead.id}`)
  console.log(`  Email: ${lead.email}`)
  console.log(`  Nome: ${lead.nome} ${lead.cognome}`)
  console.log(`  Agenzia: ${lead.agenzia.nome}`)
  console.log(`  Data: ${lead.dataRichiesta.toISOString()}`)
  const p = lead.property
  if (p) {
    console.log(`\n  IMMOBILE:`)
    console.log(`    Indirizzo: ${p.indirizzo}`)
    console.log(`    Città: ${p.citta} ${p.cap ?? ''}`)
    console.log(`    Quartiere: ${p.quartiere ?? 'n/d'}`)
    console.log(`    Tipo: ${p.tipo}`)
    console.log(`    Superficie: ${p.superficieMq}mq`)
    console.log(`    Locali: ${p.locali ?? 'n/d'} · Bagni: ${p.bagni ?? 'n/d'}`)
    console.log(`    Piano: ${p.piano ?? 'n/d'} ascensore:${p.ascensore}`)
    console.log(`    Stato: ${p.stato}`)
    console.log(`    Energia: ${p.classeEnergetica ?? 'n/d'}`)
    console.log(`    Anno: ${p.annoCostruzione ?? 'n/d'}`)
    console.log(`    Parking: ${p.postoAuto} · Outdoor: ${p.spaziEsterni ?? 'n/d'}`)
    console.log(`    Heating: ${p.riscaldamento ?? 'n/d'} · AC: ${p.ariaCondizionata}`)
    console.log(`    Occupazione: ${p.statoOccupazione ?? 'n/d'}`)
    const v = p.valuation
    if (v) {
      console.log(`\n  VALUTAZIONE:`)
      console.log(`    Prezzo stimato: €${v.prezzoStimato.toLocaleString('it-IT')}`)
      console.log(`    Range: €${v.prezzoMinimo.toLocaleString('it-IT')} – €${v.prezzoMassimo.toLocaleString('it-IT')}`)
      console.log(`    OMI base: €${v.valoreOmiBase}/mq`)
      console.log(`    €/mq finale: ${v.pricePerSqm ?? Math.round(v.prezzoStimato / p.superficieMq)}`)
      console.log(`    Coef. piano: ${v.coefficientePiano}`)
      console.log(`    Coef. stato (composite): ${v.coefficienteStato}`)
      console.log(`    Confidence: ${v.confidence} (${v.confidenceScore ?? 'n/d'})`)
      console.log(`    Zone match: ${v.omiZoneMatch ?? 'n/d'}`)
      console.log(`    Data completeness: ${v.dataCompleteness ?? 'n/d'}%`)
      const ws = v.warnings as any[] | null
      if (ws && ws.length) {
        console.log(`    Warnings (${ws.length}):`)
        for (const w of ws) console.log(`      [${w.severity}] ${w.code}: ${w.message}`)
      }
      const cmp = v.comparablesData as any
      if (cmp) {
        console.log(`    Comparables: ${cmp.sampleSize} · med €${cmp.medianPricePerSqm}/mq`)
        if (cmp.crossCheck) {
          console.log(`      CrossCheck: delta ${cmp.crossCheck.deltaPct}% (${cmp.crossCheck.agreement})`)
        }
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
