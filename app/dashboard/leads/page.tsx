import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getAuthAgency } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LeadsTableClient } from "@/components/dashboard/leads-table-client"
import { ExportLeadsButtons } from "@/components/dashboard/export-leads-buttons"

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  // Get authenticated agency
  const agency = await getAuthAgency()

  if (!agency) {
    return null // Middleware should prevent this
  }

  // Fetch leads from database with relations
  const leads = await prisma.lead.findMany({
    where: {
      agenziaId: agency.agencyId,
    },
    include: {
      property: true,
    },
    orderBy: {
      dataRichiesta: "desc", // Most recent first
    },
  })

  if (leads.length === 0) {
    return (
      <div>
        <PageHeader title="I tuoi Lead" />
        <EmptyState
          icon={<Users className="w-20 h-20" />}
          title="Nessun lead ancora"
          description="Installa il widget sul tuo sito per iniziare a raccogliere lead qualificati"
          action={
            <Button asChild>
              <Link href="/dashboard">Installa Widget</Link>
            </Button>
          }
        />
      </div>
    )
  }

  // Fetch agency data for export
  const agencyData = await prisma.agency.findUnique({
    where: { id: agency.agencyId },
  })

  // Fetch leads with statuses for export
  const leadsWithStatuses = await prisma.lead.findMany({
    where: {
      agenziaId: agency.agencyId,
    },
    include: {
      property: {
        include: {
          valuation: true,
        },
      },
      statuses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: {
      dataRichiesta: "desc",
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="I tuoi Lead"
          subtitle={`${leads.length} lead ${leads.length === 1 ? "trovato" : "trovati"}`}
        />
        <ExportLeadsButtons
          leads={leadsWithStatuses}
          agencyName={agencyData?.nome || 'Agenzia'}
        />
      </div>

      {/* Use client component for interactive features */}
      <LeadsTableClient leads={leads} />
    </div>
  )
}
