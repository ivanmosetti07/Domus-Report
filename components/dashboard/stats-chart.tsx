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

  let trendIcon = <Minus className="w-4 h-4 text-gray-500" />
  let trendText = "Stabile"
  let trendColor = "text-gray-600"

  if (secondAvg > firstAvg * 1.1) {
    trendIcon = <TrendingUp className="w-4 h-4 text-green-600" />
    trendText = `+${Math.round(((secondAvg - firstAvg) / firstAvg) * 100)}% rispetto a 15 giorni fa`
    trendColor = "text-green-600"
  } else if (secondAvg < firstAvg * 0.9) {
    trendIcon = <TrendingDown className="w-4 h-4 text-red-600" />
    trendText = `${Math.round(((secondAvg - firstAvg) / firstAvg) * 100)}% rispetto a 15 giorni fa`
    trendColor = "text-red-600"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs mt-1">{description}</CardDescription>
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            {trendIcon}
            <span>{trendText}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple bar chart */}
        <div className="flex items-end gap-1 h-32">
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
                    className={`w-full rounded-t transition-all ${
                      isToday
                        ? 'bg-primary'
                        : item.count > 0
                        ? 'bg-primary/60 hover:bg-primary/80'
                        : 'bg-gray-200'
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  />
                </div>

                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10 transition-opacity">
                  {new Date(item.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                  : {item.count} lead{item.count !== 1 ? 's' : ''}
                </div>
              </div>
            )
          })}
        </div>

        {/* X-axis labels (show only some dates to avoid clutter) */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>
            {new Date(data[0].date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
          </span>
          {data.length > 2 && (
            <span>
              {new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
            </span>
          )}
          <span>
            {new Date(data[data.length - 1].date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Total */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <span className="text-xs text-gray-600">Totale periodo</span>
          <span className="text-sm font-semibold text-gray-900">
            {data.reduce((sum, d) => sum + d.count, 0)} lead{data.reduce((sum, d) => sum + d.count, 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
