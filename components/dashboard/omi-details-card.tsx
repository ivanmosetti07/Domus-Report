"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface OMIDetailsCardProps {
  citta: string
  zona: string
  valoreMedioMq: number
  valoreMinMq: number
  valoreMaxMq: number
  semestre: number
  anno: number
  fonte: string
}

export function OMIDetailsCard({
  citta,
  zona,
  valoreMedioMq,
  valoreMinMq,
  valoreMaxMq,
  semestre,
  anno,
  fonte,
}: OMIDetailsCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Valori OMI</h3>
            <p className="text-sm text-muted-foreground">
              {citta} - {zona}
            </p>
          </div>
          <Badge variant="secondary">
            Semestre {semestre} {anno}
          </Badge>
        </div>

        {/* Valori principali */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Minimo</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              €{valoreMinMq.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">per m²</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Medio</p>
            <p className="text-2xl font-bold text-primary">
              €{valoreMedioMq.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">per m²</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Massimo</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              €{valoreMaxMq.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">per m²</p>
          </div>
        </div>

        {/* Info fonte */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Fonte dati</p>
            <p className="text-sm font-medium">{fonte}</p>
          </div>

          <a
            href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/omi/banche-dati/quotazioni-immobiliari"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Visita sito OMI
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Info box */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            I valori OMI (Osservatorio del Mercato Immobiliare) sono pubblicati
            dall&apos;Agenzia delle Entrate e rappresentano le quotazioni di mercato per zona.
            Questi dati vengono aggiornati semestralmente e sono utilizzati come base per il
            calcolo della valutazione.
          </p>
        </div>
      </div>
    </Card>
  )
}
