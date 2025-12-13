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
    <Card
      className={cn(
        "card-lift group p-6",
        variantColors[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm font-medium text-foreground-muted truncate">{label}</p>
          <p className="text-3xl font-bold leading-tight text-foreground truncate">{value}</p>
          {trend && (
            <div
              className={cn(
                "mt-1 flex items-center gap-2 text-sm font-semibold",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="truncate">{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="rounded-2xl bg-primary/10 p-3 text-primary group-hover:bg-primary/15">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
