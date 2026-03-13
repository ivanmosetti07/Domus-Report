"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Sparkles } from "lucide-react"
import { SectionHeader } from "./section-header"
import { DETAILED_FEATURES } from "./landing-data"

export function FeaturesTabs() {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-surface">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1400px] mx-auto">
        <SectionHeader
          badge={{ icon: Sparkles, label: "Approfondisci" }}
          title={
            <>
              Scopri cosa puoi fare con{" "}
              <span className="text-primary">DomusReport</span>
            </>
          }
          subtitle="Ogni funzionalità è progettata per farti risparmiare tempo e generare più lead qualificati"
        />

        <Tabs defaultValue={DETAILED_FEATURES[0].id} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 mb-12 bg-transparent h-auto">
            {DETAILED_FEATURES.map((feature) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-surface-2 text-foreground-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-lg transition-all"
              >
                <feature.icon className="w-4 h-4" />
                <span className="font-semibold text-sm">{feature.tabLabel}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {DETAILED_FEATURES.map((feature) => (
            <TabsContent key={feature.id} value={feature.id}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Text Content */}
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.bulletPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual / Stats */}
                <div className="bg-card border-2 border-border rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{feature.tabLabel}</div>
                      <div className="text-xs text-foreground-muted">DomusReport</div>
                    </div>
                  </div>
                  {feature.bulletPoints.map((point, idx) => (
                    <div
                      key={point}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/50 border border-border/50"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
