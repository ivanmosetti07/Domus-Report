import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center",
      className
    )}>
      {icon && (
        <div className="text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="max-w-md text-sm text-foreground-muted">
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}
