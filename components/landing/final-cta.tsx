import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, CheckCircle } from "lucide-react"

export function FinalCta() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary text-primary-foreground py-16 sm:py-20 lg:py-24 xl:py-32">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto text-center space-y-8 sm:space-y-10 lg:space-y-12">
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
            Il chatbot AI che lavora
            <br className="hidden sm:block" /> per te 24/7
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed px-4">
            Conversazione intelligente. Valutazione real-time. Lead qualificati. Tutto automatico mentre dormi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-12 py-8 font-bold shadow-2xl hover:shadow-3xl transition-all text-primary group"
            >
              Attiva il tuo AI Agent ora
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
          {[
            { icon: Sparkles, text: "AI Avanzata inclusa" },
            { icon: Zap, text: "Valutazioni real-time" },
            { icon: CheckCircle, text: "7 giorni gratis" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <item.icon className="w-6 h-6 opacity-90" />
              <span className="font-semibold text-lg opacity-90">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-white/20">
          <p className="text-lg opacity-75">
            Dubbi? Contattaci:{" "}
            <a
              href="mailto:support@domusreport.com"
              className="font-bold underline hover:opacity-80 transition-opacity"
            >
              support@domusreport.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
