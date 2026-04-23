import { NextRequest, NextResponse } from "next/server"
import { Message } from "@/types"
import { DEFAULT_OPENAI_MODEL, REASONING_EFFORT_CHAT } from "@/lib/openai-config"

// Runtime Node.js: GPT-5 è più lento dei modelli precedenti (reasoning model),
// l'edge runtime con timeout max ~25s causava 504. Serverless Node permette
// maxDuration fino a 60s (Pro) / 300s (Enterprise).
export const runtime = "nodejs"
export const maxDuration = 60

// System prompt per il chatbot immobiliare AI conversazionale
// IMPORTANTE: i valori degli enum devono essere ESATTAMENTE in italiano come definiti nel database.
const CHAT_SYSTEM_PROMPT = `Sei l'assistente immobiliare conversazionale white-label dell'agenzia.

Se nel contesto è presente NOME AGENZIA, parla come assistente interno di quell'agenzia.
Non citare mai provider esterni, modelli AI, tool, web search, OpenAI, OMI come fonte tecnica o altri servizi di terze parti.
All'utente finale devi sembrare uno strumento proprietario dell'agenzia: professionale, chiaro, rassicurante, concreto.

OBIETTIVO
Il tuo compito non è fare subito la valutazione finale.
Il tuo compito è raccogliere con precisione i dati dell'immobile e i contatti minimi necessari, così che il motore di valutazione possa:
- geolocalizzare correttamente l'immobile
- associare la zona più coerente
- stimare il valore con maggiore affidabilità
- cercare comparabili coerenti in fase successiva

PRINCIPI OPERATIVI
- Non inventare mai dati.
- Non assumere mai dettagli non dichiarati.
- Se un dato è incerto, segnalalo e chiedilo.
- Fai sempre una sola domanda per volta.
- Usa frasi brevi, naturali, non tecniche.
- Non essere verboso.
- Non usare emoji.
- Non scrivere mai messaggi vuoti.
- Se l'utente fornisce più informazioni insieme, estrai tutto ciò che è chiaro e poi fai la domanda successiva più utile.
- Dai priorità ai dati che migliorano precisione geografica e qualità dei comparabili.
- Se l'utente corregge un dato, aggiorna solo quel dato e prosegui.

PRIORITÀ DATI PER OTTIMIZZARE IL MOTORE DI VALUTAZIONE
Raccogli questi dati con questa logica di priorità:

BLOCCO A - LOCALIZZAZIONE
1. city
2. address
3. postalCode
4. neighborhood

BLOCCO B - IDENTITÀ IMMOBILE
5. propertyType
6. surfaceSqm
7. rooms
8. bathrooms

BLOCCO C - QUALITÀ DELLA STIMA
9. floor
10. hasElevator
11. condition
12. outdoorSpace
13. hasParking
14. heatingType
15. hasAirConditioning
16. energyClass
17. buildYear
18. occupancyStatus

BLOCCO D - CONTATTI
19. firstName
20. lastName
21. email
22. phone

REGOLE DI CONVERSAZIONE
- Parti con un saluto breve e professionale, poi chiedi subito in quale città si trova l'immobile.
- Dopo la città, punta a ottenere un indirizzo il più preciso possibile.
- Per address preferisci via e numero civico. Se il civico manca, raccogli almeno via o piazza e quartiere o zona.
- Il CAP è molto importante: se non è già presente nell'indirizzo o nel messaggio utente, chiedilo.
- Il quartiere o la zona sono molto utili per i comparabili: se mancano ma l'utente li conosce, raccoglili.
- Per immobili residenziali chiedi camere e bagni.
- Per appartamenti e attici chiedi il piano; chiedi ascensore solo se il piano è rilevante.
- Per ville non insistere su piano o ascensore se non utile.
- Non dichiarare mai che la valutazione è pronta finché non hai raccolto tutti i dati indispensabili e tutti i contatti.

DATI DAVVERO CRITICI PRIMA DI PROCEDERE
Prima di impostare readyForValuation a true devono essere presenti:
- city
- address
- propertyType
- surfaceSqm
- condition
- firstName
- lastName
- email
- phone

Il postalCode è molto importante e va chiesto sempre se manca, ma non va inventato.
Se manca un dato molto utile ma non strettamente bloccante, continua comunque la raccolta senza inventarlo.
Se manca un dato bloccante, chiedilo.

GESTIONE VALORI ED ENUM
Usa questi valori esatti quando estrai i dati:

propertyType:
- "Appartamento"
- "Attico"
- "Villa"
- "Ufficio"
- "Negozio"
- "Box"
- "Terreno"
- "Altro"

condition:
- "Nuovo"
- "Ristrutturato"
- "Parzialmente ristrutturato"
- "Buono"
- "Vecchio ma abitabile"
- "Da ristrutturare"

outdoorSpace:
- "Nessuno"
- "Balcone"
- "Terrazzo"
- "Giardino"

heatingType:
- "Autonomo"
- "Centralizzato"
- "Assente"

occupancyStatus:
- "Libero"
- "Occupato"

energyClass:
- "A"
- "B"
- "C"
- "D"
- "E"
- "F"
- "G"
- "Non so"

REGOLE IMPORTANTI SU OMI CATEGORY
- Non forzare omiCategory.
- Impostala solo se l'utente fornisce un'informazione davvero esplicita e affidabile.
- Se non è chiarissima, lasciala assente.
- Non fare inferenze automatiche premium, signorile o economico.

REGOLE IMPORTANTI SU RISPOSTE NUMERICHE
Le risposte composte solo da un numero sono valide e vanno interpretate nel contesto dell'ultima domanda.
Esempi:
- Se hai chiesto la superficie e l'utente risponde "95", estrai surfaceSqm: 95
- Se hai chiesto le camere e risponde "3", estrai rooms: 3
- Se hai chiesto i bagni e risponde "2", estrai bathrooms: 2
- Se hai chiesto il piano e risponde "4", estrai floor: 4
- Se hai chiesto l'anno e risponde "2008", estrai buildYear: 2008

Non rifiutare una risposta solo perché è breve, se è coerente col contesto.

VALIDAZIONE CONTESTUALE
Se la risposta dell'utente non è coerente con la domanda appena fatta:
- non inserirla nel campo sbagliato
- non inventare interpretazioni
- riponi la stessa domanda in modo più chiaro

Esempi:
- se hai chiesto il piano e l'utente risponde "buono", non usarlo come piano
- se hai chiesto l'email e l'utente scrive qualcosa che non sembra un'email, chiedi l'email in modo chiaro
- se hai chiesto il telefono e l'utente scrive testo generico, richiedi il telefono

LOGICA DI RACCOLTA CONTATTI
Quando i dati immobile sono sufficienti, raccogli i contatti in questo ordine rigoroso:
1. firstName
2. lastName
3. email
4. phone

Fai una domanda per volta:
- nome
- cognome
- email
- telefono

Non saltare mai questi 4 passaggi.

RECAP FINALE OBBLIGATORIO
Dopo aver raccolto il telefono, fai sempre un recap completo e ordinato.
Il recap deve essere chiaro, leggibile e rassicurante.
Dopo il recap chiedi esattamente: "I dati sono corretti?"

Se l'utente conferma con un sì, ok, corretto, va bene o equivalente:
- imposta readyForValuation a true

Se l'utente corregge uno o più dati:
- aggiorna i campi corretti
- non impostare readyForValuation a true
- chiedi se adesso è tutto corretto

STILE DEL RECAP
Usa questo formato:

**IMMOBILE**
Tipo: [propertyType]
Indirizzo: [address]
Città: [city]
CAP: [postalCode o "Non specificato"]
Quartiere/Zona: [neighborhood o "Non specificato"]

**CARATTERISTICHE**
Superficie: [surfaceSqm] m²
Camere: [rooms o "Non specificato"]
Bagni: [bathrooms o "Non specificato"]
Piano: [floor o "Non specificato"]
Ascensore: [Sì/No/Non specificato]

**STATO E DOTAZIONI**
Stato: [condition]
Spazi esterni: [outdoorSpace o "Non specificato"]
Parcheggio: [Sì/No/Non specificato]
Riscaldamento: [heatingType o "Non specificato"]
Aria condizionata: [Sì/No/Non specificato]
Classe energetica: [energyClass o "Non specificato"]
Anno costruzione: [buildYear o "Non specificato"]
Occupazione: [occupancyStatus o "Non specificato"]

**CONTATTI**
[firstName] [lastName]
Email: [email]
Telefono: [phone]

I dati sono corretti?

FORMATO RISPOSTA
Rispondi sempre e solo in JSON valido, senza testo extra prima o dopo.
La struttura deve essere sempre questa:

{
  "message": "messaggio naturale per l'utente",
  "extractedData": {
    "city": "stringa se disponibile",
    "address": "stringa se disponibile",
    "neighborhood": "stringa se disponibile",
    "postalCode": "5 cifre se disponibile",
    "propertyType": "Appartamento|Attico|Villa|Ufficio|Negozio|Box|Terreno|Altro",
    "omiCategory": "stringa solo se davvero esplicita",
    "surfaceSqm": 0,
    "rooms": 0,
    "bathrooms": 0,
    "floor": 0,
    "hasElevator": true,
    "outdoorSpace": "Nessuno|Balcone|Terrazzo|Giardino",
    "hasParking": true,
    "condition": "Nuovo|Ristrutturato|Parzialmente ristrutturato|Buono|Vecchio ma abitabile|Da ristrutturare",
    "heatingType": "Autonomo|Centralizzato|Assente",
    "hasAirConditioning": true,
    "energyClass": "A|B|C|D|E|F|G|Non so",
    "buildYear": 2000,
    "occupancyStatus": "Libero|Occupato",
    "firstName": "stringa se disponibile",
    "lastName": "stringa se disponibile",
    "email": "stringa se disponibile",
    "phone": "stringa se disponibile"
  },
  "readyForValuation": false,
  "missingRequired": ["lista campi ancora mancanti"]
}

REGOLE SUL JSON
- message è sempre obbligatorio.
- extractedData deve contenere solo i campi che puoi estrarre con buona confidenza dal messaggio corrente o dal recap o correzione corrente.
- Non valorizzare campi ignoti.
- Non usare stringhe vuote per fingere dati presenti.
- Se un dato non è noto, omettilo o lascialo assente.
- missingRequired deve riflettere i campi davvero ancora mancanti per arrivare alla valutazione.
- readyForValuation può diventare true solo dopo conferma esplicita del recap e solo se nome, cognome, email e telefono sono presenti.

OBIETTIVO QUALITATIVO
Ogni tua scelta deve migliorare almeno una di queste tre cose:
- precisione geografica della stima
- qualità dei comparabili futuri
- probabilità di completamento della conversazione

Se devi scegliere tra due domande, fai prima quella che aumenta di più l'affidabilità del motore di valutazione.`

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
  "PARTIALLY_RENOVATED": "Parzialmente ristrutturato",
  "GOOD": "Buono",
  "HABITABLE_OLD": "Vecchio ma abitabile",
  "TO_RENOVATE": "Da ristrutturare",
  // Valori già corretti
  "Nuovo": "Nuovo",
  "Ristrutturato": "Ristrutturato",
  "Parzialmente ristrutturato": "Parzialmente ristrutturato",
  "Buono": "Buono",
  "Vecchio ma abitabile": "Vecchio ma abitabile",
  "Da ristrutturare": "Da ristrutturare",
  // Varianti comuni
  "buono": "Buono",
  "nuovo": "Nuovo",
  "ristrutturato": "Ristrutturato",
  "parzialmente ristrutturato": "Parzialmente ristrutturato",
  "parz. ristrutturato": "Parzialmente ristrutturato",
  "parzialmente": "Parzialmente ristrutturato",
  "in parte ristrutturato": "Parzialmente ristrutturato",
  "mezzo ristrutturato": "Parzialmente ristrutturato",
  "quasi ristrutturato": "Parzialmente ristrutturato",
  "solo cucina rifatta": "Parzialmente ristrutturato",
  "solo bagno rifatto": "Parzialmente ristrutturato",
  "bagno e cucina rifatti": "Parzialmente ristrutturato",
  // "da ristrutturare in parte" → ha ancora lavori da fare → HABITABLE_OLD (malus moderato)
  "parzialmente da ristrutturare": "Vecchio ma abitabile",
  "da parzialmente ristrutturare": "Vecchio ma abitabile",
  "in parte da ristrutturare": "Vecchio ma abitabile",
  "parzialmente da sistemare": "Vecchio ma abitabile",
  "vecchio ma abitabile": "Vecchio ma abitabile",
  "vecchio": "Vecchio ma abitabile",
  "datato": "Vecchio ma abitabile",
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

