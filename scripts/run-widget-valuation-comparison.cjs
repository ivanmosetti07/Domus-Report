const fs = require("fs")
const path = require("path")
const { chromium } = require("playwright")

const outDir = path.join(process.cwd(), "output", "widget-test")
fs.mkdirSync(outDir, { recursive: true })

const widgets = [
  {
    key: "hybrid",
    label: "Ibrido",
    widgetId: "wgt_65NpxCCj0onR3sgq",
    url: "https://domusreport.com/widget/wgt_65NpxCCj0onR3sgq",
  },
  {
    key: "ai_market",
    label: "Solo AI",
    widgetId: "wgt_-dyW2u4o9_gF-vSK",
    url: "https://domusreport.com/widget/wgt_-dyW2u4o9_gF-vSK",
  },
]

const contacts = {
  firstName: "Luca",
  lastName: "Testdomus",
  phoneBase: "33377012",
}

const properties = [
  {
    id: "roma-montespertoli",
    cityGroup: "Roma",
    listingUrl: "https://www.immobiliare.it/annunci/124816915/",
    title: "Quadrilocale via Montespertoli, Grottarossa - Saxa Rubra, Roma",
    askingPrice: 259000,
    askingPricePerSqm: 2616,
    city: "Roma",
    postalCode: "00189",
    neighborhood: "Grottarossa - Saxa Rubra",
    address: "Via Montespertoli",
    propertyType: "Attico",
    surfaceSqm: 99,
    rooms: 2,
    bathrooms: 1,
    floor: 3,
    hasElevator: false,
    outdoorSpace: "Balcone",
    hasParking: false,
    condition: "Buono",
    heatingType: "Autonomo",
    hasAirConditioning: true,
    energyClass: "E",
    buildYear: 1980,
    occupancyStatus: "Libero",
  },
  {
    id: "roma-san-godenzo",
    cityGroup: "Roma",
    listingUrl: "https://www.immobiliare.it/annunci/127180621/",
    title: "Trilocale via San Godenzo, Cassia - San Godenzo, Roma",
    askingPrice: 480000,
    askingPricePerSqm: 4800,
    city: "Roma",
    postalCode: "00189",
    neighborhood: "Cassia - San Godenzo",
    address: "Via San Godenzo",
    propertyType: "Attico",
    surfaceSqm: 100,
    rooms: 2,
    bathrooms: 2,
    floor: 3,
    hasElevator: true,
    outdoorSpace: "Terrazzo",
    hasParking: true,
    condition: "Ristrutturato",
    heatingType: "Autonomo",
    hasAirConditioning: true,
    energyClass: "E",
    buildYear: 1975,
    occupancyStatus: "Libero",
  },
  {
    id: "roma-san-fabiano",
    cityGroup: "Roma",
    listingUrl: "https://www.immobiliare.it/annunci/128236028/",
    title: "Bilocale via San Fabiano, Gregorio VII - Piccolomini, Roma",
    askingPrice: 485000,
    askingPricePerSqm: 7462,
    city: "Roma",
    postalCode: "00165",
    neighborhood: "Gregorio VII - Piccolomini",
    address: "Via San Fabiano",
    propertyType: "Appartamento",
    surfaceSqm: 65,
    rooms: 1,
    bathrooms: 1,
    floor: 1,
    hasElevator: true,
    outdoorSpace: "Giardino",
    hasParking: false,
    condition: "Buono",
    heatingType: "Autonomo",
    hasAirConditioning: true,
    energyClass: "G",
    buildYear: 1965,
    occupancyStatus: "Libero",
  },
  {
    id: "ardea-gerani",
    cityGroup: "Ardea",
    listingUrl: "https://www.immobiliare.it/annunci/123850915/",
    title: "Trilocale via dei Gerani 1, Lido dei Pini di Ardea - Lupetta, Ardea",
    askingPrice: 119000,
    askingPricePerSqm: 1983,
    city: "Ardea",
    postalCode: "00040",
    neighborhood: "Lido dei Pini di Ardea - Lupetta",
    address: "Via dei Gerani 1",
    propertyType: "Appartamento",
    surfaceSqm: 60,
    rooms: 2,
    bathrooms: 2,
    floor: 0,
    hasElevator: false,
    outdoorSpace: "Nessuno",
    hasParking: true,
    condition: "Buono",
    heatingType: "Autonomo",
    hasAirConditioning: false,
    energyClass: "G",
    buildYear: 1985,
    occupancyStatus: "Libero",
  },
  {
    id: "ardea-diomede",
    cityGroup: "Ardea",
    listingUrl: "https://www.immobiliare.it/annunci/125041397/",
    title: "Trilocale via Diomede 69, Torre Marina - Lido di Tirrenella, Ardea",
    askingPrice: 129000,
    askingPricePerSqm: 2048,
    city: "Ardea",
    postalCode: "00040",
    neighborhood: "Torre Marina - Lido di Tirrenella",
    address: "Via Diomede 69",
    propertyType: "Appartamento",
    surfaceSqm: 63,
    rooms: 2,
    bathrooms: 1,
    floor: 0,
    hasElevator: false,
    outdoorSpace: "Giardino",
    hasParking: false,
    condition: "Buono",
    heatingType: "Autonomo",
    hasAirConditioning: false,
    energyClass: "Non so",
    buildYear: 1980,
    occupancyStatus: "Libero",
  },
]

