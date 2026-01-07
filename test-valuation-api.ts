/**
 * Test script per verificare la chiamata API di valutazione
 * Simula la chiamata che fa il chatbot
 */

import { calculateValuation } from './lib/valuation'
import { PropertyType, PropertyCondition } from './types'

console.log("🧪 TEST VALUTAZIONE API\n")

// Dati esattamente come li invia il chatbot
const testInput = {
  address: "via Cammarata, 8",
  city: "Roma",
  postalCode: "00133",
  propertyType: PropertyType.APARTMENT,
  omiCategory: "abitazioni civili",
  surfaceSqm: 60,
  floor: 2,
  hasElevator: false,
  condition: PropertyCondition.GOOD,
  rooms: 2,
  bathrooms: 1,
}

async function runTest() {
  console.log("📋 INPUT DATI:")
  console.log(JSON.stringify(testInput, null, 2))
  console.log("\n═══════════════════════════════════════════════\n")

  try {
    console.log("⏳ Chiamata calculateValuation()...")

    const result = await calculateValuation(testInput)

    console.log("\n✅ VALUTAZIONE COMPLETATA!")
    console.log("═══════════════════════════════════════════════")
    console.log(`💰 Prezzo stimato: ${result.estimatedPrice.toLocaleString()} €`)
    console.log(`📊 Range: ${result.minPrice.toLocaleString()} - ${result.maxPrice.toLocaleString()} €`)
    console.log(`🏠 Valore OMI base: ${result.baseOMIValue.toLocaleString()} €/m²`)
    console.log(`🏢 Coefficiente piano: ${result.floorCoefficient}`)
    console.log(`✨ Coefficiente stato: ${result.conditionCoefficient}`)
    console.log(`\n📝 Spiegazione:\n${result.explanation}`)
    console.log("\n═══════════════════════════════════════════════")

  } catch (error) {
    console.error("\n❌ ERRORE DURANTE LA VALUTAZIONE:")
    console.error("═══════════════════════════════════════════════")
    if (error instanceof Error) {
      console.error(`Tipo: ${error.name}`)
      console.error(`Messaggio: ${error.message}`)
      console.error(`Stack:\n${error.stack}`)
    } else {
      console.error(error)
    }
    console.error("\n═══════════════════════════════════════════════")
    process.exit(1)
  }
}

runTest()
