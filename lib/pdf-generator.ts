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

  let yPosition = 15

  // ========== HEADER MIGLIORATO CON BANDA COLORATA ==========
  // Banda colorata superiore
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')

  // Box bianco per il contenuto principale dell'header
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(15, 10, 180, 30, 2, 2, 'F')

  // LATO SINISTRO: Titolo e data
  doc.setFontSize(18)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Report Valutazione Immobiliare', 20, 20)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generato il ${formatDate(new Date())}`, 20, 26)

  // LATO DESTRO: Logo e dati agenzia
  const rightX = 195
  let rightY = 15

  // Carica e aggiungi il logo se disponibile
  if (data.agency.logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(data.agency.logoUrl)
      if (logoBase64) {
        // Aggiungi il logo come immagine
        const logoWidth = 30
        const logoHeight = 12
        const logoX = rightX - logoWidth
        doc.addImage(logoBase64, 'PNG', logoX, rightY - 2, logoWidth, logoHeight)
        rightY += logoHeight + 2
      } else {
        // Fallback al nome se il logo non si carica
        doc.setFontSize(11)
        doc.setTextColor(...primaryColor)
        doc.setFont('helvetica', 'bold')
        doc.text(data.agency.nome, rightX, rightY, { align: 'right' })
        rightY += 5
      }
    } catch (error) {
      // Fallback al nome in caso di errore
      console.error('Error adding logo to PDF:', error)
      doc.setFontSize(11)
      doc.setTextColor(...primaryColor)
      doc.setFont('helvetica', 'bold')
      doc.text(data.agency.nome, rightX, rightY, { align: 'right' })
      rightY += 5
    }
  } else {
    // Nessun logo, mostra solo il nome
    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text(data.agency.nome, rightX, rightY, { align: 'right' })
    rightY += 5
  }

  // Dati agenzia compatti
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'normal')

  if (data.agency.indirizzo) {
    doc.text(data.agency.indirizzo, rightX, rightY, { align: 'right' })
    rightY += 3.5
  }

  doc.text(`${data.agency.citta}`, rightX, rightY, { align: 'right' })
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
    doc.text(data.agency.sitoWeb, rightX, rightY, { align: 'right' })
  }

  yPosition = 52

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
      cellPadding: 4,
      textColor: textColor,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: accentColor,
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
        textColor: primaryColor,
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
      cellPadding: 4,
      textColor: textColor,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: accentColor,
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
        textColor: primaryColor,
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

  // Box prezzo stimato in evidenza - Design migliorato
  // Sfondo con gradiente simulato (2 rettangoli)
  doc.setFillColor(...accentColor)
  doc.roundedRect(20, yPosition, 170, 28, 4, 4, 'F')

  // Bordo colorato
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(1.5)
  doc.roundedRect(20, yPosition, 170, 28, 4, 4, 'S')

  // Icona o badge "VALUTAZIONE"
  doc.setFillColor(...primaryColor)
  doc.circle(30, yPosition + 14, 8, 'F')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('€', 30, yPosition + 17, { align: 'center' })

  // Label
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'bold')
  doc.text('PREZZO STIMATO', 45, yPosition + 10)

  // Prezzo grande
  doc.setFontSize(22)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(data.valuation.prezzoStimato), 45, yPosition + 22)

  yPosition += 36

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
      cellPadding: 4,
      textColor: textColor,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: accentColor,
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
        textColor: primaryColor,
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
