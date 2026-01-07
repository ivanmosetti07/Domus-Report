/**
 * DEPRECATO: Questo script non è più necessario
 *
 * Il sistema OMI è stato migrato da PostgreSQL a lettura diretta da CSV.
 * I dati vengono caricati automaticamente in cache alla prima richiesta.
 *
 * File CSV: data/omi-values.csv (~133.000 record)
 * Cache: In-memory con TTL di 30 minuti
 * Performance: ~350ms primo caricamento, <5ms successivamente
 *
 * NON È PIÙ NECESSARIO ESEGUIRE QUESTO SCRIPT
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   ⚠️  SCRIPT DEPRECATO  ⚠️                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Questo script non è più necessario.                          ║
║                                                                ║
║  Il sistema OMI ora legge i dati direttamente dal CSV         ║
║  utilizzando una cache in-memory automatica.                  ║
║                                                                ║
║  📁 File CSV: data/omi-values.csv                             ║
║  💾 Record: ~133.000                                          ║
║  ⚡ Performance: ~350ms primo caricamento, <5ms dopo         ║
║                                                                ║
║  ✅ Non è richiesta alcuna azione da parte tua.               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`)

process.exit(0)

async function main() {
  console.log('🚀 Avvio caricamento dati OMI...\n')
  console.log('=' .repeat(70))

  try {
    // Verifica che il database sia accessibile
    console.log('\n📊 Verifica connessione database...')
    await prisma.$connect()
    console.log('✅ Database connesso')

    // Conta quanti record ci sono già
    const existingCount = await prisma.oMIValue.count()
    console.log(`📈 Record OMI esistenti: ${existingCount.toLocaleString()}`)

    if (existingCount > 0) {
      console.log('\n⚠️  ATTENZIONE: Il database contiene già dati OMI.')
      console.log('   Questo script aggiornerà i record esistenti e ne aggiungerà di nuovi.')
      console.log('   Continuare? (Ctrl+C per annullare)\n')

      // Aspetta 3 secondi prima di continuare
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    // Carica i dati dal CSV
    console.log('\n📥 Caricamento dati da CSV...')
    console.log('   Questo potrebbe richiedere alcuni minuti...\n')

    const startTime = Date.now()
    const recordsLoaded = await loadOMIDataFromCSV()
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log('\n' + '=' .repeat(70))
    console.log(`\n✅ COMPLETATO!`)
    console.log(`   • Record caricati/aggiornati: ${recordsLoaded.toLocaleString()}`)
    console.log(`   • Tempo impiegato: ${elapsedTime}s`)

    // Verifica finale
    const finalCount = await prisma.oMIValue.count()
    console.log(`   • Totale record nel database: ${finalCount.toLocaleString()}`)

    // Mostra alcuni esempi
    console.log('\n📋 Esempi di dati caricati:')
    const samples = await prisma.oMIValue.findMany({
      take: 5,
      orderBy: { anno: 'desc' }
    })

    samples.forEach((sample, idx) => {
      console.log(`   ${idx + 1}. ${sample.citta} - ${sample.zona} (CAP ${sample.cap || 'N/A'})`)
      console.log(`      ${sample.tipoImmobile} - ${sample.categoria || 'N/A'}`)
      console.log(`      ${sample.valoreMedioMq.toLocaleString()} €/m² (${sample.anno}-S${sample.semestre})`)
    })

    console.log('\n🎉 Il database OMI è ora pronto per le valutazioni!\n')
  } catch (error) {
    console.error('\n❌ ERRORE durante il caricamento:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Esegui lo script
main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })
