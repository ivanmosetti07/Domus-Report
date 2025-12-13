/**
 * Test script per verificare il bug della validazione telefono
 *
 * PROBLEMA IDENTIFICATO:
 * La funzione validatePhone ha un bug critico alla riga 110:
 * Quando il numero NON è valido, ritorna sanitized: null invece del numero sanitizzato
 *
 * Questo causa la perdita del numero di telefono anche quando l'utente lo inserisce correttamente
 */

console.log('🔍 TEST VALIDAZIONE TELEFONO - Bug Investigation\n')
console.log('=' .repeat(80))

// Simula la funzione validatePhone ATTUALE (con bug)
function validatePhoneBUGGY(phone) {
  console.log('[validatePhone] START - Input:', JSON.stringify(phone), 'Type:', typeof phone, 'Length:', phone?.length)

  if (phone === undefined || phone === null) {
    console.log('[validatePhone] Phone is null/undefined - returning null (optional field)')
    return { valid: true, sanitized: null }
  }

  const phoneStr = String(phone)
  console.log('[validatePhone] Phone as string:', JSON.stringify(phoneStr))

  let sanitized = phoneStr
    .trim()
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/[^\d+]/g, "")

  console.log('[validatePhone] After sanitization:', JSON.stringify(sanitized), 'Length:', sanitized.length)

  if (!sanitized || sanitized.length === 0) {
    console.log('[validatePhone] Empty after sanitization - returning null')
    return { valid: true, sanitized: null }
  }

  if (sanitized.startsWith('0039')) {
    sanitized = '+39' + sanitized.substring(4)
    console.log('[validatePhone] Normalized 0039 to +39:', sanitized)
  }

  const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
  const isValid = phoneRegex.test(sanitized)

  console.log('[validatePhone] Regex test result:', isValid, 'Against pattern:', phoneRegex.toString())

  if (!isValid) {
    console.log('[validatePhone] ❌ VALIDATION FAILED - Input does not match Italian phone format')
    // BUG QUI: Ritorna sanitized: null invece di sanitized
    return { valid: false, sanitized: null, error: "Formato telefono non valido" }
  }

  console.log('[validatePhone] ✅ SUCCESS - Valid phone number:', JSON.stringify(sanitized))
  return { valid: true, sanitized }
}

// Test cases
const testCases = [
  '3331234567',        // Valid: 10 digits
  '+393331234567',     // Valid: +39 prefix
  '333 123 4567',      // Valid: with spaces
  '333-123-4567',      // Valid: with dashes
  '12345',             // Invalid: too short
  'abc123',            // Invalid: contains letters
  '',                  // Empty
  null,                // Null
  undefined,           // Undefined
]

console.log('\n🧪 TEST CASES:\n')

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${JSON.stringify(testCase)}`)
  console.log('-'.repeat(80))
  const result = validatePhoneBUGGY(testCase)
  console.log('RESULT:', JSON.stringify(result, null, 2))

  if (testCase && !result.valid && result.sanitized === null) {
    console.log('🚨 BUG DETECTED: Phone was provided but sanitized returned as null!')
    console.log(`   Input: ${testCase}`)
    console.log(`   Expected: sanitized should contain the sanitized input`)
    console.log(`   Actual: sanitized is null`)
  }
})

console.log('\n' + '='.repeat(80))
console.log('\n📋 CONCLUSIONI:\n')
console.log('Il bug è alla riga 110 di lib/validation.ts:')
console.log('Quando la validazione fallisce, la funzione ritorna sanitized: null')
console.log('Questo fa perdere il dato del telefono anche se era stato inserito.')
console.log('\nSOLUZIONE:')
console.log('Cambiare la riga 110 da:')
console.log('  return { valid: false, sanitized: null, error: "..." }')
console.log('a:')
console.log('  return { valid: false, sanitized, error: "..." }')
console.log('\nIn questo modo il numero sanitizzato viene preservato per il logging/debugging')
console.log('e il database riceverà comunque null perché valid: false bloccherà la richiesta.')
