'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DownloadPDFButtonProps {
  leadId: string
  leadName: string
}

export function DownloadPDFButton({ leadId, leadName }: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsGenerating(true)

      const response = await fetch('/api/reports/lead-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella generazione del PDF')
      }

      // Get PDF blob
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${leadName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'PDF generato con successo',
        description: 'Il report è stato scaricato',
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Impossibile generare il PDF',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      {isGenerating ? 'Generazione...' : 'Scarica PDF'}
    </Button>
  )
}