function compactPropertyPrompt(property, widget, runIndex) {
  const email = `luca.testdomus+${property.id}-${widget.key}@example.com`
  const phone = `${contacts.phoneBase}${String(runIndex).padStart(2, "0")}`
  return [
    "Vorrei una valutazione. Ti do tutti i dati in una volta per un test interno.",
    `Citta: ${property.city}. CAP: ${property.postalCode}. Zona: ${property.neighborhood}.`,
    `Indirizzo: ${property.address}. Tipologia: ${property.propertyType}.`,
    `Superficie commerciale: ${property.surfaceSqm} mq. Camere: ${property.rooms}. Bagni: ${property.bathrooms}.`,
    `Piano: ${property.floor}. Ascensore: ${property.hasElevator ? "si" : "no"}.`,
    `Spazi esterni: ${property.outdoorSpace}. Posto auto o box: ${property.hasParking ? "si" : "no"}.`,
    `Stato: ${property.condition}. Riscaldamento: ${property.heatingType}. Aria condizionata: ${property.hasAirConditioning ? "si" : "no"}.`,
    `Classe energetica: ${property.energyClass}. Anno costruzione: ${property.buildYear}. Occupazione: ${property.occupancyStatus}.`,
    `Contatti test: nome ${contacts.firstName}, cognome ${contacts.lastName}, email ${email}, telefono ${phone}.`,
    "Confermo che i dati sono corretti, puoi procedere con la valutazione.",
  ].join(" ")
}

function answerForLatestBot(text, property, widget, runIndex) {
  const t = text.toLowerCase()
  const email = `luca.testdomus+${property.id}-${widget.key}@example.com`
  const phone = `${contacts.phoneBase}${String(runIndex).padStart(2, "0")}`

  if (/dati sono corretti|sono corretti|proceda|procedo|confermi|conferma|vuoi che proceda|posso procedere/.test(t)) {
    return "Si, corretto. Procedi con la valutazione."
  }
  if (/citta|citt/.test(t)) return property.city
  if (/cap|codice avviamento/.test(t)) return property.postalCode
  if (/indirizzo/.test(t)) return property.address
  if (/quartiere|zona/.test(t)) return property.neighborhood
  if (/tipo|tipologia/.test(t)) return property.propertyType
  if (/superficie|metri|mq|m2/.test(t)) return String(property.surfaceSqm)
  if (/camere|camera da letto|stanze/.test(t)) return String(property.rooms)
  if (/bagni|bagno/.test(t)) return String(property.bathrooms)
  if (/piano/.test(t)) return String(property.floor)
  if (/ascensore/.test(t)) return property.hasElevator ? "Si" : "No"
  if (/spazi esterni|balcone|terrazzo|giardino/.test(t)) return property.outdoorSpace
  if (/box|posto auto|garage/.test(t)) return property.hasParking ? "Si" : "No"
  if (/stato/.test(t)) return property.condition
  if (/riscaldamento/.test(t)) return property.heatingType
  if (/aria condizionata|climatizz/.test(t)) return property.hasAirConditioning ? "Si" : "No"
  if (/classe energetica/.test(t)) return property.energyClass
  if (/anno|costruzione/.test(t)) return String(property.buildYear)
  if (/libero|occupato|occupazione/.test(t)) return property.occupancyStatus
  if (/come ti chiami|nome/.test(t)) return contacts.firstName
  if (/cognome/.test(t)) return contacts.lastName
  if (/email|e-mail/.test(t)) return email
  if (/telefono|cellulare|numero/.test(t)) return phone
  return "Si, corretto. Procedi con la valutazione."
}

