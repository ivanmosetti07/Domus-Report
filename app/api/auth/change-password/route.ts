import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import bcrypt from 'bcrypt'

// PUT /api/auth/change-password - Change password
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
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password attuale e nuova password sono obbligatorie' },
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nuova password deve avere almeno 8 caratteri' },
        { status: 400 }
      )
    }

    // Validate new password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)

    if (!hasUpperCase || !hasNumber) {
      return NextResponse.json(
        { error: 'La password deve contenere almeno una maiuscola e un numero' },
        { status: 400 }
      )
    }

    // Get current agency data
    const agency = await prisma.agency.findUnique({
      where: { id: auth.agencyId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, agency.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password attuale non corretta' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.agency.update({
      where: { id: auth.agencyId },
      data: { password: hashedPassword },
    })

    // Optional: Revoke all existing sessions
    // This forces re-login on all devices for security
    await prisma.agencySession.updateMany({
      where: {
        agencyId: auth.agencyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password aggiornata con successo. Tutte le sessioni sono state revocate per sicurezza.',
    })
  } catch (error) {
    console.error('Errore PUT /api/auth/change-password:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