const ENERGY_CLASS_MAP: Record<string, string> = {
  "A": "A",
  "B": "B",
  "C": "C",
  "D": "D",
  "E": "E",
  "F": "F",
  "G": "G",
  "a": "A",
  "b": "B",
  "c": "C",
  "d": "D",
  "e": "E",
  "f": "F",
  "g": "G",
  "UNKNOWN": "Non so",
  "NOT_AVAILABLE": "Non so",
  "Non disponibile": "Non so",
  "Non so": "Non so"
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

const REQUIRED_FOR_VALUATION = [
  "city",
  "address",
  "propertyType",
  "surfaceSqm",
  "condition",
  "firstName",
  "lastName",
  "email",
  "phone",
] as const

function hasValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0
  return value !== undefined && value !== null
}

function computeMissingRequired(data: CollectedData): string[] {
  return REQUIRED_FOR_VALUATION.filter((field) => !hasValue(data[field]))
}

function isResidentialProperty(propertyType?: string): boolean {
  return propertyType === "Appartamento" || propertyType === "Attico" || propertyType === "Villa"
}

function isFloorRelevantProperty(propertyType?: string): boolean {
  return propertyType === "Appartamento" || propertyType === "Attico"
}

function formatTextValue(value?: string | number): string {
  if (value === undefined || value === null) return "Non specificato"
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : "Non specificato"
  }
  return String(value)
}

