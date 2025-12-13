import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("border-b border-border", className)} style={{
      paddingBottom: 'clamp(1rem, 2vw, 1.25rem)'
    }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{
        gap: 'clamp(0.75rem, 2vw, 1rem)'
      }}>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-foreground truncate" style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.875rem)',
            lineHeight: 'var(--leading-tight)'
          }}>{title}</h1>
          {subtitle && (
            <p className="text-foreground-muted" style={{
              marginTop: 'clamp(0.25rem, 1vw, 0.5rem)',
              fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
              lineHeight: 'var(--leading-normal)'
            }}>{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center flex-shrink-0" style={{
            gap: 'clamp(0.5rem, 1.5vw, 0.75rem)'
          }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
