"use client"

import { motion } from "framer-motion"
import { TRUST_STATS } from "./landing-data"

const BRANDS = [
  "Agenzia Premium",
  "Gruppo Case Italia",
  "Studio Immobiliare Centro",
  "Immobiliare Plus",
  "Real Estate Partners",
  "Global Case",
  "Progetto Casa",
  "Domus Partner",
]

export function TrustMarquee() {
  return (
    <section className="py-12 bg-background border-y border-border/40 relative overflow-hidden">
      {/* Gradients for fading effect */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mb-8 lg:mb-12">
        <h3 className="text-center text-sm font-semibold tracking-wider text-foreground-subtle uppercase mb-8">
          Affidabilità e performance comprovate
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {TRUST_STATS.map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface/30 border border-border/50 hover:bg-surface/50 hover:border-primary/30 transition-colors">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground-subtle mb-1">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-medium text-foreground-muted text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex overflow-x-hidden">
        <motion.div
          className="flex whitespace-nowrap gap-12 sm:gap-20 items-center px-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Double array for infinite loop effect */}
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span
              key={i}
              className="text-xl sm:text-2xl font-bold text-foreground-subtle/40 hover:text-foreground-muted transition-colors select-none"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
