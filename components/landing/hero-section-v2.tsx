"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  Play,
  TrendingUp,
  Clock,
  Award,
  LogOut,
  MapPin,
  BarChart3,
  Home,
  CheckCircle,
  Database,
  Shield,
  MessageSquare
} from "lucide-react"
import { HERO_BADGE, HERO_TRUST_ITEMS } from "./landing-data"

interface HeroSectionV2Props {
  onDemoClick: () => void
}

export function HeroSectionV2({ onDemoClick }: HeroSectionV2Props) {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20 pb-16">
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] opacity-60"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] opacity-40"
        />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1600px] mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="flex flex-col space-y-8 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-md border border-primary/30 rounded-full w-fit max-w-full"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
              <span className="text-sm font-semibold text-primary truncate">{HERO_BADGE}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight"
            >
              Il chatbot AI che valuta immobili in <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-primary">
                tempo reale
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-foreground-muted leading-relaxed max-w-xl"
            >
              <strong className="text-foreground font-semibold">Conversazione AI + Valutazione istantanea.</strong>{" "}
              Il tuo chatbot qualifica lead con stime OMI precise mentre parla con i clienti. Zero form, solo una conversazione naturale che converte.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: MessageSquare, label: "AI Conversazionale" },
                { icon: Zap, label: "Valutazione 3 secondi" },
                { icon: Database, label: "Dati OMI 133k+" },
              ].map((pill, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-surface/50 backdrop-blur-sm border border-border/50 rounded-full hover:border-primary/40 transition-colors">
                  <pill.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{pill.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link href="/register" className="w-full sm:w-auto group">
                <Button size="lg" className="w-full h-14 text-lg px-8 font-bold shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)] transition-all duration-300">
                  Attiva il tuo AI Agent
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 text-lg px-8 border-2 bg-surface/50 backdrop-blur-md hover:bg-surface hover:text-primary transition-all duration-300 group"
                onClick={onDemoClick}
              >
                <div className="relative flex items-center justify-center mr-2 w-6 h-6 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Play className="w-3 h-3 text-primary ml-0.5" />
                </div>
                Vedi in azione
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-sm text-foreground-muted"
            >
              {HERO_TRUST_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Premium Glassmorphism Widget */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:ml-auto w-full max-w-lg perspective-1000"
          >
            {/* Main Glass Card */}
            <div className="relative rounded-3xl overflow-hidden glass-effect border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] bg-surface/40 backdrop-blur-2xl">
              
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/90 to-primary-hover p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white">Valutazione AI</h3>
                      <p className="text-xs sm:text-sm text-white/80 font-medium">Generata in 45 secondi</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[11px] font-bold tracking-wider text-white">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="flex items-start justify-between border-b border-border/50 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-surface rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm sm:text-base">Milano Centro Storico</h4>
                      <p className="text-foreground-muted text-xs sm:text-sm mt-0.5">Appartamento &bull; 85mq &bull; Ottimo stato</p>
                    </div>
                  </div>
                </div>

                <div className="py-2 text-center relative">
                  <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                  <p className="text-sm font-medium text-foreground-muted mb-2 relative">Valore di mercato stimato</p>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-foreground-muted tracking-tight relative">
                    €285.000
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-foreground-muted px-1">
                    <span>€260k</span>
                    <span className="text-primary font-bold">€285k</span>
                    <span>€310k</span>
                  </div>
                  <div className="h-3 bg-surface rounded-full overflow-hidden p-0.5 inset-shadow-sm border border-border/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "52%" }}
                      transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/80 rounded-full shadow-[0_0_10px_rgba(61,214,140,0.5)]" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Target, label: "Precisione OMI", value: "98%", desc: "Dati certificati" },
                    { icon: BarChart3, label: "Prezzo/mq", value: "€3.353", desc: "Media zona" },
                    { icon: TrendingUp, label: "Trend annuo", value: "+3.2%", desc: "In crescita", color: "text-primary" }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1 + (i * 0.1) }}
                      className="flex flex-col items-center text-center p-3 rounded-2xl bg-surface/50 border border-border/30 hover:bg-surface transition-colors"
                    >
                      <stat.icon className={`w-5 h-5 mb-2 ${stat.color || 'text-foreground-subtle'}`} />
                      <div className="text-sm sm:text-base font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] sm:text-xs text-foreground-muted mt-0.5">{stat.desc}</div>
                    </motion.div>
                  ))}
                </div>

              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 top-20 hidden lg:flex items-center gap-3 glass-effect bg-surface/60 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl"
            >
              <div className="p-3 bg-primary/20 text-primary rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-foreground-muted font-medium">Lead Qualificati</div>
                <div className="text-xl font-bold text-foreground">+234%</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 bottom-24 hidden lg:flex flex-col items-center justify-center p-4 glass-effect bg-surface/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-md" />
                <Clock className="w-8 h-8 text-primary relative z-10 mb-2" />
              </div>
              <div className="text-lg font-bold text-foreground">24/7</div>
              <div className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold">Attivo</div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}
