"use client"

import * as React from "react"
import { Card } from "./card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning'
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  className
}: StatCardProps) {
  const variantColors = {
    default: 'border-border bg-surface-2',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5'
  }

  return (
    <Card className={cn(
      "p-4 sm:p-6 card-lift group",
      variantColors[variant],
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-foreground-muted mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground truncate">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="truncate">{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 sm:p-3 bg-primary/10 rounded-xl flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-180">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
