"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { InteractiveDemoV2 } from "@/components/landing/interactive-demo-v2"
import { DemoConversionBanner } from "@/components/landing/demo-conversion-banner"

import { FeaturesTabs } from "@/components/landing/features-tabs"

// Lazy-load below-the-fold sections
const PricingSection = dynamic(() => import("@/components/landing/pricing-section").then(m => ({ default: m.PricingSection })))
const TestimonialsSection = dynamic(() => import("@/components/landing/testimonials-section").then(m => ({ default: m.TestimonialsSection })))
const FaqSection = dynamic(() => import("@/components/landing/faq-section").then(m => ({ default: m.FaqSection })))
const FinalCta = dynamic(() => import("@/components/landing/final-cta").then(m => ({ default: m.FinalCta })))

export function LandingPageClient() {
  const [showDemoWidget, setShowDemoWidget] = React.useState(false)
  const [demoCompleted, setDemoCompleted] = React.useState(false)

  // Referral tracking
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
    <>
      <InteractiveDemoV2
        showWidget={showDemoWidget}
        onToggleWidget={setShowDemoWidget}
        onDemoComplete={() => setDemoCompleted(true)}
      />

      <DemoConversionBanner demoCompleted={demoCompleted} />

      <FeaturesTabs />

      <section id="pricing">
        <PricingSection />
      </section>

      <TestimonialsSection />

      <FaqSection />

      <FinalCta />
    </>
  )
}
