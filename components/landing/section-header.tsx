import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface SectionHeaderProps {
  badge?: { icon: LucideIcon; label: string }
  title: React.ReactNode
  subtitle?: string
  centered?: boolean
  className?: string
}

export function SectionHeader({ badge, title, subtitle, centered = true, className = "" }: SectionHeaderProps) {
  return (
    <div className={`max-w-4xl ${centered ? "mx-auto text-center" : ""} mb-16 lg:mb-20 ${className}`}>
      {badge && (
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
          <badge.icon className="w-4 h-4 mr-2" />
          {badge.label}
        </Badge>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg sm:text-xl text-foreground-muted px-4">{subtitle}</p>
      )}
    </div>
  )
}
