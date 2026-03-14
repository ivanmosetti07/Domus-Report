"use client"

import { motion } from "framer-motion"
import { FEATURES } from "./landing-data"

export function ShowcaseBento() {
  return (
    <section id="features" className="w-full py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1600px] mx-auto relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 tracking-tight">
              Tutto quello che ti serve, <br className="hidden lg:block" />
              <span className="text-primary">in un unico strumento.</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground-muted">
              L'intelligenza artificiale che converte visitatori in lead qualificati con valutazione OMI inclusa.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
          {FEATURES.map((feature, i) => {
            const isLarge = feature.size === "large"
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative overflow-hidden rounded-3xl bg-surface/40 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-500 card-lift ${
                  isLarge ? "md:col-span-2" : ""
                }`}
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className={`p-8 sm:p-10 h-full flex flex-col ${isLarge && "sm:flex-row sm:items-center sm:gap-10"}`}>
                  <div className={`mb-6 sm:mb-8 ${isLarge && "sm:mb-0 sm:w-1/3 flex-shrink-0"}`}>
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                      <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                  
                  <div className={`flex justify-center flex-col ${isLarge && "sm:w-2/3"}`}>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-base sm:text-lg text-foreground-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
