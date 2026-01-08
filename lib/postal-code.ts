/**
 * Utility per estrarre la città dal CAP italiano
 * Database semplificato dei CAP principali italiani
 */

interface PostalCodeRange {
  min: string
  max: string
  city: string
  province: string
}

// Database semplificato dei range CAP principali per città italiane
const POSTAL_CODE_RANGES: PostalCodeRange[] = [
  // Lazio - Area metropolitana Roma (CAP specifici prima dei range generici)
  // Castelli Romani e Litorale
  { min: "00040", max: "00040", city: "Ariccia", province: "RM" },
  { min: "00041", max: "00041", city: "Albano Laziale", province: "RM" },
  { min: "00042", max: "00042", city: "Anzio", province: "RM" },
  { min: "00043", max: "00043", city: "Ciampino", province: "RM" },
  { min: "00044", max: "00044", city: "Frascati", province: "RM" },
  { min: "00045", max: "00045", city: "Genzano di Roma", province: "RM" },
  { min: "00046", max: "00046", city: "Grottaferrata", province: "RM" },
  { min: "00047", max: "00047", city: "Marino", province: "RM" },
  { min: "00048", max: "00048", city: "Nettuno", province: "RM" },
  { min: "00049", max: "00049", city: "Velletri", province: "RM" },
  { min: "00050", max: "00050", city: "Lariano", province: "RM" },
  { min: "00051", max: "00051", city: "Allumiere", province: "RM" },
  { min: "00052", max: "00052", city: "Cerveteri", province: "RM" },
  { min: "00053", max: "00053", city: "Civitavecchia", province: "RM" },
  { min: "00054", max: "00054", city: "Fiumicino", province: "RM" },
  { min: "00055", max: "00055", city: "Ladispoli", province: "RM" },
  { min: "00056", max: "00056", city: "Santa Marinella", province: "RM" },
  { min: "00057", max: "00057", city: "Maccarese", province: "RM" },
  { min: "00058", max: "00058", city: "Santa Severa", province: "RM" },
  { min: "00059", max: "00059", city: "Tolfa", province: "RM" },
  { min: "00060", max: "00060", city: "Formello", province: "RM" },
  { min: "00061", max: "00061", city: "Anguillara Sabazia", province: "RM" },
  { min: "00062", max: "00062", city: "Bracciano", province: "RM" },
  { min: "00063", max: "00063", city: "Campagnano di Roma", province: "RM" },
  { min: "00069", max: "00069", city: "Trevignano Romano", province: "RM" },
  { min: "00071", max: "00071", city: "Pomezia", province: "RM" },
  { min: "00072", max: "00072", city: "Ariccia", province: "RM" },
  { min: "00073", max: "00073", city: "Castel Gandolfo", province: "RM" },
  { min: "00074", max: "00074", city: "Nettuno", province: "RM" },
  { min: "00075", max: "00075", city: "Lanuvio", province: "RM" },
  { min: "00076", max: "00076", city: "Lariano", province: "RM" },
  { min: "00077", max: "00077", city: "Monte Porzio Catone", province: "RM" },
  { min: "00078", max: "00078", city: "Monte Compatri", province: "RM" },
  { min: "00079", max: "00079", city: "Rocca Priora", province: "RM" },
  { min: "00081", max: "00081", city: "Rocca di Papa", province: "RM" },
  { min: "00082", max: "00082", city: "Grottaferrata", province: "RM" },
  { min: "00083", max: "00083", city: "Carpineto Romano", province: "RM" },
  { min: "00030", max: "00030", city: "Colonna", province: "RM" },
  { min: "00031", max: "00031", city: "Artena", province: "RM" },
  { min: "00032", max: "00032", city: "Colleferro", province: "RM" },
  { min: "00033", max: "00033", city: "Cave", province: "RM" },
  { min: "00034", max: "00034", city: "Colleferro", province: "RM" },
  { min: "00035", max: "00035", city: "Olevano Romano", province: "RM" },
  { min: "00036", max: "00036", city: "Palestrina", province: "RM" },
  { min: "00037", max: "00037", city: "Segni", province: "RM" },
  { min: "00038", max: "00038", city: "Valmontone", province: "RM" },
  { min: "00039", max: "00039", city: "Zagarolo", province: "RM" },

  // Provincia di Frosinone (CAP specifici PRIMA del range generico)
  { min: "03011", max: "03011", city: "Alatri", province: "FR" },
  { min: "03012", max: "03012", city: "Anagni", province: "FR" },
  { min: "03013", max: "03013", city: "Ferentino", province: "FR" },
  { min: "03018", max: "03018", city: "Paliano", province: "FR" },
  { min: "03019", max: "03019", city: "Supino", province: "FR" },
  { min: "03020", max: "03020", city: "Fiuggi", province: "FR" },
  { min: "03023", max: "03023", city: "Ceccano", province: "FR" },
  { min: "03029", max: "03029", city: "Veroli", province: "FR" },
  { min: "03030", max: "03030", city: "Sora", province: "FR" },
  { min: "03036", max: "03036", city: "Isola del Liri", province: "FR" },
  { min: "03037", max: "03037", city: "Pontecorvo", province: "FR" },
  { min: "03038", max: "03038", city: "Roccasecca", province: "FR" },
  { min: "03039", max: "03039", city: "Sora", province: "FR" },
  { min: "03040", max: "03040", city: "Atina", province: "FR" },
  { min: "03041", max: "03041", city: "Alvito", province: "FR" },
  { min: "03042", max: "03042", city: "Arce", province: "FR" },
  { min: "03043", max: "03043", city: "Cassino", province: "FR" },
  // Range generico Frosinone
  { min: "03010", max: "03100", city: "Frosinone", province: "FR" },

  // Provincia di Latina (CAP specifici PRIMA del range generico)
  { min: "04011", max: "04011", city: "Aprilia", province: "LT" },
  { min: "04012", max: "04012", city: "Cisterna di Latina", province: "LT" },
  { min: "04013", max: "04013", city: "Sermoneta", province: "LT" },
  { min: "04014", max: "04014", city: "Pontinia", province: "LT" },
  { min: "04015", max: "04015", city: "Priverno", province: "LT" },
  { min: "04016", max: "04016", city: "Sabaudia", province: "LT" },
  { min: "04017", max: "04017", city: "San Felice Circeo", province: "LT" },
  { min: "04018", max: "04018", city: "Sezze", province: "LT" },
  { min: "04019", max: "04019", city: "Terracina", province: "LT" },
  { min: "04020", max: "04020", city: "Sperlonga", province: "LT" },
  { min: "04021", max: "04021", city: "Castelforte", province: "LT" },
  { min: "04022", max: "04022", city: "Fondi", province: "LT" },
  { min: "04023", max: "04023", city: "Formia", province: "LT" },
  { min: "04024", max: "04024", city: "Gaeta", province: "LT" },
  { min: "04025", max: "04025", city: "Lenola", province: "LT" },
  { min: "04026", max: "04026", city: "Minturno", province: "LT" },
  { min: "04027", max: "04027", city: "Pontecorvo", province: "LT" },
  { min: "04028", max: "04028", city: "Minturno", province: "LT" },
  { min: "04029", max: "04029", city: "Spigno Saturnia", province: "LT" },
  // Range generico Latina
  { min: "04010", max: "04100", city: "Latina", province: "LT" },

  // Provincia di Rieti (CAP specifici PRIMA dei range generici)
  { min: "02011", max: "02011", city: "Accumoli", province: "RI" },
  { min: "02012", max: "02012", city: "Amatrice", province: "RI" },
  { min: "02013", max: "02013", city: "Antrodoco", province: "RI" },
  { min: "02014", max: "02014", city: "Borbona", province: "RI" },
  { min: "02015", max: "02015", city: "Cittaducale", province: "RI" },
  { min: "02016", max: "02016", city: "Leonessa", province: "RI" },
  { min: "02017", max: "02017", city: "Poggio Bustone", province: "RI" },
  { min: "02018", max: "02018", city: "Scandriglia", province: "RI" },
  { min: "02019", max: "02019", city: "Poggio Mirteto", province: "RI" },
  { min: "02030", max: "02030", city: "Borgo Velino", province: "RI" },
  { min: "02031", max: "02031", city: "Casperia", province: "RI" },
  { min: "02032", max: "02032", city: "Castel Sant'Angelo", province: "RI" },
  { min: "02033", max: "02033", city: "Fara in Sabina", province: "RI" },
  { min: "02034", max: "02034", city: "Forano", province: "RI" },
  { min: "02035", max: "02035", city: "Magliano Sabina", province: "RI" },
  // Range generico Rieti
  { min: "02010", max: "02100", city: "Rieti", province: "RI" },

  // Provincia di Viterbo (CAP specifici PRIMA dei range generici)
  { min: "01011", max: "01011", city: "Acquapendente", province: "VT" },
  { min: "01012", max: "01012", city: "Caprarola", province: "VT" },
  { min: "01013", max: "01013", city: "Civita Castellana", province: "VT" },
  { min: "01014", max: "01014", city: "Montalto di Castro", province: "VT" },
  { min: "01015", max: "01015", city: "Sutri", province: "VT" },
  { min: "01016", max: "01016", city: "Tarquinia", province: "VT" },
  { min: "01017", max: "01017", city: "Tuscania", province: "VT" },
  { min: "01018", max: "01018", city: "Valentano", province: "VT" },
  { min: "01019", max: "01019", city: "Vetralla", province: "VT" },
  // Range generico Viterbo
  { min: "01010", max: "01100", city: "Viterbo", province: "VT" },

  // Range Roma città (più generico, dopo i CAP specifici dei comuni)
  { min: "00100", max: "00199", city: "Roma", province: "RM" },

  // Lombardia
  { min: "20010", max: "20199", city: "Milano", province: "MI" },
  { min: "20121", max: "20162", city: "Milano", province: "MI" },
  { min: "24010", max: "24129", city: "Bergamo", province: "BG" },
  { min: "25010", max: "25136", city: "Brescia", province: "BS" },
  { min: "22010", max: "22100", city: "Como", province: "CO" },
  { min: "26010", max: "26100", city: "Cremona", province: "CR" },
  { min: "20900", max: "20900", city: "Monza", province: "MB" },

  // Piemonte
  { min: "10010", max: "10156", city: "Torino", province: "TO" },
  { min: "15010", max: "15121", city: "Alessandria", province: "AL" },
  { min: "28010", max: "28100", city: "Novara", province: "NO" },

  // Veneto
  { min: "30010", max: "30176", city: "Venezia", province: "VE" },
  { min: "37010", max: "37142", city: "Verona", province: "VR" },
  { min: "35010", max: "35143", city: "Padova", province: "PD" },
  { min: "31010", max: "31100", city: "Treviso", province: "TV" },
  { min: "36010", max: "36100", city: "Vicenza", province: "VI" },

  // Emilia-Romagna
  { min: "40010", max: "40141", city: "Bologna", province: "BO" },
  { min: "41010", max: "41126", city: "Modena", province: "MO" },
  { min: "43010", max: "43126", city: "Parma", province: "PR" },
  { min: "42010", max: "42124", city: "Reggio Emilia", province: "RE" },
  { min: "44010", max: "44124", city: "Ferrara", province: "FE" },
  { min: "47010", max: "47121", city: "Forlì", province: "FC" },
  { min: "48010", max: "48124", city: "Ravenna", province: "RA" },
  { min: "47900", max: "47924", city: "Rimini", province: "RN" },

  // Toscana
  { min: "50010", max: "50145", city: "Firenze", province: "FI" },
  { min: "56010", max: "56128", city: "Pisa", province: "PI" },
  { min: "57010", max: "57128", city: "Livorno", province: "LI" },
  { min: "52010", max: "52100", city: "Arezzo", province: "AR" },
  { min: "51010", max: "51100", city: "Pistoia", province: "PT" },
  { min: "55010", max: "55100", city: "Lucca", province: "LU" },
  { min: "53010", max: "53100", city: "Siena", province: "SI" },
  { min: "59010", max: "59100", city: "Prato", province: "PO" },

  // Campania
  { min: "80010", max: "80147", city: "Napoli", province: "NA" },
  { min: "84010", max: "84135", city: "Salerno", province: "SA" },
  { min: "81010", max: "81100", city: "Caserta", province: "CE" },
  { min: "82010", max: "82100", city: "Benevento", province: "BN" },
  { min: "83010", max: "83100", city: "Avellino", province: "AV" },

  // Sicilia
  { min: "90010", max: "90151", city: "Palermo", province: "PA" },
  { min: "95010", max: "95131", city: "Catania", province: "CT" },
  { min: "98010", max: "98168", city: "Messina", province: "ME" },
  { min: "96010", max: "96100", city: "Siracusa", province: "SR" },

  // Puglia
  { min: "70010", max: "70132", city: "Bari", province: "BA" },
  { min: "73010", max: "73100", city: "Lecce", province: "LE" },
  { min: "72010", max: "72100", city: "Brindisi", province: "BR" },
  { min: "71010", max: "71122", city: "Foggia", province: "FG" },
  { min: "74010", max: "74123", city: "Taranto", province: "TA" },

  // Calabria
  { min: "88010", max: "88100", city: "Catanzaro", province: "CZ" },
  { min: "89010", max: "89135", city: "Reggio Calabria", province: "RC" },
  { min: "87010", max: "87100", city: "Cosenza", province: "CS" },

  // Sardegna
  { min: "09010", max: "09134", city: "Cagliari", province: "CA" },
  { min: "07010", max: "07100", city: "Sassari", province: "SS" },

  // Friuli-Venezia Giulia
  { min: "34010", max: "34151", city: "Trieste", province: "TS" },
  { min: "33010", max: "33100", city: "Udine", province: "UD" },

  // Trentino-Alto Adige
  { min: "38010", max: "38123", city: "Trento", province: "TN" },
  { min: "39010", max: "39100", city: "Bolzano", province: "BZ" },

  // Liguria
  { min: "16010", max: "16167", city: "Genova", province: "GE" },
  { min: "19010", max: "19138", city: "La Spezia", province: "SP" },

  // Marche
  { min: "60010", max: "60131", city: "Ancona", province: "AN" },
  { min: "61010", max: "61122", city: "Pesaro", province: "PU" },

  // Umbria
  { min: "06010", max: "06135", city: "Perugia", province: "PG" },
  { min: "05010", max: "05100", city: "Terni", province: "TR" },

  // Abruzzo
  { min: "65010", max: "65129", city: "Pescara", province: "PE" },
  { min: "67010", max: "67100", city: "L'Aquila", province: "AQ" },

  // Molise
  { min: "86010", max: "86100", city: "Campobasso", province: "CB" },

  // Basilicata
  { min: "85010", max: "85100", city: "Potenza", province: "PZ" },
  { min: "75010", max: "75100", city: "Matera", province: "MT" },
]

