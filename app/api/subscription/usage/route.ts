import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getAgencyUsage } from '@/lib/subscription-limits'

// GET /api/subscription/usage - Ottieni utilizzo corrente
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const authResult = await verifyAuth(token)
    if (!authResult) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const usage = await getAgencyUsage(authResult.agencyId)

    return NextResponse.json(usage)
  } catch (error) {
    console.error('Errore fetch usage:', error)
    return NextResponse.json({
      error: 'Errore durante il recupero dei dati di utilizzo'
    }, { status: 500 })
  }
}
