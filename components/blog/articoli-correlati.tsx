import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getRelatedArticles } from "@/lib/seo/cluster-map"

interface ArticoliCorrelatiProps {
  currentSlug: string
  limit?: number
}

export function ArticoliCorrelati({ currentSlug, limit = 3 }: ArticoliCorrelatiProps) {
  const related = getRelatedArticles(currentSlug, limit)
  if (related.length === 0) return null

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h3 className="text-xl font-bold mb-6">Articoli correlati</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((art) => (
          <Link
            key={art.slug}
            href={`/blog/${art.slug}`}
            className="rounded-xl border border-border bg-surface p-4 space-y-2 hover:border-primary/30 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">
              {art.categoria}
            </div>
            <h4 className="text-sm font-semibold leading-snug">{art.titolo}</h4>
            <span className="text-xs text-primary flex items-center gap-1">
              Leggi <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
