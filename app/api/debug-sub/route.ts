import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const agency = await prisma.agency.findUnique({
            where: { email: 'simonebaia.consulente@gmail.com' },
            include: { subscription: true }
        })
        return NextResponse.json(agency)
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }
        return NextResponse.json({ error: 'Errore sconosciuto' }, { status: 500 })
    }
}
