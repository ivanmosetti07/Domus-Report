import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validatePhone } from "@/lib/validation"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!existingLead) {
      return NextResponse.json(
        { error: "Lead non trovato" },
        { status: 404 }
      )
    }

    // Validate phone if provided
    if (body.phone) {
      const phoneValidation = validatePhone(body.phone)
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { error: phoneValidation.error },
          { status: 400 }
        )
      }

      // Update lead with phone
      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          telefono: phoneValidation.sanitized,
        },
      })

      return NextResponse.json({
        success: true,
        lead: updatedLead,
        message: "Lead aggiornato con successo",
      })
    }

    return NextResponse.json(
      { error: "Nessun dato da aggiornare" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating lead:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Errore interno del server",
        success: false,
      },
      { status: 500 }
    )
  }
}
