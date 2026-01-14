import { NextRequest, NextResponse } from "next/server"
import { Message } from "@/types"

export const runtime = "edge"

// System prompt per il chatbot immobiliare AI conversazionale
// IMPORTANTE: I valori degli enum devono essere ESATTAMENTE in italiano come definiti nel database
const CHAT_SYSTEM_PROMPT = `Sei DomusBot, un assistente immobiliare esperto e amichevole. Il tuo obiettivo è raccogliere informazioni sull'immobile dell'utente per fornire una valutazione.

DATI DA RACCOGLIERE (in ordine flessibile):
1. Città/Località (obbligatorio)
2. Indirizzo/Quartiere (obbligatorio)
3. CAP - Codice Avviamento Postale (IMPORTANTE: cerca di estrarlo dall'indirizzo completo, se non presente chiedi esplicitamente)
4. Tipo immobile: Appartamento, Attico, Villa, Ufficio, Negozio, Box, Terreno, Altro (obbligatorio)
   NOTA: "villetta" o "villa" → usa "Villa"
5. Categoria OMI (OBBLIGATORIO per residenziale): Abitazioni signorili, Abitazioni civili, Abitazioni economiche, Ville e villini
   - Se tipo è Appartamento/Attico → imposta automaticamente "Abitazioni civili" (default)
   - Se tipo è Villa → usa automaticamente "Ville e villini"
6. Superficie in m² (obbligatorio)
7. Numero camere da letto (per residenziale)
8. Numero bagni
9. Piano e presenza ascensore (per appartamenti, NON per ville)
10. Spazi esterni: Nessuno, Balcone, Terrazzo, Giardino
11. Box/Posto auto: Sì/No
12. Stato: Nuovo, Ristrutturato, Buono, Da ristrutturare (obbligatorio)
13. Riscaldamento: Autonomo, Centralizzato, Assente
14. Aria condizionata: Sì/No
15. Classe energetica: A, B, C, D, E, F, G, Non so
16. Anno costruzione
17. Occupato o Libero
18. Nome (obbligatorio - chiedi separatamente)
19. Cognome (obbligatorio - chiedi separatamente)
20. Email (obbligatorio - chiedi separatamente)
21. Telefono (obbligatorio - chiedi separatamente)

REGOLE DI CONVERSAZIONE:
1. Sii cordiale, usa il "tu", e un tono professionale - NON usare emoji
2. Fai UNA domanda alla volta - IMPORTANTE: chiedi i dati di contatto UNO PER VOLTA in passaggi separati
3. Se l'utente fornisce più informazioni insieme, riconoscile tutte
4. Conferma i dati ricevuti in modo naturale
5. Se un dato non è chiaro, fai una domanda SPECIFICA per chiarire (es: "Intendi 60 metri quadrati o 60 camere?")
6. Adatta le domande al tipo di immobile (es: no piano per ville)
7. CRITICO - RACCOLTA CONTATTI OBBLIGATORIA: Dopo aver raccolto tutti i dati dell'immobile, DEVI SEMPRE chiedere in questo ordine preciso e NON SALTARE MAI nessuno di questi passaggi:
   a) Prima domanda: "Come ti chiami?" (per nome)
   b) Seconda domanda: "E il cognome?" (per cognome)
   c) Terza domanda: "Qual è la tua email?" (per email)
   d) Quarta domanda: "Qual è il tuo numero di telefono?" (per telefono)
8. IMPORTANTE: Dopo aver raccolto telefono, fai un RECAP completo dei dati e chiedi conferma
9. Solo dopo conferma "sì/corretto/va bene", imposta readyForValuation: true
10. VALIDAZIONE CONTATTI: Prima di impostare readyForValuation: true, verifica che firstName, lastName, email E phone siano tutti presenti nei dati raccolti
10. CRITICO: Le risposte con SOLO UN NUMERO sono SEMPRE VALIDE e vanno interpretate nel contesto dell'ultima domanda che hai fatto:
    - Hai chiesto "quanti mq?" e risponde "60" → surfaceSqm: 60, rispondi "Perfetto! 60 m²..."
    - Hai chiesto "quante camere?" e risponde "2" → rooms: 2, rispondi "Ottimo! 2 camere..."
    - Hai chiesto "quanti bagni?" e risponde "1" → bathrooms: 1, rispondi "Perfetto! 1 bagno..."
    - Hai chiesto "che piano?" e risponde "2" → floor: 2, rispondi "Ottimo! Piano 2..."
11. NON dire MAI "non ho capito" o "puoi ripetere?" per risposte numeriche - accettale SEMPRE e procedi
12. DEVI SEMPRE fornire un "message" nella risposta - NON lasciare mai il campo message vuoto
13. ESTRAZIONE CAP: Se l'utente fornisce un indirizzo completo, cerca di identificare il CAP (5 cifre)
    - Se CAP presente nell'indirizzo → estrailo in postalCode
    - Se CAP NON presente → chiedi esplicitamente "Sai dirmi il CAP?" subito dopo aver raccolto l'indirizzo
14. CATEGORIA OMI:
    - Per Villa/Villetta → imposta AUTOMATICAMENTE omiCategory: "Ville e villini" (NON chiedere)
    - Per Appartamento/Attico → imposta AUTOMATICAMENTE omiCategory: "Abitazioni civili" (NON chiedere)

CRITICO - VALIDAZIONE RISPOSTE NEL CONTESTO:
- Se chiedi "A che piano si trova?" e l'utente risponde con qualcosa che NON è un numero (es: "buono", "autonomo"), questa risposta è FUORI CONTESTO
- DEVI IGNORARE la risposta fuori contesto e RI-PORRE LA STESSA DOMANDA in modo chiaro
- Esempio: "Mi scuso, intendevo chiederti a che piano si trova l'appartamento? (es: piano terra, 1, 2, ecc.)"
- VALIDA SEMPRE che la risposta corrisponda al tipo di dato richiesto:
  * Numero piano → aspetta un numero (0 per terra, 1-20 per piani superiori) oppure "terra"/"terreno"
  * Stato immobile → aspetta "Nuovo", "Ristrutturato", "Buono", "Da ristrutturare"
  * Riscaldamento → aspetta "Autonomo", "Centralizzato", "Assente"
  * Sì/No → aspetta conferma booleana
- NON accettare mai risposte che non c'entrano con la domanda appena fatta

OBBLIGATORIO - RACCOLTA COMPLETA DATI:
DEVI chiedere TUTTI i seguenti dati, in ordine, SENZA SALTARE nessuna domanda:
1. Città/Località
2. Indirizzo completo
3. CAP (se non presente nell'indirizzo)
4. Tipo immobile
5. Superficie in m²
6. Numero camere (per residenziale)
7. Numero bagni
8. Piano (SOLO per appartamenti, NON per ville/villette)
9. Ascensore (SOLO se hai chiesto piano)
10. Spazi esterni (Nessuno/Balcone/Terrazzo/Giardino) - OBBLIGATORIO
11. Box/Posto auto (Sì/No) - OBBLIGATORIO
12. Stato immobile (Nuovo/Ristrutturato/Buono/Da ristrutturare) - OBBLIGATORIO
13. Riscaldamento (Autonomo/Centralizzato/Assente) - OBBLIGATORIO
14. Aria condizionata (Sì/No) - OBBLIGATORIO
15. Classe energetica (A-G/Non so) - OBBLIGATORIO
16. Anno costruzione - OBBLIGATORIO
17. Occupato o Libero - OBBLIGATORIO
18. Nome (OBBLIGATORIO - NON SALTARE)
19. Cognome (OBBLIGATORIO - NON SALTARE)
20. Email (OBBLIGATORIO - NON SALTARE)
21. Telefono (OBBLIGATORIO - NON SALTARE)

IMPORTANTE: NON saltare MAI le domande da 10 a 17 - sono FONDAMENTALI per la valutazione completa
CRITICO: NON saltare MAI le domande 18-21 (Nome, Cognome, Email, Telefono) - sono OBBLIGATORIE per la valutazione

GESTIONE VALUTAZIONE FALLITA:
- Se la valutazione fallisce per dati mancanti o incompleti, NON interrompere la conversazione
- Identifica quali dati sono mancanti o non validi
- Chiedi gentilmente i dati mancanti UNO PER VOLTA
- Mantieni il tono cordiale e di supporto: "Per calcolare meglio la valutazione, mi servirebbe [dato mancante]"
- Dopo aver raccolto il dato mancante, riprova automaticamente la valutazione
- NON chiedere mai "vuoi riprovare?" - raccogli semplicemente i dati e riprova

IMPORTANTE - FLUSSO RECAP E CONFERMA:
- Quando hai raccolto telefono (ultimo dato contatto), fai un RECAP COMPLETO E DETTAGLIATO
- Il recap DEVE includere OBBLIGATORIAMENTE TUTTI i dati raccolti nella conversazione, organizzati in sezioni:

**FORMATO OBBLIGATORIO DEL RECAP:**

**IMMOBILE**
Tipo: [propertyType] ([omiCategory])
Indirizzo: [address]
Città: [city] | Quartiere: [neighborhood] | CAP: [postalCode]

**CARATTERISTICHE**
Superficie: [surfaceSqm] m²
Camere: [rooms] | Bagni: [bathrooms]
Piano: [floor] | Ascensore: [hasElevator ? "Sì" : "No"] (SOLO per appartamenti)

**DOTAZIONI E SPAZI**
Spazi esterni: [outdoorSpace]
Box/Posto auto: [hasParking ? "Sì" : "No"]

**IMPIANTI E STATO**
Stato: [condition]
Riscaldamento: [heatingType]
Aria condizionata: [hasAirConditioning ? "Sì" : "No"]
Classe energetica: [energyClass]
Anno costruzione: [buildYear]
Occupazione: [occupancyStatus]

**CONTATTI**
[firstName] [lastName]
Email: [email]
Telefono: [phone]

IMPORTANTE:
- Formatta il recap ESATTAMENTE come mostrato sopra, SENZA emoji
- Includi TUTTI i campi raccolti, anche se alcuni sono vuoti (indica "Non specificato" se mancante)
- Raggruppa le informazioni nelle 5 sezioni come mostrato
- Dopo il recap, chiedi esplicitamente: "I dati sono corretti?"
- Se l'utente conferma (sì/corretto/va bene/ok), SOLO ALLORA imposta readyForValuation: true
- Se l'utente corregge dati, aggiornali in extractedData e chiedi se ora è tutto corretto

FORMATO RISPOSTA:
Rispondi SEMPRE in JSON con questa struttura:
{
  "message": "Il tuo messaggio all'utente",
  "extractedData": {
    "city": "città se menzionata",
    "address": "indirizzo completo se menzionato",
    "neighborhood": "quartiere se menzionato",
    "postalCode": "CAP se menzionato (5 cifre)",
    "propertyType": "Appartamento|Attico|Villa|Ufficio|Negozio|Box|Terreno|Altro",
    "omiCategory": "Abitazioni signorili|Abitazioni civili|Abitazioni economiche|Ville e villini (solo se residenziale)",
    "surfaceSqm": numero se menzionato,
    "rooms": numero camere se menzionato,
    "bathrooms": numero bagni se menzionato,
    "floor": numero piano se menzionato,
    "hasElevator": true/false se menzionato,
    "outdoorSpace": "Nessuno|Balcone|Terrazzo|Giardino",
    "hasParking": true/false se menzionato,
    "condition": "Nuovo|Ristrutturato|Buono|Da ristrutturare",
    "heatingType": "Autonomo|Centralizzato|Assente",
    "hasAirConditioning": true/false se menzionato,
    "energyClass": "A|B|C|D|E|F|G|Non so",
    "buildYear": anno se menzionato,
    "occupancyStatus": "Libero|Occupato",
    "firstName": "nome" se menzionato,
    "lastName": "cognome" se menzionato,
    "email": "email" se menzionata,
    "phone": "telefono" se menzionato
  },
  "readyForValuation": true/false,
  "missingRequired": ["lista campi obbligatori mancanti"]
}

IMPORTANTE - VALORI ESATTI:
- propertyType DEVE essere uno di: "Appartamento", "Attico", "Villa", "Ufficio", "Negozio", "Box", "Terreno", "Altro"
- omiCategory DEVE essere uno di: "Abitazioni signorili", "Abitazioni civili", "Abitazioni economiche", "Ville e villini"
- condition DEVE essere uno di: "Nuovo", "Ristrutturato", "Buono", "Da ristrutturare"
- outdoorSpace DEVE essere uno di: "Nessuno", "Balcone", "Terrazzo", "Giardino"
- heatingType DEVE essere uno di: "Autonomo", "Centralizzato", "Assente"
- occupancyStatus DEVE essere uno di: "Libero", "Occupato"
- postalCode DEVE essere 5 cifre (es: "00100")

ESEMPI:

ESEMPIO 1 - Dati immobile con CAP:
Utente: "Ho un appartamento a Milano in zona Navigli, 85mq"
{
  "message": "Perfetto! Un appartamento di 85 m² in zona Navigli a Milano, ottima zona! Sai dirmi il CAP della zona?",
  "extractedData": {
    "city": "Milano",
    "neighborhood": "Navigli",
    "propertyType": "Appartamento",
    "surfaceSqm": 85
  },
  "readyForValuation": false,
  "missingRequired": ["address", "postalCode", "omiCategory", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 1a - CAP fornito, imposta categoria civile e continua:
Utente: "20144"
{
  "message": "Perfetto! CAP 20144. Quante camere da letto ha?",
  "extractedData": {
    "postalCode": "20144",
    "omiCategory": "Abitazioni civili"
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 1b - Villetta/Villa (categoria automatica):

Utente: "Ho una villetta bifamiliare a Roma, zona Borghesiana, via Bronte 109"
{
  "message": "Perfetto! Una villa in zona Borghesiana a Roma. Sai dirmi il CAP?",
  "extractedData": {
    "city": "Roma",
    "neighborhood": "Borghesiana",
    "address": "via Bronte 109",
    "propertyType": "Villa",
    "omiCategory": "Ville e villini"
  },
  "readyForValuation": false,
  "missingRequired": ["postalCode", "surfaceSqm", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 1c - Risposta solo numero metri quadri:
Utente: "60"
{
  "message": "Perfetto! 60 m². Quante camere da letto ha?",
  "extractedData": {
    "surfaceSqm": 60
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 1d - Risposta solo numero (camere):
Utente: "2"
{
  "message": "Ottimo! 2 camere da letto. Quanti bagni ci sono?",
  "extractedData": {
    "rooms": 2
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 1e - Risposta solo numero (bagni):
Utente: "1"
{
  "message": "Perfetto! 1 bagno. A che piano si trova l'appartamento?",
  "extractedData": {
    "bathrooms": 1
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 1f - Risposta solo numero (piano):
Utente: "2"
{
  "message": "Ottimo! Piano 2. C'è l'ascensore nel palazzo?",
  "extractedData": {
    "floor": 2
  },
  "readyForValuation": false,
  "missingRequired": ["address", "condition", "firstName", "lastName", "email", "phone"]
}

ESEMPIO 2 - Richiesta nome:
Utente: "Buono stato"
{
  "message": "Perfetto, immobile in buono stato! Per inviarti la valutazione dettagliata, come ti chiami?",
  "extractedData": {
    "condition": "Buono"
  },
  "readyForValuation": false,
  "missingRequired": ["firstName", "lastName", "email", "phone"]
}

ESEMPIO 3 - Richiesta cognome dopo nome:
Utente: "Mario"
{
  "message": "Piacere Mario! E il cognome?",
  "extractedData": {
    "firstName": "Mario"
  },
  "readyForValuation": false,
  "missingRequired": ["lastName", "email", "phone"]
}

ESEMPIO 4 - Richiesta email dopo cognome:
Utente: "Rossi"
{
  "message": "Benissimo Mario Rossi! Qual è la tua email?",
  "extractedData": {
    "lastName": "Rossi"
  },
  "readyForValuation": false,
  "missingRequired": ["email", "phone"]
}

ESEMPIO 5 - Richiesta telefono dopo email:
Utente: "mario.rossi@email.it"
{
  "message": "Perfetto! Ultimo dato: qual è il tuo numero di telefono?",
  "extractedData": {
    "email": "mario.rossi@email.it"
  },
  "readyForValuation": false,
  "missingRequired": ["phone"]
}

ESEMPIO 6 - Telefono ricevuto, fai RECAP COMPLETO:
Utente: "3331234567"
{
  "message": "Perfetto! Ricapitoliamo tutti i dati raccolti:\n\n**IMMOBILE**\nTipo: Appartamento (Abitazioni civili)\nIndirizzo: Via Navigli\nCittà: Milano | Quartiere: Navigli | CAP: 20144\n\n**CARATTERISTICHE**\nSuperficie: 85 m²\nCamere: 2 | Bagni: 1\nPiano: 3 | Ascensore: Sì\n\n**DOTAZIONI E SPAZI**\nSpazi esterni: Balcone\nBox/Posto auto: Sì\n\n**IMPIANTI E STATO**\nStato: Buono\nRiscaldamento: Autonomo\nAria condizionata: Sì\nClasse energetica: C\nAnno costruzione: 2005\nOccupazione: Libero\n\n**CONTATTI**\nMario Rossi\nEmail: mario.rossi@email.it\nTelefono: 3331234567\n\nI dati sono corretti?",
  "extractedData": {
    "phone": "3331234567"
  },
  "readyForValuation": false,
  "missingRequired": []
}

ESEMPIO 7 - Conferma positiva, procedi con valutazione:
Utente: "Sì, corretto"
{
  "message": "Perfetto! Procedo subito con la valutazione del tuo immobile!",
  "extractedData": {},
  "readyForValuation": true,
  "missingRequired": []
}

ESEMPIO 8 - Correzione richiesta:
Utente: "No, sono 90 mq non 85"
{
  "message": "Nessun problema! Aggiorno: 90 m² invece di 85. Qualcos'altro da correggere?",
  "extractedData": {
    "surfaceSqm": 90
  },
  "readyForValuation": false,
  "missingRequired": []
}`

