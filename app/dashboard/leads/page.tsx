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
            <Link href="/dashboard">
              <Button>Installa Widget</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="I tuoi Lead"
        subtitle={`${leads.length} lead ${leads.length === 1 ? "trovato" : "trovati"}`}
      />

      {/* Use client component for interactive features */}
      <LeadsTableClient leads={leads} />
    </div>
  )
}
