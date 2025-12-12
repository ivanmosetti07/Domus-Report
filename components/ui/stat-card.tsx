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
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50'
  }

  return (
    <Card className={cn(
      "p-4 sm:p-6 hover:shadow-md transition-shadow",
      variantColors[variant],
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
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
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
