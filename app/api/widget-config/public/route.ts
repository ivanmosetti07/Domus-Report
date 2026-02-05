import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/widget-config/public?widgetId=xxx - Fetch widget config pubblicamente
// Questa API è pubblica e non richiede autenticazione
// Viene usata dal widget embed per caricare la configurazione
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const widgetId = searchParams.get('widgetId')

    if (!widgetId) {
      return NextResponse.json(
        { error: 'widgetId richiesto' },
        { status: 400 }
      )
    }

    // Widget demo per testing
    if (widgetId === 'TEST' || widgetId === 'DEMO') {
      const demoConfig = {
        id: 'demo-widget',
        widgetId: widgetId,
        name: 'Widget Demo',
        mode: 'bubble',
        isActive: true,
        themeName: 'default',
        primaryColor: '#3b82f6',
        secondaryColor: '#2563eb',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px',
        buttonStyle: 'gradient',
        bubblePosition: 'bottom-right',
        bubbleIcon: null,
        showBadge: true,
        bubbleAnimation: 'pulse',
        inlineHeight: '600px',
        showHeader: true,
        showBorder: true,
        customCss: null,
        logoUrl: null,
        sendButtonColor: '#3b82f6',
        sendButtonIconColor: '#ffffff',
        agencyName: 'DomusReport Demo',
      }
      return NextResponse.json({ widgetConfig: demoConfig })
    }

    // Cerca widget config per widgetId pubblico
    const widgetConfig = await prisma.widgetConfig.findUnique({
      where: { widgetId },
      select: {
        id: true,
        widgetId: true,
        name: true,
        mode: true,
        isActive: true,
        themeName: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        textColor: true,
        fontFamily: true,
        borderRadius: true,
        buttonStyle: true,
        bubblePosition: true,
        bubbleIcon: true,
        showBadge: true,
        bubbleAnimation: true,
        inlineHeight: true,
        showHeader: true,
        showBorder: true,
        customCss: true,
        logoUrl: true,
        sendButtonColor: true,
        sendButtonIconColor: true,
        // Includiamo il nome dell'agenzia per il messaggio di benvenuto
        agency: {
          select: {
            nome: true,
          },
        },
      },
    })

    if (!widgetConfig) {
      return NextResponse.json(
        { error: 'Widget non trovato' },
        { status: 404 }
      )
    }

    if (!widgetConfig.isActive) {
      return NextResponse.json(
        { error: 'Widget non attivo' },
        { status: 404 }
      )
    }

    // Incrementa impressions in background (non bloccante)
    prisma.widgetConfig.update({
      where: { widgetId },
      data: { impressions: { increment: 1 } },
    }).catch((err) => {
      console.error('Error incrementing impressions:', err)
    })

    // Estrai il nome dell'agenzia e aggiungilo alla risposta
    const { agency, ...configWithoutAgency } = widgetConfig
    const responseConfig = {
      ...configWithoutAgency,
      agencyName: agency?.nome || 'DomusReport',
    }

    return NextResponse.json({ widgetConfig: responseConfig })
  } catch (error) {
    console.error('Errore GET widget-config/public:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