/**
 * Estrae la città dal CAP italiano
 * @param postalCode CAP a 5 cifre
 * @returns Nome della città o null se non trovato
 */
export function getCityFromPostalCode(postalCode: string): string | null {
  if (!postalCode || postalCode.length !== 5) {
    return null
  }

  // Normalizza il CAP
  const normalizedCAP = postalCode.trim()

  // Cerca nel database dei range
  for (const range of POSTAL_CODE_RANGES) {
    if (normalizedCAP >= range.min && normalizedCAP <= range.max) {
      return range.city
    }
  }

  return null
}

/**
 * Funzione intelligente per dedurre la città dai dati disponibili
 * Priorità: city esplicita > CAP > indirizzo > fallback
 */
export function inferCity(data: {
  city?: string
  postalCode?: string
  address?: string
  neighborhood?: string
}): string {
  // 1. Se la città è fornita esplicitamente, usala
  if (data.city && data.city.trim().length > 0) {
    return data.city.trim()
  }

  // 2. Prova a dedurre dal CAP
  if (data.postalCode) {
    const cityFromCAP = getCityFromPostalCode(data.postalCode)
    if (cityFromCAP) {
      console.log(`[inferCity] Città dedotta da CAP ${data.postalCode}: ${cityFromCAP}`)
      return cityFromCAP
    }
  }

  // 3. Prova a estrarre dall'indirizzo completo
  if (data.address) {
    const cityFromAddress = extractCityFromFullAddress(data.address)
    if (cityFromAddress) {
      console.log(`[inferCity] Città estratta da indirizzo: ${cityFromAddress}`)
      return cityFromAddress
    }
  }

  // 4. Prova dal quartiere (a volte gli utenti scrivono la città nel campo quartiere)
  if (data.neighborhood) {
    const possibleCity = data.neighborhood.trim()
    // Se il quartiere sembra essere una città (inizia con maiuscola, lunghezza ragionevole)
    if (possibleCity.length >= 4 && /^[A-Z]/.test(possibleCity)) {
      console.log(`[inferCity] Città possibile da quartiere: ${possibleCity}`)
      return possibleCity
    }
  }

  // 5. Fallback: errore, non indoviniamo
  console.warn("[inferCity] Impossibile determinare la città dai dati forniti")
  return ""
}

