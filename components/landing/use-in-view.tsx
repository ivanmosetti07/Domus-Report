"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useInView(
  options: UseInViewOptions = {}
): [(node: HTMLElement | null) => void, boolean] {
  const { threshold = 0, rootMargin = "-50px", once = true } = options
  const [inView, setInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (!node) return

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observerRef.current?.unobserve(node)
          } else if (!once) {
            setInView(false)
          }
        },
        { threshold, rootMargin }
      )

      observerRef.current.observe(node)
    },
    [threshold, rootMargin, once]
  )

  return [ref, inView]
}

/**
 * ScrollReveal: componente wrapper che applica animazioni CSS on scroll.
 * Sostituisce motion.div con whileInView.
 */
interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  animation?: "reveal-up" | "reveal-fade" | "reveal-scale"
  delay?: number
  style?: React.CSSProperties
}

export function ScrollReveal({
  children,
  className = "",
  animation = "reveal-up",
  delay = 0,
  style,
}: ScrollRevealProps) {
  const [ref, inView] = useInView()

  const animClass =
    animation === "reveal-up"
      ? "reveal"
      : animation === "reveal-fade"
        ? "reveal reveal-fade"
        : "reveal reveal-scale"

  return (
    <div
      ref={ref}
      className={`${animClass} ${inView ? "in-view" : ""} ${className}`}
      style={{ ...style, animationDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  )
}