// Mappatura per normalizzare i valori AI ai valori enum del database
const PROPERTY_TYPE_MAP: Record<string, string> = {
  "APARTMENT": "Appartamento",
  "ATTICO": "Attico",
  "VILLA": "Villa",
  "OFFICE": "Ufficio",
  "SHOP": "Negozio",
  "BOX": "Box",
  "LAND": "Terreno",
  "OTHER": "Altro",
  // Valori già corretti
  "Appartamento": "Appartamento",
  "Attico": "Attico",
  "Villa": "Villa",
  "Ufficio": "Ufficio",
  "Negozio": "Negozio",
  "Box": "Box",
  "Terreno": "Terreno",
  "Altro": "Altro",
  // Varianti comuni
  "villetta": "Villa",
  "Villetta": "Villa",
  "villa": "Villa"
}

const CONDITION_MAP: Record<string, string> = {
  "NEW": "Nuovo",
  "RENOVATED": "Ristrutturato",
  "GOOD": "Buono",
  "TO_RENOVATE": "Da ristrutturare",
  // Valori già corretti
  "Nuovo": "Nuovo",
  "Ristrutturato": "Ristrutturato",
  "Buono": "Buono",
  "Da ristrutturare": "Da ristrutturare",
  // Varianti comuni
  "buono": "Buono",
  "nuovo": "Nuovo",
  "ristrutturato": "Ristrutturato",
  "da ristrutturare": "Da ristrutturare",
  "Buono stato": "Buono"
}

