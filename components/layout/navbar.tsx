"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const el = document.getElementById(href.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      setMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { href: "#features", label: "Funzionalità" },
    { href: "#pricing", label: "Pricing" },
    { href: "/about", label: "Chi Siamo" },
    { href: "/affiliate", label: "Affiliati" },
    { href: "/docs/wordpress", label: "Docs" },
  ]

  return (
    <nav
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-border bg-background/95 backdrop-blur-lg shadow-soft"
          : "bg-transparent border-b border-transparent"
      }`}
    >
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
              onClick={(e) => handleAnchorClick(e, link.href)}
            >
              {link.label}
            </Link>
          ))}
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
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-lg">
          <div className="site-container flex flex-col gap-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-foreground"
                onClick={(e) => {
                  handleAnchorClick(e, link.href)
                  setMobileMenuOpen(false)
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Accedi</Button>
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
