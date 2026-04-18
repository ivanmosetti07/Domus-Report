/**
 * Normalizzazione centralizzata dei campi property verso valori enum validi.
 * Usato sia dal widget (prima dei POST) sia dalle API come safety net.
 *
 * Obiettivo: accettare input utente/AI in qualsiasi variante (italiano, abbreviazioni,
 * typo comuni) e produrre sempre un valore valido del nostro enum.
 */

import { PropertyCondition, OutdoorSpace, HeatingType, PropertyType } from "@/types"

function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
}

// ============================================================================
// CONDITION
// ============================================================================

const CONDITION_VARIANTS: Record<string, PropertyCondition> = {
  // NEW
  "nuovo": PropertyCondition.NEW,
  "new": PropertyCondition.NEW,
  "mai abitato": PropertyCondition.NEW,
  "appena costruito": PropertyCondition.NEW,
  // RENOVATED
  "ristrutturato": PropertyCondition.RENOVATED,
  "renovated": PropertyCondition.RENOVATED,
  "ristrutturazione completa": PropertyCondition.RENOVATED,
  "ristrutturato di recente": PropertyCondition.RENOVATED,
  "rimodernato": PropertyCondition.RENOVATED,
  // PARTIALLY_RENOVATED (già rifatto a metà → premium)
  "parzialmente ristrutturato": PropertyCondition.PARTIALLY_RENOVATED,
  "parzialmente": PropertyCondition.PARTIALLY_RENOVATED,
  "parz ristrutturato": PropertyCondition.PARTIALLY_RENOVATED,
  "in parte ristrutturato": PropertyCondition.PARTIALLY_RENOVATED,
  "mezzo ristrutturato": PropertyCondition.PARTIALLY_RENOVATED,
  "quasi ristrutturato": PropertyCondition.PARTIALLY_RENOVATED,
  "solo cucina rifatta": PropertyCondition.PARTIALLY_RENOVATED,
  "solo bagno rifatto": PropertyCondition.PARTIALLY_RENOVATED,
  "bagno e cucina rifatti": PropertyCondition.PARTIALLY_RENOVATED,
  "partially renovated": PropertyCondition.PARTIALLY_RENOVATED,
  // PARTIALLY TO RENOVATE (semanticamente opposto: c'è ancora da fare → malus moderato)
  // Mappato a HABITABLE_OLD (0.86) come compromesso tra GOOD (1.0) e TO_RENOVATE (0.72)
  "parzialmente da ristrutturare": PropertyCondition.HABITABLE_OLD,
  "da parzialmente ristrutturare": PropertyCondition.HABITABLE_OLD,
  "in parte da ristrutturare": PropertyCondition.HABITABLE_OLD,
  "parzialmente da sistemare": PropertyCondition.HABITABLE_OLD,
  "da sistemare in parte": PropertyCondition.HABITABLE_OLD,
  // GOOD
  "buono": PropertyCondition.GOOD,
  "buono stato": PropertyCondition.GOOD,
  "buone condizioni": PropertyCondition.GOOD,
  "good": PropertyCondition.GOOD,
  "discreto": PropertyCondition.GOOD,
  "abitabile": PropertyCondition.GOOD,
  // HABITABLE_OLD
  "vecchio ma abitabile": PropertyCondition.HABITABLE_OLD,
  "vecchio abitabile": PropertyCondition.HABITABLE_OLD,
  "vecchio": PropertyCondition.HABITABLE_OLD,
  "datato": PropertyCondition.HABITABLE_OLD,
  "anni 60": PropertyCondition.HABITABLE_OLD,
  "anni 70": PropertyCondition.HABITABLE_OLD,
  "mediocre": PropertyCondition.HABITABLE_OLD,
  "habitable old": PropertyCondition.HABITABLE_OLD,
  // TO_RENOVATE
  "da ristrutturare": PropertyCondition.TO_RENOVATE,
  "to renovate": PropertyCondition.TO_RENOVATE,
  "ristrutturazione totale": PropertyCondition.TO_RENOVATE,
  "da rifare": PropertyCondition.TO_RENOVATE,
  "non abitabile": PropertyCondition.TO_RENOVATE,
  "cattivo stato": PropertyCondition.TO_RENOVATE,
  "pessimo": PropertyCondition.TO_RENOVATE,
}

export function normalizeCondition(raw?: string | null): PropertyCondition | undefined {
  if (!raw) return undefined
  const key = normalizeKey(String(raw))
  // Enum exact match (sia valore che nome uppercase)
  for (const v of Object.values(PropertyCondition)) {
    if (normalizeKey(v) === key) return v
  }
  // Lookup nel dizionario
  const matched = CONDITION_VARIANTS[key]
  if (matched) return matched
  // Enum identifier (NEW, RENOVATED, ecc.)
  const upper = String(raw).toUpperCase().trim()
  if ((PropertyCondition as Record<string, string>)[upper]) {
    return (PropertyCondition as Record<string, string>)[upper] as PropertyCondition
  }
  return undefined
}

// ============================================================================
// OUTDOOR SPACE
// ============================================================================