async function getVisibleText(page) {
  return page.locator("body").innerText({ timeout: 5000 }).catch(() => "")
}

async function getLatestBotText(page) {
  return page.evaluate(() => {
    const bodyText = document.body.innerText || ""
    const chunks = bodyText
      .split(/\n{2,}|\n(?=\d{1,2}:\d{2})/)
      .map((s) => s.trim())
      .filter(Boolean)
    return chunks.slice(-12).join("\n")
  })
}

async function sendMessage(page, message) {
  const input = page.locator('input[placeholder="Scrivi qui..."]').last()
  await input.waitFor({ state: "visible", timeout: 20000 })
  await input.fill(message)
  await input.press("Enter")
}

async function openWidget(page, widget) {
  await page.goto(widget.url, { waitUntil: "networkidle", timeout: 60000 })
  const openButton = page.getByRole("button", { name: /apri chat/i })
  if (await openButton.count()) {
    await openButton.click()
  }
  await page.locator('input[placeholder="Scrivi qui..."]').waitFor({ state: "visible", timeout: 60000 })
}

async function inputIsVisible(page) {
  const input = page.locator('input[placeholder="Scrivi qui..."]').last()
  try {
    return await input.isVisible({ timeout: 1000 })
  } catch {
    return false
  }
}

async function runCase(browser, widget, property, runIndex) {
  const context = await browser.newContext({
    viewport: { width: 430, height: 920 },
    locale: "it-IT",
  })
  const page = await context.newPage()
  const startedAt = new Date().toISOString()
  const events = []
  let valuationResponse = null
  let leadResponse = null
  let readyForValuationSeen = false

  page.on("response", async (response) => {
    const url = response.url()
    if (!url.includes("domusreport.com/api/")) return
    if (!/\/api\/(chat|valuation|leads)/.test(url)) return
    let body = null
    try {
      body = await response.json()
    } catch {
      body = null
    }
    events.push({
      url,
      status: response.status(),
      at: new Date().toISOString(),
      body,
    })
    if (url.includes("/api/valuation")) valuationResponse = body
    if (url.includes("/api/leads")) leadResponse = body
    if (url.includes("/api/chat") && body && body.readyForValuation === true) {
      readyForValuationSeen = true
    }
  })

  page.on("pageerror", (err) => events.push({ type: "pageerror", message: err.message }))

  try {
    await openWidget(page, widget)
    await page.waitForTimeout(2500)
    await sendMessage(page, compactPropertyPrompt(property, widget, runIndex))

    let turns = 0
    let lastAnswer = ""
    const deadline = Date.now() + 210000
    while (Date.now() < deadline) {
      await page.waitForTimeout(2500)
      const visible = await getVisibleText(page)
      if (valuationResponse && valuationResponse.valuation) break
      if (/valore stimato|ecco la valutazione|range:|stima:/i.test(visible) && valuationResponse) break
      if (readyForValuationSeen || !(await inputIsVisible(page))) {
        await page.waitForTimeout(5000)
        continue
      }

      const latestBot = await getLatestBotText(page)
      const answer = answerForLatestBot(latestBot, property, widget, runIndex)
      if (answer === lastAnswer && /procedi con la valutazione/i.test(answer)) {
        await page.waitForTimeout(5000)
      }
      if (turns >= 18) break
      await sendMessage(page, answer)
      lastAnswer = answer
      turns += 1
    }

    await page.waitForTimeout(5000)
    const screenshot = path.join(outDir, `${property.id}-${widget.key}.png`)
    await page.screenshot({ path: screenshot, fullPage: true })
    const finalText = await getVisibleText(page)
    return {
      ok: !!(valuationResponse && valuationResponse.valuation),
      widget: widget.key,
      widgetLabel: widget.label,
      propertyId: property.id,
      title: property.title,
      cityGroup: property.cityGroup,
      listingUrl: property.listingUrl,
      askingPrice: property.askingPrice,
      askingPricePerSqm: property.askingPricePerSqm,
      startedAt,
      endedAt: new Date().toISOString(),
      valuationMode: valuationResponse && valuationResponse.valuationMode,
      valuation: valuationResponse && valuationResponse.valuation,
      comparables: valuationResponse && valuationResponse.comparables,
      lead: leadResponse && {
        success: leadResponse.success,
        leadId: leadResponse.leadId,
        valuationFailed: leadResponse.valuationFailed,
        warnings: leadResponse.warnings,
      },
      finalTextTail: finalText.slice(-4000),
      screenshot,
      events,
    }
  } catch (error) {
    const screenshot = path.join(outDir, `${property.id}-${widget.key}-error.png`)
    await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {})
    return {
      ok: false,
      widget: widget.key,
      widgetLabel: widget.label,
      propertyId: property.id,
      title: property.title,
      cityGroup: property.cityGroup,
      listingUrl: property.listingUrl,
      askingPrice: property.askingPrice,
      askingPricePerSqm: property.askingPricePerSqm,
      startedAt,
      endedAt: new Date().toISOString(),
      error: error && error.stack ? error.stack : String(error),
      valuation: valuationResponse && valuationResponse.valuation,
      comparables: valuationResponse && valuationResponse.comparables,
      lead: leadResponse,
      screenshot,
      events,
    }
  } finally {
    await context.close()
  }
}

