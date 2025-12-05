import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET /api/profile - Get agency profile
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const auth = await verifyAuth(token)
    if (!auth) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Fetch agency profile
    const agency = await prisma.agency.findUnique({
      where: { id: auth.agencyId },
      select: {
        id: true,
        nome: true,
        email: true,
        citta: true,
        telefono: true,
        indirizzo: true,
        sitoWeb: true,
        partitaIva: true,
        logoUrl: true,
        piano: true,
        dataCreazione: true,
        attiva: true,
      },
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: agency,
    })
  } catch (error) {
    console.error('Errore GET /api/profile:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// PUT /api/profile - Update agency profile
export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const auth = await verifyAuth(token)
    if (!auth) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, citta, telefono, indirizzo, sitoWeb, partitaIva } = body

    // Validate required fields
    if (!nome || !citta) {
      return NextResponse.json(
        { error: 'Nome e città sono obbligatori' },
        { status: 400 }
      )
    }

    // Validate partitaIva format if provided
    if (partitaIva && !/^IT\d{11}$/.test(partitaIva)) {
      return NextResponse.json(
        { error: 'Partita IVA non valida. Formato richiesto: IT + 11 cifre' },
        { status: 400 }
      )
    }

    // Validate sitoWeb format if provided
    if (sitoWeb && !/^https?:\/\/.+/.test(sitoWeb)) {
      return NextResponse.json(
        { error: 'Sito web non valido. Deve iniziare con http:// o https://' },
        { status: 400 }
      )
    }

    // Update agency profile
    const updatedAgency = await prisma.agency.update({
      where: { id: auth.agencyId },
      data: {
        nome,
        citta,
        telefono: telefono || null,
        indirizzo: indirizzo || null,
        sitoWeb: sitoWeb || null,
        partitaIva: partitaIva || null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        citta: true,
        telefono: true,
        indirizzo: true,
        sitoWeb: true,
        partitaIva: true,
        logoUrl: true,
        piano: true,
        dataCreazione: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      profile: updatedAgency,
    })
  } catch (error) {
    console.error('Errore PUT /api/profile:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