/**
 * Estrae la città da un indirizzo completo
 * Es: "Via Roma 10, 20121 Milano" -> "Milano"
 */
function extractCityFromFullAddress(address: string): string | null {
  // Pattern per città italiana dopo CAP o virgola
  const patterns = [
    // Pattern: "..., CAP Città"
    /,\s*\d{5}\s+([A-ZÀ-Ÿ][a-zà-ÿ\s']+)(?:\s*\(|$)/i,
    // Pattern: "..., Città"
    /,\s*([A-ZÀ-Ÿ][a-zà-ÿ\s']{3,})(?:\s*\(|$)/i,
  ]

  for (const pattern of patterns) {
    const match = address.match(pattern)
    if (match && match[1]) {
      const city = match[1].trim()
      // Verifica che non sia una via o un numero
      if (!/^(via|viale|piazza|corso|strada|v\.le|p\.zza)/i.test(city) && !/^\d+$/.test(city)) {
        return city
      }
    }
  }

  // Cerca CAP nell'indirizzo e prova a dedurre la città
  const capMatch = address.match(/\b(\d{5})\b/)
  if (capMatch) {
    const cityFromCAP = getCityFromPostalCode(capMatch[1])
    if (cityFromCAP) {
      return cityFromCAP
    }
  }

  return null
}

/**
 * Valida se una stringa è un CAP italiano valido
 */
export function isValidItalianPostalCode(postalCode: string): boolean {
  return /^\d{5}$/.test(postalCode.trim())
}
