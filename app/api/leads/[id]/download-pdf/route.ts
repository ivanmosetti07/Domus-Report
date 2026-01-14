import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateLeadPDF } from '@/lib/pdf-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId è obbligatorio' },
        { status: 400 }
      )
    }

    // Fetch lead with all related data including agency settings
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        property: {
          include: {
            valuation: true,
          },
        },
        conversation: true,
        agenzia: {
          include: {
            settings: true,
          },
        },
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead non trovato' },
        { status: 404 }
      )
    }

    // Validate required data
    if (!lead.property || !lead.property.valuation) {
      return NextResponse.json(
        { error: 'Lead non ha dati completi per generare il PDF' },
        { status: 400 }
      )
    }

    // Generate PDF with complete agency data and settings
    const pdf = await generateLeadPDF({
      lead: {
        nome: lead.nome,
        cognome: lead.cognome,
        email: lead.email,
        telefono: lead.telefono,
        dataRichiesta: lead.dataRichiesta,
      },
      property: {
        indirizzo: lead.property.indirizzo,
        citta: lead.property.citta,
        cap: lead.property.cap,
        tipo: lead.property.tipo,
        superficieMq: lead.property.superficieMq,
        piano: lead.property.piano,
        ascensore: lead.property.ascensore,
        stato: lead.property.stato,
      },
      valuation: {
        prezzoMinimo: lead.property.valuation.prezzoMinimo,
        prezzoMassimo: lead.property.valuation.prezzoMassimo,
        prezzoStimato: lead.property.valuation.prezzoStimato,
        valoreOmiBase: lead.property.valuation.valoreOmiBase,
        coefficientePiano: lead.property.valuation.coefficientePiano,
        coefficienteStato: lead.property.valuation.coefficienteStato,
        spiegazione: lead.property.valuation.spiegazione,
        dataCalcolo: lead.property.valuation.dataCalcolo,
      },
      conversation: lead.conversation ? {
        messaggi: lead.conversation.messaggi as any[]
      } : undefined,
      agency: {
        nome: lead.agenzia.nome,
        email: lead.agenzia.email,
        citta: lead.agenzia.citta,
        indirizzo: lead.agenzia.indirizzo,
        telefono: lead.agenzia.telefono,
        partitaIva: lead.agenzia.partitaIva,
        sitoWeb: lead.agenzia.sitoWeb,
        logoUrl: lead.agenzia.logoUrl,
      },
      settings: lead.agenzia.settings ? {
        brandColors: lead.agenzia.settings.brandColors as any,
      } : undefined,
    })

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Generate filename
    const filename = `valutazione-${lead.cognome.toLowerCase()}-${lead.nome.toLowerCase()}.pdf`

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[PDF Download] Error generating PDF:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Errore nella generazione del PDF',
      },
      { status: 500 }
    )
  }
}
