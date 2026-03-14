"use client"

import { motion, Easing } from "framer-motion"

export const DURATION = 0.8
export const EASING: Easing = [0.22, 1, 0.36, 1]

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: DURATION,
        ease: EASING,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
