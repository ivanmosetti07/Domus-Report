'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, FileSpreadsheet } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { exportLeadsToCSV, exportLeadsToExcel } from '@/lib/export-utils'

interface ExportLeadsButtonsProps {
  leads: any[]
  agencyName: string
}

export function ExportLeadsButtons({ leads, agencyName }: ExportLeadsButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExportCSV = () => {
    try {
      setIsExporting(true)

      if (leads.length === 0) {
        toast({
          title: 'Nessun lead da esportare',
          description: 'Non ci sono lead disponibili per l\'export',
          variant: 'destructive',
        })
        return
      }

      exportLeadsToCSV(leads, agencyName)

      toast({
        title: 'Export CSV completato',
        description: `Esportati ${leads.length} lead in formato CSV`,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile esportare i lead in CSV',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = () => {
    try {
      setIsExporting(true)

      if (leads.length === 0) {
        toast({
          title: 'Nessun lead da esportare',
          description: 'Non ci sono lead disponibili per l\'export',
          variant: 'destructive',
        })
        return
      }

      exportLeadsToExcel(leads, agencyName)

      toast({
        title: 'Export Excel completato',
        description: `Esportati ${leads.length} lead in formato Excel con 3 fogli`,
      })
    } catch (error) {
      console.error('Error exporting Excel:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile esportare i lead in Excel',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportCSV}
        disabled={isExporting || leads.length === 0}
        variant="outline"
        className="gap-2"
      >
        <FileDown className="w-4 h-4" />
        Esporta CSV
      </Button>
      <Button
        onClick={handleExportExcel}
        disabled={isExporting || leads.length === 0}
        variant="outline"
        className="gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Esporta Excel
      </Button>
    </div>
  )
}
