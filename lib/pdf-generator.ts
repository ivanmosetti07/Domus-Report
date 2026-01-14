import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, formatCurrency } from './utils'

interface LeadData {
  lead: {
    nome: string
    cognome: string
    email: string
    telefono: string | null
    dataRichiesta: Date
  }
  property: {
    indirizzo: string
    citta: string
    cap: string | null
    tipo: string
    superficieMq: number
    piano: number | null
    ascensore: boolean | null
    stato: string
  }
  valuation: {
    prezzoMinimo: number
    prezzoMassimo: number
    prezzoStimato: number
    valoreOmiBase: number
    coefficientePiano: number
    coefficienteStato: number
    spiegazione: string
    dataCalcolo: Date
  }
  conversation?: {
    messaggi: any[]
  }
  agency: {
    nome: string
    email: string
    citta: string
    indirizzo?: string | null
    telefono?: string | null
    partitaIva?: string | null
    sitoWeb?: string | null
    logoUrl?: string | null
  }
  settings?: {
    brandColors?: {
      primary?: string
      secondary?: string
      accent?: string
    } | null
  }
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return [37, 99, 235] // Default blue-600
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ]
}

// Helper function to load image from URL and convert to base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    // Determine image format from URL or content-type
    const contentType = response.headers.get('content-type')
    let format = 'PNG'

    if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
      format = 'JPEG'
    } else if (contentType?.includes('png')) {
      format = 'PNG'
    }

    return `data:image/${format.toLowerCase()};base64,${base64}`
  } catch (error) {
    console.error('Error loading logo image:', error)
    return null
  }
}

