import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { isUnsubscribed, resolveTemplate } from '@/lib/email-marketing'

// GET /api/cron/process-email-queue — Processa la coda email marketing
// Schedule: ogni ora (0 */1 * * *)
export async function GET(request: Request) {
  try {
    // Verifica autorizzazione cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const now = new Date()

    // Trova email pending pronte per l'invio
    const pendingEmails = await prisma.emailSend.findMany({
      where: {
        status: 'pending',
        scheduledAt: { lte: now }
      },
      include: {
        step: true,
        campaign: true
      },
      take: 50,
      orderBy: { scheduledAt: 'asc' }
    })

    console.log(`[process-email-queue] Trovate ${pendingEmails.length} email da processare`)

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const emailSend of pendingEmails) {
      results.processed++

      try {
        // Check unsubscribe
        if (await isUnsubscribed(emailSend.recipientEmail)) {
          await prisma.emailSend.update({
            where: { id: emailSend.id },
            data: { status: 'skipped', sentAt: now }
          })
          results.skipped++
          continue
        }

        // Per il flusso demo_nurture: verifica se il DemoLead si è già convertito
        if (emailSend.campaign.flowType === 'demo_nurture' && emailSend.recipientType === 'demo_lead') {
          const demoLead = await prisma.demoLead.findUnique({
            where: { id: emailSend.recipientId },
            select: { convertedToAgencyId: true }
          })
          if (demoLead?.convertedToAgencyId) {
            await prisma.emailSend.update({
              where: { id: emailSend.id },
              data: { status: 'skipped', sentAt: now }
            })
            results.skipped++
            continue
          }
        }

        // Per flusso onboarding: verifica se l'agenzia ha già configurato un widget
        if (emailSend.campaign.flowType === 'onboarding_completion' && emailSend.recipientType === 'agency') {
          const widgetCount = await prisma.widgetConfig.count({
            where: { agencyId: emailSend.recipientId, isActive: true }
          })
          if (widgetCount > 0) {
            await prisma.emailSend.update({
              where: { id: emailSend.id },
              data: { status: 'skipped', sentAt: now }
            })
            results.skipped++
            continue
          }
        }

        // Per flusso free_upgrade: verifica se l'agenzia ha già fatto upgrade
        if (emailSend.campaign.flowType === 'free_upgrade' && emailSend.recipientType === 'agency') {
          const subscription = await prisma.subscription.findUnique({
            where: { agencyId: emailSend.recipientId },
            select: { planType: true }
          })
          if (subscription && subscription.planType !== 'free') {
            await prisma.emailSend.update({
              where: { id: emailSend.id },
              data: { status: 'skipped', sentAt: now }
            })
            results.skipped++
            continue
          }
        }

        // Genera HTML dal template
        const metadata = (emailSend.metadata as Record<string, unknown>) || {}
        const { html, text } = resolveTemplate(
          emailSend.step.templateKey,
          metadata,
          emailSend.recipientEmail
        )

        // Interpola subject con metadata
        let subject = emailSend.step.subject
        subject = subject.replace('{city}', String(metadata.city || ''))
        subject = subject.replace('{nome}', String(metadata.agencyName || metadata.firstName || ''))
        subject = subject.replace('{remaining}', String(
          Math.max(0, Number(metadata.valuationsLimit || 5) - Number(metadata.valuationsUsed || 0))
        ))

        // Invia email
        const result = await sendEmail({
          to: emailSend.recipientEmail,
          subject,
          html,
          text
        })

        if (result.success) {
          await prisma.emailSend.update({
            where: { id: emailSend.id },
            data: {
              status: 'sent',
              sentAt: now,
              messageId: result.messageId
            }
          })
          results.sent++
        } else {
          await prisma.emailSend.update({
            where: { id: emailSend.id },
            data: {
              status: 'failed',
              failReason: result.error || 'Errore sconosciuto'
            }
          })
          results.failed++
          results.errors.push(`${emailSend.recipientEmail}: ${result.error}`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        await prisma.emailSend.update({
          where: { id: emailSend.id },
          data: {
            status: 'failed',
            failReason: errorMsg
          }
        })
        results.failed++
        results.errors.push(`${emailSend.recipientEmail}: ${errorMsg}`)
      }
    }

    console.log(`[process-email-queue] Completato:`, results)

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error) {
    console.error('[process-email-queue] Error:', error)
    return NextResponse.json(
      { error: 'Errore nel processing della coda email' },
      { status: 500 }
    )
  }
}
