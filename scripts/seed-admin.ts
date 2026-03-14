/**
 * Seed script per creare l'admin iniziale.
 * Uso: npx tsx scripts/seed-admin.ts
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding admin...")

  const passwordHash = await bcrypt.hash("MainstreamAgency07%", 12)

  const admin = await prisma.admin.upsert({
    where: { email: "info@domusreport.com" },
    update: {},
    create: {
      nome: "Admin",
      cognome: "DomusReport",
      email: "info@domusreport.com",
      password: passwordHash,
      ruolo: "superadmin",
      attivo: true,
    },
  })

  console.log(`Admin creato: ${admin.email} (id: ${admin.id})`)
}

main()
  .catch((e) => {
    console.error("Errore nel seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