const OUTDOOR_VARIANTS: Record<string, OutdoorSpace> = {
  "nessuno": OutdoorSpace.NONE,
  "none": OutdoorSpace.NONE,
  "no": OutdoorSpace.NONE,
  "niente": OutdoorSpace.NONE,
  "balcone": OutdoorSpace.BALCONY,
  "balconi": OutdoorSpace.BALCONY,
  "balcony": OutdoorSpace.BALCONY,
  "terrazzo": OutdoorSpace.TERRACE,
  "terrazza": OutdoorSpace.TERRACE,
  "terrace": OutdoorSpace.TERRACE,
  "lastrico solare": OutdoorSpace.TERRACE,
  "giardino": OutdoorSpace.GARDEN,
  "garden": OutdoorSpace.GARDEN,
  "cortile": OutdoorSpace.GARDEN,
}

export function normalizeOutdoorSpace(raw?: string | null): OutdoorSpace | undefined {
  if (!raw) return undefined
  const key = normalizeKey(String(raw))
  for (const v of Object.values(OutdoorSpace)) {
    if (normalizeKey(v) === key) return v
  }
  const matched = OUTDOOR_VARIANTS[key]
  if (matched) return matched
  const upper = String(raw).toUpperCase().trim()
  if ((OutdoorSpace as Record<string, string>)[upper]) {
    return (OutdoorSpace as Record<string, string>)[upper] as OutdoorSpace
  }
  return undefined
}

// ============================================================================
// HEATING TYPE
// ============================================================================

const HEATING_VARIANTS: Record<string, HeatingType> = {
  "autonomo": HeatingType.AUTONOMOUS,
  "autonomous": HeatingType.AUTONOMOUS,
  "indipendente": HeatingType.AUTONOMOUS,
  "centralizzato": HeatingType.CENTRALIZED,
  "centralized": HeatingType.CENTRALIZED,
  "condominiale": HeatingType.CENTRALIZED,
  "centrale": HeatingType.CENTRALIZED,
  "assente": HeatingType.NONE,
  "nessuno": HeatingType.NONE,
  "none": HeatingType.NONE,
  "absent": HeatingType.NONE,
  "no riscaldamento": HeatingType.NONE,
}

export function normalizeHeating(raw?: string | null): HeatingType | undefined {
  if (!raw) return undefined
  const key = normalizeKey(String(raw))
  for (const v of Object.values(HeatingType)) {
    if (normalizeKey(v) === key) return v
  }
  const matched = HEATING_VARIANTS[key]
  if (matched) return matched
  const upper = String(raw).toUpperCase().trim()
  if ((HeatingType as Record<string, string>)[upper]) {
    return (HeatingType as Record<string, string>)[upper] as HeatingType
  }
  return undefined
}

// ============================================================================
// PROPERTY TYPE
// ============================================================================

const TYPE_VARIANTS: Record<string, PropertyType> = {
  "appartamento": PropertyType.APARTMENT,
  "apartment": PropertyType.APARTMENT,
  "bilocale": PropertyType.APARTMENT,
  "trilocale": PropertyType.APARTMENT,
  "quadrilocale": PropertyType.APARTMENT,
  "attico": PropertyType.ATTICO,
  "attici": PropertyType.ATTICO,
  "penthouse": PropertyType.ATTICO,
  "villa": PropertyType.VILLA,
  "villetta": PropertyType.VILLA,
  "villino": PropertyType.VILLA,
  "ufficio": PropertyType.OFFICE,
  "office": PropertyType.OFFICE,
  "studio": PropertyType.OFFICE,
  "negozio": PropertyType.SHOP,
  "shop": PropertyType.SHOP,
  "box": PropertyType.BOX,
  "garage": PropertyType.BOX,
  "posto auto": PropertyType.BOX,
  "terreno": PropertyType.LAND,
  "land": PropertyType.LAND,
  "altro": PropertyType.OTHER,
  "other": PropertyType.OTHER,
}

export function normalizePropertyType(raw?: string | null): PropertyType | undefined {
  if (!raw) return undefined
  const key = normalizeKey(String(raw))
  for (const v of Object.values(PropertyType)) {
    if (normalizeKey(v) === key) return v
  }
  const matched = TYPE_VARIANTS[key]
  if (matched) return matched
  const upper = String(raw).toUpperCase().trim()
  if ((PropertyType as Record<string, string>)[upper]) {
    return (PropertyType as Record<string, string>)[upper] as PropertyType
  }
  return undefined
}

// ============================================================================
// NORMALIZE FULL PAYLOAD
// ============================================================================

/**
 * Applica la normalizzazione a un payload property, ritornando una copia
 * con valori enum validi. I campi non normalizzabili restano undefined.
 */
export function normalizePropertyPayload<T extends {
  condition?: string
  outdoorSpace?: string
  heatingType?: string
  type?: string
  propertyType?: string
}>(input: T): T {
  const result = { ...input }
  if (input.condition) {
    const norm = normalizeCondition(input.condition)
    if (norm) result.condition = norm
  }
  if (input.outdoorSpace) {
    const norm = normalizeOutdoorSpace(input.outdoorSpace)
    if (norm) result.outdoorSpace = norm
  }
  if (input.heatingType) {
    const norm = normalizeHeating(input.heatingType)
    if (norm) result.heatingType = norm
  }
  if (input.type) {
    const norm = normalizePropertyType(input.type)
    if (norm) result.type = norm
  }
  if (input.propertyType) {
    const norm = normalizePropertyType(input.propertyType)
    if (norm) result.propertyType = norm
  }
  return result
}
