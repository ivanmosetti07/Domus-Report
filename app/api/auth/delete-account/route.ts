import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

// DELETE /api/auth/delete-account - Soft delete agency account
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const auth = await verifyAuth(token)
    if (!auth) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Get agency data before deletion
    const agency = await prisma.agency.findUnique({
      where: { id: auth.agencyId },
      select: {
        id: true,
        nome: true,
        email: true,
        attiva: true,
      },
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

    if (!agency.attiva) {
      return NextResponse.json(
        { error: 'Account già disattivato' },
        { status: 400 }
      )
    }

    // Soft delete: Set attiva to false instead of actually deleting
    await prisma.agency.update({
      where: { id: auth.agencyId },
      data: {
        attiva: false,
      },
    })

    // Revoke all sessions
    await prisma.agencySession.updateMany({
      where: {
        agencyId: auth.agencyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    // Cancel active subscription if any
    const subscription = await prisma.subscription.findUnique({
      where: { agencyId: auth.agencyId },
    })

    if (subscription && subscription.status === 'active') {
      await prisma.subscription.update({
        where: { agencyId: auth.agencyId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      })
    }

    // Create audit log
    try {
      await createAuditLog({
        agencyId: auth.agencyId,
        action: 'DELETE_ACCOUNT',
        entityType: 'Agency',
        entityId: auth.agencyId,
        oldValue: { attiva: true },
        newValue: { attiva: false },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      })
    } catch (auditError) {
      console.error('Errore creazione audit log:', auditError)
      // Non blocchiamo l'operazione se l'audit log fallisce
    }

    return NextResponse.json({
      success: true,
      message: 'Account eliminato con successo. Ci dispiace vederti andare via.',
    })
  } catch (error) {
    console.error('Errore DELETE /api/auth/delete-account:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