function summarize(results) {
  return results.map((r) => {
    const estimated = r.valuation && Number(r.valuation.estimatedPrice)
    const min = r.valuation && Number(r.valuation.minPrice)
    const max = r.valuation && Number(r.valuation.maxPrice)
    const pricePerSqm = r.valuation && Number(r.valuation.pricePerSqm)
    const diff = estimated ? estimated - r.askingPrice : null
    const diffPct = estimated ? Math.round(((estimated - r.askingPrice) / r.askingPrice) * 1000) / 10 : null
    return {
      propertyId: r.propertyId,
      widget: r.widget,
      ok: r.ok,
      mode: r.valuationMode,
      askingPrice: r.askingPrice,
      estimated,
      min,
      max,
      pricePerSqm,
      diff,
      diffPct,
      confidence: r.valuation && r.valuation.confidence,
      confidenceScore: r.valuation && r.valuation.confidenceScore,
      dataCompleteness: r.valuation && r.valuation.dataCompleteness,
      omiZoneMatch: r.valuation && r.valuation.omiZoneMatch,
      warnings: r.valuation && r.valuation.warnings,
      comparablesSampleSize: r.comparables && r.comparables.sampleSize,
      comparablesMedianPricePerSqm: r.comparables && r.comparables.medianPricePerSqm,
      screenshot: r.screenshot,
    }
  })
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    let runIndex = 1
    for (const property of properties) {
      for (const widget of widgets) {
        console.log(`[run] ${property.id} / ${widget.key}`)
        const result = await runCase(browser, widget, property, runIndex)
        results.push(result)
        fs.writeFileSync(path.join(outDir, "results.partial.json"), JSON.stringify({ results, summary: summarize(results) }, null, 2))
        const summary = summarize([result])[0]
        console.log(`[done] ${property.id} / ${widget.key}: ok=${result.ok} estimate=${summary.estimated} diffPct=${summary.diffPct}`)
        runIndex += 1
      }
    }
  } finally {
    await browser.close()
  }

  const output = {
    generatedAt: new Date().toISOString(),
    widgets,
    properties,
    results,
    summary: summarize(results),
  }
  fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(output, null, 2))
  console.table(output.summary.map((r) => ({
    propertyId: r.propertyId,
    widget: r.widget,
    ask: r.askingPrice,
    estimate: r.estimated,
    diffPct: r.diffPct,
    sample: r.comparablesSampleSize,
    conf: r.confidence,
  })))
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
