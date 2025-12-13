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
      "card-lift group",
      variantColors[variant],
      className
    )} style={{
      padding: 'var(--space-md)'
    }}>
      <div className="flex items-start justify-between" style={{
        gap: 'var(--space-3)'
      }}>
        <div className="flex-1 min-w-0" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)'
        }}>
          <p className="font-medium text-foreground-muted truncate" style={{
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-tight)'
          }}>{label}</p>
          <p className="font-bold text-foreground truncate" style={{
            fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
            lineHeight: 'var(--leading-tight)'
          }}>{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )} style={{
              gap: 'var(--space-1)',
              marginTop: 'var(--space-1)',
              fontSize: 'var(--text-sm)'
            }}>
              {trend.isPositive ? (
                <TrendingUp style={{
                  width: 'clamp(0.75rem, 1vw, 1rem)',
                  height: 'clamp(0.75rem, 1vw, 1rem)'
                }} />
              ) : (
                <TrendingDown style={{
                  width: 'clamp(0.75rem, 1vw, 1rem)',
                  height: 'clamp(0.75rem, 1vw, 1rem)'
                }} />
              )}
              <span className="truncate">{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="bg-primary/10 rounded-xl flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-180" style={{
            padding: 'clamp(0.5rem, 1.5vw, 0.75rem)'
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
