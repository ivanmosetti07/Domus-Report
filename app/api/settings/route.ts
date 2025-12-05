import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET /api/settings - Ottieni settings agenzia
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

    // Ottieni settings
    let settings = await prisma.agencySetting.findUnique({
      where: { agencyId: agency.agencyId },
    })

    // Se non esistono, crea settings default
    if (!settings) {
      settings = await prisma.agencySetting.create({
        data: {
          agencyId: agency.agencyId,
          notificationsEmail: true,
          emailOnNewLead: true,
          timeZone: 'Europe/Rome',
          language: 'it',
          widgetTheme: 'default',
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Errore GET settings:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// PUT /api/settings - Aggiorna settings
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
    const {
      notificationsEmail,
      emailOnNewLead,
      timeZone,
      language,
      widgetTheme,
      customCss,
      brandColors,
      dateFormat,
    } = body

    // Verifica se esistono già settings
    const existingSettings = await prisma.agencySetting.findUnique({
      where: { agencyId: agency.agencyId },
    })

    let settings

    if (existingSettings) {
      // Aggiorna settings esistenti
      settings = await prisma.agencySetting.update({
        where: { agencyId: agency.agencyId },
        data: {
          notificationsEmail: notificationsEmail !== undefined ? notificationsEmail : existingSettings.notificationsEmail,
          emailOnNewLead: emailOnNewLead !== undefined ? emailOnNewLead : existingSettings.emailOnNewLead,
          timeZone: timeZone || existingSettings.timeZone,
          language: language || existingSettings.language,
          widgetTheme: widgetTheme || existingSettings.widgetTheme,
          customCss: customCss !== undefined ? customCss : existingSettings.customCss,
          brandColors: brandColors !== undefined ? brandColors : existingSettings.brandColors,
          dateFormat: dateFormat || existingSettings.dateFormat,
        },
      })
    } else {
      // Crea nuovi settings
      settings = await prisma.agencySetting.create({
        data: {
          agencyId: agency.agencyId,
          notificationsEmail: notificationsEmail !== undefined ? notificationsEmail : true,
          emailOnNewLead: emailOnNewLead !== undefined ? emailOnNewLead : true,
          timeZone: timeZone || 'Europe/Rome',
          language: language || 'it',
          widgetTheme: widgetTheme || 'default',
          customCss: customCss || null,
          brandColors: brandColors || null,
          dateFormat: dateFormat || 'DD/MM/YYYY',
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Errore PUT settings:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
