import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cron/check-trials - Controlla trial scaduti e downgrade a free
// Questo endpoint dovrebbe essere chiamato da un cron job giornaliero
export async function GET(request: Request) {
  try {
    // Verifica autorizzazione cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const now = new Date()

    // Trova tutti i trial scaduti
    const expiredTrials = await prisma.subscription.findMany({
      where: {
        status: 'trial',
        trialEndsAt: { lt: now }
      },
      include: {
        agency: {
          select: { id: true, email: true, nome: true }
        }
      }
    })

    console.log(`Trovati ${expiredTrials.length} trial scaduti`)

    const results = {
      processed: 0,
      downgraded: 0,
      errors: [] as string[]
    }

    for (const subscription of expiredTrials) {
      try {
        // Downgrade a free
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              planType: 'free',
              status: 'expired',
              cancelledAt: now
            }
          }),
          prisma.agency.update({
            where: { id: subscription.agencyId },
            data: { piano: 'free' }
          }),
          // Crea notifica
          prisma.notification.create({
            data: {
              agencyId: subscription.agencyId,
              type: 'TRIAL_EXPIRED',
              title: 'Periodo di prova terminato',
              message: 'Il tuo periodo di prova Premium è terminato. Sei stato riportato al piano Free. Effettua l\'upgrade per continuare a utilizzare tutte le funzionalità.'
            }
          })
        ])

        results.downgraded++

        // Invia email (se Resend è configurato)
        if (process.env.RESEND_API_KEY && subscription.agency) {
          try {
            const { Resend } = await import('resend')
            const resend = new Resend(process.env.RESEND_API_KEY)

            await resend.emails.send({
              from: 'Domus Report <noreply@domusreport.com>',
              to: subscription.agency.email,
              subject: 'Il tuo periodo di prova è terminato',
              html: `
                <h1>Ciao ${subscription.agency.nome}!</h1>
                <p>Il tuo periodo di prova Premium di 14 giorni è terminato.</p>
                <p>Sei stato riportato al piano Free con funzionalità limitate:</p>
                <ul>
                  <li>1 widget</li>
                  <li>50 lead/mese</li>
                  <li>Analytics base</li>
                </ul>
                <p>Per continuare a utilizzare tutte le funzionalità Premium, effettua l'upgrade.</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Effettua l'upgrade</a></p>
                <p>Grazie per aver provato Domus Report!</p>
              `
            })
          } catch (emailError) {
            console.error('Errore invio email trial scaduto:', emailError)
          }
        }

        results.processed++
      } catch (error) {
        console.error(`Errore processing trial ${subscription.id}:`, error)
        results.errors.push(`Trial ${subscription.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processati ${results.processed} trial, ${results.downgraded} downgrade effettuati`,
      results
    })
  } catch (error) {
    console.error('Errore cron check-trials:', error)
    return NextResponse.json({
      error: 'Errore durante il controllo dei trial'
    }, { status: 500 })
  }
}
