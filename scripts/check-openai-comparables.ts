/**
 * Check end-to-end che il motore v2 + OpenAI web_search funzionino insieme:
 *
 * 1. Verifica che OPENAI_API_KEY sia configurata
 * 2. Chiama searchComparables per l'immobile di Ardea (dataset reale)
 * 3. Verifica che OpenAI ritorni annunci veri (sampleSize > 0)
 * 4. Calcola OMI baseline con motore v2
 * 5. crossCheckWithOMI: confronta mercato vs OMI
 * 6. applyComparablesRefinement: verifica che NON modifichi prezzi (warning-only)
 * 7. Stampa verdetto
 *
 * Usage: npx tsx scripts/check-openai-comparables.ts
 */

import {
  searchComparables,
  crossCheckWithOMI,
  applyComparablesRefinement,
  isComparablesEnabled,
  getComparablesProvider,
} from "../lib/comparables"
import { calculateValuationLocal } from "../lib/valuation"
import { PropertyType, PropertyCondition } from "../types"

function sep(title: string) {
  console.log("\n" + "═".repeat(70))
  console.log(`  ${title}`)
  console.log("═".repeat(70))
}

async function main() {
  sep("STEP 1 — Environment check")
  console.log(`OPENAI_API_KEY:       ${process.env.OPENAI_API_KEY ? "✅ presente" : "❌ MANCANTE"}`)
  console.log(`OPENAI_COMPARABLES_MODEL: ${process.env.OPENAI_COMPARABLES_MODEL || "(default gpt-4o)"}`)
  console.log(`COMPARABLES_ENABLED:  ${process.env.COMPARABLES_ENABLED ?? "(default true)"}`)
  console.log(`isComparablesEnabled(): ${isComparablesEnabled()}`)

  const provider = getComparablesProvider()
  console.log(`Provider attivo:      ${provider?.name ?? "❌ NESSUNO"}`)

  if (!provider) {
    console.log("\n❌ Nessun provider comparables disponibile. Imposta OPENAI_API_KEY.")
    process.exit(1)
  }

  // Test dataset: immobile Ardea lungomare (quello delle 2 valutazioni errate)
  const inputArdea = {
    address: "Lungomare degli ardeatini 327",
    city: "Ardea",
    neighborhood: "Marina di Ardea",
    postalCode: "00040",
    propertyType: PropertyType.APARTMENT,
    surfaceSqm: 40,
    floor: 1,
    hasElevator: false,
    condition: PropertyCondition.RENOVATED,
    rooms: 1,
    bathrooms: 1,
    outdoorSpace: "Balcone",
    hasParking: false,
  }

  sep("STEP 2 — OMI baseline (motore v2)")
  const baseValuation = calculateValuationLocal(inputArdea)
  console.log(`Prezzo stimato v2:    €${baseValuation.estimatedPrice.toLocaleString("it-IT")}`)
  console.log(`Range:                €${baseValuation.minPrice.toLocaleString("it-IT")} – €${baseValuation.maxPrice.toLocaleString("it-IT")}`)
  console.log(`€/mq:                 ${baseValuation.pricePerSqm}`)
  console.log(`OMI base:             €${baseValuation.baseOMIValue}/m²`)
  console.log(`Zone match:           ${baseValuation.omiZoneMatch}`)
  console.log(`Confidence:           ${baseValuation.confidence} (${baseValuation.confidenceScore})`)

  sep("STEP 3 — Web search (OpenAI Responses API + web_search tool)")
  console.log("Chiamata a OpenAI (può richiedere 15-45s)…\n")

  const t0 = Date.now()
  const comparables = await searchComparables({
    city: inputArdea.city,
    neighborhood: inputArdea.neighborhood,
    postalCode: inputArdea.postalCode,
    propertyType: inputArdea.propertyType,
    surfaceSqm: inputArdea.surfaceSqm,
    condition: inputArdea.condition,
    rooms: inputArdea.rooms,
  })
  const elapsed = Date.now() - t0

  if (!comparables) {
    console.log(`❌ searchComparables ha ritornato null dopo ${elapsed}ms`)
    process.exit(1)
  }

  console.log(`Provider:             ${comparables.provider}`)
  console.log(`Tempo esecuzione:     ${comparables.executionTimeMs}ms (totale ${elapsed}ms)`)
  console.log(`sampleSize:           ${comparables.sampleSize}`)
  console.log(`Median €/mq:          ${comparables.medianPricePerSqm}`)
  console.log(`Avg €/mq:             ${comparables.avgPricePerSqm}`)
  console.log(`Range €/mq:           ${comparables.minPricePerSqm} – ${comparables.maxPricePerSqm}`)
  console.log(`Warnings provider:    ${comparables.warnings.length}`)
  for (const w of comparables.warnings) console.log(`  · ${w}`)

  if (comparables.sampleSize === 0) {
    console.log("\n⚠️  OpenAI non ha trovato annunci. Possibili cause:")
    console.log("   · model non supporta web_search nella Responses API")
    console.log("   · rate limit / quota")
    console.log("   · prompt troppo restrittivo")
    console.log("   Rivedere OPENAI_COMPARABLES_MODEL (attuale gpt-4o).")
    process.exit(1)
  }

  sep("STEP 4 — Dettaglio annunci trovati")
  comparables.comparables.forEach((c, i) => {
    console.log(
      `${i + 1}. [${c.source}] ${c.surfaceSqm}m², €${c.price.toLocaleString("it-IT")} (${c.pricePerSqm}€/mq)` +
        (c.rooms ? `, ${c.rooms} loc.` : "") +
        (c.condition ? `, ${c.condition}` : "") +
        (c.neighborhood ? `, ${c.neighborhood}` : "")
    )
    if (c.url) console.log(`   ${c.url}`)
    if (c.title) console.log(`   "${c.title.slice(0, 80)}"`)
  })

  sep("STEP 5 — crossCheckWithOMI (diagnosi, non tocca prezzi)")
  const crossCheck = crossCheckWithOMI(baseValuation.pricePerSqm, comparables)
  console.log(`OMI €/mq:             ${crossCheck.omiPricePerSqm}`)
  console.log(`Mercato €/mq:         ${crossCheck.comparablesMedianPricePerSqm}`)
  console.log(`Delta:                ${crossCheck.deltaPct > 0 ? "+" : ""}${crossCheck.deltaPct}%`)
  console.log(`Agreement:            ${crossCheck.agreement}`)
  console.log(`shouldAdjust:         ${crossCheck.shouldAdjust} (v2: sempre false, warning-only)`)
  console.log(`Warnings:             ${crossCheck.warnings.length}`)
  for (const w of crossCheck.warnings) console.log(`  · ${w}`)

  sep("STEP 6 — applyComparablesRefinement (verifica warning-only)")
  const refined = applyComparablesRefinement(baseValuation, comparables, crossCheck, inputArdea.surfaceSqm)

  const priceChanged = refined.estimatedPrice !== baseValuation.estimatedPrice
  const minChanged = refined.minPrice !== baseValuation.minPrice
  const maxChanged = refined.maxPrice !== baseValuation.maxPrice

  console.log(`Prezzo prima:         €${baseValuation.estimatedPrice.toLocaleString("it-IT")}`)
  console.log(`Prezzo dopo:          €${refined.estimatedPrice.toLocaleString("it-IT")}`)
  console.log(`Min prima/dopo:       €${baseValuation.minPrice.toLocaleString("it-IT")} / €${refined.minPrice.toLocaleString("it-IT")}`)
  console.log(`Max prima/dopo:       €${baseValuation.maxPrice.toLocaleString("it-IT")} / €${refined.maxPrice.toLocaleString("it-IT")}`)
  console.log(`Warnings prima:       ${baseValuation.warnings.length}`)
  console.log(`Warnings dopo:        ${refined.warnings.length}`)
  console.log(`Confidence prima:     ${baseValuation.confidence} (${baseValuation.confidenceScore})`)
  console.log(`Confidence dopo:      ${refined.confidence} (${refined.confidenceScore})`)

  const warningOnlyOK = !priceChanged && !minChanged && !maxChanged
  console.log(
    `\n${warningOnlyOK ? "✅" : "❌"} Warning-only: prezzi ${warningOnlyOK ? "INVARIATI" : "MODIFICATI (bug!)"}`
  )

  // Nuovi warning aggiunti dal refinement
  const newWarnings = refined.warnings.slice(baseValuation.warnings.length)
  if (newWarnings.length > 0) {
    console.log(`\nWarning aggiunti dal refinement:`)
    for (const w of newWarnings) {
      console.log(`  [${w.severity}] ${w.code}: ${w.message}`)
    }
  }

  sep("VERDETTO FINALE")
  const allOK = comparables.sampleSize > 0 && warningOnlyOK
  if (allOK) {
    console.log("✅ Motore v2 + OpenAI web_search: TUTTO OK")
    console.log(`   · Provider OpenAI: attivo`)
    console.log(`   · Annunci trovati: ${comparables.sampleSize}`)
    console.log(`   · Mediana mercato: ${comparables.medianPricePerSqm}€/mq`)
    console.log(`   · OMI baseline:    ${baseValuation.pricePerSqm}€/mq`)
    console.log(`   · Divergenza:      ${crossCheck.deltaPct}% (${crossCheck.agreement})`)
    console.log(`   · Policy warning-only: rispettata (prezzi invariati)`)
  } else {
    console.log("❌ Qualcosa non va:")
    if (comparables.sampleSize === 0) console.log("   · sampleSize = 0")
    if (!warningOnlyOK) console.log("   · prezzi MODIFICATI dal refinement (dovevano restare uguali!)")
  }
}

main().catch((e) => {
  console.error("\n💥 Script crashed:", e)
  process.exit(1)
})
