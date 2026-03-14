import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroSectionV2 } from "@/components/landing/hero-section-v2"
import { TrustMarquee } from "@/components/landing/trust-marquee"
import { ShowcaseBento } from "@/components/landing/showcase-bento"
import { LandingPageClient } from "@/components/landing/landing-page-client"
import { STRUCTURED_DATA } from "@/components/landing/landing-data"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground">
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[200px] bg-primary/20 blur-[150px] pointer-events-none z-0" />

      <Navbar />

      <main className="flex flex-col relative z-10 pt-20">
        {/* Above-the-fold: server-rendered */}
        <HeroSectionV2 />

        <TrustMarquee />

        <ShowcaseBento />

        {/* Below-the-fold: client-rendered with lazy loading */}
        <LandingPageClient />
      </main>

      <Footer />
    </div>
  )
}
