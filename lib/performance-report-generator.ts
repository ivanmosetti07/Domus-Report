import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, formatCurrency } from './utils'

interface PerformanceReportData {
  agency: {
    nome: string
    email: string
    citta: string
  }
  reportType: 'monthly' | 'converted' | 'followup'
  period: {
    start: Date
    end: Date
  }
  metrics: {
    totalLeads: number
    leadsInPeriod: number
    convertedLeads: number
    conversionRate: number
    averageResponseTime?: number
  }
  topLeads: Array<{
    nome: string
    cognome: string
    email: string
    propertyAddress: string
    estimatedPrice: number
    status: string
    date: Date
  }>
  leadsByStatus: Record<string, number>
}

export function generatePerformanceReportPDF(data: PerformanceReportData): jsPDF {
  const doc = new jsPDF()

  // Colori brand
  const primaryColor: [number, number, number] = [37, 99, 235]
  const textColor: [number, number, number] = [31, 41, 55]
  const lightGray: [number, number, number] = [243, 244, 246]

  let yPosition = 20

  // ========== COPERTINA ==========
  // Background gradient simulation
  doc.setFillColor(...lightGray)
  doc.rect(0, 0, 210, 297, 'F')

  // Logo/Title box
  doc.setFillColor(...primaryColor)
  doc.roundedRect(20, 20, 170, 50, 5, 5, 'F')

  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  const reportTitles = {
    monthly: 'Report Performance Mensile',
    converted: 'Report Lead Convertiti',
    followup: 'Report Lead da Ricontattare',
  }
  doc.text(reportTitles[data.reportType], 105, 40, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(data.agency.nome, 105, 55, { align: 'center' })

  yPosition = 85

  // Periodo
  doc.setFontSize(12)
  doc.setTextColor(...textColor)
  doc.setFont('helvetica', 'bold')
  doc.text('Periodo di Riferimento:', 20, yPosition)

  yPosition += 8
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${formatDate(data.period.start)} - ${formatDate(data.period.end)}`,
    20,
    yPosition
  )

  yPosition += 15

  // ========== SOMMARIO METRICHE ==========
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Metriche Chiave', 20, yPosition)

  yPosition += 10

  // Metriche in box
  const metricsBoxes = [
    {
      label: 'Lead Totali',
      value: data.metrics.totalLeads.toString(),
      color: [59, 130, 246] as [number, number, number],
    },
    {
      label: 'Lead nel Periodo',
      value: data.metrics.leadsInPeriod.toString(),
      color: [16, 185, 129] as [number, number, number],
    },
    {
      label: 'Lead Convertiti',
      value: data.metrics.convertedLeads.toString(),
      color: [139, 92, 246] as [number, number, number],
    },
    {
      label: 'Tasso Conversione',
      value: `${data.metrics.conversionRate.toFixed(1)}%`,
      color: [245, 158, 11] as [number, number, number],
    },
  ]

  const boxWidth = 40
  const boxHeight = 25
  const boxSpacing = 5
  const startX = 20

  metricsBoxes.forEach((metric, index) => {
    const xPos = startX + index * (boxWidth + boxSpacing)

    // Box
    doc.setFillColor(...metric.color)
    doc.roundedRect(xPos, yPosition, boxWidth, boxHeight, 3, 3, 'F')

    // Value
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(metric.value, xPos + boxWidth / 2, yPosition + 12, { align: 'center' })

    // Label
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(metric.label, xPos + boxWidth / 2, yPosition + 20, { align: 'center' })
  })

  yPosition += boxHeight + 20

  // ========== DISTRIBUZIONE PER STATUS ==========
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Distribuzione Lead per Status', 20, yPosition)

  yPosition += 8

  const statusLabels = {
    NEW: 'Nuovo',
    CONTACTED: 'Contattato',
    INTERESTED: 'Interessato',
    CONVERTED: 'Convertito',
    LOST: 'Perso',
  }

  const statusData = Object.entries(data.leadsByStatus).map(([status, count]) => [
    statusLabels[status as keyof typeof statusLabels] || status,
    count.toString(),
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Status', 'Numero Lead']],
    body: statusData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'center' },
    },
    margin: { left: 20, right: 20 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // Check se serve nuova pagina
  if (yPosition > 220) {
    doc.addPage()
    yPosition = 20
  }

  // ========== TOP LEAD ==========
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(
    data.reportType === 'converted' ? 'Lead Convertiti' : 'Top Lead per Valore',
    20,
    yPosition
  )

  yPosition += 8

  if (data.topLeads.length > 0) {
    const topLeadsData = data.topLeads.map((lead) => [
      `${lead.nome} ${lead.cognome}`,
      lead.propertyAddress,
      formatCurrency(lead.estimatedPrice),
      lead.status,
      formatDate(lead.date),
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Nome', 'Indirizzo', 'Valore Stimato', 'Status', 'Data']],
      body: topLeadsData,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  } else {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'italic')
    doc.text('Nessun lead disponibile per questo report', 20, yPosition)
    yPosition += 15
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

    doc.text(`${data.agency.nome} | ${data.agency.citta}`, 20, 285)
    doc.text(`Generato il ${formatDate(new Date())}`, 20, 290)

    // Numero pagina
    doc.setFont('helvetica', 'normal')
    doc.text(`Pagina ${i} di ${pageCount}`, 180, 285, { align: 'right' })
  }

  return doc
}
