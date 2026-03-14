"use client"

import { useInView } from "@/components/landing/use-in-view"

interface SlideUpProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function SlideUp({ children, delay = 0, className }: SlideUpProps) {
  const [ref, inView] = useInView({ rootMargin: "-10%" })

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""} ${className || ""}`}
      style={delay ? { animationDelay: `${delay * 1000}ms` } : undefined}
    >
      {children}
    </div>
  )
}
