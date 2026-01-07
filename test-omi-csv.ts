/**
 * Test script per verificare l'estrazione dati OMI dal CSV
 */

import { getOMIValueByZone, getPriceHistory, calculateZoneTrend, getZonesByCity } from './lib/omi-advanced'

console.log("🧪 TEST ESTRAZIONE DATI OMI DAL CSV\n")

// Test 1: Ricerca per zona
console.log("═══════════════════════════════════════════════")
console.log("Test 1: Ricerca per ZONA (Borghesiana, Roma)")
console.log("═══════════════════════════════════════════════")
const test1 = getOMIValueByZone("Roma", "Borghesiana", undefined, "residenziale", "Ville e villini")
if (test1) {
  console.log("✅ RISULTATO TROVATO:")
  console.log(`  • Zona: ${test1.zona}`)
  console.log(`  • Valore Medio: ${test1.valoreMedioMq.toLocaleString()} €/m²`)
  console.log(`  • Range: ${test1.valoreMinMq.toLocaleString()} - ${test1.valoreMaxMq.toLocaleString()} €/m²`)
  console.log(`  • Periodo: ${test1.anno}-S${test1.semestre}`)
  console.log(`  • Fonte: ${test1.fonte}`)
  console.log(`  • Valutazione per 75 m²: ${(test1.valoreMedioMq * 75).toLocaleString()} €`)
} else {
  console.log("❌ NESSUN RISULTATO TROVATO")
}

// Test 2: Ricerca per CAP
console.log("\n═══════════════════════════════════════════════")
console.log("Test 2: Ricerca per CAP (00132, Roma)")
console.log("═══════════════════════════════════════════════")
const test2 = getOMIValueByZone("Roma", undefined, "00132", "residenziale", "Ville e villini")
if (test2) {
  console.log("✅ RISULTATO TROVATO:")
  console.log(`  • Zona: ${test2.zona}`)
  console.log(`  • Valore Medio: ${test2.valoreMedioMq.toLocaleString()} €/m²`)
  console.log(`  • Range: ${test2.valoreMinMq.toLocaleString()} - ${test2.valoreMaxMq.toLocaleString()} €/m²`)
  console.log(`  • Periodo: ${test2.anno}-S${test2.semestre}`)
} else {
  console.log("❌ NESSUN RISULTATO TROVATO")
}

// Test 3: Bologna Centro Storico
console.log("\n═══════════════════════════════════════════════")
console.log("Test 3: Bologna Centro Storico - Abitazioni Civili")
console.log("═══════════════════════════════════════════════")
const test3 = getOMIValueByZone("Bologna", "Centro Storico", undefined, "residenziale", "abitazioni civili")
if (test3) {
  console.log("✅ RISULTATO TROVATO:")
  console.log(`  • Zona: ${test3.zona}`)
  console.log(`  • Valore Medio: ${test3.valoreMedioMq.toLocaleString()} €/m²`)
  console.log(`  • Range: ${test3.valoreMinMq.toLocaleString()} - ${test3.valoreMaxMq.toLocaleString()} €/m²`)
  console.log(`  • Valutazione per 80 m²: ${(test3.valoreMedioMq * 80).toLocaleString()} €`)
} else {
  console.log("❌ NESSUN RISULTATO TROVATO")
}

// Test 4: Media città (senza zona/CAP)
console.log("\n═══════════════════════════════════════════════")
console.log("Test 4: Media città Roma (senza zona/CAP)")
console.log("═══════════════════════════════════════════════")
const test4 = getOMIValueByZone("Roma", undefined, undefined, "residenziale", "abitazioni civili")
if (test4) {
  console.log("✅ RISULTATO TROVATO:")
  console.log(`  • Zona: ${test4.zona}`)
  console.log(`  • Valore Medio: ${test4.valoreMedioMq.toLocaleString()} €/m²`)
  console.log(`  • Range: ${test4.valoreMinMq.toLocaleString()} - ${test4.valoreMaxMq.toLocaleString()} €/m²`)
} else {
  console.log("❌ NESSUN RISULTATO TROVATO")
}

// Test 5: Storico prezzi
console.log("\n═══════════════════════════════════════════════")
console.log("Test 5: Storico Prezzi - Bologna Centro Storico")
console.log("═══════════════════════════════════════════════")
const history = getPriceHistory("Bologna", "Centro Storico", "residenziale", 4)
if (history.length > 0) {
  console.log("✅ STORICO TROVATO:")
  history.forEach(h => {
    const variazione = h.variazione ? `(${h.variazione > 0 ? '+' : ''}${h.variazione.toFixed(1)}%)` : ''
    console.log(`  • ${h.semestre}: ${h.valoreMedioMq.toLocaleString()} €/m² ${variazione}`)
  })
} else {
  console.log("❌ NESSUNO STORICO TROVATO")
}

// Test 6: Trend zona
console.log("\n═══════════════════════════════════════════════")
console.log("Test 6: Trend - Bologna Centro Storico")
console.log("═══════════════════════════════════════════════")
const trend = calculateZoneTrend("Bologna", "Centro Storico", "residenziale")
if (trend) {
  console.log("✅ TREND CALCOLATO:")
  console.log(`  • ${trend.icona} ${trend.trend.toUpperCase()}`)
  console.log(`  • ${trend.descrizione}`)
  console.log(`  • Prezzo medio attuale: ${trend.prezzoMedioAttuale.toLocaleString()} €/m²`)
} else {
  console.log("❌ TREND NON CALCOLABILE")
}

// Test 7: Elenco zone
console.log("\n═══════════════════════════════════════════════")
console.log("Test 7: Elenco Zone disponibili - Bologna")
console.log("═══════════════════════════════════════════════")
const zones = getZonesByCity("Bologna")
if (zones.length > 0) {
  console.log(`✅ TROVATE ${zones.length} ZONE:`)
  zones.slice(0, 10).forEach(z => {
    console.log(`  • ${z.zona} ${z.cap ? `(CAP: ${z.cap})` : ''} - ${z.numeroValori} valori`)
  })
  if (zones.length > 10) {
    console.log(`  ... e altre ${zones.length - 10} zone`)
  }
} else {
  console.log("❌ NESSUNA ZONA TROVATA")
}

console.log("\n═══════════════════════════════════════════════")
console.log("✅ TEST COMPLETATI!")
console.log("═══════════════════════════════════════════════\n")
