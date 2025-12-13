"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-surface border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="DomusReport"
              width={180}
              height={60}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              Funzionalità
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs/wordpress"
              className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              Documentazione
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline">Accedi</Button>
            </Link>
            <Link href="/register">
              <Button>Inizia Gratis</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="#features"
              className="block text-base font-medium text-foreground-muted hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funzionalità
            </Link>
            <Link
              href="#pricing"
              className="block text-base font-medium text-foreground-muted hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs/wordpress"
              className="block text-base font-medium text-foreground-muted hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Documentazione
            </Link>
            <div className="pt-3 space-y-2">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Accedi
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button className="w-full">Inizia Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
