export interface Lead {
  id: string
  agencyId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  createdAt: Date
  property: Property
  valuation: Valuation
  conversation: Conversation
}

export interface Property {
  id: string
  leadId: string
  address: string
  city: string
  neighborhood?: string
  postalCode: string
  latitude?: number
  longitude?: number
  type: PropertyType
  surfaceSqm: number
  rooms?: number
  bathrooms?: number
  floor?: number
  hasElevator?: boolean
  floorType?: FloorType
  outdoorSpace?: OutdoorSpace
  hasParking?: boolean
  condition: PropertyCondition
  heatingType?: HeatingType
  hasAirConditioning?: boolean
  energyClass?: EnergyClass
  buildYear?: number
  occupancyStatus?: OccupancyStatus
  occupancyEndDate?: string
}

export enum PropertyType {
  APARTMENT = "Appartamento",
  ATTICO = "Attico",
  VILLA = "Villa",
  OFFICE = "Ufficio",
  SHOP = "Negozio",
  BOX = "Box",
  LAND = "Terreno",
  OTHER = "Altro"
}

export enum PropertyCondition {
  NEW = "Nuovo",
  RENOVATED = "Ristrutturato",
  GOOD = "Buono",
  TO_RENOVATE = "Da ristrutturare"
}

export enum FloorType {
  GROUND_NO_ELEVATOR = "Terra (senza ascensore)",
  FLOOR_1_2_NO_ELEVATOR = "1-2 senza ascensore",
  FLOOR_1_2_WITH_ELEVATOR = "1-2 con ascensore",
  FLOOR_3_PLUS_NO_ELEVATOR = "3+ senza ascensore",
  FLOOR_3_PLUS_WITH_ELEVATOR = "3+ con ascensore",
  TOP_FLOOR_NO_ELEVATOR = "Ultimo piano (senza ascensore)",
  TOP_FLOOR_WITH_ELEVATOR = "Ultimo piano (con ascensore)"
}

export enum OutdoorSpace {
  NONE = "Nessuno",
  BALCONY = "Balcone",
  TERRACE = "Terrazzo",
  GARDEN = "Giardino"
}

export enum HeatingType {
  AUTONOMOUS = "Autonomo",
  CENTRALIZED = "Centralizzato",
  NONE = "Assente"
}

export enum EnergyClass {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  NOT_AVAILABLE = "Non disponibile",
  UNKNOWN = "Non so"
}

export enum OccupancyStatus {
  FREE = "Libero",
  OCCUPIED = "Occupato"
}

export interface Valuation {
  id: string
  propertyId: string
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  omiBaseValue: number
  floorCoefficient: number
  conditionCoefficient: number
  explanation: string
  calculatedAt: Date
}

export interface Conversation {
  id: string
  leadId: string
  messages: Message[]
}

export interface Message {
  id: string
  role: 'bot' | 'user'
  text: string
  timestamp: Date
  quickReplies?: QuickReply[]
}

export interface QuickReply {
  label: string
  value: string
}
