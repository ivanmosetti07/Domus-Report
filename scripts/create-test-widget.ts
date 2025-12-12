/**
 * Script per creare un widget di test nel database
 * Uso: npx tsx scripts/create-test-widget.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifica widget di test...')

  // Cerca un'agenzia esistente o creane una di test
  let agency = await prisma.agency.findFirst({
    where: { email: 'test@domusreport.com' }
  })

  if (!agency) {
    console.log('📝 Creazione agenzia di test...')
    agency = await prisma.agency.create({
      data: {
        nome: 'Agenzia Test',
        email: 'test@domusreport.com',
        telefono: '+39 123 456 7890',
        attiva: true,
        piano: 'TRIAL',
        widgetId: 'TEST-LEGACY', // Legacy widget ID
      }
    })
    console.log('✅ Agenzia creata:', agency.id)
  } else {
    console.log('✅ Agenzia esistente trovata:', agency.id)
  }

  // Verifica se esiste già un widget con widgetId "TEST"
  let widgetConfig = await prisma.widgetConfig.findUnique({
    where: { widgetId: 'TEST' }
  })

  if (widgetConfig) {
    console.log('✅ Widget TEST già esistente:', widgetConfig.id)
    console.log('   Mode:', widgetConfig.mode)
    console.log('   Active:', widgetConfig.isActive)
  } else {
    console.log('📝 Creazione widget di test...')
    widgetConfig = await prisma.widgetConfig.create({
      data: {
        widgetId: 'TEST',
        agencyId: agency.id,
        name: 'Widget Test',
        mode: 'bubble', // Puoi cambiare in 'inline' per testare
        isActive: true,
        themeName: 'modern-blue',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
        buttonStyle: 'rounded',
        bubblePosition: 'bottom-right',
        showBadge: true,
        bubbleAnimation: 'pulse',
        inlineHeight: '600px',
        showHeader: true,
        showBorder: true,
      }
    })
    console.log('✅ Widget creato:', widgetConfig.id)
  }

  console.log('\n📊 Configurazione widget TEST:')
  console.log('   widgetId:', widgetConfig.widgetId)
  console.log('   agencyId:', widgetConfig.agencyId)
  console.log('   mode:', widgetConfig.mode)
  console.log('   isActive:', widgetConfig.isActive)
  console.log('\n✨ Widget di test pronto per l\'uso!')
  console.log('   URL test bubble: http://localhost:3001/test-widget.html')
  console.log('   URL test inline: http://localhost:3001/test-widget-inline.html')
}

main()
  .catch((error) => {
    console.error('❌ Errore:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
