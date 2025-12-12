"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  User,
  LogOut,
  Menu,
  X,
  BarChart3,
  FileText,
  MessageSquare,
  CreditCard,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Lead", href: "/dashboard/leads", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Report", href: "/dashboard/reports", icon: FileText },
  { name: "Widget", href: "/dashboard/widgets", icon: MessageSquare },
  { name: "Abbonamento", href: "/dashboard/subscription", icon: CreditCard },
  { name: "Sicurezza", href: "/dashboard/security", icon: Shield },
  { name: "Profilo", href: "/dashboard/profile", icon: User },
]

interface SidebarProps {
  agencyName?: string
  agencyLogo?: string | null
}

export function Sidebar({ agencyName = "La Tua Agenzia", agencyLogo }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")

      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear token from localStorage
      localStorage.removeItem("token")
      // Redirect to login regardless of API success
      router.push("/login")
    }
  }

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="px-6 py-6 border-b border-border">
        <Link href="/dashboard" className="flex flex-col gap-3 group">
          {/* Logo Agenzia o Domus Report */}
          {agencyLogo ? (
            <div className="relative h-16 w-full group-hover:scale-105 transition-transform duration-180">
              <Image
                src={agencyLogo}
                alt={agencyName}
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          ) : (
            <Image
              src="/logo.png"
              alt="DomusReport"
              width={180}
              height={60}
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-180"
              priority
            />
          )}
          <p className="text-xs text-foreground-muted truncate">
            {agencyName}
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
                          (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-180 ease-smooth border border-transparent",
                isActive
                  ? "bg-primary/10 text-primary border-primary/20 shadow-soft"
                  : "text-foreground-muted hover:bg-surface hover:text-foreground hover:border-border-hover"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-180"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
        <p className="text-xs text-foreground-subtle mt-3 px-3">
          v0.1.0
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-surface lg:border-r lg:border-border border-soft">
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-surface shadow-soft-lg border-border hover:border-border-hover"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-50 flex flex-col animate-slide-in-left">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  )
}
