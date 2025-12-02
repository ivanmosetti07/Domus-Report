import Link from "next/link"
import { Building2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DomusReport</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm">
              La piattaforma intelligente per agenzie immobiliari che genera lead qualificati
              con valutazioni automatiche basate su dati OMI ufficiali.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Prodotto</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm hover:text-white transition-colors">
                  Funzionalità
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs/wordpress" className="text-sm hover:text-white transition-colors">
                  Documentazione
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Azienda</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  Chi siamo
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@domusreport.it"
                  className="text-sm hover:text-white transition-colors"
                >
                  Contatti
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  Termini
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© 2024 DomusReport by Mainstream Agency. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}
