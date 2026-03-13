import { Card, CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"
import { SectionHeader } from "./section-header"
import { FEATURES } from "./landing-data"

export function FeaturesGrid() {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1800px] mx-auto">
        <SectionHeader
          badge={{ icon: Target, label: "Tutto incluso" }}
          title={
            <>
              Chatbot AI.
              <br className="hidden sm:block" /> Valutazioni real-time.{" "}
              <span className="text-primary">Incarichi automatici.</span>
            </>
          }
          subtitle="L'intelligenza artificiale che converte visitatori in lead qualificati con valutazione OMI inclusa"
        />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className={`border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-300 group overflow-hidden ${
                feature.size === "large" ? "md:col-span-2" : ""
              }`}
            >
              <CardContent className={`p-6 sm:p-8 space-y-4 sm:space-y-5 ${
                feature.size === "large" ? "sm:flex sm:gap-8 sm:items-start sm:space-y-0" : ""
              }`}>
                <div className={`${feature.size === "large" ? "flex-shrink-0" : ""}`}>
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl`}>
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-foreground-muted leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
