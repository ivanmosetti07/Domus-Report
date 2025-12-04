import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// POST /api/subscription/promo - Valida codice promozionale
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const authResult = await verifyAuth(token)
    if (!authResult) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body as { code: string }

    if (!code) {
      return NextResponse.json({ error: 'Codice richiesto' }, { status: 400 })
    }

    // Cerca codice promo
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        isActive: true
      }
    })

    if (!promo) {
      return NextResponse.json({ error: 'Codice non valido' }, { status: 404 })
    }

    // Verifica scadenza
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: 'Codice scaduto' }, { status: 400 })
    }

    // Verifica utilizzi massimi
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: 'Codice esaurito' }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      message: `Sconto del ${promo.discountPercent}% applicato!`
    })
  } catch (error) {
    console.error('Errore validazione promo:', error)
    return NextResponse.json({
      error: 'Errore durante la validazione del codice'
    }, { status: 500 })
  }
}
