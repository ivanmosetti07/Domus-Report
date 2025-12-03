"use client"

import { useRouter } from "next/navigation"
import { LeadStatusManager } from "./lead-status-manager"

interface LeadStatus {
  id: string
  status: string
  note: string | null
  createdAt: string
  createdByAgencyId: string
}

interface LeadStatusWrapperProps {
  leadId: string
  currentStatus: string
  statuses: LeadStatus[]
}

export function LeadStatusWrapper({ leadId, currentStatus, statuses }: LeadStatusWrapperProps) {
  const router = useRouter()

  const handleStatusUpdate = () => {
    // Refresh the page to get updated data
    router.refresh()
  }

  return (
    <LeadStatusManager
      leadId={leadId}
      currentStatus={currentStatus}
      statuses={statuses}
      onStatusUpdate={handleStatusUpdate}
    />
  )
}
