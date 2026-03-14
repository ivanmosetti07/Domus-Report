"use client"

import { motion, Easing } from "framer-motion"
import { DURATION, EASING } from "./fade-in"

interface SlideUpProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function SlideUp({ children, delay = 0, className }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: DURATION,
        ease: EASING as Easing,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
