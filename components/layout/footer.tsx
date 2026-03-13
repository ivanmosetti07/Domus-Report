import Link from "next/link"
import Image from "next/image"
import { Linkedin, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-foreground">
      <div className="site-container grid gap-8 py-12 md:grid-cols-5">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="DomusReport"
              width={160}
              height={48}
              className="h-10 w-auto"
            />
          </Link>
          <p className="text-sm text-foreground-muted max-w-md">
            La piattaforma intelligente per agenzie immobiliari che genera lead qualificati con valutazioni automatiche basate su dati OMI ufficiali.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://www.linkedin.com/company/domusreport"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-foreground-muted transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com/domusreport"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-foreground-muted transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/domusreport"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-foreground-muted transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Prodotto</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>
              <Link href="/#features" className="transition-colors hover:text-foreground">Funzionalità</Link>
            </li>
            <li>
              <Link href="/#pricing" className="transition-colors hover:text-foreground">Pricing</Link>
            </li>
            <li>
              <Link href="/docs/wordpress" className="transition-colors hover:text-foreground">Documentazione</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Azienda</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>
              <Link href="/about" className="transition-colors hover:text-foreground">Chi siamo</Link>
            </li>
            <li>
              <a href="mailto:info@domusreport.com" className="transition-colors hover:text-foreground">Contatti</a>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-foreground">Termini</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Affiliati</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>
              <Link href="/affiliate" className="transition-colors hover:text-foreground">Programma Affiliati</Link>
            </li>
            <li>
              <Link href="/affiliate/login" className="transition-colors hover:text-foreground">Accesso Affiliati</Link>
            </li>
            <li>
              <Link href="/affiliate/register" className="transition-colors hover:text-foreground">Diventa Affiliato</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-container border-t border-border/50 py-6 text-center text-sm text-foreground-muted">
        &copy; {new Date().getFullYear()} DomusReport by Mainstream Agency. Tutti i diritti riservati.
      </div>
    </footer>
  )
}
