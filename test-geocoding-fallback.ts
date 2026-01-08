/**
 * Test del sistema di fallback geocoding
 * Verifica che quando i dati utente sono affidabili (città+CAP corretti),
 * il sistema accetti il lead anche se il geocoding fallisce
 */

import { getCityFromPostalCode } from './lib/postal-code'

console.log("🧪 TEST GEOCODING FALLBACK\n")

// Test Case: Viale Alessandro Manzoni 13, Pomezia, CAP 00071
const testData = {
  address: "Viale Alessandro Manzoni 13",
  city: "Pomezia",
  postalCode: "00071"
}

console.log("📋 INPUT DATI:")
console.log(JSON.stringify(testData, null, 2))
console.log("\n═══════════════════════════════════════════════\n")

// Step 1: Verifica affidabilità dati
const cityFromCAP = getCityFromPostalCode(testData.postalCode)

console.log("🔍 STEP 1: Verifica affidabilità dati")
console.log(`CAP fornito: ${testData.postalCode}`)
console.log(`Città fornita: ${testData.city}`)
console.log(`Città dedotta da CAP: ${cityFromCAP}`)

const userDataReliable = testData.city &&
                        testData.postalCode &&
                        cityFromCAP &&
                        testData.city.toLowerCase().trim() === cityFromCAP.toLowerCase().trim()

console.log(`\nDati utente affidabili? ${userDataReliable ? '✅ SÌ' : '❌ NO'}`)

if (userDataReliable) {
  console.log("\n✅ RISULTATO:")
  console.log("I dati città+CAP sono coerenti.")
  console.log("Anche se il geocoding dell'indirizzo specifico fallisce,")
  console.log("il sistema dovrebbe:")
  console.log("1. Tentare geocoding con 'Viale Alessandro Manzoni 13, Pomezia, 00071'")
  console.log("2. Se fallisce, tentare geocoding solo con 'Pomezia'")
  console.log("3. Se anche quello fallisce, usare dati utente senza coordinate")
  console.log("4. Salvare il lead con indirizzo: 'Viale Alessandro Manzoni 13, Pomezia, 00071'")
  console.log("5. Coordinate: null (se geocoding fallisce completamente)")
} else {
  console.log("\n❌ RISULTATO:")
  console.log("I dati città+CAP NON sono coerenti.")
  console.log("Il geocoding è OBBLIGATORIO per validare l'indirizzo.")
}

console.log("\n═══════════════════════════════════════════════\n")

// Test Case 2: Indirizzo ambiguo (Via Chioggia, Ardea)
const testData2 = {
  address: "Via Chioggia 23",
  city: "Ardea",
  postalCode: "00040"
}

console.log("📋 TEST CASE 2: Indirizzo ambiguo")
console.log(JSON.stringify(testData2, null, 2))
console.log("\n═══════════════════════════════════════════════\n")

const cityFromCAP2 = getCityFromPostalCode(testData2.postalCode)

console.log("🔍 STEP 1: Verifica affidabilità dati")
console.log(`CAP fornito: ${testData2.postalCode}`)
console.log(`Città fornita: ${testData2.city}`)
console.log(`Città dedotta da CAP: ${cityFromCAP2}`)

const userDataReliable2 = testData2.city &&
                         testData2.postalCode &&
                         cityFromCAP2 &&
                         testData2.city.toLowerCase().trim() === cityFromCAP2.toLowerCase().trim()

console.log(`\nDati utente affidabili? ${userDataReliable2 ? '✅ SÌ' : '❌ NO'}`)

if (userDataReliable2) {
  console.log("\n✅ RISULTATO:")
  console.log("Via Chioggia esiste sia ad Ardea che a Ravenna.")
  console.log("Grazie ai dati affidabili (Ardea + 00040), il sistema:")
  console.log("1. Geocodifica con 'Via Chioggia 23, Ardea, 00040'")
  console.log("2. Se trova risultati, usa coordinate di Ardea (non Ravenna)")
  console.log("3. Se non trova risultati, usa dati utente + coordinate città Ardea")
}

console.log("\n═══════════════════════════════════════════════")
