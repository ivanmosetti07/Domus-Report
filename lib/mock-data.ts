import { Lead, PropertyType, PropertyCondition } from "@/types"

export const mockLeads: Lead[] = [
  {
    id: "lead_1",
    agencyId: "agency_1",
    firstName: "Marco",
    lastName: "Rossi",
    email: "marco.rossi@email.it",
    phone: "+39 339 1234567",
    createdAt: new Date("2024-12-01T10:30:00"),
    property: {
      id: "prop_1",
      leadId: "lead_1",
      address: "Via Roma 15",
      city: "Milano",
      postalCode: "20121",
      latitude: 45.4642,
      longitude: 9.1900,
      type: PropertyType.APARTMENT,
      surfaceSqm: 85,
      floor: 3,
      hasElevator: true,
      condition: PropertyCondition.GOOD
    },
    valuation: {
      id: "val_1",
      propertyId: "prop_1",
      minPrice: 280000,
      maxPrice: 320000,
      estimatedPrice: 300000,
      omiBaseValue: 3500,
      floorCoefficient: 1.05,
      conditionCoefficient: 1.0,
      explanation: "Valutazione basata su dati OMI zona Milano Centro. Piano intermedio con ascensore (+5%). Condizioni buone.",
      calculatedAt: new Date("2024-12-01T10:35:00")
    },
    conversation: {
      id: "conv_1",
      leadId: "lead_1",
      messages: [
        {
          id: "msg_1",
          role: "bot",
          text: "Ciao! 👋 Ti aiuto a scoprire quanto vale la tua casa. Dove si trova?",
          timestamp: new Date("2024-12-01T10:30:00")
        },
        {
          id: "msg_2",
          role: "user",
          text: "Via Roma 15, Milano",
          timestamp: new Date("2024-12-01T10:31:00")
        },
        {
          id: "msg_3",
          role: "bot",
          text: "Perfetto! Che tipo di immobile è?",
          timestamp: new Date("2024-12-01T10:31:15"),
          quickReplies: [
            { label: "Appartamento", value: "apartment" },
            { label: "Villa", value: "villa" },
            { label: "Ufficio", value: "office" },
            { label: "Altro", value: "other" }
          ]
        },
        {
          id: "msg_4",
          role: "user",
          text: "Appartamento",
          timestamp: new Date("2024-12-01T10:32:00")
        },
        {
          id: "msg_5",
          role: "bot",
          text: "Quanti metri quadri ha?",
          timestamp: new Date("2024-12-01T10:32:15")
        },
        {
          id: "msg_6",
          role: "user",
          text: "85",
          timestamp: new Date("2024-12-01T10:33:00")
        },
        {
          id: "msg_7",
          role: "bot",
          text: "Grazie Marco! 🎉 Sarai ricontattato a breve da un nostro consulente.",
          timestamp: new Date("2024-12-01T10:35:30")
        }
      ]
    }
  },
  {
    id: "lead_2",
    agencyId: "agency_1",
    firstName: "Laura",
    lastName: "Bianchi",
    email: "laura.bianchi@email.it",
    phone: "+39 348 7654321",
    createdAt: new Date("2024-11-28T14:20:00"),
    property: {
      id: "prop_2",
      leadId: "lead_2",
      address: "Corso Garibaldi 42",
      city: "Milano",
      postalCode: "20121",
      latitude: 45.4730,
      longitude: 9.1888,
      type: PropertyType.APARTMENT,
      surfaceSqm: 120,
      floor: 1,
      hasElevator: false,
      condition: PropertyCondition.TO_RENOVATE
    },
    valuation: {
      id: "val_2",
      propertyId: "prop_2",
      minPrice: 350000,
      maxPrice: 390000,
      estimatedPrice: 370000,
      omiBaseValue: 3800,
      floorCoefficient: 0.95,
      conditionCoefficient: 0.85,
      explanation: "Valutazione basata su dati OMI zona Milano Brera. Piano basso senza ascensore (-5%). Da ristrutturare (-15%).",
      calculatedAt: new Date("2024-11-28T14:25:00")
    },
    conversation: {
      id: "conv_2",
      leadId: "lead_2",
      messages: [
        {
          id: "msg_21",
          role: "bot",
          text: "Ciao! 👋 Ti aiuto a scoprire quanto vale la tua casa. Dove si trova?",
          timestamp: new Date("2024-11-28T14:20:00")
        },
        {
          id: "msg_22",
          role: "user",
          text: "Corso Garibaldi 42, Milano",
          timestamp: new Date("2024-11-28T14:21:00")
        }
      ]
    }
  },
  {
    id: "lead_3",
    agencyId: "agency_1",
    firstName: "Giuseppe",
    lastName: "Verdi",
    email: "giuseppe.verdi@email.it",
    createdAt: new Date("2024-11-25T09:15:00"),
    property: {
      id: "prop_3",
      leadId: "lead_3",
      address: "Via Montenapoleone 8",
      city: "Milano",
      postalCode: "20121",
      latitude: 45.4685,
      longitude: 9.1953,
      type: PropertyType.OFFICE,
      surfaceSqm: 65,
      floor: 2,
      hasElevator: true,
      condition: PropertyCondition.GOOD
    },
    valuation: {
      id: "val_3",
      propertyId: "prop_3",
      minPrice: 420000,
      maxPrice: 480000,
      estimatedPrice: 450000,
      omiBaseValue: 6500,
      floorCoefficient: 1.03,
      conditionCoefficient: 1.1,
      explanation: "Valutazione basata su dati OMI zona Milano Quadrilatero. Ufficio in zona premium. Condizioni ottime (+10%).",
      calculatedAt: new Date("2024-11-25T09:20:00")
    },
    conversation: {
      id: "conv_3",
      leadId: "lead_3",
      messages: [
        {
          id: "msg_31",
          role: "bot",
          text: "Ciao! 👋 Ti aiuto a scoprire quanto vale la tua casa. Dove si trova?",
          timestamp: new Date("2024-11-25T09:15:00")
        }
      ]
    }
  }
]
