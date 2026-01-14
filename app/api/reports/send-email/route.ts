import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { getAuthAgency } from '@/lib/auth'
import { generateLeadPDF } from '@/lib/pdf-generator'
import { generateReportEmailHTML, generateReportEmailText } from '@/lib/email-templates'
import { validateEmail } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated agency
    const agency = await getAuthAgency()

    if (!agency) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Servizio email non configurato. Contatta l\'amministratore.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { leadId, recipientEmail, customMessage, sendCopyToSender } = body

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId è obbligatorio' },
        { status: 400 }
      )
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'recipientEmail è obbligatorio' },
        { status: 400 }
      )
    }

    // Validate email
    const emailValidation = validateEmail(recipientEmail)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
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

    // Security check: verify lead belongs to authenticated agency
    if (lead.agenziaId !== agency.agencyId) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      )
    }

    // Validate required data
    if (!lead.property || !lead.property.valuation) {
      return NextResponse.json(
        { error: 'Lead non ha dati completi per inviare il report' },
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

    // Convert PDF to base64 for email attachment
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    const pdfBase64 = pdfBuffer.toString('base64')

    // Generate email content
    const emailData = {
      agencyName: lead.agenzia.nome,
      leadName: `${lead.nome} ${lead.cognome}`,
      propertyAddress: lead.property.indirizzo,
      estimatedPrice: lead.property.valuation.prezzoStimato,
      customMessage: customMessage || undefined,
    }

    const htmlContent = generateReportEmailHTML(emailData)
    const textContent = generateReportEmailText(emailData)

    const filename = `report-valutazione-${lead.cognome.toLowerCase()}-${Date.now()}.pdf`

    // Prepare recipients
    const recipients = [recipientEmail]
    if (sendCopyToSender && lead.agenzia.email) {
      recipients.push(lead.agenzia.email)
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email via Resend
    const result = await resend.emails.send({
      from: `${lead.agenzia.nome} <noreply@domusreport.mainstream.agency>`,
      to: recipients,
      subject: `Valutazione Immobiliare - ${lead.property.indirizzo}`,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          filename: filename,
          content: pdfBase64,
        },
      ],
    })

    if (!result.data) {
      throw new Error('Errore nell\'invio dell\'email')
    }

    return NextResponse.json({
      success: true,
      message: 'Email inviata con successo',
      emailId: result.data.id,
    })
  } catch (error) {
    console.error('Error sending email:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Errore nell\'invio dell\'email',
      },
      { status: 500 }
    )
  }
}
