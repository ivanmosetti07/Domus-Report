import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function WordPressDocsPage() {
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
          Installare DomusReport su WordPress
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Guida passo-passo per installare il widget sul tuo sito WordPress
        </p>

        <div className="prose prose-lg max-w-none">
          {/* Step 1 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Accedi alla Dashboard WordPress
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Vai su <code className="bg-gray-100 px-2 py-1 rounded">tuosito.it/wp-admin</code> e
                    accedi con le tue credenziali amministratore.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Vai a Aspetto → Temi → Editor dei Temi
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Nel menu laterale, naviga verso <strong>Aspetto</strong>, poi clicca su{" "}
                    <strong>Editor dei Temi</strong> (o Theme File Editor).
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Attenzione:</strong> Se non vedi questa opzione, il tuo hosting potrebbe
                      averla disabilitata. In alternativa, usa un plugin come "Insert Headers and Footers".
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Apri il file footer.php
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Nella lista dei file del tema sulla destra, cerca e apri il file{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">footer.php</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Incolla il codice del widget
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Cerca il tag <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code> alla
                    fine del file. Incolla il codice del widget <strong>prima</strong> di questo tag:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`<!-- Altri contenuti del footer -->

<script src="https://cdn.domusreport.mainstream.agency/widget.js"
        data-widget-id="IL_TUO_WIDGET_ID"
        async></script>

</body>
</html>`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full flex-shrink-0 font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Salva e verifica
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Clicca su <strong>Aggiorna File</strong> per salvare le modifiche. Poi visita il tuo
                    sito e verifica che il bottone del widget appaia in basso a destra.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <strong>Fatto! Il widget è ora attivo sul tuo sito.</strong>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Method */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Metodo Alternativo: Plugin "Insert Headers and Footers"
              </h2>
              <ol className="space-y-3 text-gray-700">
                <li>1. Installa e attiva il plugin "Insert Headers and Footers"</li>
                <li>2. Vai su <strong>Impostazioni → Insert Headers and Footers</strong></li>
                <li>3. Incolla il codice del widget nella sezione <strong>Footer</strong></li>
                <li>4. Clicca su <strong>Salva</strong></li>
              </ol>
            </CardContent>
          </Card>

          {/* Help */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Hai bisogno di aiuto?
            </h3>
            <p className="text-gray-600 mb-6">
              Se incontri problemi durante l'installazione, il nostro team è qui per aiutarti
            </p>
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
