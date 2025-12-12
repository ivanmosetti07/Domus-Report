import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkWidget() {
  const widgetId = 'wgt_KqoseGGHNRk3URSx'

  console.log('🔍 Cercando widget:', widgetId)
  console.log('---')

  // Check WidgetConfig (nuovo sistema)
  const widgetConfig = await prisma.widgetConfig.findUnique({
    where: { widgetId },
    include: { agency: true }
  })

  if (widgetConfig) {
    console.log('✅ Widget trovato in WidgetConfig:')
    console.log('  - ID:', widgetConfig.id)
    console.log('  - Nome:', widgetConfig.name)
    console.log('  - Attivo:', widgetConfig.isActive)
    console.log('  - Agenzia:', widgetConfig.agency.nome)
    console.log('  - Agenzia Attiva:', widgetConfig.agency.attiva)
    console.log('')
    console.log('✅ URL CORRETTO:')
    console.log(`   https://domusreport.mainstream.agency/widget/${widgetId}`)
    return
  }

  // Check Agency.widgetId (vecchio sistema)
  const agency = await prisma.agency.findUnique({
    where: { widgetId }
  })

  if (agency) {
    console.log('✅ Widget trovato in Agency (vecchio sistema):')
    console.log('  - Agenzia:', agency.nome)
    console.log('  - Attiva:', agency.attiva)
    console.log('')
    console.log('✅ URL CORRETTO:')
    console.log(`   https://domusreport.mainstream.agency/widget/${widgetId}`)
    return
  }

  console.log('❌ Widget NON trovato nel database!')
  console.log('')
  console.log('📋 Widget disponibili:')

  // Mostra tutti i widget disponibili
  const allWidgets = await prisma.widgetConfig.findMany({
    include: { agency: true },
    take: 10
  })

  if (allWidgets.length === 0) {
    console.log('   Nessun widget in WidgetConfig')

    // Prova vecchio sistema
    const agencies = await prisma.agency.findMany({
      where: { widgetId: { not: null } },
      take: 10
    })

    if (agencies.length > 0) {
      console.log('')
      console.log('   Widget dal vecchio sistema (Agency):')
      agencies.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.widgetId} - ${a.nome} (${a.attiva ? 'Attiva' : 'Non attiva'})`)
      })
    }
  } else {
    allWidgets.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w.widgetId} - ${w.name} - ${w.agency.nome} (${w.isActive ? 'Attivo' : 'Non attivo'})`)
    })
  }
}

checkWidget()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Errore:', error)
    process.exit(1)
  })
