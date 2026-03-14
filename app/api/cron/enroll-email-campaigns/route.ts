import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrollInCampaign } from '@/lib/email-marketing'

// GET /api/cron/enroll-email-campaigns — Identifica e enrolla utenti nei flussi B e C
// Schedule: ogni giorno alle 06:00 (0 6 * * *)
export async function GET(request: Request) {
  try {
    // Verifica autorizzazione cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domusreport.it'

    const results = {
      flowB: { found: 0, enrolled: 0, skipped: 0 },
      flowC: { found: 0, enrolled: 0, skipped: 0 }
    }

    // ═══════════════════════════════════════════════════════════════
    // FLUSSO B: Agenzie registrate senza widget configurato
    // Condizioni: subscription attiva/trial, nessun WidgetConfig attivo, registrata da >24h
    // ═══════════════════════════════════════════════════════════════

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const agenciesWithoutWidget = await prisma.agency.findMany({
      where: {
        attiva: true,
        dataCreazione: { lt: oneDayAgo },
        subscription: {
          status: { in: ['active', 'trial'] }
        },
        widgetConfigs: {
          none: { isActive: true }
        }
      },
      select: { id: true, email: true, nome: true }
    })

    results.flowB.found = agenciesWithoutWidget.length
    console.log(`[enroll-campaigns] Flusso B: trovate ${agenciesWithoutWidget.length} agenzie senza widget`)

    for (const agency of agenciesWithoutWidget) {
      const result = await enrollInCampaign({
        campaignName: 'onboarding_completion',
        recipientEmail: agency.email,
        recipientName: agency.nome,
        recipientType: 'agency',
        recipientId: agency.id,
        metadata: {
          agencyName: agency.nome,
          appUrl
        }
      })

      if (result.enrolled) {
        results.flowB.enrolled++
      } else {
        results.flowB.skipped++
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // FLUSSO C: Agenzie piano Free con almeno 1 lead, registrate da >7 giorni
    // ═══════════════════════════════════════════════════════════════

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const freeAgencies = await prisma.agency.findMany({
      where: {
        attiva: true,
        dataCreazione: { lt: sevenDaysAgo },
        subscription: {
          planType: 'free',
          status: 'active'
        },
        leads: { some: {} }
      },
      select: {
        id: true,
        email: true,
        nome: true,
        subscription: {
          select: { valuationsUsedThisMonth: true }
        },
        _count: { select: { leads: true } }
      }
    })

    results.flowC.found = freeAgencies.length
    console.log(`[enroll-campaigns] Flusso C: trovate ${freeAgencies.length} agenzie free con lead`)

    for (const agency of freeAgencies) {
      const result = await enrollInCampaign({
        campaignName: 'free_upgrade',
        recipientEmail: agency.email,
        recipientName: agency.nome,
        recipientType: 'agency',
        recipientId: agency.id,
        metadata: {
          agencyName: agency.nome,
          valuationsUsed: agency.subscription?.valuationsUsedThisMonth || 0,
          valuationsLimit: 5,
          leadsGenerated: agency._count.leads,
          appUrl
        }
      })

      if (result.enrolled) {
        results.flowC.enrolled++
      } else {
        results.flowC.skipped++
      }
    }

    console.log(`[enroll-campaigns] Completato:`, results)

    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    console.error('[enroll-campaigns] Error:', error)
    return NextResponse.json(
      { error: 'Errore nell\'enrollment delle campagne' },
      { status: 500 }
    )
  }
}
