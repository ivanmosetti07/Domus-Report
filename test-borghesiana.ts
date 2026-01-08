/**
 * Test valutazione proprietà Borghesiana
 * Via Bronte 109, Roma, CAP 00132
 */

import { calculateValuationLocal } from './lib/valuation'
import { PropertyType, PropertyCondition } from './types'

console.log("🧪 TEST VALUTAZIONE BORGHESIANA\n")

const testInput = {
  address: "via Bronte 109",
  city: "Roma",
  postalCode: "00132",
  neighborhood: "Borghesiana",
  propertyType: PropertyType.APARTMENT,
  omiCategory: "abitazioni civili",
  surfaceSqm: 75,
  floor: 0, // piano terra
  hasElevator: false,
  condition: PropertyCondition.GOOD,
  rooms: 2,
  bathrooms: 1,
  hasBalcony: true,
  hasTerrace: true,
  hasParking: true,
}

console.log("📋 INPUT DATI:")
console.log(JSON.stringify(testInput, null, 2))
console.log("\n═══════════════════════════════════════════════\n")

try {
  console.log("⏳ Chiamata calculateValuationLocal()...")

  const result = calculateValuationLocal(testInput)

  console.log("\n✅ VALUTAZIONE COMPLETATA!")
  console.log("═══════════════════════════════════════════════")
  console.log(`💰 Prezzo stimato: ${result.estimatedPrice.toLocaleString()} €`)
  console.log(`📊 Range: ${result.minPrice.toLocaleString()} - ${result.maxPrice.toLocaleString()} €`)
  console.log(`🏠 Valore OMI base: ${result.baseOMIValue.toLocaleString()} €/m²`)
  console.log(`🏢 Coefficiente piano: ${result.floorCoefficient}`)
  console.log(`✨ Coefficiente stato: ${result.conditionCoefficient}`)
  console.log(`\n📝 Spiegazione:\n${result.explanation}`)
  console.log("\n═══════════════════════════════════════════════")

  // Confronto con prezzo chatbot
  const chatbotPrice = 351900
  const difference = result.estimatedPrice - chatbotPrice
  const percentageDiff = (difference / chatbotPrice) * 100

  console.log("\n📊 CONFRONTO CON CHATBOT:")
  console.log(`Prezzo chatbot: ${chatbotPrice.toLocaleString()} €`)
  console.log(`Prezzo calcolato: ${result.estimatedPrice.toLocaleString()} €`)
  console.log(`Differenza: ${difference.toLocaleString()} € (${percentageDiff > 0 ? '+' : ''}${percentageDiff.toFixed(2)}%)`)

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
