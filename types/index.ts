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
  postalCode: string
  latitude?: number
  longitude?: number
  type: PropertyType
  surfaceSqm: number
  floor?: number
  hasElevator?: boolean
  condition: PropertyCondition
}

export enum PropertyType {
  APARTMENT = "Appartamento",
  VILLA = "Villa",
  OFFICE = "Ufficio",
  OTHER = "Altro"
}

export enum PropertyCondition {
  NEW = "Nuovo",
  EXCELLENT = "Ottimo",
  GOOD = "Buono",
  TO_RENOVATE = "Da ristrutturare"
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
