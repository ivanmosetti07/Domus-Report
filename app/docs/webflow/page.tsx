import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function WebflowDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard/widget"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al Widget
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Installare DomusReport su Webflow
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Guida rapida per aggiungere il widget al tuo sito Webflow
        </p>

        <div className="prose prose-lg max-w-none">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Apri le Impostazioni del Progetto
                  </h2>
                  <p className="text-gray-600">
                    Nel Designer di Webflow, clicca sull'icona delle impostazioni in alto a sinistra e
                    seleziona <strong>Project Settings</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Vai alla sezione Custom Code
                  </h2>
                  <p className="text-gray-600">
                    Nel menu laterale, clicca su <strong>Custom Code</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Incolla nel Footer Code
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Scorri fino a <strong>Footer Code</strong> e incolla il codice del widget:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`<script src="https://cdn.domusreport.mainstream.agency/widget.js"
        data-widget-id="IL_TUO_WIDGET_ID"
        async></script>`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Salva e Pubblica
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Clicca su <strong>Save Changes</strong> e poi <strong>Publish</strong> il sito per
                    rendere il widget visibile.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <strong>Perfetto! Il widget è ora live.</strong>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Serve assistenza?
            </h3>
            <a href="mailto:support@domusreport.it">
              <Button>Contatta il Supporto</Button>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
