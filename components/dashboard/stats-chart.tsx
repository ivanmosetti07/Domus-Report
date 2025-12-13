"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface LeadsByDay {
  date: string
  count: number
}

interface StatsChartProps {
  data: LeadsByDay[]
  title?: string
  description?: string
}

export function StatsChart({ data, title = "Trend Lead", description = "Ultimi 30 giorni" }: StatsChartProps) {
  if (data.length === 0) {
    return null
  }

  // Calculate max value for scaling
  const maxCount = Math.max(...data.map(d => d.count), 1)

  // Calculate trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.count, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.count, 0) / secondHalf.length

  let trendIcon = <Minus className="w-4 h-4 text-foreground-muted" />
  let trendText = "Stabile"
  let trendColor = "text-foreground-muted"

  if (secondAvg > firstAvg * 1.1) {
    trendIcon = <TrendingUp className="w-4 h-4 text-success" />
    trendText = `+${Math.round(((secondAvg - firstAvg) / firstAvg) * 100)}% rispetto a 15 giorni fa`
    trendColor = "text-success"
  } else if (secondAvg < firstAvg * 0.9) {
    trendIcon = <TrendingDown className="w-4 h-4 text-destructive" />
    trendText = `${Math.round(((secondAvg - firstAvg) / firstAvg) * 100)}% rispetto a 15 giorni fa`
    trendColor = "text-destructive"
  }

  return (
    <Card>
      <CardHeader style={{
        paddingBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)',
        padding: 'clamp(0.75rem, 2vw, 1.5rem)'
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{
          gap: 'var(--space-2)'
        }}>
          <div>
            <CardTitle style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>{title}</CardTitle>
            <CardDescription style={{
              fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)',
              marginTop: 'var(--space-1)'
            }}>{description}</CardDescription>
          </div>
          <div className={`flex items-center font-medium ${trendColor}`} style={{
            gap: 'var(--space-1)',
            fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)'
          }}>
            {trendIcon}
            <span className="hidden sm:inline">{trendText}</span>
            <span className="sm:hidden">
              {trendText.includes('+') ? trendText.split(' ')[0] : trendText.split(' ')[0]}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent style={{
        padding: 'clamp(0.75rem, 2vw, 1.5rem)',
        paddingTop: '0'
      }}>
        {/* Simple bar chart */}
        <div className="flex items-end" style={{
          gap: 'clamp(0.125rem, 0.5vw, 0.25rem)',
          height: 'clamp(6rem, 20vw, 8rem)'
        }}>
          {data.map((item, index) => {
            const heightPercentage = (item.count / maxCount) * 100
            const isToday = index === data.length - 1

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center gap-1 group relative"
              >
                {/* Bar */}
                <div className="w-full flex items-end justify-center flex-1">
                  <div
                    className={`w-full rounded-t transition-all duration-180 ${
                      isToday
                        ? 'bg-primary'
                        : item.count > 0
                        ? 'bg-primary/60 hover:bg-primary/80'
                        : 'bg-border'
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  />
                </div>

                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full bg-surface-2 text-foreground rounded-lg whitespace-nowrap pointer-events-none z-10 transition-opacity border border-border shadow-soft-lg" style={{
                  marginBottom: 'var(--space-2)',
                  padding: 'clamp(0.125rem, 0.5vw, 0.25rem) clamp(0.25rem, 1vw, 0.5rem)',
                  fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)'
                }}>
                  {new Date(item.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                  : {item.count} lead{item.count !== 1 ? 's' : ''}
                </div>
              </div>
            )
          })}
        </div>

        {/* X-axis labels (show only some dates to avoid clutter) */}
        <div className="flex items-center justify-between text-foreground-subtle" style={{
          marginTop: 'var(--space-2)',
          fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)'
        }}>
          <span className="truncate">
            {new Date(data[0].date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
          </span>
          {data.length > 2 && (
            <span className="hidden sm:inline truncate">
              {new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
            </span>
          )}
          <span className="truncate">
            {new Date(data[data.length - 1].date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Total */}
        <div className="border-t border-border flex items-center justify-between" style={{
          marginTop: 'clamp(0.5rem, 1.5vw, 0.75rem)',
          paddingTop: 'clamp(0.5rem, 1.5vw, 0.75rem)'
        }}>
          <span className="text-foreground-muted" style={{
            fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)'
          }}>Totale periodo</span>
          <span className="font-semibold text-foreground" style={{
            fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
          }}>
            {data.reduce((sum, d) => sum + d.count, 0)} lead{data.reduce((sum, d) => sum + d.count, 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
