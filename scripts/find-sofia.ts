import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { nome: { contains: 'Sofia', mode: 'insensitive' } },
        { cognome: { contains: 'Scaramuzza', mode: 'insensitive' } }
      ]
    },
    include: {
      property: {
        include: {
          valuation: true
        }
      }
    }
  })
  
  if (leads.length > 0) {
    console.log('Trovato nei Lead:', JSON.stringify(leads, null, 2))
    return;
  }
  
  const properties = await prisma.property.findMany({
    where: {
      indirizzo: { contains: 'Sofia', mode: 'insensitive' }
    },
    include: {
      valuation: true,
      lead: true
    }
  })
  
  if (properties.length > 0) {
    console.log('Trovato in Property:', JSON.stringify(properties, null, 2))
    return;
  }
  
  const demoLeads = await prisma.demoLead.findMany({
    where: {
      OR: [
        { nome: { contains: 'Sofia', mode: 'insensitive' } },
        { cognome: { contains: 'Scaramuzza', mode: 'insensitive' } }
      ]
    }
  })
  
  console.log('Trovato nei DemoLead:', JSON.stringify(demoLeads, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
