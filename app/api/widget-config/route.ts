import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthAgency } from '@/lib/auth'
import { canCreateWidget, canUseCustomCss, canUseCustomBranding } from '@/lib/plan-limits'
import { isValidHexColor, sanitizeCSS } from '@/lib/widget-themes'
import { nanoid } from 'nanoid'

// GET /api/widget-config - Ottieni tutti i widget dell'agenzia
export async function GET(request: Request) {
  try {
    const agency = await getAuthAgency()
    if (!agency) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Fetch widget configs per l'agenzia (solo attivi)
    const widgetConfigs = await prisma.widgetConfig.findMany({
      where: {
        agencyId: agency.agencyId,
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Ottieni piano agenzia per limiti
    const agencyData = await prisma.agency.findUnique({
      where: { id: agency.agencyId },
      select: { piano: true },
    })

    return NextResponse.json({
      widgetConfigs,
      plan: agencyData?.piano || 'free',
      count: widgetConfigs.length,
    })
  } catch (error) {
    console.error('Errore GET widget-config:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// POST /api/widget-config - Crea nuovo widget
export async function POST(request: Request) {
  try {
    const agency = await getAuthAgency()
    if (!agency) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni piano agenzia
    const agencyData = await prisma.agency.findUnique({
      where: { id: agency.agencyId },
      select: { piano: true },
    })
    const plan = agencyData?.piano || 'free'

    // Conta widget attuali (solo quelli non eliminati)
    const currentCount = await prisma.widgetConfig.count({
      where: {
        agencyId: agency.agencyId,
        isActive: true
      },
    })

    // Verifica limite widget
    if (!canCreateWidget(plan, currentCount)) {
      return NextResponse.json(
        { error: 'Hai raggiunto il limite di widget per il tuo piano. Upgrade per crearne altri.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      mode = 'bubble',
      themeName = 'default',
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      borderRadius,
      buttonStyle,
      bubblePosition,
      bubbleIcon,
      showBadge,
      bubbleAnimation,
      inlineHeight,
      showHeader,
      showBorder,
      customCss,
      logoUrl,
    } = body

    // Validazioni
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome widget richiesto (min 2 caratteri)' }, { status: 400 })
    }

    if (!['bubble', 'inline'].includes(mode)) {
      return NextResponse.json({ error: 'Modalità non valida' }, { status: 400 })
    }

    // Valida colori
    if (primaryColor && !isValidHexColor(primaryColor)) {
      return NextResponse.json({ error: 'Colore primario non valido' }, { status: 400 })
    }

    // Verifica permessi branding custom (solo logo)
    // I colori sono permessi a tutti i piani tramite selezione tema
    if (logoUrl && !canUseCustomBranding(plan)) {
      return NextResponse.json(
        { error: 'Upload logo non disponibile nel tuo piano' },
        { status: 403 }
      )
    }

    // Verifica permessi CSS custom
    if (customCss && !canUseCustomCss(plan)) {
      return NextResponse.json(
        { error: 'CSS personalizzato non disponibile nel tuo piano' },
        { status: 403 }
      )
    }

    // Genera widgetId unico
    const widgetId = `wgt_${nanoid(16)}`

    // Se è il primo widget, rendilo default
    const isDefault = currentCount === 0

    // Crea widget
    const widgetConfig = await prisma.widgetConfig.create({
      data: {
        agencyId: agency.agencyId,
        widgetId,
        name: name.trim(),
        mode,
        isDefault,
        themeName,
        primaryColor: primaryColor || '#2563eb',
        secondaryColor: secondaryColor || undefined,
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#1f2937',
        fontFamily: fontFamily || 'system-ui, -apple-system, sans-serif',
        borderRadius: borderRadius || '8px',
        buttonStyle: buttonStyle || 'rounded',
        bubblePosition: bubblePosition || 'bottom-right',
        bubbleIcon: bubbleIcon || undefined,
        showBadge: showBadge !== undefined ? showBadge : true,
        bubbleAnimation: bubbleAnimation || 'pulse',
        inlineHeight: inlineHeight || '600px',
        showHeader: showHeader !== undefined ? showHeader : true,
        showBorder: showBorder !== undefined ? showBorder : true,
        customCss: customCss ? sanitizeCSS(customCss) : undefined,
        logoUrl: logoUrl || undefined,
      },
    })

    return NextResponse.json({ widgetConfig }, { status: 201 })
  } catch (error) {
    console.error('Errore POST widget-config:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// PUT /api/widget-config - Aggiorna widget esistente
export async function PUT(request: Request) {
  try {
    const agency = await getAuthAgency()
    if (!agency) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID widget richiesto' }, { status: 400 })
    }

    // Verifica che il widget appartenga all'agenzia
    const existingWidget = await prisma.widgetConfig.findFirst({
      where: {
        id,
        agencyId: agency.agencyId,
      },
    })

    if (!existingWidget) {
      return NextResponse.json({ error: 'Widget non trovato' }, { status: 404 })
    }

    // Ottieni piano agenzia
    const agencyData = await prisma.agency.findUnique({
      where: { id: agency.agencyId },
      select: { piano: true },
    })
    const plan = agencyData?.piano || 'free'

    // Verifica permessi branding custom (solo logo)
    if (updates.logoUrl && !canUseCustomBranding(plan)) {
      return NextResponse.json(
        { error: 'Upload logo non disponibile nel tuo piano' },
        { status: 403 }
      )
    }

    if (updates.customCss && !canUseCustomCss(plan)) {
      return NextResponse.json(
        { error: 'CSS personalizzato non disponibile nel tuo piano' },
        { status: 403 }
      )
    }

    // Valida colori
    if (updates.primaryColor && !isValidHexColor(updates.primaryColor)) {
      return NextResponse.json({ error: 'Colore primario non valido' }, { status: 400 })
    }

    // Se imposta isDefault, rimuovi default dagli altri
    if (updates.isDefault === true) {
      await prisma.widgetConfig.updateMany({
        where: {
          agencyId: agency.agencyId,
          id: { not: id },
        },
        data: { isDefault: false },
      })
    }

    // Sanitizza CSS
    if (updates.customCss) {
      updates.customCss = sanitizeCSS(updates.customCss)
    }

    // Aggiorna widget
    const widgetConfig = await prisma.widgetConfig.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({ widgetConfig })
  } catch (error) {
    console.error('Errore PUT widget-config:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// DELETE /api/widget-config - Elimina widget (hard delete dal database)
export async function DELETE(request: Request) {
  try {
    const agency = await getAuthAgency()
    if (!agency) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID widget richiesto' }, { status: 400 })
    }

    // Verifica che il widget appartenga all'agenzia
    const existingWidget = await prisma.widgetConfig.findFirst({
      where: {
        id,
        agencyId: agency.agencyId,
      },
    })

    if (!existingWidget) {
      return NextResponse.json({ error: 'Widget non trovato' }, { status: 404 })
    }

    // Non permettere eliminazione del widget default se ci sono altri widget
    if (existingWidget.isDefault) {
      const otherWidgets = await prisma.widgetConfig.count({
        where: {
          agencyId: agency.agencyId,
          id: { not: id },
        },
      })

      if (otherWidgets > 0) {
        return NextResponse.json(
          { error: 'Non puoi eliminare il widget predefinito. Imposta prima un altro widget come predefinito.' },
          { status: 400 }
        )
      }
    }

    // Se era il default, imposta un altro widget come default prima di eliminarlo
    if (existingWidget.isDefault) {
      const nextDefault = await prisma.widgetConfig.findFirst({
        where: {
          agencyId: agency.agencyId,
          id: { not: id },
        },
        orderBy: { createdAt: 'asc' },
      })

      if (nextDefault) {
        await prisma.widgetConfig.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        })
      }
    }

    // Hard delete - elimina completamente dal database
    await prisma.widgetConfig.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Widget eliminato definitivamente dal database',
      success: true
    })
  } catch (error) {
    console.error('Errore DELETE widget-config:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
