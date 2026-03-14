"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, Plus, Minus } from "lucide-react"
import { SectionHeader } from "./section-header"
import { FAQS } from "./landing-data"

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <section className="w-full py-24 sm:py-32 bg-background relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl mx-auto relative z-10">
        <SectionHeader
          badge={{ icon: HelpCircle, label: "FAQ" }}
          title={
             <>
              Domande{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">frequenti</span>
            </>
          }
          subtitle="Tutto quello che devi sapere su DomusReport"
        />

        <div className="mt-16 space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isOpen ? "bg-surface/60 border-primary/30" : "bg-surface/30 border-white/5 hover:bg-surface/50 hover:border-white/10"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left"
                >
                  <span className={`text-lg sm:text-xl font-semibold pr-8 transition-colors ${isOpen ? "text-primary flex-grow text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent" : "text-foreground"}`}>
                    {faq.question}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]" : "bg-white/5 text-foreground-muted"}`}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                       <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-foreground-muted text-base sm:text-lg leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