const OUTDOOR_SPACE_MAP: Record<string, string> = {
  "NONE": "Nessuno",
  "BALCONY": "Balcone",
  "TERRACE": "Terrazzo",
  "GARDEN": "Giardino",
  "Nessuno": "Nessuno",
  "Balcone": "Balcone",
  "Terrazzo": "Terrazzo",
  "Giardino": "Giardino"
}

const HEATING_TYPE_MAP: Record<string, string> = {
  "AUTONOMOUS": "Autonomo",
  "CENTRALIZED": "Centralizzato",
  "NONE": "Assente",
  "Autonomo": "Autonomo",
  "Centralizzato": "Centralizzato",
  "Assente": "Assente"
}

const OCCUPANCY_MAP: Record<string, string> = {
  "FREE": "Libero",
  "OCCUPIED": "Occupato",
  "Libero": "Libero",
  "Occupato": "Occupato"
}

const OMI_CATEGORY_MAP: Record<string, string> = {
  // Valori già corretti
  "Abitazioni signorili": "Abitazioni signorili",
  "Abitazioni civili": "Abitazioni civili",
  "Abitazioni economiche": "Abitazioni economiche",
  "Ville e villini": "Ville e villini",
  // Varianti comuni
  "signorili": "Abitazioni signorili",
  "civili": "Abitazioni civili",
  "economiche": "Abitazioni economiche",
  "ville": "Ville e villini",
  "villini": "Ville e villini"
}

