/**
 * Script per verificare che tutte le environment variables necessarie siano configurate
 * Esegui con: npx tsx scripts/check-env.ts
 */

const requiredEnvVars = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL connection string (Neon)',
    validation: (val: string) => {
      if (!val.includes('postgresql://')) return 'Deve iniziare con postgresql://'
      if (!val.includes('sslmode=require')) return 'Deve includere ?sslmode=require'
      return null
    },
  },

  // Authentication
  NEXTAUTH_SECRET: {
    required: true,
    description: 'JWT secret per NextAuth (min 32 chars)',
    validation: (val: string) => {
      if (val.length < 32) return 'Deve essere almeno 32 caratteri'
      return null
    },
  },
  NEXTAUTH_URL: {
    required: true,
    description: 'URL base applicazione',
    validation: (val: string) => {
      if (!val.startsWith('http')) return 'Deve iniziare con http:// o https://'
      return null
    },
  },

  // OpenAI
  OPENAI_API_KEY: {
    required: true,
    description: 'OpenAI API key',
    validation: (val: string) => {
      if (!val.startsWith('sk-')) return 'Deve iniziare con sk-'
      return null
    },
  },

  // Google Maps
  GOOGLE_MAPS_API_KEY: {
    required: true,
    description: 'Google Maps API key per geocoding',
    validation: (val: string) => {
      if (val.length < 20) return 'API key non valida (troppo corta)'
      return null
    },
  },

  // N8N (opzionale per MVP)
  N8N_WEBHOOK_URL: {
    required: false,
    description: 'n8n webhook URL (opzionale)',
    validation: (val: string) => {
      if (!val.startsWith('http')) return 'Deve iniziare con http:// o https://'
      return null
    },
  },

  // Public URLs
  NEXT_PUBLIC_APP_URL: {
    required: true,
    description: 'URL pubblico applicazione',
    validation: (val: string) => {
      if (!val.startsWith('http')) return 'Deve iniziare con http:// o https://'
      return null
    },
  },
  NEXT_PUBLIC_WIDGET_CDN_URL: {
    required: false,
    description: 'CDN URL per widget (opzionale)',
    validation: (val: string) => {
      if (!val.startsWith('http')) return 'Deve iniziare con http:// o https://'
      return null
    },
  },
}

function checkEnvironmentVariables() {
  console.log('🔍 Verifico environment variables...\n')

  let hasErrors = false
  let hasWarnings = false

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key]

    // Check se variabile esiste
    if (!value) {
      if (config.required) {
        console.log(`❌ ${key}`)
        console.log(`   ${config.description}`)
        console.log(`   MANCANTE - variabile obbligatoria\n`)
        hasErrors = true
      } else {
        console.log(`⚠️  ${key}`)
        console.log(`   ${config.description}`)
        console.log(`   Opzionale - non configurata\n`)
        hasWarnings = true
      }
      continue
    }

    // Valida il valore
    if (config.validation) {
      const error = config.validation(value)
      if (error) {
        console.log(`❌ ${key}`)
        console.log(`   ${config.description}`)
        console.log(`   ERRORE: ${error}\n`)
        hasErrors = true
        continue
      }
    }

    // Tutto ok
    console.log(`✅ ${key}`)
    console.log(`   ${config.description}`)
    console.log(`   Configurata correttamente\n`)
  }

  // Summary
  console.log('─'.repeat(60))
  if (hasErrors) {
    console.log('❌ ERRORI TROVATI - Configura le variabili mancanti')
    console.log('\nVedi .env.example per riferimento')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️  WARNINGS - Alcune variabili opzionali non configurate')
    console.log('\n✅ Configurazione base OK, puoi procedere')
    process.exit(0)
  } else {
    console.log('✅ TUTTO OK - Tutte le variabili configurate correttamente')
    process.exit(0)
  }
}

// Esegui check
checkEnvironmentVariables()
