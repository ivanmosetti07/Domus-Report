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
    <header className={cn("border-b border-border pb-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0 space-y-2">
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-foreground-muted md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex w-full flex-wrap gap-3 md:w-auto md:justify-end">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