function formatBooleanValue(value?: boolean): string {
  if (value === undefined) return "Non specificato"
  return value ? "Sì" : "No"
}

function buildRecapMessage(data: CollectedData): string {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim()

  return `**IMMOBILE**
Tipo: ${formatTextValue(data.propertyType)}
Indirizzo: ${formatTextValue(data.address)}
Città: ${formatTextValue(data.city)}
CAP: ${formatTextValue(data.postalCode)}
Quartiere/Zona: ${formatTextValue(data.neighborhood)}

**CARATTERISTICHE**
Superficie: ${data.surfaceSqm !== undefined ? `${data.surfaceSqm} m²` : "Non specificato"}
Camere: ${formatTextValue(data.rooms)}
Bagni: ${formatTextValue(data.bathrooms)}
Piano: ${formatTextValue(data.floor)}
Ascensore: ${formatBooleanValue(data.hasElevator)}

**STATO E DOTAZIONI**
Stato: ${formatTextValue(data.condition)}
Spazi esterni: ${formatTextValue(data.outdoorSpace)}
Parcheggio: ${formatBooleanValue(data.hasParking)}
Riscaldamento: ${formatTextValue(data.heatingType)}
Aria condizionata: ${formatBooleanValue(data.hasAirConditioning)}
Classe energetica: ${formatTextValue(data.energyClass)}
Anno costruzione: ${formatTextValue(data.buildYear)}
Occupazione: ${formatTextValue(data.occupancyStatus)}

**CONTATTI**
${fullName || "Non specificato"}
Email: ${formatTextValue(data.email)}
Telefono: ${formatTextValue(data.phone)}

I dati sono corretti?`
}

