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
      <div className="border-b border-border" style={{
        padding: 'var(--space-md)'
      }}>
        <Link href="/dashboard" className="flex items-center group" style={{
          gap: 'var(--space-3)'
        }}>
          {/* Logo Agenzia (quadrato) */}
          {agencyLogo ? (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-180" style={{
              width: 'clamp(2.5rem, 10vw, 3rem)',
              height: 'clamp(2.5rem, 10vw, 3rem)'
            }}>
              <Image
                src={agencyLogo}
                alt={agencyName}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="bg-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-180" style={{
              width: 'clamp(2.5rem, 10vw, 3rem)',
              height: 'clamp(2.5rem, 10vw, 3rem)'
            }}>
              <Image
                src="/favicon.png"
                alt="DomusReport"
                width={48}
                height={48}
                style={{
                  width: 'clamp(1.5rem, 6vw, 2rem)',
                  height: 'clamp(1.5rem, 6vw, 2rem)'
                }}
                priority
              />
            </div>
          )}
          <div className="flex-1 min-w-0" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)'
          }}>
            <h2 className="font-bold text-foreground truncate" style={{
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-tight)'
            }}>DomusReport</h2>
            <p className="text-foreground-muted truncate" style={{
              fontSize: 'var(--text-xs)',
              lineHeight: 'var(--leading-tight)'
            }}>
              {agencyName}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1" style={{
        padding: 'var(--space-sm) var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)'
      }}>
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
                "flex items-center rounded-xl font-medium transition-all duration-180 ease-smooth border border-transparent",
                isActive
                  ? "bg-primary/10 text-primary border-primary/20 shadow-soft"
                  : "text-foreground-muted hover:bg-surface hover:text-foreground hover:border-border-hover"
              )}
              style={{
                gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-sm)'
              }}
            >
              <Icon style={{
                width: 'clamp(1.125rem, 2vw, 1.25rem)',
                height: 'clamp(1.125rem, 2vw, 1.25rem)'
              }} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border" style={{
        padding: 'var(--space-sm) var(--space-3)'
      }}>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-180"
          onClick={handleLogout}
          style={{
            fontSize: 'var(--text-sm)',
            padding: 'var(--space-2) var(--space-3)'
          }}
        >
          <LogOut style={{
            width: 'clamp(1.125rem, 2vw, 1.25rem)',
            height: 'clamp(1.125rem, 2vw, 1.25rem)',
            marginRight: 'var(--space-3)'
          }} />
          Logout
        </Button>
        <p className="text-foreground-subtle" style={{
          fontSize: 'var(--text-xs)',
          marginTop: 'var(--space-3)',
          paddingLeft: 'var(--space-3)'
        }}>
          v0.1.0
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:bg-surface lg:border-r lg:border-border border-soft" style={{
        width: 'var(--sidebar-width-desktop)'
      }}>
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed z-50" style={{
        top: 'var(--space-4)',
        left: 'var(--space-4)'
      }}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-surface shadow-soft-lg border-border hover:border-border-hover"
          style={{
            width: 'clamp(2.5rem, 10vw, 3rem)',
            height: 'clamp(2.5rem, 10vw, 3rem)'
          }}
        >
          {mobileMenuOpen ? (
            <X style={{
              width: 'clamp(1.25rem, 5vw, 1.5rem)',
              height: 'clamp(1.25rem, 5vw, 1.5rem)'
            }} />
          ) : (
            <Menu style={{
              width: 'clamp(1.25rem, 5vw, 1.5rem)',
              height: 'clamp(1.25rem, 5vw, 1.5rem)'
            }} />
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
          <div className="lg:hidden fixed inset-y-0 left-0 bg-surface border-r border-border z-50 flex flex-col animate-slide-in-left" style={{
            width: 'clamp(16rem, 80vw, 20rem)'
          }}>
            <SidebarContent />
          </div>
        </>
      )}
    </>
  )
}
