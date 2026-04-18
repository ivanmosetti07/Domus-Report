#!/usr/bin/env tsx
/**
 * Test di confronto valutazioni vs prezzi reali su idealista.
 * Chiama /api/valuation in produzione per 5 immobili noti, in parallelo,
 * sia in modalità "hybrid" che "ai_market".
 */

interface Prop {
  label: string
  url: string
  idealistaPrice: number
  body: Record<string, unknown>
}

const BASE = "https://domusreport.com/api/valuation"

const properties: Prop[] = [
  {
    label: "ROMA#1 Trilocale Prati-Degli Eroi 80mq 1939",
    url: "https://www.idealista.it/immobile/35170815/",
    idealistaPrice: 499000,
    body: {
      address: "Via Giacomo Barzellotti 4",
      city: "Roma",
      neighborhood: "Degli Eroi",
      postalCode: "00136",
      propertyType: "Appartamento",
      surfaceSqm: 80,
      floor: 2,
      hasElevator: true,
      condition: "Buono",
      rooms: 3,
      bathrooms: 2,
      outdoorSpace: "Balcone",
      hasParking: false,
      heatingType: "Autonomo",
      hasAirConditioning: true,
      energyClass: "C",
      buildYear: 1939,
      occupancyStatus: "Libero",
      useAI: false,
    },
  },
  {
    label: "ROMA#2 Trilocale Infernetto 90mq 2016 classe A",
    url: "https://www.idealista.it/immobile/32076638/",
    idealistaPrice: 258000,
    body: {
      address: "Via Salorno 64",
      city: "Roma",
      neighborhood: "Infernetto",
      postalCode: "00124",
      propertyType: "Appartamento",
      surfaceSqm: 90,
      floor: 3,
      hasElevator: true,
      condition: "Buono",
      rooms: 3,
      bathrooms: 2,
      outdoorSpace: "Balcone",
      hasParking: false,
      heatingType: "Autonomo",
      hasAirConditioning: true,
      energyClass: "A",
      buildYear: 2016,
      occupancyStatus: "Libero",
      useAI: false,
    },
  },
  {
    label: "ROMA#3 Attico La Giustiniana 120mq 1970",
    url: "https://www.idealista.it/immobile/34604280/",
    idealistaPrice: 440000,
    body: {
      address: "Via Cassia",
      city: "Roma",
      neighborhood: "La Giustiniana",
      postalCode: "00189",
      propertyType: "Attico",
      surfaceSqm: 120,
      floor: 3,
      hasElevator: true,
      condition: "Buono",
      rooms: 5,
      bathrooms: 2,
      outdoorSpace: "Terrazzo",
      hasParking: true,
      heatingType: "Autonomo",
      hasAirConditioning: false,
      energyClass: "F",
      buildYear: 1970,
      occupancyStatus: "Libero",
      useAI: false,
    },
  },
  {
    label: "ARDEA#1 Villa Nuova Florida 150mq 1970 da ristrutturare",
    url: "https://www.idealista.it/immobile/35465942/",
    idealistaPrice: 159000,
    body: {
      address: "Via Abruzzo 8",
      city: "Ardea",
      neighborhood: "Nuova Florida",
      postalCode: "00040",
      propertyType: "Villa",
      surfaceSqm: 150,
      condition: "Da ristrutturare",
      rooms: 4,
      bathrooms: 2,
      outdoorSpace: "Terrazzo",
      hasParking: true,
      heatingType: "Autonomo",
      hasAirConditioning: true,
      energyClass: "F",
      buildYear: 1970,
      occupancyStatus: "Libero",
      useAI: false,
    },
  },
  {
    label: "ARDEA#2 Quadriloc Tor San Lorenzo 90mq 1970 piano terra",
    url: "https://www.idealista.it/immobile/34589695/",
    idealistaPrice: 179000,
    body: {
      address: "Via Ulisse 30",
      city: "Ardea",
      neighborhood: "Tor San Lorenzo Lido",
      postalCode: "00040",
      propertyType: "Appartamento",
      surfaceSqm: 90,
      floor: 0,
      hasElevator: false,
      condition: "Buono",
      rooms: 4,
      bathrooms: 2,
      outdoorSpace: "Giardino",
      hasParking: false,
      heatingType: "Autonomo",
      hasAirConditioning: false,
      energyClass: "F",
      buildYear: 1970,
      occupancyStatus: "Libero",
      useAI: false,
    },
  },
]

