"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroSectionV2 } from "@/components/landing/hero-section-v2"
import { TrustMarquee } from "@/components/landing/trust-marquee"
import { ShowcaseBento } from "@/components/landing/showcase-bento"
import { InteractiveDemoV2 } from "@/components/landing/interactive-demo-v2"
import { FeaturesTabs } from "@/components/landing/features-tabs"
import { PricingSection } from "@/components/landing/pricing-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { FaqSection } from "@/components/landing/faq-section"
import { FinalCta } from "@/components/landing/final-cta"
import { STRUCTURED_DATA } from "@/components/landing/landing-data"

export default function LandingPage() {
  const [showDemoWidget, setShowDemoWidget] = React.useState(false)

  // Referral tracking: salva codice referral nel cookie
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("ref")
    if (ref) {
      document.cookie = `domus_ref=${ref}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
      fetch("/api/affiliate/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ref }),
      }).catch(() => {})
    }
  }, [])

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
        <HeroSectionV2
          onDemoClick={() => {
            setShowDemoWidget(true)
            document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
          }}
        />

        <TrustMarquee />

        <ShowcaseBento />

        <InteractiveDemoV2
          showWidget={showDemoWidget}
          onToggleWidget={setShowDemoWidget}
        />

        <FeaturesTabs />

        <section id="pricing">
          <PricingSection />
        </section>

        <TestimonialsSection />

        <FaqSection />

        <FinalCta />
      </main>

      <Footer />
    </div>
  )
}
