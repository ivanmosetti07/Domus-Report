import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PropertyType, PropertyCondition } from "@/types"

export interface CreateLeadRequest {
  widgetId: string
  // Lead data
  firstName: string
  lastName: string
  email: string
  phone?: string
  // Property data
  address: string
  city: string
  postalCode?: string
  latitude?: number
  longitude?: number
  type: PropertyType
  surfaceSqm: number
  floor?: number
  hasElevator?: boolean
  condition: PropertyCondition
  // Valuation data
  minPrice: number
  maxPrice: number
  estimatedPrice: number
  baseOMIValue: number
  floorCoefficient: number
  conditionCoefficient: number
  explanation: string
  // Conversation
  messages: any[]
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateLeadRequest

    // Validate required fields
    if (!body.widgetId || !body.email || !body.firstName) {
      return NextResponse.json(
        { error: "Widget ID, email e nome sono obbligatori" },
        { status: 400 }
      )
    }

    // Find agency by widgetId
    const agency = await prisma.agency.findUnique({
      where: { widgetId: body.widgetId },
    })

    if (!agency) {
      return NextResponse.json(
        { error: "Widget non valido" },
        { status: 404 }
      )
    }

    if (!agency.attiva) {
      return NextResponse.json(
        { error: "Agenzia non attiva" },
        { status: 403 }
      )
    }

    // Create lead with related data in a transaction
    const lead = await prisma.lead.create({
      data: {
        agenziaId: agency.id,
        nome: body.firstName,
        cognome: body.lastName,
        email: body.email,
        telefono: body.phone,
        property: {
          create: {
            indirizzo: body.address,
            citta: body.city,
            cap: body.postalCode,
            latitudine: body.latitude,
            longitudine: body.longitude,
            tipo: body.type,
            superficieMq: body.surfaceSqm,
            piano: body.floor,
            ascensore: body.hasElevator,
            stato: body.condition,
            valuation: {
              create: {
                prezzoMinimo: body.minPrice,
                prezzoMassimo: body.maxPrice,
                prezzoStimato: body.estimatedPrice,
                valoreOmiBase: body.baseOMIValue,
                coefficientePiano: body.floorCoefficient,
                coefficienteStato: body.conditionCoefficient,
                spiegazione: body.explanation,
              },
            },
          },
        },
        conversation: {
          create: {
            messaggi: body.messages,
          },
        },
      },
      include: {
        property: {
          include: {
            valuation: true,
          },
        },
        conversation: true,
      },
    })

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Lead creato con successo",
    })
  } catch (error) {
    console.error("Error creating lead:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const widgetId = searchParams.get("widgetId")

    if (!widgetId) {
      return NextResponse.json(
        { error: "Widget ID is required" },
        { status: 400 }
      )
    }

    // Find agency
    const agency = await prisma.agency.findUnique({
      where: { widgetId },
      include: {
        leads: {
          include: {
            property: {
              include: {
                valuation: true,
              },
            },
            conversation: true,
          },
          orderBy: {
            dataRichiesta: "desc",
          },
        },
      },
    })

    if (!agency) {
      return NextResponse.json({ error: "Widget non trovato" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      leads: agency.leads,
    })
  } catch (error) {
    console.error("Error fetching leads:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
