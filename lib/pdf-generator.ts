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
  }
}

export function generateLeadPDF(data: LeadData): jsPDF {
  const doc = new jsPDF()

  // Colori brand
  const primaryColor: [number, number, number] = [37, 99, 235] // blue-600
  const textColor: [number, number, number] = [31, 41, 55] // gray-800
  const lightGray: [number, number, number] = [243, 244, 246] // gray-100

  let yPosition = 20

  // ========== HEADER ==========
  doc.setFontSize(24)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Report Valutazione Immobiliare', 20, yPosition)

  yPosition += 10
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generato il ${formatDate(new Date())}`, 20, yPosition)

  // Logo agenzia (testo per ora)
  doc.setFontSize(12)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text(data.agency.nome, 150, 20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(data.agency.citta, 150, 25)
  doc.text(data.agency.email, 150, 30)

  yPosition += 15

  // Linea separatore
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(20, yPosition, 190, yPosition)

  yPosition += 15

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
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: textColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
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
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: textColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
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

  // Box prezzo stimato in evidenza
  doc.setFillColor(...lightGray)
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(1)
  doc.roundedRect(20, yPosition, 170, 20, 3, 3, 'FD')

  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text('PREZZO STIMATO', 25, yPosition + 7)

  doc.setFontSize(18)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(data.valuation.prezzoStimato), 25, yPosition + 16)

  yPosition += 28

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
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: textColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
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
