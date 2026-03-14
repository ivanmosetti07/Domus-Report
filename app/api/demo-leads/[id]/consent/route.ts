import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrollInCampaign } from '@/lib/email-marketing'

// POST /api/demo-leads/[id]/consent — Aggiorna consenso email e enrolla nel flusso nurture
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const demoLead = await prisma.demoLead.findUnique({
      where: { id }
    })

    if (!demoLead) {
      return NextResponse.json({ error: 'Demo lead non trovato' }, { status: 404 })
    }

    if (demoLead.emailConsent) {
      return NextResponse.json({ success: true, message: 'Consenso già registrato' })
    }

    // Aggiorna consenso
    await prisma.demoLead.update({
      where: { id },
      data: { emailConsent: true }
    })

    // Enrolla nel flusso A: demo_nurture
    const result = await enrollInCampaign({
      campaignName: 'demo_nurture',
      recipientEmail: demoLead.email,
      recipientName: `${demoLead.nome} ${demoLead.cognome}`.trim(),
      recipientType: 'demo_lead',
      recipientId: demoLead.id,
      metadata: {
        firstName: demoLead.nome,
        city: demoLead.citta,
        estimatedPrice: demoLead.prezzoStimato
      }
    })

    console.log(`[consent] DemoLead ${id} consent updated, enrollment:`, result)

    return NextResponse.json({ success: true, enrolled: result.enrolled })
  } catch (error) {
    console.error('[consent] Error:', error)
    return NextResponse.json(
      { error: 'Errore nel salvataggio del consenso' },
      { status: 500 }
    )
  }
}
