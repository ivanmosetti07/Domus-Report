import Link from "next/link"
import { Building2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-foreground">
      <div className="site-container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">DomusReport</span>
          </Link>
          <p className="text-sm text-foreground-muted max-w-md">
            La piattaforma intelligente per agenzie immobiliari che genera lead qualificati con valutazioni automatiche basate su dati OMI ufficiali.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Prodotto</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>
              <Link href="#features" className="transition-colors hover:text-foreground">
                Funzionalità
              </Link>
            </li>
            <li>
              <Link href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/docs/wordpress" className="transition-colors hover:text-foreground">
                Documentazione
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Azienda</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>
              <Link href="/about" className="transition-colors hover:text-foreground">
                Chi siamo
              </Link>
            </li>
            <li>
              <a
                href="mailto:info@domusreport.com"
                className="transition-colors hover:text-foreground"
              >
                Contatti
              </a>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Termini
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="site-container border-t border-border/50 py-6 text-center text-sm text-foreground-muted">
        © 2024 DomusReport by Mainstream Agency. Tutti i diritti riservati.
      </div>
    </footer>
  )
}
