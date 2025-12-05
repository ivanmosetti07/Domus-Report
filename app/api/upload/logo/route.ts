import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { canUseCustomBranding } from '@/lib/plan-limits'

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024
// Allowed mime types
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']

// POST /api/upload/logo - Upload logo per agenzia o widget
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

    // Verifica piano per branding custom
    const agencyData = await prisma.agency.findUnique({
      where: { id: agency.agencyId },
      select: { piano: true },
    })
    const plan = agencyData?.piano || 'free'

    if (!canUseCustomBranding(plan)) {
      return NextResponse.json(
        { error: 'Upload logo non disponibile nel tuo piano. Passa a Basic o Premium.' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const widgetId = formData.get('widgetId') as string | null
    const type = formData.get('type') as string | null // 'agency' o 'widget'

    if (!file) {
      return NextResponse.json({ error: 'File non fornito' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo file non supportato. Usa PNG, JPG, SVG o WebP.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File troppo grande. Massimo 2MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png'
    const filename = `logos/${agency.agencyId}/${widgetId || 'agency'}_${Date.now()}.${ext}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Save URL to database
    if (type === 'widget' && widgetId) {
      // Get current logo URL to delete
      const currentWidget = await prisma.widgetConfig.findFirst({
        where: {
          widgetId,
          agencyId: agency.agencyId,
        },
        select: { logoUrl: true },
      })

      // Delete old logo if exists
      if (currentWidget?.logoUrl) {
        try {
          await del(currentWidget.logoUrl)
        } catch {
          // Ignore delete errors
        }
      }

      // Update widget with new logo
      await prisma.widgetConfig.updateMany({
        where: {
          widgetId,
          agencyId: agency.agencyId,
        },
        data: { logoUrl: blob.url },
      })
    } else {
      // Get current agency logo to delete old one
      const currentAgency = await prisma.agency.findUnique({
        where: { id: agency.agencyId },
        select: { logoUrl: true },
      })

      // Delete old logo if exists
      if (currentAgency?.logoUrl) {
        try {
          await del(currentAgency.logoUrl)
        } catch {
          // Ignore delete errors
        }
      }

      // Update agency with new logo
      await prisma.agency.update({
        where: { id: agency.agencyId },
        data: { logoUrl: blob.url },
      })
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
    })
  } catch (error) {
    console.error('Errore upload logo:', error)

    // Handle Vercel Blob specific errors
    if (error instanceof Error) {
      if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        return NextResponse.json(
          { error: 'Configurazione storage mancante. Contatta il supporto.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ error: 'Errore server durante upload' }, { status: 500 })
  }
}

// DELETE /api/upload/logo - Elimina logo
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
    const widgetId = searchParams.get('widgetId')
    const logoUrl = searchParams.get('logoUrl')

    if (!logoUrl) {
      return NextResponse.json({ error: 'logoUrl richiesto' }, { status: 400 })
    }

    // Delete from Vercel Blob
    try {
      await del(logoUrl)
    } catch {
      // Ignore if already deleted
    }

    // Remove from database
    if (widgetId) {
      await prisma.widgetConfig.updateMany({
        where: {
          widgetId,
          agencyId: agency.agencyId,
        },
        data: { logoUrl: null },
      })
    } else {
      // Remove logo from agency
      await prisma.agency.update({
        where: { id: agency.agencyId },
        data: { logoUrl: null },
      })
    }

    return NextResponse.json({ success: true, message: 'Logo eliminato' })
  } catch (error) {
    console.error('Errore delete logo:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
