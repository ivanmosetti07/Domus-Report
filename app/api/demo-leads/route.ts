import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PropertyType, PropertyCondition } from "@/types"

export interface CreateDemoLeadRequest {
  // Lead data
  firstName: string
  lastName: string
  email: string
  phone?: string
  // Property data
  address: string
  city: string
  type: PropertyType
  surfaceSqm: number
  floor?: number
  hasElevator?: boolean
  condition: PropertyCondition
  // Valuation data
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  // Conversation
  messages: any[]
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateDemoLeadRequest

    // Validate required fields - Lead data
    if (!body.email || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "Email, nome e cognome sono obbligatori" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Formato email non valido" },
        { status: 400 }
      )
    }

    // Validate required fields - Property data
    if (!body.address || !body.city || !body.type || !body.surfaceSqm || !body.condition) {
      return NextResponse.json(
        { error: "Dati immobile obbligatori: indirizzo, città, tipo, superficie, stato" },
        { status: 400 }
      )
    }

    // Validate surface range
    if (body.surfaceSqm < 10 || body.surfaceSqm > 2000) {
      return NextResponse.json(
        { error: "Superficie deve essere tra 10 e 2000 m²" },
        { status: 400 }
      )
    }

    // Validate valuation data
    if (!body.minPrice || !body.maxPrice || !body.estimatedPrice) {
      return NextResponse.json(
        { error: "Dati valutazione obbligatori: prezzi min/max/stimato" },
        { status: 400 }
      )
    }

    // Create demo lead
    const demoLead = await prisma.demoLead.create({
      data: {
        nome: body.firstName,
        cognome: body.lastName,
        email: body.email,
        telefono: body.phone,
        indirizzo: body.address,
        citta: body.city,
        tipo: body.type,
        superficieMq: body.surfaceSqm,
        piano: body.floor,
        ascensore: body.hasElevator,
        stato: body.condition,
        prezzoMinimo: body.minPrice,
        prezzoMassimo: body.maxPrice,
        prezzoStimato: body.estimatedPrice,
        messaggi: body.messages,
      },
    })

    return NextResponse.json({
      success: true,
      leadId: demoLead.id,
      message: "Lead demo creato con successo",
    })
  } catch (error) {
    console.error("Error creating demo lead:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}

// GET endpoint per statistiche demo (opzionale, per uso interno)
export async function GET(request: NextRequest) {
  try {
    const count = await prisma.demoLead.count()
    const recent = await prisma.demoLead.findMany({
      take: 10,
      orderBy: {
        dataRichiesta: "desc",
      },
      select: {
        id: true,
        email: true,
        citta: true,
        dataRichiesta: true,
      },
    })

    return NextResponse.json({
      success: true,
      count,
      recent,
    })
  } catch (error) {
    console.error("Error fetching demo leads:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
