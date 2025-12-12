/**
 * Script per testare manualmente il check trial expiry
 *
 * Esegui con: npx tsx scripts/check-trial-expiry.ts
 *
 * Questo script chiama l'endpoint API /api/cron/check-trial-expiry
 * usando il CRON_SECRET configurato in .env
 */

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('❌ CRON_SECRET non configurato in .env')
    console.log('Aggiungi CRON_SECRET=your-secret-key nel file .env')
    process.exit(1)
  }

  console.log('🔄 Esecuzione check trial expiry...')
  console.log(`📍 URL: ${baseUrl}/api/cron/check-trial-expiry`)

  try {
    const response = await fetch(`${baseUrl}/api/cron/check-trial-expiry`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Check trial expiry completato con successo')
      console.log('\nRisultati:')
      console.log(`  - Totale trial scaduti: ${data.results.total}`)
      console.log(`  - Convertiti a piano attivo: ${data.results.converted}`)
      console.log(`  - Downgrade a free: ${data.results.downgraded}`)
      console.log(`  - Errori: ${data.results.errors}`)
    } else {
      console.error('❌ Errore durante il check:', data.error)
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Errore di connessione:', error)
    process.exit(1)
  }
}

main()