// Funzione per determinare la prossima domanda in base ai dati mancanti
function getNextQuestion(data: CollectedData): string {
  if (!data.city) {
    return "In quale città si trova il tuo immobile?"
  }
  if (!data.address) {
    return "Qual è l'indirizzo completo dell'immobile?"
  }
  if (!data.postalCode) {
    return "Sai dirmi il CAP?"
  }
  if (!data.neighborhood) {
    return "Conosci anche il quartiere o la zona?"
  }
  if (!data.propertyType) {
    return "Che tipo di immobile è? (Appartamento, Villa, Attico, ecc.)"
  }
  if (!data.surfaceSqm) {
    return "Quanti metri quadri è l'immobile?"
  }
  if (data.rooms === undefined && isResidentialProperty(data.propertyType)) {
    return "Quante camere da letto ha?"
  }
  if (data.bathrooms === undefined) {
    return "Quanti bagni ci sono?"
  }
  if (data.floor === undefined && isFloorRelevantProperty(data.propertyType)) {
    return "A che piano si trova?"
  }
  if (data.hasElevator === undefined && isFloorRelevantProperty(data.propertyType) && data.floor !== undefined && data.floor > 0) {
    return "C'è l'ascensore?"
  }
  if (!data.outdoorSpace) {
    return "Ci sono spazi esterni? (Nessuno, Balcone, Terrazzo, Giardino)"
  }
  if (data.hasParking === undefined) {
    return "C'è un box o posto auto?"
  }
  if (!data.condition) {
    return "In che stato è l'immobile? (Nuovo, Ristrutturato, Parzialmente ristrutturato, Buono, Vecchio ma abitabile, Da ristrutturare)"
  }
  if (!data.heatingType) {
    return "Che tipo di riscaldamento ha? (Autonomo, Centralizzato, Assente)"
  }
  if (data.hasAirConditioning === undefined) {
    return "C'è l'aria condizionata?"
  }
  if (!data.energyClass) {
    return "Conosci la classe energetica? (A, B, C, D, E, F, G oppure Non so)"
  }
  if (!data.buildYear) {
    return "Sai l'anno di costruzione dell'immobile?"
  }
  if (!data.occupancyStatus) {
    return "L'immobile è attualmente libero o occupato?"
  }
  // Dati di contatto
  if (!data.firstName) {
    return "Perfetto, ho quasi tutte le informazioni! Come ti chiami?"
  }
  if (!data.lastName) {
    return "E il cognome?"
  }
  if (!data.email) {
    return "Qual è la tua email?"
  }
  if (!data.phone) {
    return "Qual è il tuo numero di telefono?"
  }
  return buildRecapMessage(data)
}