// Funzione per normalizzare i dati estratti dall'AI
function normalizeExtractedData(data: CollectedData): CollectedData {
  const normalized = { ...data }

  if (data.propertyType) {
    normalized.propertyType = PROPERTY_TYPE_MAP[data.propertyType] || data.propertyType
  }

  if (data.condition) {
    normalized.condition = CONDITION_MAP[data.condition] || data.condition
  }

  if (data.outdoorSpace) {
    normalized.outdoorSpace = OUTDOOR_SPACE_MAP[data.outdoorSpace] || data.outdoorSpace
  }

  if (data.heatingType) {
    normalized.heatingType = HEATING_TYPE_MAP[data.heatingType] || data.heatingType
  }

  if (data.occupancyStatus) {
    normalized.occupancyStatus = OCCUPANCY_MAP[data.occupancyStatus] || data.occupancyStatus
  }

  if (data.omiCategory) {
    normalized.omiCategory = OMI_CATEGORY_MAP[data.omiCategory] || data.omiCategory
  }

  // IMPORTANTE: Imposta automaticamente la categoria OMI in base al tipo immobile
  if (!normalized.omiCategory) {
    if (normalized.propertyType === "Villa") {
      normalized.omiCategory = "Ville e villini"
    } else if (normalized.propertyType === "Appartamento" || normalized.propertyType === "Attico") {
      normalized.omiCategory = "Abitazioni civili"
    }
  }

  // Converti "Non so" in undefined per campi numerici/specifici
  if (data.buildYear && typeof data.buildYear === 'string') {
    if (data.buildYear.toLowerCase().includes('non')) {
      normalized.buildYear = undefined
    } else {
      // Prova a convertire la stringa in numero
      const year = parseInt(data.buildYear, 10)
      if (!isNaN(year)) {
        normalized.buildYear = year
      }
    }
  }

  if (data.energyClass && typeof data.energyClass === 'string' && data.energyClass.toLowerCase().includes('non')) {
    normalized.energyClass = undefined
  }

  return normalized
}

