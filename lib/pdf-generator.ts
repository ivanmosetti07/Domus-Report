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
    quartiere: string | null
    locali: number | null
    bagni: number | null
    spaziEsterni: string | null
    postoAuto: boolean | null
    riscaldamento: string | null
    ariaCondizionata: boolean | null
    classeEnergetica: string | null
    annoCostruzione: number | null
    statoOccupazione: string | null
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

// ==================== HELPER FUNCTIONS ====================

function hexToRgb(hex: string): [number, number, number] {
  if (!hex) return [37, 99, 235]
  const cleanHex = hex.replace(/^#/, '')
  let processedHex = cleanHex
  if (cleanHex.length === 3) {
    processedHex = cleanHex.split('').map(char => char + char).join('')
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(processedHex)
  if (!result || processedHex.length !== 6) {
    return [37, 99, 235]
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ]
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
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

// Colori fissi di design
const LIGHT_GRAY: [number, number, number] = [248, 249, 250]
const MEDIUM_GRAY: [number, number, number] = [233, 236, 239]
const DARK_GRAY: [number, number, number] = [73, 80, 87]
const TEXT_COLOR: [number, number, number] = [31, 41, 55]

// Layout
const MARGIN_LEFT = 20
const MARGIN_RIGHT = 190
const CONTENT_WIDTH = 170
const SECTION_SPACING = 12

function drawSectionTitle(
  doc: jsPDF,
  sectionNumber: number,
  title: string,
  yPos: number,
  color: [number, number, number]
): number {
  // Cerchietto numerato
  doc.setFillColor(...color)
  doc.circle(MARGIN_LEFT + 5, yPos - 1.5, 5, 'F')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text(String(sectionNumber), MARGIN_LEFT + 5, yPos + 1, { align: 'center' })

  // Titolo
  doc.setFontSize(13)
  doc.setTextColor(...color)
  doc.setFont('helvetica', 'bold')
  doc.text(title, MARGIN_LEFT + 14, yPos)

  // Linea sottile
  doc.setDrawColor(...color)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_LEFT + 14, yPos + 2, MARGIN_RIGHT, yPos + 2)

  return yPos + 10
}

function checkPageBreak(doc: jsPDF, yPos: number, requiredSpace: number = 60): number {
  if (yPos + requiredSpace > 270) {
    doc.addPage()
    return 20
  }
  return yPos
}

function translateValue(key: string, value: string | null | undefined): string {
  if (!value) return 'Non specificato'
  const translations: Record<string, Record<string, string>> = {
    spaziEsterni: {
      'NONE': 'Nessuno',
      'BALCONY': 'Balcone',
      'TERRACE': 'Terrazzo',
      'GARDEN': 'Giardino',
      'ROOF_TERRACE': 'Terrazza sul tetto',
    },
    riscaldamento: {
      'AUTONOMOUS': 'Autonomo',
      'CENTRALIZED': 'Centralizzato',
      'NONE': 'Assente',
      'ABSENT': 'Assente',
    },
    statoOccupazione: {
      'FREE': 'Libero',
      'OCCUPIED': 'Occupato',
    },
    tipo: {
      'APARTMENT': 'Appartamento',
      'VILLA': 'Villa',
      'HOUSE': 'Casa indipendente',
      'SHOP': 'Negozio',
      'BOX': 'Box/Garage',
      'OFFICE': 'Ufficio',
      'LAND': 'Terreno',
    },
    stato: {
      'NEW': 'Nuovo',
      'RENOVATED': 'Ristrutturato',
      'GOOD': 'Buono',
      'TO_RENOVATE': 'Da ristrutturare',
    },
  }
  return translations[key]?.[value] ?? value
}

// Standard table style used across all sections
function createStyledTable(
  doc: jsPDF,
  yPosition: number,
  body: string[][],
  primaryColor: [number, number, number]
) {
  autoTable(doc, {
    startY: yPosition,
    head: [],
    body,
    theme: 'striped',
    styles: {
      fontSize: 9.5,
      cellPadding: 4,
      textColor: TEXT_COLOR,
      lineColor: MEDIUM_GRAY,
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY,
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        cellWidth: 50,
        textColor: DARK_GRAY,
      },
      1: { cellWidth: 130 },
    },
    margin: { left: MARGIN_LEFT },
    tableLineColor: primaryColor,
  })
  return (doc as any).lastAutoTable.finalY
}

// ==================== MAIN FUNCTION ====================

export async function generateLeadPDF(data: LeadData): Promise<jsPDF> {
  const doc = new jsPDF()

  // Brand colors
  const primaryColor: [number, number, number] = data.settings?.brandColors?.primary
    ? hexToRgb(data.settings.brandColors.primary)
    : [37, 99, 235]

  const secondaryColor: [number, number, number] = data.settings?.brandColors?.secondary
    ? hexToRgb(data.settings.brandColors.secondary)
    : primaryColor

  const accentColor: [number, number, number] = data.settings?.brandColors?.accent
    ? hexToRgb(data.settings.brandColors.accent)
    : [
      Math.round(primaryColor[0] * 0.1 + 255 * 0.9),
      Math.round(primaryColor[1] * 0.1 + 255 * 0.9),
      Math.round(primaryColor[2] * 0.1 + 255 * 0.9)
    ]

  let yPosition = 20

  // ==================== HEADER ====================
  // Banda colorata superiore
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 50, 'F')

  // Box bianco centrale
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 8, 190, 37, 3, 3, 'F')

  // Colonna sinistra: Titolo
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Report Valutazione', 15, 18)
  doc.text('Immobiliare', 15, 25)

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generato il ${formatDate(new Date())}`, 15, 32)

  // Colonna centrale: Logo
  const centerX = 105
  if (data.agency.logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(data.agency.logoUrl)
      if (logoBase64) {
        const logoSize = 25
        const logoX = centerX - (logoSize / 2)
        doc.addImage(logoBase64, 'PNG', logoX, 14, logoSize, logoSize)
      } else {
        doc.setFontSize(14)
        doc.setTextColor(...primaryColor)
        doc.setFont('helvetica', 'bold')
        doc.text(data.agency.nome, centerX, 25, { align: 'center' })
      }
    } catch {
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.setFont('helvetica', 'bold')
      doc.text(data.agency.nome, centerX, 25, { align: 'center' })
    }
  } else {
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text(data.agency.nome, centerX, 25, { align: 'center' })
  }

  // Colonna destra: Dati agenzia
  const rightX = 195
  let rightY = 14
  doc.setFontSize(7.5)
  doc.setTextColor(70, 70, 70)
  doc.setFont('helvetica', 'normal')

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

  // ==================== SEZIONE 1: DATI CLIENTE ====================
  yPosition = drawSectionTitle(doc, 1, 'Dati Cliente', yPosition, primaryColor)

  const leadTableData = [
    ['Nome Completo', `${data.lead.nome} ${data.lead.cognome}`],
    ['Email', data.lead.email],
    ['Telefono', data.lead.telefono || 'Non fornito'],
    ['Data Richiesta', formatDate(data.lead.dataRichiesta)],
  ]

  yPosition = createStyledTable(doc, yPosition, leadTableData, primaryColor) + SECTION_SPACING

  // ==================== SEZIONE 2: DETTAGLI IMMOBILE ====================
  yPosition = checkPageBreak(doc, yPosition, 80)
  yPosition = drawSectionTitle(doc, 2, 'Dettagli Immobile', yPosition, primaryColor)

  const propertyTableData: string[][] = [
    ['Indirizzo', data.property.indirizzo],
    ['Citt\u00E0', `${data.property.cap ? data.property.cap + ' ' : ''}${data.property.citta}`],
  ]

  if (data.property.quartiere) {
    propertyTableData.push(['Quartiere', data.property.quartiere])
  }

  propertyTableData.push(['Tipologia', translateValue('tipo', data.property.tipo)])
  propertyTableData.push(['Superficie', `${data.property.superficieMq} m\u00B2`])

  // Locali e bagni
  if (data.property.locali != null && data.property.bagni != null) {
    propertyTableData.push(['Composizione', `${data.property.locali} locali, ${data.property.bagni} bagni`])
  } else {
    if (data.property.locali != null) propertyTableData.push(['Locali', String(data.property.locali)])
    if (data.property.bagni != null) propertyTableData.push(['Bagni', String(data.property.bagni)])
  }

  // Piano + ascensore combinati
  if (data.property.piano !== null) {
    const pianoText = data.property.piano === 0 ? 'Piano terra' : `${data.property.piano}\u00B0 piano`
    const ascText = data.property.ascensore != null
      ? (data.property.ascensore ? ' (con ascensore)' : ' (senza ascensore)')
      : ''
    propertyTableData.push(['Piano', pianoText + ascText])
  }

  propertyTableData.push(['Stato', translateValue('stato', data.property.stato)])

  if (data.property.annoCostruzione) {
    propertyTableData.push(['Anno Costruzione', String(data.property.annoCostruzione)])
  }

  if (data.property.classeEnergetica && data.property.classeEnergetica !== 'NOT_AVAILABLE' && data.property.classeEnergetica !== 'UNKNOWN') {
    propertyTableData.push(['Classe Energetica', `Classe ${data.property.classeEnergetica}`])
  }

  if (data.property.riscaldamento) {
    let riscText = translateValue('riscaldamento', data.property.riscaldamento)
    if (data.property.ariaCondizionata) {
      riscText += ' + Aria condizionata'
    }
    propertyTableData.push(['Riscaldamento', riscText])
  }

  if (data.property.spaziEsterni && data.property.spaziEsterni !== 'NONE') {
    propertyTableData.push(['Spazi Esterni', translateValue('spaziEsterni', data.property.spaziEsterni)])
  }

  if (data.property.postoAuto != null) {
    propertyTableData.push(['Posto Auto', data.property.postoAuto ? 'S\u00EC' : 'No'])
  }

  if (data.property.statoOccupazione) {
    propertyTableData.push(['Occupazione', translateValue('statoOccupazione', data.property.statoOccupazione)])
  }

  yPosition = createStyledTable(doc, yPosition, propertyTableData, primaryColor) + SECTION_SPACING

  // ==================== SEZIONE 3: VALUTAZIONE ====================
  yPosition = checkPageBreak(doc, yPosition, 100)
  yPosition = drawSectionTitle(doc, 3, 'Valutazione Immobiliare', yPosition, primaryColor)

  // --- Box prezzo stimato ---
  doc.setFillColor(...accentColor)
  doc.roundedRect(MARGIN_LEFT, yPosition, CONTENT_WIDTH, 38, 4, 4, 'F')

  // Bordo sinistro accent
  doc.setFillColor(...primaryColor)
  doc.rect(MARGIN_LEFT, yPosition + 4, 4, 30, 'F')

  // Label
  doc.setFontSize(10)
  doc.setTextColor(...DARK_GRAY)
  doc.setFont('helvetica', 'bold')
  doc.text('PREZZO STIMATO', MARGIN_LEFT + 12, yPosition + 10)

  // Prezzo grande
  doc.setFontSize(26)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(data.valuation.prezzoStimato), MARGIN_LEFT + 12, yPosition + 24)

  // Prezzo al m2
  const prezzoAlMq = data.property.superficieMq > 0
    ? Math.round(data.valuation.prezzoStimato / data.property.superficieMq)
    : 0
  doc.setFontSize(10)
  doc.setTextColor(...DARK_GRAY)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${formatCurrency(prezzoAlMq)}/m\u00B2`,
    MARGIN_RIGHT - 5, yPosition + 24,
    { align: 'right' }
  )

  // Range testo
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `Range: ${formatCurrency(data.valuation.prezzoMinimo)} \u2013 ${formatCurrency(data.valuation.prezzoMassimo)}`,
    MARGIN_LEFT + 12, yPosition + 33
  )

  yPosition += 44

  // --- Barra visuale range prezzo ---
  const barY = yPosition
  const barHeight = 8
  const barLeft = MARGIN_LEFT + 15
  const barWidth = CONTENT_WIDTH - 30

  // Label "Stima" sopra l'indicatore (posizionata dopo il calcolo)
  const range = data.valuation.prezzoMassimo - data.valuation.prezzoMinimo
  const pricePosition = range > 0
    ? (data.valuation.prezzoStimato - data.valuation.prezzoMinimo) / range
    : 0.5
  const indicatorX = barLeft + (barWidth * pricePosition)

  doc.setFontSize(7)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Stima', indicatorX, barY - 2, { align: 'center' })

  // Sfondo barra
  doc.setFillColor(
    Math.round(primaryColor[0] * 0.2 + 255 * 0.8),
    Math.round(primaryColor[1] * 0.2 + 255 * 0.8),
    Math.round(primaryColor[2] * 0.2 + 255 * 0.8)
  )
  doc.roundedRect(barLeft, barY, barWidth, barHeight, 3, 3, 'F')

  // Barra riempita fino all'indicatore (gradiente simulato)
  doc.setFillColor(
    Math.round(primaryColor[0] * 0.4 + 255 * 0.6),
    Math.round(primaryColor[1] * 0.4 + 255 * 0.6),
    Math.round(primaryColor[2] * 0.4 + 255 * 0.6)
  )
  const fillWidth = barWidth * pricePosition
  if (fillWidth > 3) {
    doc.roundedRect(barLeft, barY, fillWidth, barHeight, 3, 3, 'F')
  }

  // Indicatore circolare
  doc.setFillColor(...primaryColor)
  doc.circle(indicatorX, barY + barHeight / 2, 5, 'F')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('\u20AC', indicatorX, barY + barHeight / 2 + 2, { align: 'center' })

  // Etichette min/max
  doc.setFontSize(7.5)
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCurrency(data.valuation.prezzoMinimo), barLeft, barY + barHeight + 5)
  doc.text(
    formatCurrency(data.valuation.prezzoMassimo),
    barLeft + barWidth, barY + barHeight + 5,
    { align: 'right' }
  )

  yPosition = barY + barHeight + 12

  // --- Tabella dati valutazione ---
  const valuationTableData = [
    ['Valore OMI Base', `${formatCurrency(data.valuation.valoreOmiBase)}/m\u00B2`],
    ['Prezzo al m\u00B2', `${formatCurrency(prezzoAlMq)}/m\u00B2`],
    ['Coeff. Piano', `${(data.valuation.coefficientePiano * 100).toFixed(0)}%`],
    ['Coeff. Qualit\u00E0', `${(data.valuation.coefficienteStato * 100).toFixed(0)}%`],
    ['Data Calcolo', formatDate(data.valuation.dataCalcolo)],
  ]

  yPosition = createStyledTable(doc, yPosition, valuationTableData, primaryColor)
  yPosition += 8

  // --- Box spiegazione ---
  yPosition = checkPageBreak(doc, yPosition, 40)

  const explanationLines = doc.splitTextToSize(data.valuation.spiegazione, CONTENT_WIDTH - 14)
  const explanationHeight = explanationLines.length * 4.2 + 14

  // Sfondo
  doc.setFillColor(252, 252, 253)
  doc.roundedRect(MARGIN_LEFT, yPosition, CONTENT_WIDTH, explanationHeight, 2, 2, 'F')

  // Bordo sinistro
  doc.setFillColor(...primaryColor)
  doc.rect(MARGIN_LEFT, yPosition + 2, 2.5, explanationHeight - 4, 'F')

  // Titoletto
  doc.setFontSize(9)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Nota metodologica', MARGIN_LEFT + 7, yPosition + 7)

  // Testo
  doc.setFontSize(8.5)
  doc.setTextColor(...DARK_GRAY)
  doc.setFont('helvetica', 'normal')
  doc.text(explanationLines, MARGIN_LEFT + 7, yPosition + 13)

  yPosition += explanationHeight + SECTION_SPACING

  // ==================== SEZIONE 4: RIEPILOGO CONVERSAZIONE ====================
  if (data.conversation && data.conversation.messaggi.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 40)
    yPosition = drawSectionTitle(doc, 4, 'Riepilogo Interazione', yPosition, primaryColor)

    const messaggi = data.conversation.messaggi as any[]
    const userMessages = messaggi.filter((m: any) => m.role === 'user')
    const botMessages = messaggi.filter((m: any) => m.role === 'bot' || m.role === 'assistant')

    const conversationTableData = [
      ['Messaggi Totali', String(messaggi.length)],
      ['Risposte Cliente', String(userMessages.length)],
      ['Domande Sistema', String(botMessages.length)],
    ]

    yPosition = createStyledTable(doc, yPosition, conversationTableData, primaryColor) + SECTION_SPACING
  }

  // ==================== FOOTER ====================
  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Linea divisoria
    doc.setDrawColor(...MEDIUM_GRAY)
    doc.setLineWidth(0.5)
    doc.line(MARGIN_LEFT, 275, MARGIN_RIGHT, 275)

    // Riga 1: Agenzia + Powered by + Pagina
    doc.setFontSize(7)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text(data.agency.nome, MARGIN_LEFT, 280)

    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    doc.text('Powered by Domus Report', 105, 280, { align: 'center' })
    doc.text(`Pagina ${i} di ${pageCount}`, MARGIN_RIGHT, 280, { align: 'right' })

    // Riga 2: Disclaimer legale
    doc.setFontSize(6.5)
    doc.setTextColor(130, 130, 130)
    doc.setFont('helvetica', 'italic')

    const disclaimer = 'Valutazione indicativa basata su dati OMI (Osservatorio del Mercato Immobiliare). ' +
      'Non costituisce una perizia ufficiale n\u00E9 un documento di valore legale. ' +
      'Per una valutazione formale, rivolgersi a un perito abilitato.'

    const disclaimerLines = doc.splitTextToSize(disclaimer, CONTENT_WIDTH)
    doc.text(disclaimerLines, MARGIN_LEFT, 284)
  }

  return doc
}