// Interfaccia per risultato validazione contatti
interface ContactValidationResult {
  isValid: boolean
  errorMessage?: string
  invalidField?: 'firstName' | 'lastName' | 'email' | 'phone'
}

// Keyword tipiche dei dati immobile che NON dovrebbero mai finire in firstName/lastName
// (usate per scartare estrazioni spurie dell'AI).
const PROPERTY_KEYWORDS = [
  "letto", "bagn", "camera", "camere", "cucina", "salone", "sala", "studio",
  "tinello", "ingresso", "terrazzo", "balcone", "giardino", "box", "auto",
  "piano", "ascensor", "cantina", "soffitt", "mansard", "mq", "m²",
  "ristrutturat", "nuov", "buono", "vecchio",
]

function looksLikeRealName(value: string): boolean {
  const v = value.trim().toLowerCase()
  if (v.length < 2) return false
  // Solo numeri/punteggiatura → non è un nome
  if (!/[a-zàèéìòù]/i.test(v)) return false
  // Contiene keyword immobiliari → spurio
  for (const kw of PROPERTY_KEYWORDS) {
    if (v.includes(kw)) return false
  }
  return true
}

// Determina se la conversazione è nella fase di raccolta contatti
// (ultimo messaggio bot chiedeva nome/cognome/email/telefono).
function isInContactCollectionPhase(
  messages: ChatMessage[],
  field: "firstName" | "lastName" | "email" | "phone"
): boolean {
  // Ultimo messaggio bot (cerca dall'ultimo verso l'indietro)
  let lastBotText = ""
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "bot") {
      lastBotText = messages[i].text.toLowerCase()
      break
    }
  }
  if (!lastBotText) return false
  if (field === "firstName") {
    return /come ti chiami|il tuo nome|tuo nome/i.test(lastBotText)
  }
  if (field === "lastName") {
    return /cognome/i.test(lastBotText)
  }
  if (field === "email") {
    return /e[\-\s]?mail/i.test(lastBotText)
  }
  if (field === "phone") {
    return /telefono|cellulare|numero/i.test(lastBotText)
  }
  return false
}

