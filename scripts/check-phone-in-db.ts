/**
 * Script per verificare se i numeri di telefono sono presenti nel database
 * e controllare lo stato attuale dei lead
 */

import { prisma } from '../lib/prisma'

async function checkPhoneInDatabase() {
  console.log('🔍 VERIFICA NUMERI TELEFONO NEL DATABASE\n')
  console.log('=' .repeat(80))

  try {
    // 1. Verifica schema database
    console.log('\n1️⃣  Verifica Schema Database:\n')

    const leadCount = await prisma.lead.count()
    console.log(`📊 Totale lead nel database: ${leadCount}`)

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
      console.log(`\n[${index + 1}] ID: ${lead.id}`)
      console.log(`    Nome: ${lead.nome} ${lead.cognome}`)
      console.log(`    Email: ${lead.email}`)
      console.log(`    Telefono: ${lead.telefono || '❌ NULL'}`)
      console.log(`    Data: ${lead.dataRichiesta.toISOString()}`)

      if (!lead.telefono) {
        console.log(`    ⚠️  TELEFONO MANCANTE!`)
      }
    })

    // 4. Cerca lead recenti senza telefono
    console.log('\n3️⃣  Lead Recenti SENZA Telefono (ultimi 7 giorni):\n')

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentLeadsWithoutPhone = await prisma.lead.findMany({
      where: {
        telefono: null,
        dataRichiesta: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        dataRichiesta: 'desc'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        dataRichiesta: true,
      }
    })

    if (recentLeadsWithoutPhone.length === 0) {
      console.log('✅ Nessun lead senza telefono negli ultimi 7 giorni!')
    } else {
      console.log(`⚠️  Trovati ${recentLeadsWithoutPhone.length} lead senza telefono:`)
      recentLeadsWithoutPhone.forEach((lead, index) => {
        console.log(`\n[${index + 1}] ${lead.nome} (${lead.email})`)
        console.log(`    ID: ${lead.id}`)
        console.log(`    Data: ${lead.dataRichiesta.toISOString()}`)
      })
    }

    // 5. Esempi di telefoni salvati correttamente
    console.log('\n4️⃣  Esempi di Telefoni Salvati Correttamente:\n')

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
        console.log(`[${index + 1}] ${lead.nome}: ${lead.telefono} (${lead.dataRichiesta.toISOString()})`)
      })
    }

    console.log('\n' + '='.repeat(80))
    console.log('\n📋 CONCLUSIONI:\n')

    if (leadsWithoutPhone === leadCount) {
      console.log('🚨 PROBLEMA CRITICO: NESSUN lead ha il telefono salvato!')
      console.log('   Possibili cause:')
      console.log('   1. Il campo telefono non viene mai inviato dal client')
      console.log('   2. La validazione server fallisce sempre')
      console.log('   3. Il campo viene perso durante il salvataggio Prisma')
      console.log('   4. Problema di mapping tra API e database')
    } else if (leadsWithoutPhone > leadCount * 0.5) {
      console.log('⚠️  PROBLEMA: Più del 50% dei lead non ha il telefono')
      console.log(`   ${leadsWithoutPhone}/${leadCount} lead senza telefono`)
    } else if (leadsWithoutPhone > 0) {
      console.log(`ℹ️  Alcuni lead non hanno il telefono: ${leadsWithoutPhone}/${leadCount}`)
      console.log('   Questo potrebbe essere normale se il campo è opzionale')
    } else {
      console.log('✅ TUTTO OK: Tutti i lead hanno il telefono!')
    }

    console.log('\n🔍 Prossimi passi:')
    console.log('   1. Verificare i log di Vercel per vedere cosa arriva all\'API')
    console.log('   2. Testare manualmente il widget e monitorare i log')
    console.log('   3. Controllare il payload della richiesta nel browser (Network tab)')

  } catch (error) {
    console.error('❌ Errore durante la verifica:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Esegui lo script
checkPhoneInDatabase()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
