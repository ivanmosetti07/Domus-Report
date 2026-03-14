/**
 * Script per creare le 3 campagne email marketing con i relativi step.
 *
 * Uso: npx tsx scripts/seed-email-campaigns.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding email campaigns...')

  // ─── Campagna 1: Demo Nurture (Flusso A) ─────────────────────────────
  const demoNurture = await prisma.emailCampaign.upsert({
    where: { name: 'demo_nurture' },
    update: {
      description: 'Converti utenti demo in agenzie registrate',
      flowType: 'demo_nurture',
      isActive: true
    },
    create: {
      name: 'demo_nurture',
      description: 'Converti utenti demo in agenzie registrate',
      flowType: 'demo_nurture',
      isActive: true
    }
  })

  // Elimina step esistenti per ricreazione pulita
  await prisma.emailCampaignStep.deleteMany({ where: { campaignId: demoNurture.id } })

  await prisma.emailCampaignStep.createMany({
    data: [
      {
        campaignId: demoNurture.id,
        stepOrder: 1,
        delayHours: 1,
        subject: 'La tua valutazione a {city}: ecco come sfruttarla',
        templateKey: 'demo_nurture_step_1'
      },
      {
        campaignId: demoNurture.id,
        stepOrder: 2,
        delayHours: 24,
        subject: 'Come le agenzie generano 3x lead con l\'AI',
        templateKey: 'demo_nurture_step_2'
      },
      {
        campaignId: demoNurture.id,
        stepOrder: 3,
        delayHours: 72,
        subject: 'Ultima possibilita: installa il tuo agente AI',
        templateKey: 'demo_nurture_step_3'
      }
    ]
  })

  console.log(`  Campagna "${demoNurture.name}" creata con 3 step`)

  // ─── Campagna 2: Onboarding Completion (Flusso B) ────────────────────
  const onboardingCompletion = await prisma.emailCampaign.upsert({
    where: { name: 'onboarding_completion' },
    update: {
      description: 'Sollecita agenzie registrate a configurare il widget',
      flowType: 'onboarding_completion',
      isActive: true
    },
    create: {
      name: 'onboarding_completion',
      description: 'Sollecita agenzie registrate a configurare il widget',
      flowType: 'onboarding_completion',
      isActive: true
    }
  })

  await prisma.emailCampaignStep.deleteMany({ where: { campaignId: onboardingCompletion.id } })

  await prisma.emailCampaignStep.createMany({
    data: [
      {
        campaignId: onboardingCompletion.id,
        stepOrder: 1,
        delayHours: 24,
        subject: '{nome}, configura il widget in 2 minuti',
        templateKey: 'onboarding_step_1'
      },
      {
        campaignId: onboardingCompletion.id,
        stepOrder: 2,
        delayHours: 72,
        subject: 'I tuoi competitor stanno gia catturando lead',
        templateKey: 'onboarding_step_2'
      },
      {
        campaignId: onboardingCompletion.id,
        stepOrder: 3,
        delayHours: 168,
        subject: 'Possiamo aiutarti? Il team e qui per te',
        templateKey: 'onboarding_step_3'
      }
    ]
  })

  console.log(`  Campagna "${onboardingCompletion.name}" creata con 3 step`)

  // ─── Campagna 3: Free Upgrade (Flusso C) ─────────────────────────────
  const freeUpgrade = await prisma.emailCampaign.upsert({
    where: { name: 'free_upgrade' },
    update: {
      description: 'Converti utenti Free al piano Basic',
      flowType: 'free_upgrade',
      isActive: true
    },
    create: {
      name: 'free_upgrade',
      description: 'Converti utenti Free al piano Basic',
      flowType: 'free_upgrade',
      isActive: true
    }
  })

  await prisma.emailCampaignStep.deleteMany({ where: { campaignId: freeUpgrade.id } })

  await prisma.emailCampaignStep.createMany({
    data: [
      {
        campaignId: freeUpgrade.id,
        stepOrder: 1,
        delayHours: 168, // 7 giorni
        subject: '{nome}, solo {remaining} valutazioni rimaste',
        templateKey: 'free_upgrade_step_1'
      },
      {
        campaignId: freeUpgrade.id,
        stepOrder: 2,
        delayHours: 336, // 14 giorni
        subject: 'Con Basic avresti generato piu lead',
        templateKey: 'free_upgrade_step_2'
      },
      {
        campaignId: freeUpgrade.id,
        stepOrder: 3,
        delayHours: 504, // 21 giorni
        subject: 'Prova Basic gratis per 7 giorni',
        templateKey: 'free_upgrade_step_3'
      }
    ]
  })

  console.log(`  Campagna "${freeUpgrade.name}" creata con 3 step`)

  console.log('\nSeed completato! 3 campagne con 9 step totali.')
}

main()
  .catch((e) => {
    console.error('Errore nel seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
