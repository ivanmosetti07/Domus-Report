"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Building2,
  Users,
  Handshake,
  Tag,
  Mail,
  UserCog,
  LogOut,
  X,
  Menu,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import * as React from "react"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Agenzie", href: "/admin/dashboard/agencies", icon: Building2 },
  { name: "Lead", href: "/admin/dashboard/leads", icon: Users },
  { name: "Affiliati", href: "/admin/dashboard/affiliates", icon: Handshake },
  { name: "Coupon", href: "/admin/dashboard/coupons", icon: Tag },
  {
    name: "Email Marketing",
    href: "/admin/dashboard/email-campaigns",
    icon: Mail,
  },
  { name: "Profilo & Team", href: "/admin/dashboard/profile", icon: UserCog },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin-token")
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      // ignore
    }
    localStorage.removeItem("admin-token")
    router.push("/admin/login")
  }

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href
    return pathname.startsWith(href)
  }

  const navContent = (
    <>
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-foreground-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:bg-surface hover:text-foreground w-full transition-all"
        >
          <LogOut className="h-5 w-5" />
          Esci
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-background border-r border-border flex flex-col h-full">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-foreground-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 flex-col bg-background border-r border-border">
        {navContent}
      </aside>
    </>
  )
}
