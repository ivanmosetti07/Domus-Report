"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface PriceHistoryEntry {
  semestre: string
  valoreMedioMq: number
  variazione?: number
}

interface ZoneTrend {
  trend: "crescita" | "stabile" | "decrescita"
  variazioneAnnuale: number
  variazioneUltimoSemestre?: number
  prezzoMedioAttuale: number
  descrizione: string
  icona: string
}

interface PriceHistoryChartProps {
  citta: string
  zona: string
  tipoImmobile?: string
}

export function PriceHistoryChart({
  citta,
  zona,
  tipoImmobile = "residenziale",
}: PriceHistoryChartProps) {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([])
  const [trend, setTrend] = useState<ZoneTrend | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          citta,
          zona,
          tipoImmobile,
          numSemestri: "6",
        })

        const response = await fetch(`/api/price-history?${params}`)

        if (!response.ok) {
          throw new Error("Errore nel caricamento dello storico prezzi")
        }

        const data = await response.json()

        if (data.success) {
          setHistory(data.history)
          setTrend(data.trend)
        } else {
          setError(data.error || "Dati non disponibili")
        }
      } catch (err) {
        console.error("Error fetching price history:", err)
        setError(err instanceof Error ? err.message : "Errore sconosciuto")
      } finally {
        setLoading(false)
      }
    }

    if (citta && zona) {
      fetchPriceHistory()
    }
  }, [citta, zona, tipoImmobile])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Storico prezzi non disponibile</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Nessun dato storico disponibile per questa zona</p>
        </div>
      </Card>
    )
  }

  // Calcola min e max per il grafico
  const values = history.map((h) => h.valoreMedioMq)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue
  const padding = range * 0.1

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Titolo e trend */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Andamento Mercato Zona</h3>
          {trend && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-2xl">{trend.icona}</span>
              <span className="font-medium">{trend.descrizione}</span>
            </div>
          )}
        </div>

        {/* Grafico lineare semplice (SVG) */}
        <div className="relative h-64 border rounded-lg p-4 bg-muted/30">
          <svg className="w-full h-full" viewBox="0 0 600 200">
            {/* Linea griglia orizzontale */}
            <line
              x1="40"
              y1="100"
              x2="590"
              y2="100"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="4"
            />

            {/* Linea del grafico */}
            <polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              points={history
                .map((entry, index) => {
                  const x = 40 + (index / (history.length - 1)) * 550
                  const y =
                    190 -
                    ((entry.valoreMedioMq - minValue + padding) / (range + padding * 2)) *
                      180
                  return `${x},${y}`
                })
                .join(" ")}
            />

            {/* Punti */}
            {history.map((entry, index) => {
              const x = 40 + (index / (history.length - 1)) * 550
              const y =
                190 -
                ((entry.valoreMedioMq - minValue + padding) / (range + padding * 2)) * 180

              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="hsl(var(--primary))"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Label semestre */}
                  <text
                    x={x}
                    y="200"
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    opacity="0.6"
                  >
                    {entry.semestre.replace("-S", " S")}
                  </text>
                </g>
              )
            })}

            {/* Label valore massimo */}
            <text x="5" y="20" fontSize="10" fill="currentColor" opacity="0.6">
              €{maxValue.toLocaleString()}
            </text>

            {/* Label valore minimo */}
            <text x="5" y="195" fontSize="10" fill="currentColor" opacity="0.6">
              €{minValue.toLocaleString()}
            </text>
          </svg>
        </div>

        {/* Tabella dati */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Dettagli per semestre</h4>
          <div className="space-y-1">
            {history
              .slice()
              .reverse()
              .map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm py-2 px-3 rounded-md hover:bg-muted/50"
                >
                  <span className="font-medium">{entry.semestre}</span>
                  <div className="flex items-center gap-3">
                    <span>€{entry.valoreMedioMq.toLocaleString()}/m²</span>
                    {entry.variazione !== undefined && entry.variazione !== 0 && (
                      <span
                        className={
                          entry.variazione > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {entry.variazione > 0 ? "+" : ""}
                        {entry.variazione.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Info footer */}
        {trend && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Prezzo attuale medio:</span>
                <p className="font-semibold">
                  €{trend.prezzoMedioAttuale.toLocaleString()}/m²
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Variazione annuale:</span>
                <p
                  className={`font-semibold ${
                    trend.variazioneAnnuale > 0
                      ? "text-green-600 dark:text-green-400"
                      : trend.variazioneAnnuale < 0
                        ? "text-red-600 dark:text-red-400"
                        : ""
                  }`}
                >
                  {trend.variazioneAnnuale > 0 ? "+" : ""}
                  {trend.variazioneAnnuale.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
