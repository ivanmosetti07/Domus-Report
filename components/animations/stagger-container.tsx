"use client"

import { motion, Easing } from "framer-motion"
import { DURATION, EASING } from "./fade-in"

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  delayChildren?: number
}

export function StaggerContainer({ 
  children, 
  className, 
  staggerDelay = 0.1,
  delayChildren = 0
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: DURATION,
            ease: EASING as Easing
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
