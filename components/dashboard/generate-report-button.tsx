'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GenerateReportButtonProps {
  agencyId: string
  agencyName: string
  reportType: 'monthly' | 'converted' | 'followup'
  reportTitle: string
}

export function GenerateReportButton({
  agencyId,
  agencyName,
  reportType,
  reportTitle,
}: GenerateReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)

      const response = await fetch('/api/reports/performance-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencyId,
          reportType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella generazione del report')
      }

      // Get PDF blob
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportType}-${agencyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Report generato con successo',
        description: `Il report "${reportTitle}" è stato scaricato`,
      })
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Impossibile generare il report',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
      <Download className="w-4 h-4" />
      {isGenerating ? 'Generazione...' : 'Genera Report'}
    </Button>
  )
}
