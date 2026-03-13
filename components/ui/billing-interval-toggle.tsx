'use client'

import { type BillingInterval, BILLING_INTERVALS } from '@/lib/plan-limits'

interface BillingIntervalToggleProps {
  value: BillingInterval
  onChange: (interval: BillingInterval) => void
  className?: string
}

const intervals: BillingInterval[] = ['monthly', 'quarterly', 'yearly']

export function BillingIntervalToggle({ value, onChange, className = '' }: BillingIntervalToggleProps) {
  return (
    <div className={`inline-flex items-center rounded-lg border border-border bg-surface p-1 ${className}`}>
      {intervals.map((interval) => {
        const { label, discount } = BILLING_INTERVALS[interval]
        const isActive = value === interval

        return (
          <button
            key={interval}
            type="button"
            onClick={() => onChange(interval)}
            className={`relative flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-2'
            }`}
          >
            {label}
            {discount > 0 && (
              <span className={`text-xs font-semibold ${
                isActive ? 'text-primary-foreground/80' : 'text-success'
              }`}>
                -{discount * 100}%
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
