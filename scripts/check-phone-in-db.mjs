/**
 * Script per verificare se i numeri di telefono sono presenti nel database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPhoneInDatabase() {
  console.log('🔍 VERIFICA NUMERI TELEFONO NEL DATABASE\n')
  console.log('=' .repeat(80))

  try {
    // 1. Verifica schema database
    console.log('\n1️⃣  Verifica Schema Database:\n')

    const leadCount = await prisma.lead.count()
    console.log(`📊 Totale lead nel database: ${leadCount}`)

    if (leadCount === 0) {
      console.log('\n⚠️  Nessun lead nel database. Impossibile verificare.')
      return
    }

    // 2. Conta lead con/senza telefono
    const leadsWithPhone = await prisma.lead.count({
      where: {
        telefono: {
          not: null
        }
      }
    })

    const leadsWithoutPhone = await prisma.lead.count({
      where: {
        telefono: null
      }
    })

    console.log(`✅ Lead CON telefono: ${leadsWithPhone} (${Math.round(leadsWithPhone/leadCount*100)}%)`)
    console.log(`❌ Lead SENZA telefono: ${leadsWithoutPhone} (${Math.round(leadsWithoutPhone/leadCount*100)}%)`)

    // 3. Mostra ultimi 10 lead
    console.log('\n2️⃣  Ultimi 10 Lead (più recenti):\n')

    const recentLeads = await prisma.lead.findMany({
      take: 10,
      orderBy: {
        dataRichiesta: 'desc'
      },
      select: {
        id: true,
        nome: true,
        cognome: true,
        email: true,
        telefono: true,
        dataRichiesta: true,
      }
    })

    recentLeads.forEach((lead, index) => {
      console.log(`\n[${index + 1}] ID: ${lead.id.substring(0, 8)}...`)
      console.log(`    Nome: ${lead.nome} ${lead.cognome}`)
      console.log(`    Email: ${lead.email}`)
      console.log(`    Telefono: ${lead.telefono || '❌ NULL'}`)
      console.log(`    Data: ${lead.dataRichiesta.toISOString()}`)

      if (!lead.telefono) {
        console.log(`    ⚠️  TELEFONO MANCANTE!`)
      }
    })

    // 4. Esempi di telefoni salvati correttamente
    console.log('\n3️⃣  Esempi di Telefoni Salvati:\n')

    const leadsWithPhoneExamples = await prisma.lead.findMany({
      where: {
        telefono: {
          not: null
        }
      },
      take: 5,
      orderBy: {
        dataRichiesta: 'desc'
      },
      select: {
        nome: true,
        telefono: true,
        dataRichiesta: true,
      }
    })

    if (leadsWithPhoneExamples.length === 0) {
      console.log('❌ Nessun lead con telefono trovato!')
    } else {
      leadsWithPhoneExamples.forEach((lead, index) => {
        console.log(`[${index + 1}] ${lead.nome}: ${lead.telefono}`)
      })
    }

    console.log('\n' + '='.repeat(80))
    console.log('\n📋 CONCLUSIONI:\n')

    if (leadsWithoutPhone === leadCount) {
      console.log('🚨 PROBLEMA CRITICO: NESSUN lead ha il telefono salvato!')
      console.log('\n   Possibili cause:')
      console.log('   1. ❌ Il campo telefono non viene mai inviato dal client')
      console.log('   2. ❌ La validazione server fallisce sempre')
      console.log('   3. ❌ Il campo viene perso durante il salvataggio Prisma')
      console.log('   4. ❌ Problema di mapping tra API e database')
    } else if (leadsWithoutPhone > leadCount * 0.5) {
      console.log(`⚠️  PROBLEMA: Più del 50% dei lead non ha il telefono (${leadsWithoutPhone}/${leadCount})`)
    } else if (leadsWithoutPhone > 0) {
      console.log(`ℹ️  Alcuni lead non hanno il telefono: ${leadsWithoutPhone}/${leadCount}`)
      console.log('   (Potrebbe essere normale se il campo è opzionale)')
    } else {
      console.log('✅ TUTTO OK: Tutti i lead hanno il telefono!')
    }

    console.log('\n🔍 Prossimi passi per debug:')
    console.log('   1. Aprire browser su https://domusreport.com/')
    console.log('   2. Aprire DevTools (F12) → Tab Network')
    console.log('   3. Testare il widget inserendo un numero telefono')
    console.log('   4. Verificare la richiesta POST /api/leads')
    console.log('   5. Controllare che il campo "phone" sia presente nel payload')
    console.log('   6. Controllare i log di Vercel per vedere errori server-side')

  } catch (error) {
    console.error('\n❌ Errore durante la verifica:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Esegui lo script
checkPhoneInDatabase()
  .then(() => {
    console.log('\n✅ Script completato\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
