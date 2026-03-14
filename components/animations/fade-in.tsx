"use client"

import { useInView } from "@/components/landing/use-in-view"

export const DURATION = 0.8

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const [ref, inView] = useInView({ rootMargin: "-10%" })

  return (
    <div
      ref={ref}
      className={`reveal reveal-fade ${inView ? "in-view" : ""} ${className || ""}`}
      style={delay ? { animationDelay: `${delay * 1000}ms` } : undefined}
    >
      {children}
    </div>
  )
}
