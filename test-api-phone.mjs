/**
 * Test per simulare esattamente cosa fa il widget quando invia il numero al server
 * Questo ci aiuterà a capire dove si perde il dato
 */

console.log('🧪 TEST API - Simulazione Invio Numero Telefono\n')
console.log('=' .repeat(80))

// Simula esattamente cosa fa il widget
const testScenarios = [
  {
    name: 'Scenario 1: Numero valido standard',
    phone: '3497494871',
    description: 'Widget invia numero pulito dopo sanitizzazione client'
  },
  {
    name: 'Scenario 2: Numero con spazi (PRIMA della sanitizzazione client)',
    phone: '349 749 4871',
    description: 'Questo NON dovrebbe succedere perché il client sanitizza prima'
  },
  {
    name: 'Scenario 3: Campo undefined',
    phone: undefined,
    description: 'Campo non impostato'
  },
  {
    name: 'Scenario 4: Campo null',
    phone: null,
    description: 'Campo esplicitamente null'
  },
  {
    name: 'Scenario 5: Stringa vuota',
    phone: '',
    description: 'Campo impostato a stringa vuota'
  }
]

// Funzione di validazione server (copiata da validation.ts)
function validatePhoneServer(phone) {
  console.log('[validatePhone] START - Input:', JSON.stringify(phone), 'Type:', typeof phone, 'Length:', phone?.length)

  // Handle undefined or null - phone is optional
  if (phone === undefined || phone === null) {
    console.log('[validatePhone] Phone is null/undefined - returning null (optional field)')
    return { valid: true, sanitized: null }
  }

  // Convert to string if needed
  const phoneStr = String(phone)
  console.log('[validatePhone] Phone as string:', JSON.stringify(phoneStr))

  // Sanitize
  let sanitized = phoneStr
    .trim()
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/[^\d+]/g, "")

  console.log('[validatePhone] After sanitization:', JSON.stringify(sanitized), 'Length:', sanitized.length)

  // If empty after sanitization, treat as optional (return null)
  if (!sanitized || sanitized.length === 0) {
    console.log('[validatePhone] Empty after sanitization - returning null')
    return { valid: true, sanitized: null }
  }

  // Normalize 0039 to +39
  if (sanitized.startsWith('0039')) {
    sanitized = '+39' + sanitized.substring(4)
  }

  // Validate
  const phoneRegex = /^(\+39|0039)?[0-9]{8,13}$/
  const isValid = phoneRegex.test(sanitized)

  console.log('[validatePhone] Regex test:', isValid)

  if (!isValid) {
    console.log('[validatePhone] ❌ VALIDATION FAILED')
    return { valid: false, sanitized, error: "Formato telefono non valido" }
  }

  console.log('[validatePhone] ✅ SUCCESS - Valid phone:', JSON.stringify(sanitized))
  return { valid: true, sanitized }
}

console.log('\n🧪 ESECUZIONE TEST:\n')

testScenarios.forEach((scenario, index) => {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`\nTest ${index + 1}: ${scenario.name}`)
  console.log(`Descrizione: ${scenario.description}`)
  console.log(`Input phone: ${JSON.stringify(scenario.phone)}`)
  console.log('-'.repeat(80))

  const result = validatePhoneServer(scenario.phone)

  console.log('\n📊 RISULTATO:')
  console.log(`   valid: ${result.valid}`)
  console.log(`   sanitized: ${JSON.stringify(result.sanitized)}`)
  console.log(`   error: ${result.error || 'none'}`)

  console.log('\n💾 COSA VIENE SALVATO NEL DATABASE:')
  if (result.valid && result.sanitized) {
    console.log(`   ✅ telefono = "${result.sanitized}"`)
  } else if (result.valid && result.sanitized === null) {
    console.log(`   ⚠️  telefono = NULL (campo opzionale vuoto)`)
  } else {
    console.log(`   ❌ RICHIESTA RIFIUTATA (validazione fallita)`)
  }
})

console.log('\n' + '='.repeat(80))
console.log('\n📋 ANALISI:\n')

console.log('Il problema è probabilmente uno di questi:')
console.log('')
console.log('1️⃣  Il WIDGET non sta inviando il campo "phone" nel payload')
console.log('    → Verificare collectedData.phone in chat-widget.tsx')
console.log('    → Controllare che phone sia incluso nel payload (riga 797)')
console.log('')
console.log('2️⃣  Il campo "phone" arriva al server ma è UNDEFINED o VUOTO')
console.log('    → La validazione ritorna valid:true, sanitized:null')
console.log('    → Il database salva NULL')
console.log('')
console.log('3️⃣  Il campo viene perso durante il calcolo della valutazione')
console.log('    → Verificare che calculateValuation() preservi collectedData')
console.log('')
console.log('🔍 Per verificare:')
console.log('   1. Aprire browser su https://domusreport.mainstream.agency/')
console.log('   2. F12 → Network tab')
console.log('   3. Fare una valutazione completa con numero: 3497494871')
console.log('   4. Guardare la richiesta POST /api/leads')
console.log('   5. Payload → Verificare che ci sia "phone": "3497494871"')
console.log('   6. Se phone è assente/vuoto → BUG nel widget')
console.log('   7. Se phone è presente → BUG nel server')
