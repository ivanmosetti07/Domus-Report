"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroActions() {
  return (
    <div
      className="flex flex-col sm:flex-row gap-4 pt-2 animate-hero-fade-up"
      style={{ animationDelay: "400ms" }}
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
        onClick={() => {
          document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
        }}
      >
        <div className="relative flex items-center justify-center mr-2 w-6 h-6 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
          <Play className="w-3 h-3 text-primary ml-0.5" />
        </div>
        Vedi in azione
      </Button>
    </div>
  )
}
