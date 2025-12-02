import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function HTMLDocsPage() {
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
          Installare DomusReport su HTML
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Integrazione semplice per qualsiasi sito HTML statico
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
                    Apri il file HTML
                  </h2>
                  <p className="text-gray-600">
                    Apri il file HTML della tua pagina con un editor di testo (VS Code, Sublime Text,
                    Notepad++, ecc.)
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
                    Trova il tag &lt;/body&gt;
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Cerca il tag di chiusura <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code>{" "}
                    alla fine del file (solitamente verso la fine del documento)
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
                    Incolla il codice prima di &lt;/body&gt;
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Incolla il codice del widget <strong>immediatamente prima</strong> del tag{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code>:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`<!DOCTYPE html>
<html>
<head>
    <title>Il Mio Sito</title>
</head>
<body>

    <!-- Il tuo contenuto qui -->

    <!-- Widget DomusReport - INCOLLA QUI -->
    <script src="https://cdn.domusreport.mainstream.agency/widget.js"
            data-widget-id="IL_TUO_WIDGET_ID"
            async></script>

</body>
</html>`}</code>
                  </pre>
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Suggerimento:</strong> Sostituisci{" "}
                      <code className="bg-blue-100 px-1 rounded">IL_TUO_WIDGET_ID</code> con il tuo
                      Widget ID reale dalla dashboard.
                    </p>
                  </div>
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
                    Salva e Carica Online
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Salva il file e caricalo sul tuo server tramite FTP o il pannello di controllo del tuo hosting.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <strong>Fatto! Visita il tuo sito per vedere il widget.</strong>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multiple Pages Note */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                📄 Se hai più pagine HTML
              </h2>
              <p className="text-gray-700">
                Ripeti l'operazione per ogni file HTML in cui vuoi mostrare il widget. Oppure,
                considera di creare un file <code className="bg-yellow-100 px-2 py-1 rounded">footer.html</code>{" "}
                comune e includilo con JavaScript o SSI (Server Side Includes).
              </p>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Problemi con l'installazione?
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
