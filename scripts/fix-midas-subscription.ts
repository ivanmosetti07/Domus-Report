/**
 * Script per correggere manualmente la subscription del cliente Midas
 *
 * Esegui con: npx tsx scripts/fix-midas-subscription.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMidasSubscription() {
  const email = 'midasimmobiliareroma@gmail.com'
  const newPlan = 'basic'

  console.log(`\n🔍 Cercando agenzia con email: ${email}...\n`)

  // 1. Trova l'agenzia
  const agency = await prisma.agency.findUnique({
    where: { email },
    include: { subscription: true }
  })

  if (!agency) {
    console.error(`❌ Agenzia non trovata con email: ${email}`)
    process.exit(1)
  }

  console.log(`✅ Agenzia trovata:`)
  console.log(`   - ID: ${agency.id}`)
  console.log(`   - Nome: ${agency.nome}`)
  console.log(`   - Piano attuale (Agency): ${agency.piano}`)
  console.log(`   - Piano attuale (Subscription): ${agency.subscription?.planType || 'N/A'}`)
  console.log(`   - Status Subscription: ${agency.subscription?.status || 'N/A'}`)
  console.log(`   - Stripe Customer ID: ${agency.subscription?.stripeCustomerId || 'N/A'}`)
  console.log(`   - Stripe Subscription ID: ${agency.subscription?.stripeSubscriptionId || 'N/A'}`)

  // 2. Aggiorna l'agenzia
  console.log(`\n🔄 Aggiornando piano a "${newPlan}"...\n`)

  const updatedAgency = await prisma.agency.update({
    where: { id: agency.id },
    data: { piano: newPlan }
  })

  console.log(`✅ Agency.piano aggiornato a: ${updatedAgency.piano}`)

  // 3. Aggiorna o crea la subscription
  if (agency.subscription) {
    const updatedSubscription = await prisma.subscription.update({
      where: { agencyId: agency.id },
      data: {
        planType: newPlan,
        status: 'active',
        // Reset valutazioni usate se necessario
        valuationsUsedThisMonth: 0,
        valuationsResetDate: new Date()
      }
    })

    console.log(`✅ Subscription aggiornata:`)
    console.log(`   - planType: ${updatedSubscription.planType}`)
    console.log(`   - status: ${updatedSubscription.status}`)
  } else {
    // Crea una nuova subscription se non esiste
    const newSubscription = await prisma.subscription.create({
      data: {
        agencyId: agency.id,
        planType: newPlan,
        status: 'active',
        valuationsUsedThisMonth: 0,
        valuationsResetDate: new Date()
      }
    })

    console.log(`✅ Nuova Subscription creata:`)
    console.log(`   - ID: ${newSubscription.id}`)
    console.log(`   - planType: ${newSubscription.planType}`)
    console.log(`   - status: ${newSubscription.status}`)
  }

  console.log(`\n🎉 Correzione completata con successo!`)
  console.log(`   Il cliente Midas ora ha il piano: ${newPlan}`)
  console.log(`   Limiti: 3 widget, 50 valutazioni/mese\n`)
}

fixMidasSubscription()
  .catch((error) => {
    console.error('❌ Errore durante la correzione:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
