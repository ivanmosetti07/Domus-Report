/**
 * Script di test per verificare la query OMI Advanced
 * Simula la ricerca che fa DomusBot per una villa a Borghesiana
 *
 * Usage: npx tsx test-omi-query.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { getOMIValueByZone } from './lib/omi-advanced'
import { PropertyType } from './types'

async function testOMIQuery() {
  console.log('🧪 TEST OMI QUERY - Villa Borghesiana (CAP 00132)\n')
  console.log('=' .repeat(70))

  // Simula i dati che DomusBot raccoglie
  const testCases = [
    {
      name: 'Test 1: Ricerca per ZONA (Borghesiana)',
      params: {
        citta: 'Roma',
        zona: 'Borghesiana',
        cap: undefined,
        tipoImmobile: 'residenziale',
        categoria: 'Ville e villini'
      }
    },
    {
      name: 'Test 2: Ricerca per CAP (00132)',
      params: {
        citta: 'Roma',
        zona: undefined,
        cap: '00132',
        tipoImmobile: 'residenziale',
        categoria: 'Ville e villini'
      }
    },
    {
      name: 'Test 3: Ricerca COMPLETA (zona + CAP)',
      params: {
        citta: 'Roma',
        zona: 'Borghesiana',
        cap: '00132',
        tipoImmobile: 'residenziale',
        categoria: 'Ville e villini'
      }
    },
    {
      name: 'Test 4: Fallback SENZA categoria (dovrebbe fallire)',
      params: {
        citta: 'Roma',
        zona: 'Borghesiana',
        cap: '00132',
        tipoImmobile: 'residenziale',
        categoria: undefined
      }
    },
    {
      name: 'Test 5: Zona INESISTENTE (dovrebbe usare CAP)',
      params: {
        citta: 'Roma',
        zona: 'ZonaInesistente',
        cap: '00132',
        tipoImmobile: 'residenziale',
        categoria: 'Ville e villini'
      }
    },
    {
      name: 'Test 6: Case-insensitive - "abitazioni civili" (minuscolo)',
      params: {
        citta: 'Bologna',
        zona: 'Centro Storico',
        cap: '40126',
        tipoImmobile: 'residenziale',
        categoria: 'abitazioni civili' // minuscolo
      }
    },
    {
      name: 'Test 7: Case-insensitive - "ABITAZIONI CIVILI" (maiuscolo)',
      params: {
        citta: 'Bologna',
        zona: 'Centro Storico',
        cap: '40126',
        tipoImmobile: 'residenziale',
        categoria: 'ABITAZIONI CIVILI' // maiuscolo
      }
    }
  ]

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`)
    console.log('-'.repeat(70))
    console.log('Parametri:')
    console.log(`  • Città: ${testCase.params.citta}`)
    console.log(`  • Zona: ${testCase.params.zona || 'N/A'}`)
    console.log(`  • CAP: ${testCase.params.cap || 'N/A'}`)
    console.log(`  • Tipo: ${testCase.params.tipoImmobile}`)
    console.log(`  • Categoria: ${testCase.params.categoria || 'N/A'}`)

    try {
      const result = await getOMIValueByZone(
        testCase.params.citta,
        testCase.params.zona,
        testCase.params.cap,
        testCase.params.tipoImmobile,
        testCase.params.categoria
      )

      if (result) {
        console.log('\n✅ RISULTATO TROVATO:')
        console.log(`  • Zona: ${result.zona}`)
        console.log(`  • Valore Min: ${result.valoreMinMq.toLocaleString()} €/m²`)
        console.log(`  • Valore Medio: ${result.valoreMedioMq.toLocaleString()} €/m²`)
        console.log(`  • Valore Max: ${result.valoreMaxMq.toLocaleString()} €/m²`)
        console.log(`  • Fonte: ${result.fonte}`)
        console.log(`  • Periodo: ${result.anno}-S${result.semestre}`)

        // Calcola valutazione per 75 m²
        const superficie = 75
        const valutazioneMin = Math.round(result.valoreMinMq * superficie)
        const valutazioneMed = Math.round(result.valoreMedioMq * superficie)
        const valutazioneMax = Math.round(result.valoreMaxMq * superficie)

        console.log(`\n  💰 Valutazione per 75 m²:`)
        console.log(`     Range: ${valutazioneMin.toLocaleString()} € - ${valutazioneMax.toLocaleString()} €`)
        console.log(`     Stima: ${valutazioneMed.toLocaleString()} €`)
      } else {
        console.log('\n❌ NESSUN RISULTATO TROVATO')
        console.log('   → Il sistema userebbe il fallback OMI di base (4500 €/m²)')
      }
    } catch (error) {
      console.log('\n🚨 ERRORE:')
      console.log(`   ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('\n📊 RIEPILOGO:')
  console.log('• Se i test 1, 2, 3 funzionano → dati caricati correttamente')
  console.log('• Se tutti falliscono → devi ricaricare il database con /api/admin/load-omi-data')
  console.log('• Valore atteso: ~2200 €/m² (1800-2800 range)')
  console.log('• Valutazione attesa per 75 m²: ~165.000 € invece di 344.250 €\n')
}

// Esegui il test
testOMIQuery()
  .then(async () => {
    console.log('✅ Test completato')
    // Chiudi connessione Prisma
    const { prisma } = await import('./lib/prisma')
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('❌ Errore fatale:', error)
    // Chiudi connessione Prisma anche in caso di errore
    const { prisma } = await import('./lib/prisma')
    await prisma.$disconnect()
    process.exit(1)
  })
