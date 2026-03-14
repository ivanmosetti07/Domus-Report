"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, CheckCircle } from "lucide-react"

export function FinalCta() {
  return (
    <section className="relative w-full py-24 sm:py-32 lg:py-40 bg-background overflow-hidden relative border-t border-white/5">
      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1000px] h-[80vw] max-h-[1000px] bg-primary/20 rounded-full blur-[200px] pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 max-w-[1000px] mx-auto text-center space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
           <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-foreground">
             Il tuo <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)] 
              animate-gradient bg-[length:200%_auto]">Agente AI</span> lavora per te.
           </h2>
           <p className="text-xl sm:text-2xl text-foreground-muted max-w-3xl mx-auto leading-relaxed">
             Conversazioni intelligenti, valutazioni real-time, lead qualificati. Tutto in automatico mentre tu dormi o sei fuori a vendere.
           </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg sm:text-xl px-10 sm:px-14 py-8 font-bold rounded-2xl bg-primary text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <Sparkles className="w-6 h-6 mr-3 text-primary-foreground/90" />
               Inizia ora gratis
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 pt-8"
        >
          {[
            { icon: Sparkles, text: "Nessuna carta richiesta" },
            { icon: Zap, text: "Configurazione in 2 minuti" },
            { icon: CheckCircle, text: "7 giorni di prova gratis" },
          ].map((item) => (
             <div key={item.text} className="flex items-center gap-3 bg-surface/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/5">
               <item.icon className="w-5 h-5 text-primary" />
               <span className="font-semibold text-sm sm:text-base text-foreground/90">{item.text}</span>
             </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
