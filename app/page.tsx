"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustBar } from "@/components/landing/trust-bar"
import { ProblemSolution } from "@/components/landing/problem-solution"
import { HowItWorks } from "@/components/landing/how-it-works"
import { DemoSection } from "@/components/landing/demo-section"
import { FeaturesGrid } from "@/components/landing/features-grid"
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
    <div className="min-h-screen bg-background">
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      <Navbar />

      {/* Spacer per la navbar fixed */}
      <div className="h-20" />

      <HeroSection
        onDemoClick={() => {
          setShowDemoWidget(true)
          document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
        }}
      />

      <TrustBar />

      <ProblemSolution />

      <HowItWorks />

      <DemoSection
        showWidget={showDemoWidget}
        onToggleWidget={setShowDemoWidget}
      />

      <section id="features">
        <FeaturesGrid />
      </section>

      <FeaturesTabs />

      <section id="pricing">
        <PricingSection />
      </section>

      <TestimonialsSection />

      <FaqSection />

      <FinalCta />

      <Footer />
    </div>
  )
}
