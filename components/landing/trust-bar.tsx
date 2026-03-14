"use client"

import { TRUST_STATS } from "./landing-data"
import { useReveal } from "./use-reveal"

export function TrustBar() {
  const ref = useReveal()

  return (
    <section className="w-full bg-surface border-y border-border py-8 sm:py-10 lg:py-12">
      <div ref={ref} className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 reveal-stagger">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-[1600px] mx-auto">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="reveal text-center space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">{stat.value}</div>
              <div className="text-xs sm:text-sm font-medium text-foreground-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
