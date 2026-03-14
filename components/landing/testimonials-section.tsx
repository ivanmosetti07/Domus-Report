"use client"

import { motion, Variants } from "framer-motion"
import { Users, Star, Quote } from "lucide-react"
import { SectionHeader } from "./section-header"
import { TESTIMONIALS } from "./landing-data"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

export function TestimonialsSection() {
  return (
    <section className="w-full py-24 sm:py-32 bg-surface relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1600px] mx-auto relative z-10">
        <SectionHeader
          badge={{ icon: Users, label: "Risultati reali" }}
          title={
            <>
              Agenzie che hanno smesso di <br className="hidden md:block" />
              <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">rincorrere clienti</span>
            </>
          }
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mt-16"
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative group h-full"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative h-full bg-surface-2/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl flex flex-col shadow-xl">
                <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />
                
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                     <Star key={i} className="w-5 h-5 fill-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  ))}
                </div>

                <p className="text-foreground/90 italic leading-relaxed text-lg flex-grow mb-8 font-medium">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="pt-6 border-t border-white/10 mt-auto flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-foreground-muted">{testimonial.role}</div>
                    <div className="text-sm font-semibold text-primary mt-0.5">{testimonial.company}</div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-black border border-white/10 rounded-2xl p-4 shadow-2xl transform rotate-3 group-hover:rotate-6 transition-transform">
                  <div className="text-xl font-black text-primary drop-shadow-sm">{testimonial.stat}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
