import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const emailPart = process.argv[2] || 'iv'
  console.log(`🔍 Diagnostica per email contenente: "${emailPart}"\n`)

  // 1. Lead
  const leads = await prisma.lead.findMany({
    where: { email: { contains: emailPart, mode: 'insensitive' } },
    include: { property: { include: { valuation: true } }, agenzia: { select: { nome: true } } },
    orderBy: { dataRichiesta: 'desc' },
  })
  console.log(`📋 Lead trovati: ${leads.length}`)
  for (const l of leads) {
    console.log(`\n  - ${l.id}`)
    console.log(`    ${l.nome} ${l.cognome} <${l.email}> tel:${l.telefono ?? 'n/d'}`)
    console.log(`    Agenzia: ${l.agenzia.nome}`)
    console.log(`    Data: ${l.dataRichiesta.toISOString()}`)
    if (l.property) {
      console.log(`    Immobile: ${l.property.tipo} · ${l.property.superficieMq}mq · ${l.property.citta} ${l.property.cap ?? ''}`)
      console.log(`    Stato: ${l.property.stato} · piano: ${l.property.piano ?? 'n/d'}`)
      if (l.property.valuation) {
        const v = l.property.valuation
        console.log(`    Valutazione: €${v.prezzoStimato.toLocaleString('it-IT')} (${v.prezzoMinimo}-${v.prezzoMassimo})`)
        console.log(`    OMI: €${v.valoreOmiBase}/mq · zona match: ${v.omiZoneMatch ?? 'n/d'} · conf: ${v.confidence ?? 'n/d'} (${v.confidenceScore ?? 'n/d'})`)
        const ws = v.warnings as any[] | null
        if (ws && ws.length) {
          console.log(`    Warnings (${ws.length}):`)
          for (const w of ws) console.log(`      [${w.severity}] ${w.code}: ${w.message}`)
        }
      } else {
        console.log(`    ⚠️  Nessuna valutazione salvata`)
      }
    } else {
      console.log(`    ⚠️  Nessuna property salvata`)
    }
  }

  // 2. DemoLead
  const demoLeads = await prisma.demoLead.findMany({
    where: { email: { contains: emailPart, mode: 'insensitive' } },
    orderBy: { dataRichiesta: 'desc' },
  })
  console.log(`\n📋 DemoLead trovati: ${demoLeads.length}`)
  for (const d of demoLeads) {
    console.log(`  - ${d.id} · ${d.nome} ${d.cognome} <${d.email}> · ${d.dataRichiesta.toISOString()}`)
    console.log(`    Immobile: ${d.tipo} · ${d.superficieMq}mq · ${d.citta}`)
    console.log(`    Valutazione: €${d.prezzoStimato.toLocaleString('it-IT')} (${d.prezzoMinimo}-${d.prezzoMassimo})`)
  }

  // 3. LeadSubmissionAttempt (nuova tabella audit)
  try {
    const attempts = await prisma.leadSubmissionAttempt.findMany({
      where: { email: { contains: emailPart, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    })
    console.log(`\n📋 Submission attempts trovati: ${attempts.length}`)
    for (const a of attempts) {
      console.log(`\n  - ${a.id} · ${a.createdAt.toISOString()}`)
      console.log(`    Status: ${a.status} · HTTP: ${a.httpStatus ?? 'n/d'}`)
      console.log(`    Email: ${a.email ?? 'n/d'} · Nome: ${a.firstName ?? 'n/d'} ${a.lastName ?? ''}`)
      console.log(`    Widget: ${a.widgetId ?? 'n/d'} · Agency: ${a.agencyId ?? 'n/d'}`)
      console.log(`    IP: ${a.ipAddress ?? 'n/d'}`)
      if (a.errorCode) console.log(`    Errore: [${a.errorCode}] ${a.errorMessage ?? ''}`)
      if (a.savedLeadId) console.log(`    Lead salvato: ${a.savedLeadId}`)
      if (a.bodySnapshot) {
        console.log(`    Payload snapshot:`)
        const snap = a.bodySnapshot as any
        const keys = Object.keys(snap).sort()
        for (const k of keys) {
          const val = snap[k]
          const formatted = typeof val === 'string' && val.length > 80 ? val.slice(0, 80) + '…' : JSON.stringify(val)
          console.log(`      ${k}: ${formatted}`)
        }
      }
    }
  } catch (err) {
    console.log(`\n⚠️  Tabella lead_submission_attempts non ancora disponibile: ${err instanceof Error ? err.message : err}`)
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
