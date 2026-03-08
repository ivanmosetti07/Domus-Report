import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const agency = await prisma.agency.findUnique({
        where: { email: 'simonebaia.consulente@gmail.com' },
        include: { subscription: true }
    })
    console.log(JSON.stringify(agency, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
