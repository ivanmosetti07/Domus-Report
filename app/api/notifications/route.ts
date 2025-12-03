import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET /api/notifications - Ottieni notifiche agenzia
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyAuth(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const onlyUnread = searchParams.get('onlyUnread') === 'true'

    // Query notifiche
    const whereClause: any = { agencyId: agency.agencyId }
    if (onlyUnread) {
      whereClause.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50, // Ultimi 50 notifiche
      include: {
        lead: {
          select: {
            id: true,
            nome: true,
            cognome: true,
            email: true,
          },
        },
      },
    })

    // Count non lette
    const unreadCount = await prisma.notification.count({
      where: {
        agencyId: agency.agencyId,
        isRead: false,
      },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Errore GET notifications:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// POST /api/notifications - Crea notifica (per sistema interno)
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyAuth(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const body = await request.json()
    const { type, leadId, title, message } = body

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'type, title e message obbligatori' }, { status: 400 })
    }

    // Crea notifica
    const notification = await prisma.notification.create({
      data: {
        agencyId: agency.agencyId,
        type,
        leadId: leadId || null,
        title,
        message,
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Errore POST notifications:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// PUT /api/notifications - Marca come letta
export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyAuth(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Marca tutte come lette
      await prisma.notification.updateMany({
        where: {
          agencyId: agency.agencyId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      return NextResponse.json({ message: 'Tutte le notifiche marcate come lette' })
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId obbligatorio' }, { status: 400 })
    }

    // Verifica che la notifica appartenga all'agenzia
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        agencyId: agency.agencyId,
      },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notifica non trovata' }, { status: 404 })
    }

    // Marca come letta
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ notification: updatedNotification })
  } catch (error) {
    console.error('Errore PUT notifications:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// DELETE /api/notifications - Elimina notifica
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const agency = await verifyAuth(token)
    if (!agency) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId mancante' }, { status: 400 })
    }

    // Verifica che la notifica appartenga all'agenzia
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        agencyId: agency.agencyId,
      },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notifica non trovata' }, { status: 404 })
    }

    // Elimina notifica
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    return NextResponse.json({ message: 'Notifica eliminata' })
  } catch (error) {
    console.error('Errore DELETE notifications:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