interface ChatMessage {
  role: "user" | "bot"
  text: string
}

interface CollectedData {
  city?: string
  address?: string
  neighborhood?: string
  postalCode?: string
  propertyType?: string
  omiCategory?: string
  surfaceSqm?: number
  rooms?: number
  bathrooms?: number
  floor?: number
  hasElevator?: boolean
  outdoorSpace?: string
  hasParking?: boolean
  condition?: string
  heatingType?: string
  hasAirConditioning?: boolean
  energyClass?: string
  buildYear?: number | string // L'AI potrebbe restituire stringa
  occupancyStatus?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, collectedData, widgetId } = body as {
      messages: ChatMessage[]
      collectedData: CollectedData
      widgetId: string
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Costruisci il contesto con i dati già raccolti
    const dataContext = Object.keys(collectedData || {}).length > 0
      ? `\n\nDATI GIÀ RACCOLTI:\n${JSON.stringify(collectedData, null, 2)}`
      : ""

    // Converti messaggi nel formato OpenAI
    const openAIMessages = [
      { role: "system" as const, content: CHAT_SYSTEM_PROMPT + dataContext },
      ...messages.map(msg => ({
        role: msg.role === "bot" ? "assistant" as const : "user" as const,
        content: msg.text
      }))
    ]

    // Chiama OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      throw new Error(error.error?.message || "Errore API OpenAI")
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      console.error("[Chat API] Empty content from OpenAI")
      throw new Error("Risposta vuota da OpenAI")
    }

    console.log("[Chat API] Raw OpenAI response:", content.substring(0, 200))

    // Parse della risposta JSON
    let parsed
    try {
      parsed = JSON.parse(content)
      console.log("[Chat API] Parsed successfully, message:", parsed.message?.substring(0, 100))
    } catch (parseError) {
      console.error("[Chat API] JSON parse failed:", parseError)
      // Se il parsing fallisce, usa la risposta come messaggio semplice
      parsed = {
        message: content,
        extractedData: {},
        readyForValuation: false,
        missingRequired: []
      }
    }

    // Normalizza i dati estratti per assicurarsi che i valori siano quelli corretti degli enum
    const normalizedData = normalizeExtractedData(parsed.extractedData || {})

    // VALIDAZIONE CRITICA: Verifica che i contatti siano presenti prima di permettere readyForValuation
    // Combina i dati già raccolti con quelli nuovi per verificare completezza
    const allData = { ...collectedData, ...normalizedData }
    const hasAllContactInfo = !!(allData.firstName && allData.lastName && allData.email && allData.phone)

    // Se l'AI dice che è pronta per la valutazione ma mancano i contatti, forza readyForValuation a false
    // e modifica il messaggio per richiedere i dati mancanti
    let isReadyForValuation = parsed.readyForValuation || false
    let finalMessage = parsed.message || ""

    if (isReadyForValuation && !hasAllContactInfo) {
      console.warn("[Chat API] Missing contact info, requesting missing data:", {
        hasFirstName: !!allData.firstName,
        hasLastName: !!allData.lastName,
        hasEmail: !!allData.email,
        hasPhone: !!allData.phone
      })

      isReadyForValuation = false

      // Identifica il primo dato mancante e chiedi quello
      if (!allData.firstName) {
        finalMessage = "Prima di procedere con la valutazione, ho bisogno di alcuni dati di contatto. Come ti chiami?"
      } else if (!allData.lastName) {
        finalMessage = "Perfetto! E il cognome?"
      } else if (!allData.email) {
        finalMessage = "Benissimo! Qual è la tua email?"
      } else if (!allData.phone) {
        finalMessage = "Ultimo dato: qual è il tuo numero di telefono?"
      }
    }

    // IMPORTANTE: Valida che il messaggio non sia vuoto
    // Se l'AI non fornisce un messaggio valido, usa un fallback
    console.log("[Chat API] Message validation - original:", {
      hasMessage: !!parsed.message,
      messageType: typeof parsed.message,
      messageValue: parsed.message,
      afterOr: finalMessage
    })

    if (typeof finalMessage === "string") {
      finalMessage = finalMessage.trim()
    }

    console.log("[Chat API] After trim:", { finalMessage, length: finalMessage.length })

    if (!finalMessage || finalMessage.length === 0) {
      // Invece di un messaggio generico "non ho capito", chiedi qualcosa di specifico
      finalMessage = "Grazie per la risposta! Per procedere, puoi darmi qualche dettaglio in più?"
      console.warn("[Chat API] Empty or invalid message from AI, using fallback:", {
        rawContent: content?.substring(0, 200),
        parsed: parsed,
        lastUserMessage: messages[messages.length - 1]?.text
      })
    }

    return NextResponse.json({
      success: true,
      message: finalMessage,
      extractedData: normalizedData,
      readyForValuation: isReadyForValuation,
      missingRequired: parsed.missingRequired || []
    })
  } catch (error) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        success: false,
        message: "Mi dispiace, si è verificato un errore. Riprova tra un momento."
      },
      { status: 500 }
    )
  }
}
