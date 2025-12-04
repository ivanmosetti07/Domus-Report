import * as XLSX from 'xlsx'
import { formatDate, formatCurrency } from './utils'

interface LeadExportData {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string | null
  dataRichiesta: Date
  property?: {
    indirizzo: string
    citta: string
    cap: string | null
    tipo: string
    superficieMq: number
    piano: number | null
    ascensore: boolean | null
    stato: string
    valuation?: {
      prezzoMinimo: number
      prezzoMassimo: number
      prezzoStimato: number
    }
  }
  statuses?: Array<{
    status: string
  }>
}

export function exportLeadsToCSV(leads: LeadExportData[], agencyName: string): void {
  // Build CSV content
  const headers = [
    'Nome',
    'Cognome',
    'Email',
    'Telefono',
    'Indirizzo',
    'Città',
    'CAP',
    'Tipo',
    'Superficie (mq)',
    'Piano',
    'Ascensore',
    'Stato Immobile',
    'Prezzo Minimo (€)',
    'Prezzo Massimo (€)',
    'Prezzo Stimato (€)',
    'Status Lead',
    'Data Richiesta',
  ]

  const rows = leads.map((lead) => [
    lead.nome,
    lead.cognome,
    lead.email,
    lead.telefono || 'N/D',
    lead.property?.indirizzo || 'N/D',
    lead.property?.citta || 'N/D',
    lead.property?.cap || 'N/D',
    lead.property?.tipo || 'N/D',
    lead.property?.superficieMq?.toString() || 'N/D',
    lead.property?.piano !== null && lead.property?.piano !== undefined
      ? lead.property.piano.toString()
      : 'N/D',
    lead.property?.ascensore !== null && lead.property?.ascensore !== undefined
      ? lead.property.ascensore
        ? 'Sì'
        : 'No'
      : 'N/D',
    lead.property?.stato || 'N/D',
    lead.property?.valuation?.prezzoMinimo?.toString() || 'N/D',
    lead.property?.valuation?.prezzoMassimo?.toString() || 'N/D',
    lead.property?.valuation?.prezzoStimato?.toString() || 'N/D',
    lead.statuses?.[0]?.status || 'NEW',
    formatDate(lead.dataRichiesta),
  ])

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        // Escape commas and quotes
        const cellStr = String(cell)
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    ),
  ].join('\n')

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `leads-${agencyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function exportLeadsToExcel(leads: LeadExportData[], agencyName: string): void {
  // Create workbook
  const workbook = XLSX.utils.book_new()

  // ========== SHEET 1: LEAD ANAGRAFICI ==========
  const leadData = leads.map((lead) => ({
    Nome: lead.nome,
    Cognome: lead.cognome,
    Email: lead.email,
    Telefono: lead.telefono || 'N/D',
    'Status Lead': lead.statuses?.[0]?.status || 'NEW',
    'Data Richiesta': formatDate(lead.dataRichiesta),
  }))

  const leadSheet = XLSX.utils.json_to_sheet(leadData)
  XLSX.utils.book_append_sheet(workbook, leadSheet, 'Lead')

  // ========== SHEET 2: IMMOBILI ==========
  const propertyData = leads
    .filter((lead) => lead.property)
    .map((lead) => ({
      'Nome Lead': `${lead.nome} ${lead.cognome}`,
      Email: lead.email,
      Indirizzo: lead.property!.indirizzo,
      Città: lead.property!.citta,
      CAP: lead.property!.cap || 'N/D',
      Tipo: lead.property!.tipo,
      'Superficie (mq)': lead.property!.superficieMq,
      Piano:
        lead.property!.piano !== null && lead.property!.piano !== undefined
          ? lead.property!.piano
          : 'N/D',
      Ascensore:
        lead.property!.ascensore !== null && lead.property!.ascensore !== undefined
          ? lead.property!.ascensore
            ? 'Sì'
            : 'No'
          : 'N/D',
      'Stato Immobile': lead.property!.stato,
    }))

  const propertySheet = XLSX.utils.json_to_sheet(propertyData)
  XLSX.utils.book_append_sheet(workbook, propertySheet, 'Immobili')

  // ========== SHEET 3: VALUTAZIONI ==========
  const valuationData = leads
    .filter((lead) => lead.property?.valuation)
    .map((lead) => ({
      'Nome Lead': `${lead.nome} ${lead.cognome}`,
      Indirizzo: lead.property!.indirizzo,
      'Prezzo Minimo (€)': lead.property!.valuation!.prezzoMinimo,
      'Prezzo Massimo (€)': lead.property!.valuation!.prezzoMassimo,
      'Prezzo Stimato (€)': lead.property!.valuation!.prezzoStimato,
    }))

  const valuationSheet = XLSX.utils.json_to_sheet(valuationData)
  XLSX.utils.book_append_sheet(workbook, valuationSheet, 'Valutazioni')

  // Set column widths for all sheets
  const sheets = [leadSheet, propertySheet, valuationSheet]
  sheets.forEach((sheet) => {
    const cols = []
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })]
        if (cell && cell.v) {
          const cellValue = String(cell.v)
          maxWidth = Math.max(maxWidth, cellValue.length)
        }
      }
      cols.push({ wch: Math.min(maxWidth + 2, 50) })
    }
    sheet['!cols'] = cols
  })

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // Create blob and download
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `leads-${agencyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
