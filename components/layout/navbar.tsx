"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="DomusReport"
            width={160}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            Funzionalità
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/docs/wordpress"
            className="text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            Documentazione
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="outline">Accedi</Button>
          </Link>
          <Link href="/register">
            <Button>Inizia Gratis</Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          aria-label="Apri menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="site-container flex flex-col gap-4 py-6">
            <Link
              href="#features"
              className="text-base font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funzionalità
            </Link>
            <Link
              href="#pricing"
              className="text-base font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs/wordpress"
              className="text-base font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Documentazione
            </Link>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Accedi
                </Button>
              </Link>
              <Link href="/register" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Inizia Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
