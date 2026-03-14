import crypto from 'crypto'
import { prisma } from './prisma'

// ─── Unsubscribe URL ─────────────────────────────────────────────────────────

export function generateUnsubscribeUrl(email: string): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || 'domus-report-unsubscribe-secret'
  const token = crypto.createHmac('sha256', secret).update(email).digest('hex')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domusreport.it'
  return `${appUrl}/api/email/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || 'domus-report-unsubscribe-secret'
  const expectedToken = crypto.createHmac('sha256', secret).update(email).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))
}

// ─── Unsubscribe check ──────────────────────────────────────────────────────

export async function isUnsubscribed(email: string): Promise<boolean> {
  const record = await prisma.emailUnsubscribe.findUnique({ where: { email } })
  return !!record
}

// ─── Enroll in campaign ─────────────────────────────────────────────────────

interface EnrollParams {
  campaignName: string
  recipientEmail: string
  recipientName?: string
  recipientType: 'demo_lead' | 'agency'
  recipientId: string
  metadata?: Record<string, unknown>
}

export async function enrollInCampaign(params: EnrollParams): Promise<{ enrolled: boolean; reason?: string }> {
  // 1. Check unsubscribe
  if (await isUnsubscribed(params.recipientEmail)) {
    return { enrolled: false, reason: 'unsubscribed' }
  }

  // 2. Find active campaign
  const campaign = await prisma.emailCampaign.findFirst({
    where: { name: params.campaignName, isActive: true },
    include: { steps: { where: { isActive: true }, orderBy: { stepOrder: 'asc' } } }
  })
  if (!campaign) {
    return { enrolled: false, reason: 'campaign_not_found' }
  }

  // 3. Check if already enrolled (avoid duplicates)
  const existing = await prisma.emailSend.findFirst({
    where: {
      campaignId: campaign.id,
      recipientId: params.recipientId,
      recipientType: params.recipientType,
      status: { in: ['pending', 'sent'] }
    }
  })
  if (existing) {
    return { enrolled: false, reason: 'already_enrolled' }
  }

  // 4. Create EmailSend for each step
  const now = new Date()
  const sends = campaign.steps.map(step => ({
    campaignId: campaign.id,
    stepId: step.id,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName || null,
    recipientType: params.recipientType,
    recipientId: params.recipientId,
    status: 'pending',
    scheduledAt: new Date(now.getTime() + step.delayHours * 60 * 60 * 1000),
    metadata: (params.metadata || {}) as any
  }))

  await prisma.emailSend.createMany({ data: sends })

  console.log(`[email-marketing] Enrolled ${params.recipientEmail} in campaign "${params.campaignName}" (${sends.length} steps)`)

  return { enrolled: true }
}

// ─── Cancel campaign for recipient ──────────────────────────────────────────

export async function cancelCampaignForRecipient(params: {
  campaignName: string
  recipientId: string
}): Promise<number> {
  const campaign = await prisma.emailCampaign.findFirst({
    where: { name: params.campaignName }
  })
  if (!campaign) return 0

  const result = await prisma.emailSend.updateMany({
    where: {
      campaignId: campaign.id,
      recipientId: params.recipientId,
      status: 'pending'
    },
    data: { status: 'cancelled' }
  })

  if (result.count > 0) {
    console.log(`[email-marketing] Cancelled ${result.count} pending emails for recipient ${params.recipientId} in campaign "${params.campaignName}"`)
  }

  return result.count
}

// ─── Template resolver ──────────────────────────────────────────────────────

import {
  generateDemoNurtureStep1HTML, generateDemoNurtureStep1Text,
  generateDemoNurtureStep2HTML, generateDemoNurtureStep2Text,
  generateDemoNurtureStep3HTML, generateDemoNurtureStep3Text,
  generateOnboardingStep1HTML, generateOnboardingStep1Text,
  generateOnboardingStep2HTML, generateOnboardingStep2Text,
  generateOnboardingStep3HTML, generateOnboardingStep3Text,
  generateFreeUpgradeStep1HTML, generateFreeUpgradeStep1Text,
  generateFreeUpgradeStep2HTML, generateFreeUpgradeStep2Text,
  generateFreeUpgradeStep3HTML, generateFreeUpgradeStep3Text,
} from './email-marketing-templates'

export function resolveTemplate(
  templateKey: string,
  metadata: Record<string, unknown>,
  recipientEmail: string
): { html: string; text: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://domusreport.it'
  const unsubscribeUrl = generateUnsubscribeUrl(recipientEmail)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...metadata, appUrl, unsubscribeUrl }

  switch (templateKey) {
    // Flusso A: Demo Nurture
    case 'demo_nurture_step_1':
      return { html: generateDemoNurtureStep1HTML(data), text: generateDemoNurtureStep1Text(data) }
    case 'demo_nurture_step_2':
      return { html: generateDemoNurtureStep2HTML(data), text: generateDemoNurtureStep2Text(data) }
    case 'demo_nurture_step_3':
      return { html: generateDemoNurtureStep3HTML(data), text: generateDemoNurtureStep3Text(data) }

    // Flusso B: Onboarding Completion
    case 'onboarding_step_1':
      return { html: generateOnboardingStep1HTML(data), text: generateOnboardingStep1Text(data) }
    case 'onboarding_step_2':
      return { html: generateOnboardingStep2HTML(data), text: generateOnboardingStep2Text(data) }
    case 'onboarding_step_3':
      return { html: generateOnboardingStep3HTML(data), text: generateOnboardingStep3Text(data) }

    // Flusso C: Free Upgrade
    case 'free_upgrade_step_1':
      return { html: generateFreeUpgradeStep1HTML(data), text: generateFreeUpgradeStep1Text(data) }
    case 'free_upgrade_step_2':
      return { html: generateFreeUpgradeStep2HTML(data), text: generateFreeUpgradeStep2Text(data) }
    case 'free_upgrade_step_3':
      return { html: generateFreeUpgradeStep3HTML(data), text: generateFreeUpgradeStep3Text(data) }

    default:
      throw new Error(`Template email sconosciuto: ${templateKey}`)
  }
}
