import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/lead-status?leadId=xxx - Ottieni status lead
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyToken(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'leadId mancante' }, { status: 400 })
    }

    // Verifica che il lead appartenga all'agenzia
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        agenziaId: agency.id,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })
    }

    // Ottieni status history
    const statuses = await prisma.leadStatus.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ statuses })
  } catch (error) {
    console.error('Errore GET lead-status:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// POST /api/lead-status - Crea nuovo status
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyToken(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const body = await request.json()
    const { leadId, status, note } = body

    if (!leadId || !status) {
      return NextResponse.json({ error: 'leadId e status obbligatori' }, { status: 400 })
    }

    // Verifica che il lead appartenga all'agenzia
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        agenziaId: agency.id,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })
    }

    // Valida status
    const validStatuses = ['NEW', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'LOST']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status non valido' }, { status: 400 })
    }

    // Crea nuovo status
    const leadStatus = await prisma.leadStatus.create({
      data: {
        leadId,
        status,
        note: note || null,
        createdByAgencyId: agency.id,
      },
    })

    return NextResponse.json({ leadStatus }, { status: 201 })
  } catch (error) {
    console.error('Errore POST lead-status:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// PUT /api/lead-status - Aggiorna status esistente
export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyToken(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const body = await request.json()
    const { statusId, status, note } = body

    if (!statusId) {
      return NextResponse.json({ error: 'statusId obbligatorio' }, { status: 400 })
    }

    // Verifica che lo status appartenga all'agenzia
    const existingStatus = await prisma.leadStatus.findFirst({
      where: {
        id: statusId,
        createdByAgencyId: agency.id,
      },
    })

    if (!existingStatus) {
      return NextResponse.json({ error: 'Status non trovato' }, { status: 404 })
    }

    // Aggiorna status
    const updatedStatus = await prisma.leadStatus.update({
      where: { id: statusId },
      data: {
        status: status || existingStatus.status,
        note: note !== undefined ? note : existingStatus.note,
      },
    })

    return NextResponse.json({ leadStatus: updatedStatus })
  } catch (error) {
    console.error('Errore PUT lead-status:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
