import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Building2, Users, Target, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Chi Siamo - DomusReport",
  description: "Scopri la storia e la missione di DomusReport",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Chi Siamo
          </h1>
          <p className="text-xl text-gray-600">
            La tecnologia al servizio delle agenzie immobiliari
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">La Nostra Missione</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            DomusReport nasce dall'esperienza di <strong>Mainstream Agency</strong>, agenzia digitale
            specializzata nello sviluppo di soluzioni software innovative per il settore immobiliare.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            La nostra missione è semplice: aiutare le agenzie immobiliari a generare più lead qualificati
            attraverso l'intelligenza artificiale e l'automazione, senza richiedere competenze tecniche.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Con DomusReport, ogni agenzia può offrire ai visitatori del proprio sito web un servizio di
            valutazione immobiliare immediato e accurato, basato sui dati ufficiali dell'Osservatorio del
            Mercato Immobiliare (OMI).
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">I Nostri Valori</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Semplicità</h3>
              <p className="text-gray-700">
                Crediamo che la tecnologia debba essere accessibile. Per questo DomusReport si integra
                in pochi minuti, senza bisogno di sviluppatori.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Precisione</h3>
              <p className="text-gray-700">
                Le nostre valutazioni sono basate su dati OMI certificati e algoritmi che tengono conto
                di oltre 15 variabili immobiliari.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Trasparenza</h3>
              <p className="text-gray-700">
                Niente costi nascosti. Il piano gratuito è davvero gratuito e puoi scalare quando vuoi
                senza vincoli.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Supporto</h3>
              <p className="text-gray-700">
                Siamo al tuo fianco. Il nostro team risponde rapidamente e ti aiuta a ottenere il massimo
                dalla piattaforma.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Mainstream Agency</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            DomusReport è sviluppato da Mainstream Agency, agenzia digitale con sede a Milano specializzata
            in progetti SaaS per il real estate.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Il nostro team è composto da sviluppatori, designer e esperti del settore immobiliare che
            lavorano ogni giorno per migliorare la piattaforma e offrire nuove funzionalità.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto a far crescere la tua agenzia?
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            Unisciti alle agenzie che stanno già generando lead con DomusReport
          </p>
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
            >
              Inizia Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