export async function generateLeadPDF(data: LeadData): Promise<jsPDF> {
  const doc = new jsPDF()

  // Colori brand personalizzati o default
  const primaryColor: [number, number, number] = data.settings?.brandColors?.primary
    ? hexToRgb(data.settings.brandColors.primary)
    : [37, 99, 235] // blue-600

  const secondaryColor: [number, number, number] = data.settings?.brandColors?.secondary
    ? hexToRgb(data.settings.brandColors.secondary)
    : [59, 130, 246] // blue-500

  const accentColor: [number, number, number] = data.settings?.brandColors?.accent
    ? hexToRgb(data.settings.brandColors.accent)
    : [239, 246, 255] // blue-50

  const textColor: [number, number, number] = [31, 41, 55] // gray-800

  let yPosition = 20

  // ========== HEADER COMPLETAMENTE RIDISEGNATO ==========
  // Banda colorata superiore full-width
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 50, 'F')

  // Box bianco centrale più alto per contenere tutto
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 8, 190, 37, 3, 3, 'F')

  // ===== COLONNA SINISTRA: Titolo Report =====
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Report Valutazione', 15, 18)
  doc.text('Immobiliare', 15, 25)

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generato il ${formatDate(new Date())}`, 15, 32)

  // ===== COLONNA CENTRALE: Logo Agenzia =====
  const centerX = 105 // Centro della pagina

  // Carica e posiziona il logo al centro
  if (data.agency.logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(data.agency.logoUrl)
      if (logoBase64) {
        // Logo centrato con dimensioni ottimali
        const logoWidth = 40
        const logoHeight = 20
        const logoX = centerX - (logoWidth / 2)
        doc.addImage(logoBase64, 'PNG', logoX, 15, logoWidth, logoHeight)
      } else {
        // Fallback: nome centrato
        doc.setFontSize(11)
        doc.setTextColor(...primaryColor)
        doc.setFont('helvetica', 'bold')
        doc.text(data.agency.nome, centerX, 25, { align: 'center' })
      }
    } catch (error) {
      console.error('Error adding logo to PDF:', error)
      doc.setFontSize(11)
      doc.setTextColor(...primaryColor)
      doc.setFont('helvetica', 'bold')
      doc.text(data.agency.nome, centerX, 25, { align: 'center' })
    }
  } else {
    // Nessun logo: mostra nome centrato
    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text(data.agency.nome, centerX, 25, { align: 'center' })
  }

  // ===== COLONNA DESTRA: Dati Agenzia =====
  const rightX = 195
  let rightY = 14

  doc.setFontSize(7.5)
  doc.setTextColor(70, 70, 70)
  doc.setFont('helvetica', 'normal')

  // Costruisci l'indirizzo completo in una riga se possibile
  const fullAddress = data.agency.indirizzo
    ? `${data.agency.indirizzo}, ${data.agency.citta}`
    : data.agency.citta

  doc.text(fullAddress, rightX, rightY, { align: 'right', maxWidth: 55 })
  rightY += 3.5

  if (data.agency.telefono) {
    doc.text(`Tel: ${data.agency.telefono}`, rightX, rightY, { align: 'right' })
    rightY += 3.5
  }

  doc.text(data.agency.email, rightX, rightY, { align: 'right' })
  rightY += 3.5

  if (data.agency.partitaIva) {
    doc.text(`P.IVA: ${data.agency.partitaIva}`, rightX, rightY, { align: 'right' })
    rightY += 3.5
  }

  if (data.agency.sitoWeb) {
    doc.setTextColor(...secondaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text(data.agency.sitoWeb, rightX, rightY, { align: 'right' })
  }

  yPosition = 56

  // ========== SEZIONE 1: DATI LEAD ==========
  doc.setFontSize(14)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Dati Cliente', 20, yPosition)

  yPosition += 8

  const leadData = [
    ['Nome Completo', `${data.lead.nome} ${data.lead.cognome}`],
    ['Email', data.lead.email],
    ['Telefono', data.lead.telefono || 'Non fornito'],
    ['Data Richiesta', formatDate(data.lead.dataRichiesta)],
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: leadData,
    theme: 'striped',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: textColor,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255], // Testo bianco su sfondo colorato
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
      },
      1: { cellWidth: 130 },
    },
    margin: { left: 20 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // ========== SEZIONE 2: DATI IMMOBILE ==========
  doc.setFontSize(14)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('2. Dettagli Immobile', 20, yPosition)

  yPosition += 8

  const propertyData = [
    ['Indirizzo', data.property.indirizzo],
    ['Città', `${data.property.cap ? data.property.cap + ' ' : ''}${data.property.citta}`],
    ['Tipologia', data.property.tipo],
    ['Superficie', `${data.property.superficieMq} m²`],
    ['Piano', data.property.piano !== null ? `${data.property.piano}° piano` : 'Non specificato'],
    ['Ascensore', data.property.ascensore !== null ? (data.property.ascensore ? 'Sì' : 'No') : 'Non specificato'],
    ['Stato', data.property.stato],
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: propertyData,
    theme: 'striped',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: textColor,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255], // Testo bianco su sfondo colorato
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
      },
      1: { cellWidth: 130 },
    },
    margin: { left: 20 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // Check se serve nuova pagina
  if (yPosition > 220) {
    doc.addPage()
    yPosition = 20
  }

  // ========== SEZIONE 3: VALUTAZIONE ==========
  doc.setFontSize(14)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('3. Valutazione Immobiliare', 20, yPosition)

  yPosition += 8

  // Box prezzo stimato in evidenza - Design ottimizzato con migliore contrasto
  // Sfondo principale
  doc.setFillColor(...accentColor)
  doc.roundedRect(20, yPosition, 170, 32, 5, 5, 'F')

  // Bordo colorato più spesso
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(2)
  doc.roundedRect(20, yPosition, 170, 32, 5, 5, 'S')

  // Icona o badge "VALUTAZIONE" - più grande
  doc.setFillColor(...primaryColor)
  doc.circle(32, yPosition + 16, 10, 'F')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('€', 32, yPosition + 20, { align: 'center' })

  // Label con migliore contrasto
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'bold')
  doc.text('PREZZO STIMATO', 48, yPosition + 12)

  // Prezzo grande e ben visibile
  doc.setFontSize(24)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(data.valuation.prezzoStimato), 48, yPosition + 25)

  yPosition += 40

  const valuationData = [
    ['Range di Valore', `${formatCurrency(data.valuation.prezzoMinimo)} - ${formatCurrency(data.valuation.prezzoMassimo)}`],
    ['Valore OMI Base', `${formatCurrency(data.valuation.valoreOmiBase)}/m²`],
    ['Coefficiente Piano', `${(data.valuation.coefficientePiano * 100).toFixed(0)}%`],
    ['Coefficiente Stato', `${(data.valuation.coefficienteStato * 100).toFixed(0)}%`],
    ['Data Calcolo', formatDate(data.valuation.dataCalcolo)],
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: valuationData,
    theme: 'striped',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: textColor,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255], // Testo bianco su sfondo colorato
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
      },
      1: { cellWidth: 130 },
    },
    margin: { left: 20 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Spiegazione valutazione
  doc.setFontSize(10)
  doc.setTextColor(...textColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Spiegazione Dettagliata:', 20, yPosition)

  yPosition += 6

  doc.setFont('helvetica', 'normal')
  const splitExplanation = doc.splitTextToSize(data.valuation.spiegazione, 170)
  doc.text(splitExplanation, 20, yPosition)

  yPosition += splitExplanation.length * 5 + 15

  // Check se serve nuova pagina per conversazione
  if (yPosition > 220) {
    doc.addPage()
    yPosition = 20
  }

  // ========== SEZIONE 4: NOTE CONVERSAZIONE ==========
  if (data.conversation && data.conversation.messaggi.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('4. Riepilogo Conversazione', 20, yPosition)

    yPosition += 8

    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    doc.setFont('helvetica', 'normal')

    const summary = `Il cliente ha interagito con il sistema di valutazione attraverso una conversazione di ${data.conversation.messaggi.length} messaggi. `
    const userMessages = data.conversation.messaggi.filter((m: any) => m.role === 'user').length
    const summaryText = summary + `Ha fornito ${userMessages} risposte alle domande del sistema per completare la valutazione.`

    const splitSummary = doc.splitTextToSize(summaryText, 170)
    doc.text(splitSummary, 20, yPosition)

    yPosition += splitSummary.length * 5 + 10
  }

  // ========== FOOTER ==========
  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Linea footer
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(20, 280, 190, 280)

    // Testo footer
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'italic')

    const disclaimerText = 'Questo documento è stato generato automaticamente da Domus Report. La valutazione è indicativa e basata su dati OMI.'
    doc.text(disclaimerText, 20, 285)

    // Numero pagina
    doc.setFont('helvetica', 'normal')
    doc.text(`Pagina ${i} di ${pageCount}`, 180, 285, { align: 'right' })
  }

  return doc
}
