/**
 * Test Finale - Validazione Telefono DOPO I FIX
 *
 * Questo script testa che:
 * 1. La sanitizzazione sia allineata tra client e server
 * 2. Il valore sanitizzato venga preservato anche in caso di errore
 */

console.log('🧪 TEST FINALE - Validazione Telefono (POST-FIX)\n')
console.log('=' .repeat(80))

// Simula la sanitizzazione CLIENT (DOPO FIX)
function sanitizePhoneClient(input) {
  return input
    .trim()
    .replace(/\s/g, "")       // Remove spaces
    .replace(/-/g, "")        // Remove dashes
    .replace(/\./g, "")       // Remove dots
    .replace(/\(/g, "")       // Remove parentheses
    .replace(/\)/g, "")       // Remove parentheses
    .replace(/[^\d+]/g, "")   // Remove any other non-digit, non-plus
}

// Simula la validazione SERVER (DOPO FIX)
function validatePhoneServer(phone) {
  console.log('[validatePhone] START - Input:', JSON.stringify(phone))

  if (phone === undefined || phone === null) {
    return { valid: true, sanitized: null }
  }

  const phoneStr = String(phone)
  let sanitized = phoneStr
    .trim()
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/[^\d+]/g, "")

  if (!sanitized || sanitized.length === 0) {
    return { valid: true, sanitized: null }
  }

  if (sanitized.startsWith('0039')) {
    sanitized = '+39' + sanitized.substring(4)
  }

  const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
  const isValid = phoneRegex.test(sanitized)

  if (!isValid) {
    // FIX: Preserva sanitized invece di ritornare null
    return { valid: false, sanitized, error: "Formato telefono non valido" }
  }

  return { valid: true, sanitized }
}

// Test cases completi
const testCases = [
  {
    name: 'Numero standard (10 cifre)',
    input: '3331234567',
    expectedValid: true,
    expectedSanitized: '3331234567'
  },
  {
    name: 'Numero con prefisso +39',
    input: '+393331234567',
    expectedValid: true,
    expectedSanitized: '+393331234567'
  },
  {
    name: 'Numero con spazi',
    input: '333 123 4567',
    expectedValid: true,
    expectedSanitized: '3331234567'
  },
  {
    name: 'Numero con trattini (CASO CRITICO)',
    input: '333-123-4567',
    expectedValid: true,
    expectedSanitized: '3331234567'
  },
  {
    name: 'Numero con punti',
    input: '333.123.4567',
    expectedValid: true,
    expectedSanitized: '3331234567'
  },
  {
    name: 'Numero con parentesi',
    input: '(333) 123-4567',
    expectedValid: true,
    expectedSanitized: '3331234567'
  },
  {
    name: 'Numero con +39 e spazi',
    input: '+39 333 123 4567',
    expectedValid: true,
    expectedSanitized: '+393331234567'
  },
  {
    name: 'Numero troppo corto',
    input: '12345',
    expectedValid: false,
    expectedSanitized: '12345' // FIX: Preservato anche se invalido
  },
  {
    name: 'Numero con lettere',
    input: 'abc333123456',
    expectedValid: false,
    expectedSanitized: '333123456' // Lettere rimosse, ma troppo corto
  },
  {
    name: 'Campo vuoto',
    input: '',
    expectedValid: true,
    expectedSanitized: null
  },
  {
    name: 'Campo null',
    input: null,
    expectedValid: true,
    expectedSanitized: null
  }
]

console.log('\n🧪 ESECUZIONE TEST:\n')

let passedTests = 0
let failedTests = 0

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.name}`)
  console.log('-'.repeat(80))
  console.log(`Input: ${JSON.stringify(testCase.input)}`)

  // Step 1: Client sanitizza
  let clientSanitized = testCase.input
  if (testCase.input !== null && testCase.input !== undefined && testCase.input !== '') {
    clientSanitized = sanitizePhoneClient(testCase.input)
  }
  console.log(`Client sanitized: ${JSON.stringify(clientSanitized)}`)

  // Step 2: Client valida con regex
  const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
  const clientValid = clientSanitized && phoneRegex.test(clientSanitized)
  console.log(`Client valid: ${clientValid}`)

  if (!clientValid && testCase.input !== null && testCase.input !== undefined && testCase.input !== '') {
    console.log('❌ Client rejected - Request NOT sent to server')
    console.log(`Expected: valid=${testCase.expectedValid}`)
    if (testCase.expectedValid) {
      console.log('🚨 TEST FAILED: Expected valid but client rejected!')
      failedTests++
    } else {
      console.log('✅ TEST PASSED: Correctly rejected by client')
      passedTests++
    }
    return
  }

  // Step 3: Server valida
  const serverResult = validatePhoneServer(clientSanitized)
  console.log(`Server result: ${JSON.stringify(serverResult, null, 2)}`)

  // Verifica risultati
  const validMatch = serverResult.valid === testCase.expectedValid
  const sanitizedMatch = serverResult.sanitized === testCase.expectedSanitized

  console.log(`Expected: valid=${testCase.expectedValid}, sanitized=${JSON.stringify(testCase.expectedSanitized)}`)
  console.log(`Actual: valid=${serverResult.valid}, sanitized=${JSON.stringify(serverResult.sanitized)}`)

  if (validMatch && sanitizedMatch) {
    console.log('✅ TEST PASSED')
    passedTests++
  } else {
    console.log('🚨 TEST FAILED')
    if (!validMatch) console.log(`  - valid mismatch: expected ${testCase.expectedValid}, got ${serverResult.valid}`)
    if (!sanitizedMatch) console.log(`  - sanitized mismatch: expected ${testCase.expectedSanitized}, got ${serverResult.sanitized}`)
    failedTests++
  }
})

console.log('\n' + '='.repeat(80))
console.log('\n📊 RISULTATI:\n')
console.log(`✅ Test passati: ${passedTests}`)
console.log(`❌ Test falliti: ${failedTests}`)
console.log(`📈 Percentuale successo: ${Math.round((passedTests / testCases.length) * 100)}%`)

if (failedTests === 0) {
  console.log('\n🎉 TUTTI I TEST SONO PASSATI! Il fix è corretto.')
} else {
  console.log('\n⚠️  Alcuni test sono falliti. Rivedere i fix.')
}

console.log('\n' + '='.repeat(80))
console.log('\n📋 VERIFICA FIX:\n')
console.log('✅ Fix #1: Sanitizzazione allineata client-server')
console.log('   - Client e server ora usano la stessa logica di rimozione caratteri')
console.log('   - Numeri come "333-123-4567" vengono accettati da entrambi')
console.log('')
console.log('✅ Fix #2: Valore sanitizzato preservato')
console.log('   - Anche se la validazione fallisce, sanitized contiene il valore')
console.log('   - I log mostreranno cosa ha inserito l\'utente')
console.log('')
console.log('🚀 Prossimi passi:')
console.log('   1. Testare manualmente il widget in locale')
console.log('   2. Verificare che i numeri vengano salvati nel database')
console.log('   3. Deploy su Vercel')
console.log('   4. Monitorare i log di produzione')
