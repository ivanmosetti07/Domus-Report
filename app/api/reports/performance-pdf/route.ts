import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthAgency } from '@/lib/auth'
import { generatePerformanceReportPDF } from '@/lib/performance-report-generator'
import type { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated agency
    const agency = await getAuthAgency()

    if (!agency) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = await request.json()
    const { agencyId, reportType } = body

    if (!agencyId || agencyId !== agency.agencyId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    if (!reportType || !['monthly', 'converted', 'followup'].includes(reportType)) {
      return NextResponse.json(
        { error: 'reportType non valido. Valori accettati: monthly, converted, followup' },
        { status: 400 }
      )
    }

    // Fetch agency data
    const agencyData = await prisma.agency.findUnique({
      where: { id: agencyId },
    })

    if (!agencyData) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

    // Calculate date range based on report type
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (reportType === 'monthly') {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      // Last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      endDate = now
    }

    // Fetch metrics
    const totalLeads = await prisma.lead.count({
      where: { agenziaId: agencyId },
    })

    const leadsInPeriod = await prisma.lead.count({
      where: {
        agenziaId: agencyId,
        dataRichiesta: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const convertedLeads = await prisma.lead.count({
      where: {
        agenziaId: agencyId,
        statuses: {
          some: {
            status: 'CONVERTED',
          },
        },
      },
    })

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    // Fetch leads by status
    const allLeadsWithStatus = await prisma.lead.findMany({
      where: { agenziaId: agencyId },
      include: {
        statuses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    type LeadWithStatus = Prisma.LeadGetPayload<{
      include: {
        statuses: true
      }
    }>

    const leadsByStatus: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      CONVERTED: 0,
      LOST: 0,
    }

    allLeadsWithStatus.forEach((lead: LeadWithStatus) => {
      const status = lead.statuses[0]?.status || 'NEW'
      if (leadsByStatus[status] !== undefined) {
        leadsByStatus[status]++
      }
    })

    // Fetch top leads based on report type
    let topLeadsQuery: any = {
      where: { agenziaId: agencyId },
      include: {
        property: {
          include: {
            valuation: true,
          },
        },
        statuses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        dataRichiesta: 'desc' as const,
      },
      take: 10,
    }

    if (reportType === 'converted') {
      topLeadsQuery.where.statuses = {
        some: { status: 'CONVERTED' },
      }
    } else if (reportType === 'followup') {
      topLeadsQuery.where.statuses = {
        some: { status: 'INTERESTED' },
      }
    }

    const topLeadsRaw = await prisma.lead.findMany(topLeadsQuery) as any[]

    const topLeads = topLeadsRaw
      .filter((lead: any) => lead.property?.valuation)
      .map((lead: any) => ({
        nome: lead.nome,
        cognome: lead.cognome,
        email: lead.email,
        propertyAddress: `${lead.property!.indirizzo}, ${lead.property!.citta}`,
        estimatedPrice: lead.property!.valuation!.prezzoStimato,
        status: lead.statuses[0]?.status || 'NEW',
        date: lead.dataRichiesta,
      }))

    // Generate PDF
    const pdf = generatePerformanceReportPDF({
      agency: {
        nome: agencyData.nome,
        email: agencyData.email,
        citta: agencyData.citta,
      },
      reportType,
      period: {
        start: startDate,
        end: endDate,
      },
      metrics: {
        totalLeads,
        leadsInPeriod,
        convertedLeads,
        conversionRate,
      },
      topLeads,
      leadsByStatus,
    })

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Generate filename
    const filename = `report-${reportType}-${agencyData.nome.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating performance report:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Errore nella generazione del report',
      },
      { status: 500 }
    )
  }
}
