/**
 * Zone Mapper
 * Mappa un indirizzo / quartiere noto alla zona OMI (codice CSV)
 * per migliorare la granularità della valutazione.
 *
 * Le zone OMI nel CSV usano codici alfanumerici (B1-B32 centro, C1-C24 semicentro,
 * D1-D32 periferia) oppure nomi descrittivi ("Centro Storico", "Borghesiana").
 *
 * Questo mapper conosce i quartieri più famosi delle top città italiane e
 * li associa a una zona OMI plausibile. Fallback: null → il motore userà la
 * media città (comportamento precedente).
 *
 * Facilmente estendibile aggiungendo città/quartieri al dizionario.
 */

type QuartiereMap = Record<string, string[]> // quartiere normalizzato → possibili zone OMI

// Normalizza stringa per matching (lowercase, no accenti, no spazi multipli)
function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
}

// Dizionario quartieri → zone OMI per top città italiane.
// I codici sono approssimazioni basate sulla mappatura standard OMI
// (B = centrale, C = semicentrale, D = periferica, E = suburbana).
const QUARTIERI_BY_CITY: Record<string, QuartiereMap> = {
  milano: {
    "duomo": ["B12", "B1"],
    "brera": ["B12", "B13"],
    "san babila": ["B12", "B13"],
    "quadrilatero": ["B12"],
    "montenapoleone": ["B12"],
    "magenta": ["B13"],
    "cadorna": ["B13"],
    "porta venezia": ["B14"],
    "porta nuova": ["B20", "B15"],
    "garibaldi": ["B20", "B15"],
    "isola": ["B20", "B15"],
    "porta romana": ["B17"],
    "porta genova": ["B16", "B15"],
    "ticinese": ["B16", "B15"],
    "navigli": ["B16", "B15"],
    "sant'ambrogio": ["B13"],
    "sant ambrogio": ["B13"],
    "santambrogio": ["B13"],
    "wagner": ["B13"],
    "citta studi": ["C14"],
    "città studi": ["C14"],
    "lambrate": ["C14", "D13"],
    "loreto": ["C14"],
    "sempione": ["C13"],
    "fiera": ["C13"],
    "citylife": ["C13"],
    "city life": ["C13"],
    "tre torri": ["C13"],
    "lorenteggio": ["C16"],
    "famagosta": ["C16", "D18"],
    "barona": ["D18"],
    "bovisa": ["C13", "D13"],
    "dergano": ["D13"],
    "maggiolina": ["C13"],
    "bicocca": ["D13"],
    "niguarda": ["D13"],
    "affori": ["D12"],
    "quarto oggiaro": ["D12"],
    "bruzzano": ["D12"],
    "gratosoglio": ["D21"],
    "corvetto": ["D20"],
    "rogoredo": ["D20"],
    "mecenate": ["D20"],
    "san siro": ["C15"],
    "san siro stadio": ["C15"],
    "qt8": ["C15", "D10"],
    "gallaratese": ["D10"],
  },

  roma: {
    // Zone OMI verificate dal CSV (ogni CAP → zona).
    // Centro storico (B13 = €7150/mq civili, B1 = €5000, B2 = €5700)
    "centro storico": ["B13", "B1"],
    "centro": ["B13"],
    "piazza navona": ["B13"],
    "pantheon": ["B13"],
    "campo marzio": ["B13"],
    "trevi": ["B13"],
    "piazza del popolo": ["B13"],
    "spagna": ["B13"],
    "piazza di spagna": ["B13"],
    "tridente": ["B13"],
    "quirinale": ["B13"],
    "esquilino": ["B1"],
    "san lorenzo": ["B1"],
    "termini": ["B1"],
    "monti": ["B1", "B13"],
    "trastevere": ["B2"],
    "borgo": ["B2"],
    "vaticano": ["B2"],
    "testaccio": ["B3"],
    "aventino": ["B3"],
    "san saba": ["B3"],
    "piramide": ["B3"],
    "ostiense": ["B3"],
    // Prati (B14 = €5850 + B15 = €5450)
    "prati": ["B14"],
    "della vittoria": ["B14"],
    "degli eroi": ["B14"],
    "mazzini": ["B14"],
    "delle vittorie": ["B14"],
    "lepanto": ["B14"],
    "cola di rienzo": ["B14"],
    // Flaminio / Parioli / Pinciano (B31 = €8400 top, B12/B14 premium)
    "flaminio": ["B12"],
    "parioli": ["B31", "B14"],
    "pinciano": ["B12"],
    "villa borghese": ["B12"],
    "villa ada": ["B14"],
    // Salario / Trieste / Coppedè (B14 / B4 area premium)
    "salario": ["B4"],
    "trieste": ["B4"],
    "coppedè": ["B4"],
    "coppede": ["B4"],
    "nomentano": ["B4"],
    "policlinico": ["B4"],
    // Est: San Giovanni / Appio / Tuscolana
    "san giovanni": ["B17"],
    "appio": ["B17"],
    "appio latino": ["B17"],
    "appio nuovo": ["B17"],
    "re di roma": ["B17"],
    "tuscolano": ["C10"],
    "tuscolana": ["C10"],
    "arco di travertino": ["C10"],
    "furio camillo": ["C10"],
    // Garbatella / Ostiense (B18)
    "garbatella": ["B18"],
    "marconi": ["B18"],
    // EUR (C11 / B32)
    "eur": ["B32", "C11"],
    "laurentino": ["D13"],
    "montagnola": ["D13"],
    "cecchignola": ["D13"],
    "torrino": ["B32"],
    "mostacciano": ["B32"],
    // Ovest: Monteverde / Gianicolense / Trastevere alta
    "monteverde": ["B2"],
    "monteverde vecchio": ["B2"],
    "monteverde nuovo": ["C1"],
    "gianicolense": ["C1"],
    "gianicolo": ["B2"],
    // Aurelio / Boccea / Balduina
    "balduina": ["C12"],
    "medaglie d'oro": ["C12"],
    "medaglie doro": ["C12"],
    "trionfale": ["C12"],
    "monte mario": ["C12"],
    "aurelio": ["C12"],
    "valle aurelia": ["C12"],
    "gregorio vii": ["C12"],
    // Periferia est (C13-C14 media)
    "pigneto": ["C13"],
    "prenestino": ["C13"],
    "tor pignattara": ["C13"],
    "quadraro": ["C13"],
    // B29 = Alessandrino / Centocelle (CAP 00155-00156)
    "centocelle": ["B29"],
    "alessandrino": ["B29"],
    "tor tre teste": ["B29"],
    "collatino": ["C14"],
    "cinecittà": ["C14"],
    "cinecitta": ["C14"],
    // Nord periferia: Montesacro / Talenti / Bufalotta
    "montesacro": ["B32"],
    "talenti": ["B32"],
    "val melaina": ["C15"],
    "conca d'oro": ["C15"],
    "conca doro": ["C15"],
    "bufalotta": ["B31"],
    "fidene": ["C15"],
    "fidene nuova": ["C15"],
    "settebagni": ["D15"],
    // Mare e ovest
    "ostia": ["C40"],
    "ostia lido": ["C40"],
    "ostia antica": ["C40"],
    "ostia levante": ["C40"],
    "ostia ponente": ["C40"],
    "axa": ["C31"],
    "casal palocco": ["C31"],
    "infernetto": ["C24"],       // CAP 00124 → C24 €4150 civili
    "dragona": ["C40"],
    "acilia": ["C31"],
    // Nord ovest: Giustiniana / Labaro / Prima Porta
    "giustiniana": ["C2"],       // CAP 00189 → C2 €4250 civili
    "la giustiniana": ["C2"],
    "cassia": ["C2"],
    "tomba di nerone": ["C2"],
    "labaro": ["C2"],
    "prima porta": ["D1"],
    "ponte mammolo": ["C15"],
    "tiburtino": ["C13"],
  },

  ardea: {
    // Zone Ardea dal CSV OMI (CAP 00040 copre tutte le zone)
    // B1 = centro (€1200/mq), D1 = semiperiferico (€1275)
    // E4-E7 = zone mare/turistiche (€1350-1650) → Marina/Tor San Lorenzo
    "centro": ["B1"],
    "ardea centro": ["B1"],
    "nuova florida": ["D1"],
    "tor san lorenzo": ["E7"],
    "tor san lorenzo lido": ["E7"],
    "nuova california": ["E7"],
    "marina di ardea": ["E4"],
    "marina": ["E4"],
    "centro regina": ["E4"],
    "lungomare degli ardeatini": ["E4"],
    "castagnetta": ["E8"],
    "strampelli": ["E8"],
    "le salzare": ["E5"],
    "banditella": ["E6"],
    "santa marina": ["E6"],
    "colle romito": ["E5"],
    "le salme": ["E5"],
  },

  torino: {
    "centro": ["B1"],
    "crocetta": ["B2", "B1"],
    "san salvario": ["B3", "B1"],
    "cit turin": ["B3"],
    "vanchiglia": ["B4"],
    "borgo po": ["C1"],
    "gran madre": ["C1"],
    "san donato": ["C2"],
    "parella": ["C3"],
    "pozzo strada": ["C3"],
    "santa rita": ["C3"],
    "mirafiori": ["D1"],
    "mirafiori sud": ["D2"],
    "lingotto": ["C4"],
    "barriera di milano": ["D3"],
    "aurora": ["C4"],
    "vallette": ["D3"],
    "borgata vittoria": ["D3"],
    "falchera": ["D4"],
  },

  napoli: {
    "chiaia": ["B1"],
    "posillipo": ["B1"],
    "vomero": ["B2"],
    "arenella": ["B2"],
    "san ferdinando": ["B1"],
    "centro storico": ["B3"],
    "spaccanapoli": ["B3"],
    "montesanto": ["B3"],
    "stella": ["B3"],
    "san carlo all'arena": ["C1"],
    "san carlo arena": ["C1"],
    "fuorigrotta": ["C2"],
    "bagnoli": ["C3"],
    "agnano": ["C3"],
    "pianura": ["D1"],
    "soccavo": ["D1"],
    "secondigliano": ["D2"],
    "scampia": ["D2"],
    "miano": ["D2"],
    "ponticelli": ["D3"],
    "barra": ["D3"],
    "san giovanni a teduccio": ["D3"],
    "san giovanni": ["D3"],
    "poggioreale": ["C4"],
    "capodimonte": ["C4"],
  },

  firenze: {
    "centro storico": ["B1"],
    "duomo": ["B1"],
    "santa croce": ["B1"],
    "san lorenzo": ["B1"],
    "santa maria novella": ["B1"],
    "san marco": ["B2"],
    "campo di marte": ["B2"],
    "le cure": ["B2"],
    "coverciano": ["C1"],
    "oltrarno": ["B2"],
    "san frediano": ["B2"],
    "santo spirito": ["B2"],
    "bellariva": ["C1"],
    "gavinana": ["C1"],
    "galluzzo": ["C2"],
    "novoli": ["C2"],
    "rifredi": ["C2"],
    "isolotto": ["C2"],
    "soffiano": ["C3"],
    "peretola": ["D1"],
    "brozzi": ["D1"],
    "le piagge": ["D1"],
  },

  bologna: {
    "centro storico": ["Centro Storico"],
    "centro": ["Centro Storico"],
    "santo stefano": ["Centro Storico"],
    "san felice": ["Centro Storico"],
    "galvani": ["Centro Storico"],
    "irnerio": ["Centro Storico"],
    "bolognina": ["Semicentro"],
    "corticella": ["Periferia"],
    "navile": ["Periferia"],
    "san donato": ["Semicentro"],
    "mazzini": ["Semicentro"],
    "san vitale": ["Semicentro"],
    "savena": ["Semicentro"],
    "saragozza": ["Semicentro"],
    "murri": ["Semicentro"],
    "costa saragozza": ["Semicentro"],
    "porto": ["Semicentro"],
    "borgo panigale": ["Periferia"],
    "reno": ["Periferia"],
  },

  genova: {
    "centro": ["B1"],
    "centro storico": ["B1"],
    "carignano": ["B2"],
    "foce": ["B2"],
    "albaro": ["Albaro"],
    "san martino": ["B3"],
    "nervi": ["C1"],
    "quarto": ["C1"],
    "quinto": ["C1"],
    "sturla": ["B3"],
    "marassi": ["C2"],
    "staglieno": ["C2"],
    "sampierdarena": ["C3"],
    "sestri ponente": ["D1"],
    "cornigliano": ["D1"],
    "voltri": ["D2"],
    "pegli": ["D1"],
  },

  palermo: {
    "centro storico": ["B1"],
    "kalsa": ["B1"],
    "vucciria": ["B1"],
    "politeama": ["B2"],
    "libertà": ["B2"],
    "liberta": ["B2"],
    "notarbartolo": ["B2"],
    "strasburgo": ["C1"],
    "resuttana": ["C1"],
    "malaspina": ["C1"],
    "palagonia": ["C1"],
    "pallavicino": ["C2"],
    "brancaccio": ["D1"],
    "zen": ["D2"],
    "mondello": ["C2"],
    "sferracavallo": ["D1"],
  },
}

