/**
 * Test per verificare quali formati di numero vengono accettati/rifiutati
 * con il regex ATTUALE vs il regex MIGLIORATO
 */

console.log('🔍 ANALISI FORMATI NUMERO TELEFONO\n')
console.log('=' .repeat(80))

// Regex ATTUALE (troppo restrittivo)
const CURRENT_REGEX = /^(\+39|0039)?[0-9]{9,13}$/

// Regex MIGLIORATO (più permissivo)
// Accetta:
// - Numeri fissi: 8-11 cifre (es. 06123456, 0612345678)
// - Numeri mobili: 9-10 cifre senza prefisso (es. 3491234567, 349123456)
// - Con prefisso +39 o 0039: +39 + 9-10 cifre
const IMPROVED_REGEX = /^(\+39|0039)?[0-9]{8,13}$/

// Test con numeri REALI italiani
const testNumbers = [
  // MOBILI (dovrebbero TUTTI essere accettati)
  { input: '3497494871', description: 'Mobile 10 cifre (formato standard)', expected: true },
  { input: '349 7494871', description: 'Mobile con spazio', expected: true },
  { input: '349-749-4871', description: 'Mobile con trattini', expected: true },
  { input: '+393497494871', description: 'Mobile con prefisso +39', expected: true },
  { input: '+39 349 7494871', description: 'Mobile con +39 e spazi', expected: true },
  { input: '00393497494871', description: 'Mobile con prefisso 0039', expected: true },

  // MOBILI 9 CIFRE (alcuni operatori)
  { input: '349749487', description: 'Mobile 9 cifre', expected: true },
  { input: '3331234567', description: 'Mobile 10 cifre (altro operatore)', expected: true },

  // FISSI (dovrebbero TUTTI essere accettati)
  { input: '0612345678', description: 'Fisso Roma (06 + 8 cifre)', expected: true },
  { input: '06 1234 5678', description: 'Fisso Roma con spazi', expected: true },
  { input: '02123456', description: 'Fisso Milano corto (02 + 6 cifre)', expected: true },
  { input: '0212345678', description: 'Fisso Milano lungo (02 + 8 cifre)', expected: true },
  { input: '+390612345678', description: 'Fisso con +39', expected: true },

  // EDGE CASES (validi)
  { input: '800123456', description: 'Numero verde (800)', expected: true },
  { input: '199123456', description: 'Numero speciale (199)', expected: true },

  // INVALIDI (dovrebbero essere RIFIUTATI)
  { input: '12345', description: 'Troppo corto (5 cifre)', expected: false },
  { input: '123', description: 'Troppo corto (3 cifre)', expected: false },
  { input: 'abc123', description: 'Contiene lettere', expected: false },
  { input: '', description: 'Vuoto', expected: false },
]

// Funzione di sanitizzazione (come nel codice)
function sanitize(input) {
  if (!input) return ''
  return String(input)
    .trim()
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/[^\d+]/g, "")
}

console.log('\n📊 CONFRONTO REGEX:\n')
console.log('ATTUALE:  /^(\\+39|0039)?[0-9]{9,13}$/')
console.log('          ↳ Accetta solo 9-13 cifre (esclude fissi corti)')
console.log('')
console.log('MIGLIORATO: /^(\\+39|0039)?[0-9]{8,13}$/')
console.log('          ↳ Accetta 8-13 cifre (include tutti i numeri italiani)')
console.log('')
console.log('=' .repeat(80))

let currentPassed = 0
let currentFailed = 0
let improvedPassed = 0
let improvedFailed = 0

testNumbers.forEach((test, index) => {
  const sanitized = sanitize(test.input)
  const currentValid = sanitized && CURRENT_REGEX.test(sanitized)
  const improvedValid = sanitized && IMPROVED_REGEX.test(sanitized)

  console.log(`\nTest ${index + 1}: ${test.description}`)
  console.log('-'.repeat(80))
  console.log(`Input:      "${test.input}"`)
  console.log(`Sanitized:  "${sanitized}" (${sanitized.length} cifre)`)
  console.log(`Expected:   ${test.expected ? '✅ VALIDO' : '❌ INVALIDO'}`)
  console.log(`ATTUALE:    ${currentValid ? '✅ ACCETTATO' : '❌ RIFIUTATO'}`)
  console.log(`MIGLIORATO: ${improvedValid ? '✅ ACCETTATO' : '❌ RIFIUTATO'}`)

  // Verifica se il risultato è corretto
  const currentCorrect = currentValid === test.expected
  const improvedCorrect = improvedValid === test.expected

  if (currentCorrect) currentPassed++
  else currentFailed++

  if (improvedCorrect) improvedPassed++
  else improvedFailed++

  if (!currentCorrect && improvedCorrect) {
    console.log('🎯 MIGLIORATO RISOLVE IL PROBLEMA!')
  } else if (currentCorrect && !improvedCorrect) {
    console.log('⚠️  MIGLIORATO INTRODUCE UN PROBLEMA!')
  } else if (!currentCorrect && !improvedCorrect) {
    console.log('⚠️  ENTRAMBI FALLISCONO')
  }
})

console.log('\n' + '='.repeat(80))
console.log('\n📊 STATISTICHE:\n')

console.log('REGEX ATTUALE:')
console.log(`  ✅ Corretti: ${currentPassed}/${testNumbers.length} (${Math.round(currentPassed/testNumbers.length*100)}%)`)
console.log(`  ❌ Errati:   ${currentFailed}/${testNumbers.length}`)

console.log('\nREGEX MIGLIORATO:')
console.log(`  ✅ Corretti: ${improvedPassed}/${testNumbers.length} (${Math.round(improvedPassed/testNumbers.length*100)}%)`)
console.log(`  ❌ Errati:   ${improvedFailed}/${testNumbers.length}`)

if (improvedPassed > currentPassed) {
  console.log(`\n🎉 MIGLIORAMENTO: +${improvedPassed - currentPassed} test corretti in più!`)
} else if (improvedPassed === currentPassed) {
  console.log('\n✅ Nessun cambiamento nella precisione')
} else {
  console.log('\n⚠️  PEGGIORAMENTO: Rivedere il regex')
}

console.log('\n' + '='.repeat(80))
console.log('\n💡 RACCOMANDAZIONE:\n')

if (improvedPassed >= currentPassed && improvedFailed <= currentFailed) {
  console.log('✅ APPLICARE IL REGEX MIGLIORATO')
  console.log('   Cambiare da: /^(\\+39|0039)?[0-9]{9,13}$/')
  console.log('   A:          /^(\\+39|0039)?[0-9]{8,13}$/')
  console.log('')
  console.log('   Questo permette di accettare:')
  console.log('   - Tutti i numeri mobili (9-10 cifre)')
  console.log('   - Tutti i numeri fissi (8-11 cifre con prefisso)')
  console.log('   - Tutti i formati con/senza +39/0039')
} else {
  console.log('⚠️  MANTENERE IL REGEX ATTUALE o rivedere')
}

console.log('\n📍 File da modificare:')
console.log('   1. components/widget/chat-widget.tsx (riga 584)')
console.log('   2. lib/validation.ts (riga 102)')