// Funzione per validare i dati di contatto appena inseriti.
// Restituisce errore visibile all'utente SOLO se siamo effettivamente nella
// fase di raccolta contatti (per evitare falsi positivi quando l'AI estrae
// erroneamente firstName/ecc. da risposte sui dati immobile).
function validateContactData(
  newData: CollectedData,
  previousData: CollectedData,
  messages: ChatMessage[]
): ContactValidationResult {
  // Validazione Nome
  if (newData.firstName !== undefined && !previousData.firstName) {
    const raw = (newData.firstName ?? "").toString()
    if (!looksLikeRealName(raw)) {
      // Dato spurio: rimuovi silenziosamente senza bloccare la chat
      return { isValid: false, invalidField: "firstName" }
    }
    if (raw.trim().length < 2 && isInContactCollectionPhase(messages, "firstName")) {
      return {
        isValid: false,
        errorMessage: "Il nome deve avere almeno 2 caratteri! Riscrivi il tuo nome.",
        invalidField: "firstName",
      }
    }
  }

  // Validazione Cognome
  if (newData.lastName !== undefined && !previousData.lastName) {
    const raw = (newData.lastName ?? "").toString()
    if (!looksLikeRealName(raw)) {
      return { isValid: false, invalidField: "lastName" }
    }
    if (raw.trim().length < 2 && isInContactCollectionPhase(messages, "lastName")) {
      return {
        isValid: false,
        errorMessage: "Il cognome deve avere almeno 2 caratteri! Riscrivi il tuo cognome.",
        invalidField: "lastName",
      }
    }
  }

  // Validazione Email (formato valido) — solo se in contact collection
  if (newData.email !== undefined && !previousData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newData.email || !emailRegex.test(newData.email.trim())) {
      if (isInContactCollectionPhase(messages, "email")) {
        return {
          isValid: false,
          errorMessage:
            "L'email inserita non è valida! Inserisci un'email corretta (es: nome@esempio.com).",
          invalidField: "email",
        }
      }
      return { isValid: false, invalidField: "email" } // rimuovi silenziosamente
    }
  }

  // Validazione Telefono (minimo 6 cifre)
  if (newData.phone !== undefined && !previousData.phone) {
    const phoneDigits = (newData.phone || "").replace(/\D/g, "")
    if (phoneDigits.length < 6) {
      if (isInContactCollectionPhase(messages, "phone")) {
        return {
          isValid: false,
          errorMessage:
            "Il numero di telefono deve avere almeno 6 cifre! Riscrivi il tuo numero di telefono.",
          invalidField: "phone",
        }
      }
      return { isValid: false, invalidField: "phone" } // rimuovi silenziosamente
    }
  }

  return { isValid: true }
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

  if (data.energyClass) {
    normalized.energyClass = ENERGY_CLASS_MAP[data.energyClass] || data.energyClass
  }

  if (data.omiCategory) {
    normalized.omiCategory = OMI_CATEGORY_MAP[data.omiCategory] || data.omiCategory
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

  return normalized
}

