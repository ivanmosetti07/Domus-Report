import { Card, CardContent } from "@/components/ui/card"
import { Users, Star } from "lucide-react"
import { SectionHeader } from "./section-header"
import { TESTIMONIALS } from "./landing-data"

export function TestimonialsSection() {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 xl:py-32 bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1800px] mx-auto">
        <SectionHeader
          badge={{ icon: Users, label: "Risultati reali" }}
          title={
            <>
              Agenzie che hanno smesso
              <br className="hidden sm:block" /> di{" "}
              <span className="text-primary">rincorrere clienti</span>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <Card
              key={testimonial.author}
              className="border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all"
            >
              <CardContent className="p-6 sm:p-8 space-y-5 sm:space-y-6">
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-foreground-muted italic leading-relaxed text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {testimonial.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-foreground-muted">{testimonial.role}</div>
                      <div className="text-sm font-semibold text-primary">{testimonial.company}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-primary">{testimonial.stat}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
