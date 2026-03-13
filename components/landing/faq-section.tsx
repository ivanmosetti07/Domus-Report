"use client"

import * as React from "react"
import { HelpCircle, ChevronDown } from "lucide-react"
import { SectionHeader } from "./section-header"
import { FAQS } from "./landing-data"

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-surface">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-3xl mx-auto">
        <SectionHeader
          badge={{ icon: HelpCircle, label: "FAQ" }}
          title={
            <>
              Domande{" "}
              <span className="text-primary">frequenti</span>
            </>
          }
          subtitle="Tutto quello che devi sapere su DomusReport"
        />

        <div className="space-y-0">
          {FAQS.map((faq, i) => (
            <div key={faq.question} className="border-b border-border">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-foreground-muted flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96 pb-5" : "max-h-0"
                }`}
              >
                <p className="text-foreground-muted leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