/**
 * Prova a estrarre un quartiere/zona nota dall'indirizzo e mapparlo
 * a una zona OMI nota.
 *
 * Restituisce il codice zona più probabile (es. "B12" per Milano, "B1" per Roma),
 * oppure null se non ci sono match.
 */
export function resolveZoneFromAddress(
  city: string,
  address?: string,
  _postalCode?: string
): string | null {
  if (!city) return null

  const cityKey = normalize(city)
  const dict = QUARTIERI_BY_CITY[cityKey]
  if (!dict) return null

  // Componiamo una stringa di testo dove cercare: indirizzo + quartiere
  const haystack = normalize(address || "")
  if (!haystack) return null

  // Cerchiamo quartiere più lungo che matcha (preferisci "porta nuova" a "porta")
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length)

  for (const key of keys) {
    if (haystack.includes(key)) {
      const zones = dict[key]
      if (zones && zones.length > 0) {
        return zones[0] // prima zona (quella più probabile)
      }
    }
  }

  return null
}

/**
 * Ritorna tutti i quartieri noti per una città (utile per UI autocomplete)
 */
export function getKnownNeighborhoods(city: string): string[] {
  const cityKey = normalize(city)
  const dict = QUARTIERI_BY_CITY[cityKey]
  if (!dict) return []
  return Object.keys(dict)
}
