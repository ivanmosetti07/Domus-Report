"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Rocket, Palette, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DemoConversionBannerProps {
  demoCompleted: boolean
}

export function DemoConversionBanner({ demoCompleted }: DemoConversionBannerProps) {
  return (
    <AnimatePresence>
      {demoCompleted && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full bg-gradient-to-b from-background to-surface/50 overflow-hidden"
        >
          <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1600px] mx-auto py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ti è piaciuta la demo?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
                  Installalo sul tuo sito.
                </span>
              </h3>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                Lo stesso widget che hai appena provato, personalizzato con i colori del tuo brand, attivo 24/7 sul tuo sito web.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
              {[
                {
                  icon: Rocket,
                  title: "Installa in 2 minuti",
                  description: "Registrati, personalizza il widget e copia una riga di codice. Il tuo chatbot AI è online.",
                  gradient: "from-green-500/10 to-green-500/5",
                  iconColor: "text-green-500",
                  iconBg: "bg-green-500/20"
                },
                {
                  icon: Palette,
                  title: "I tuoi colori, il tuo brand",
                  description: "Scegli colori, font e stile. Il widget si adatta perfettamente al design del tuo sito.",
                  gradient: "from-blue-500/10 to-blue-500/5",
                  iconColor: "text-blue-500",
                  iconBg: "bg-blue-500/20"
                },
                {
                  icon: Users,
                  title: "Lead qualificati 24/7",
                  description: "Ogni visitatore che chiede una valutazione diventa un lead con nome, email e telefono.",
                  gradient: "from-purple-500/10 to-purple-500/5",
                  iconColor: "text-purple-500",
                  iconBg: "bg-purple-500/20"
                }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                  className={`bg-gradient-to-br ${card.gradient} border border-border/40 rounded-2xl p-6 lg:p-8`}
                >
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{card.title}</h4>
                  <p className="text-foreground-muted text-sm leading-relaxed">{card.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl transition-colors text-lg shadow-lg shadow-primary/20"
              >
                Inizia Gratis Ora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-6 py-4 border-2 border-border hover:border-primary/50 text-foreground font-semibold rounded-xl transition-colors"
              >
                Vedi i piani
              </a>
            </motion.div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