// Funzione per interpretare risposte numeriche in base al contesto dell'ultima domanda
function interpretNumericResponse(
  userMessage: string,
  lastBotMessage: string,
  currentData: CollectedData,
  extractedData: CollectedData
): CollectedData {
  const enhanced = { ...extractedData }
  const trimmedMessage = userMessage.trim()

  // Controlla se la risposta è solo un numero
  const numericMatch = trimmedMessage.match(/^(\d+)$/)
  if (!numericMatch) return enhanced

  const number = parseInt(numericMatch[1], 10)
  const botMsgLower = lastBotMessage.toLowerCase()

  // Interpreta il numero in base all'ultima domanda del bot
  if ((botMsgLower.includes('camer') || botMsgLower.includes('stanz')) && currentData.rooms === undefined && enhanced.rooms === undefined) {
    enhanced.rooms = number
    console.log("[Chat API] Interpreted numeric response as rooms:", number)
  } else if (botMsgLower.includes('bagn') && currentData.bathrooms === undefined && enhanced.bathrooms === undefined) {
    enhanced.bathrooms = number
    console.log("[Chat API] Interpreted numeric response as bathrooms:", number)
  } else if ((botMsgLower.includes('metr') || botMsgLower.includes('mq') || botMsgLower.includes('m²') || botMsgLower.includes('superficie')) && currentData.surfaceSqm === undefined && enhanced.surfaceSqm === undefined) {
    enhanced.surfaceSqm = number
    console.log("[Chat API] Interpreted numeric response as surfaceSqm:", number)
  } else if (botMsgLower.includes('piano') && currentData.floor === undefined && enhanced.floor === undefined) {
    enhanced.floor = number
    console.log("[Chat API] Interpreted numeric response as floor:", number)
  } else if ((botMsgLower.includes('anno') || botMsgLower.includes('costruzion')) && currentData.buildYear === undefined && enhanced.buildYear === undefined) {
    enhanced.buildYear = number
    console.log("[Chat API] Interpreted numeric response as buildYear:", number)
  }

  return enhanced
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
    const { messages, collectedData, widgetId, agencyName, isInitialTurn } = body as {
      messages: ChatMessage[]
      collectedData: CollectedData
      widgetId: string
      agencyName?: string
      isInitialTurn?: boolean
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

    // Nome agenzia per personalizzare il saluto (se presente nel body)
    const agencyContext = agencyName
      ? `\n\nNOME AGENZIA: ${agencyName}`
      : ""

    // Primo turno: l'API viene chiamata con messages vuoto per chiedere
    // all'AI di generare il messaggio di benvenuto. Iniettiamo un user
    // message interno per stimolare la generazione del saluto iniziale.
    const isFirstTurn =
      isInitialTurn === true || messages.length === 0

    const assistantIdentity = agencyName
      ? `assistente interno di ${agencyName}`
      : "assistente immobiliare dell'agenzia"

    const userSeedMessage = isFirstTurn
      ? [
          {
            role: "user" as const,
            content:
              `[AVVIO CONVERSAZIONE] Saluta l'utente in modo professionale e breve (senza emoji) come ${assistantIdentity} e poni subito la prima domanda: in quale città si trova l'immobile. Mantieni il messaggio breve.`,
          },
        ]
      : []

    // Converti messaggi nel formato OpenAI
    const openAIMessages = [
      { role: "system" as const, content: CHAT_SYSTEM_PROMPT + dataContext + agencyContext },
      ...userSeedMessage,
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
        model: DEFAULT_OPENAI_MODEL,
        messages: openAIMessages,
        // GPT-5: max_completion_tokens (max_tokens deprecato).
        // reasoning_effort=minimal azzera il thinking interno per
        // massimizzare la velocità di risposta nella chat widget.
        max_completion_tokens: 2000,
        reasoning_effort: REASONING_EFFORT_CHAT,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorJson: any = null
      try { errorJson = JSON.parse(errorText) } catch {}
      console.error("[Chat API] OpenAI error:", {
        status: response.status,
        model: DEFAULT_OPENAI_MODEL,
        error: errorJson || errorText.slice(0, 500),
      })
      const message =
        errorJson?.error?.message ||
        `OpenAI ${response.status}: ${errorText.slice(0, 200)}`
      throw new Error(message)
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
    let normalizedData = normalizeExtractedData(parsed.extractedData || {})

    // INTERPRETA RISPOSTE NUMERICHE: Se l'utente risponde solo con un numero, interpretalo nel contesto
    const lastUserMessage = messages[messages.length - 1]?.text || ""
    const lastBotMessage = messages.length >= 2 ? messages[messages.length - 2]?.text || "" : ""
    if (lastBotMessage && messages[messages.length - 2]?.role === "bot") {
      normalizedData = interpretNumericResponse(lastUserMessage, lastBotMessage, collectedData, normalizedData)
    }

    // VALIDAZIONE DATI DI CONTATTO: Se un dato di contatto è invalido, rimuovilo.
    // Mostra errore visibile all'utente SOLO se siamo effettivamente in fase di
    // raccolta contatti; altrimenti scarta silenziosamente l'estrazione spuria
    // e lascia che l'AI continui con la domanda successiva.
    const contactValidation = validateContactData(normalizedData, collectedData, messages)
    if (!contactValidation.isValid && contactValidation.invalidField) {
      console.warn("[Chat API] Invalid contact data:", {
        field: contactValidation.invalidField,
        value: normalizedData[contactValidation.invalidField],
        error: contactValidation.errorMessage,
        willReturnError: !!contactValidation.errorMessage,
      })
      // Rimuovi il dato invalido/spurio
      delete normalizedData[contactValidation.invalidField]
      // Se abbiamo un messaggio d'errore user-visible, restituiscilo
      if (contactValidation.errorMessage) {
        const currentData = { ...collectedData, ...normalizedData }
        return NextResponse.json({
          success: true,
          message: contactValidation.errorMessage,
          extractedData: normalizedData,
          readyForValuation: false,
          missingRequired: computeMissingRequired(currentData)
        })
      }
      // Altrimenti: dato spurio già rimosso, continua il flusso normale
    }

    const allData = { ...collectedData, ...normalizedData }
    const missingRequired = computeMissingRequired(allData)
    const hasAllRequiredData = missingRequired.length === 0

    let isReadyForValuation = parsed.readyForValuation || false
    let finalMessage = parsed.message || ""

    if (isReadyForValuation && !hasAllRequiredData) {
      console.warn("[Chat API] Missing required data, requesting missing data:", {
        hasFirstName: !!allData.firstName,
        hasLastName: !!allData.lastName,
        hasEmail: !!allData.email,
        hasPhone: !!allData.phone,
        missingRequired,
      })

      isReadyForValuation = false
      finalMessage = getNextQuestion(allData)
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
      // Analizza i dati raccolti e continua con la domanda successiva
      finalMessage = getNextQuestion(allData)
      console.warn("[Chat API] Empty or invalid message from AI, using next question fallback:", {
        rawContent: content?.substring(0, 200),
        parsed: parsed,
        lastUserMessage: messages[messages.length - 1]?.text,
        nextQuestion: finalMessage
      })
    }

    return NextResponse.json({
      success: true,
      message: finalMessage,
      extractedData: normalizedData,
      readyForValuation: isReadyForValuation,
      missingRequired
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
