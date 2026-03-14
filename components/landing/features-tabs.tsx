"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Sparkles } from "lucide-react"
import { SectionHeader } from "./section-header"
import { DETAILED_FEATURES } from "./landing-data"

export function FeaturesTabs() {
  const [activeTab, setActiveTab] = useState(DETAILED_FEATURES[0].id)

  const activeFeature = DETAILED_FEATURES.find(f => f.id === activeTab) || DETAILED_FEATURES[0]

  return (
    <section className="w-full py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto relative z-10">
        <SectionHeader
          badge={{ icon: Sparkles, label: "Approfondisci" }}
          title={
            <>
              Scopri cosa puoi fare con <br className="hidden md:block" />
              <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">DomusReport</span>
            </>
          }
          subtitle="Ogni funzionalità è progettata per farti risparmiare tempo e generare più lead qualificati"
        />

        <div className="mt-16">
          {/* Custom Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 px-2">
            {DETAILED_FEATURES.map((feature) => {
              const isActive = feature.id === activeTab
              const Icon = feature.icon
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                    isActive ? "text-primary-foreground" : "text-foreground-muted hover:text-foreground hover:bg-surface/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-primary/90 border border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)] rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{feature.tabLabel}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
            >
              <div className="space-y-6 lg:space-y-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                  <activeFeature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-foreground">
                  {activeFeature.title}
                </h3>
                <p className="text-lg text-foreground-muted leading-relaxed">
                  {activeFeature.description}
                </p>
                <div className="space-y-4 pt-2">
                  {activeFeature.bulletPoints.map((point, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={point} 
                      className="flex items-start gap-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[32px] blur-xl opacity-20" />
                <div className="relative bg-surface/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 sm:p-10 shadow-2xl overflow-hidden">
                  {/* Decorative faint glow inside */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                        <activeFeature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-lg">{activeFeature.tabLabel}</div>
                        <div className="text-sm text-foreground-muted">DomusReport Agent</div>
                      </div>
                    </div>
                    {/* Simulated visual representation of UI */}
                    <div className="space-y-3">
                      {activeFeature.bulletPoints.map((point, idx) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          key={point}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:bg-black/60 transition-colors"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-sm text-foreground/90 font-medium">{point}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
