"use client"

import { useInView } from "@/components/landing/use-in-view"

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  delayChildren?: number
}

export function StaggerContainer({
  children,
  className,
}: StaggerContainerProps) {
  const [ref, inView] = useInView({ rootMargin: "-10%" })

  return (
    <div
      ref={ref}
      className={`reveal-stagger ${inView ? "in-view" : ""} ${className || ""}`}
    >
      {children}
    </div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode, className?: string }) {
  const [ref, inView] = useInView({ rootMargin: "-10%" })

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""} ${className || ""}`}
    >
      {children}
    </div>
  )
}