async function callApi(p: Prop, mode: "hybrid" | "ai_market") {
  const t0 = Date.now()
  try {
    const r = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p.body, valuationMode: mode }),
    })
    const data = await r.json()
    const elapsed = Date.now() - t0
    return {
      mode,
      label: p.label,
      idealista: p.idealistaPrice,
      idealistaPerSqm: Math.round(p.idealistaPrice / (p.body.surfaceSqm as number)),
      success: data.success,
      estimated: data.valuation?.estimatedPrice ?? null,
      min: data.valuation?.minPrice ?? null,
      max: data.valuation?.maxPrice ?? null,
      pricePerSqm: data.valuation?.pricePerSqm ?? null,
      baseOMI: data.valuation?.baseOMIValue ?? null,
      zoneMatch: data.valuation?.omiZoneMatch ?? null,
      confidence: data.valuation?.confidence ?? null,
      deltaPct: data.valuation?.estimatedPrice
        ? Math.round(((data.valuation.estimatedPrice - p.idealistaPrice) / p.idealistaPrice) * 100)
        : null,
      comparablesCount: data.comparables?.sampleSize ?? 0,
      comparablesMedian: data.comparables?.medianPricePerSqm ?? null,
      elapsedMs: elapsed,
      error: data.error ?? null,
      warnings: (data.valuation?.warnings ?? []).map((w: any) => `[${w.severity}] ${w.code}`),
    }
  } catch (e) {
    return {
      mode,
      label: p.label,
      error: String(e),
      elapsedMs: Date.now() - t0,
    }
  }
}

async function main() {
  const mode = (process.argv[2] as "hybrid" | "ai_market") || "hybrid"
  console.log(`\n▶ Testing ${properties.length} immobili in modalità "${mode}"...\n`)
  const results = await Promise.all(properties.map((p) => callApi(p, mode)))

  console.log("═".repeat(100))
  console.log(`RISULTATI — modalità: ${mode.toUpperCase()}`)
  console.log("═".repeat(100))
  for (const r of results) {
    console.log(`\n📍 ${r.label}`)
    if (r.error && !r.success) console.log(`   ❌ ERROR: ${r.error}`)
    if (r.success !== false && r.estimated) {
      const delta = r.deltaPct ?? 0
      const sign = delta > 0 ? "+" : ""
      console.log(`   Idealista:   €${r.idealista?.toLocaleString("it-IT")} (€${r.idealistaPerSqm}/mq)`)
      console.log(`   Stimato:     €${r.estimated.toLocaleString("it-IT")} (€${r.pricePerSqm}/mq)`)
      console.log(`   Delta:       ${sign}${delta}%  ${Math.abs(delta) < 10 ? "✅" : Math.abs(delta) < 20 ? "⚠️ " : "❌"}`)
      console.log(`   Range:       €${r.min?.toLocaleString("it-IT")} – €${r.max?.toLocaleString("it-IT")}`)
      console.log(`   OMI base:    €${r.baseOMI}/mq · zone: ${r.zoneMatch} · confidence: ${r.confidence}`)
      console.log(`   Comparables: ${r.comparablesCount}${r.comparablesMedian ? ` (med €${r.comparablesMedian}/mq)` : ""}`)
      console.log(`   Durata:      ${(r.elapsedMs / 1000).toFixed(1)}s`)
      if (r.warnings?.length) console.log(`   Warnings:    ${r.warnings.join(", ")}`)
    } else if (r.error) {
      console.log(`   ❌ ERROR: ${r.error}`)
      console.log(`   Durata: ${((r.elapsedMs ?? 0) / 1000).toFixed(1)}s`)
    }
  }

  // Summary
  const valid = results.filter((r) => r.estimated)
  if (valid.length > 0) {
    const avgAbsDelta = valid.reduce((s, r) => s + Math.abs(r.deltaPct ?? 0), 0) / valid.length
    console.log("\n" + "═".repeat(100))
    console.log(`SUMMARY: ${valid.length}/${results.length} valutazioni riuscite · delta medio abs: ${avgAbsDelta.toFixed(1)}%`)
    console.log("═".repeat(100))
  }
}

main().catch(console.error)
