import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Privacy Policy - DomusReport",
  description: "Informativa sulla privacy di DomusReport",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Ultimo aggiornamento: Dicembre 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduzione</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              La presente Privacy Policy descrive come DomusReport, sviluppato da Mainstream Agency,
              raccoglie, utilizza e protegge i dati personali degli utenti che utilizzano la piattaforma.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ci impegniamo a proteggere la privacy degli utenti nel rispetto del Regolamento Generale
              sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Titolare del Trattamento</h2>
            <p className="text-gray-700 leading-relaxed">
              Mainstream Agency<br />
              Email: info@domusreport.it
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Dati Raccolti</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nel corso dell'utilizzo della piattaforma, raccogliamo le seguenti categorie di dati:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Dati di registrazione delle agenzie:</strong> nome, email, città, password (criptata)</li>
              <li><strong>Dati dei lead:</strong> nome, cognome, email, telefono (opzionale)</li>
              <li><strong>Dati immobiliari:</strong> indirizzo, tipologia, superficie, caratteristiche</li>
              <li><strong>Dati di utilizzo:</strong> interazioni con il widget, conversazioni, timestamp</li>
              <li><strong>Dati tecnici:</strong> indirizzo IP, browser, cookie tecnici necessari al funzionamento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Finalità del Trattamento</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              I dati personali vengono trattati per le seguenti finalità:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Erogazione del servizio di valutazione immobiliare</li>
              <li>Gestione degli account delle agenzie</li>
              <li>Generazione e consegna dei lead alle agenzie</li>
              <li>Miglioramento del servizio e analisi statistiche</li>
              <li>Comunicazioni relative al servizio</li>
              <li>Adempimento di obblighi legali e fiscali</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Base Giuridica</h2>
            <p className="text-gray-700 leading-relaxed">
              Il trattamento dei dati personali si basa su:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Esecuzione del contratto (per l'erogazione del servizio)</li>
              <li>Consenso dell'interessato (per comunicazioni marketing)</li>
              <li>Legittimo interesse (per miglioramenti del servizio)</li>
              <li>Adempimento di obblighi di legge</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Conservazione dei Dati</h2>
            <p className="text-gray-700 leading-relaxed">
              I dati personali vengono conservati per il tempo necessario alle finalità per cui sono stati
              raccolti e in conformità agli obblighi di legge. I dati dei lead vengono conservati per tutta
              la durata dell'account dell'agenzia, salvo richiesta di cancellazione da parte dell'interessato.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Diritti degli Interessati</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In qualità di interessato, hai diritto a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Accedere ai tuoi dati personali</li>
              <li>Rettificare i dati inesatti o incompleti</li>
              <li>Richiedere la cancellazione dei dati</li>
              <li>Limitare il trattamento</li>
              <li>Opporti al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Proporre reclamo all'Autorità Garante</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Per esercitare i tuoi diritti, contattaci all'indirizzo: info@domusreport.it
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Sicurezza</h2>
            <p className="text-gray-700 leading-relaxed">
              Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali da accessi
              non autorizzati, perdita, distruzione o divulgazione. I dati sono protetti mediante crittografia
              SSL/TLS, password criptate e accesso limitato ai soli operatori autorizzati.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookie</h2>
            <p className="text-gray-700 leading-relaxed">
              DomusReport utilizza cookie tecnici strettamente necessari al funzionamento del servizio.
              Non utilizziamo cookie di profilazione o tracciamento a fini pubblicitari.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifiche alla Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              Ci riserviamo il diritto di modificare questa Privacy Policy. Le modifiche saranno pubblicate
              su questa pagina con indicazione della data di ultimo aggiornamento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contatti</h2>
            <p className="text-gray-700 leading-relaxed">
              Per qualsiasi domanda o richiesta relativa alla presente Privacy Policy, contatta:<br />
              <strong>Email:</strong> info@domusreport.it
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
