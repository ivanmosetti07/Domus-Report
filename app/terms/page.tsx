import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Termini e Condizioni - DomusReport",
  description: "Termini e condizioni d'uso di DomusReport",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Termini e Condizioni
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Ultimo aggiornamento: Dicembre 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Accettazione dei Termini</h2>
            <p className="text-gray-700 leading-relaxed">
              Utilizzando DomusReport, accetti integralmente i presenti Termini e Condizioni. Se non accetti
              questi termini, ti preghiamo di non utilizzare la piattaforma. DomusReport è un servizio
              fornito da Mainstream Agency.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrizione del Servizio</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              DomusReport è una piattaforma SaaS (Software as a Service) che offre:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Widget chatbot per valutazioni immobiliari automatiche</li>
              <li>Sistema CRM per la gestione dei lead</li>
              <li>Calcoli di valutazione basati su dati OMI ufficiali</li>
              <li>Dashboard per agenzie immobiliari</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registrazione e Account</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Per utilizzare DomusReport è necessario registrarsi e creare un account. L'utente si impegna a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Fornire informazioni veritiere, accurate e aggiornate</li>
              <li>Mantenere la riservatezza delle credenziali di accesso</li>
              <li>Notificare immediatamente eventuali accessi non autorizzati</li>
              <li>Essere responsabile di tutte le attività svolte tramite il proprio account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Piani e Pagamenti</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              DomusReport offre diversi piani tariffari:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Piano Gratuito:</strong> 50 valutazioni al mese, nessun costo</li>
              <li><strong>Piani a Pagamento:</strong> funzionalità avanzate con addebito mensile</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              I pagamenti vengono elaborati tramite gateway sicuri. L'agenzia può disdire in qualsiasi momento
              senza vincoli contrattuali. In caso di disdetta, il servizio rimane attivo fino alla fine del
              periodo già pagato.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Utilizzo Consentito</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              L'utente si impegna a utilizzare DomusReport esclusivamente per:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Attività legate al business immobiliare</li>
              <li>Generazione di lead tramite il proprio sito web</li>
              <li>Gestione dei contatti acquisiti tramite la piattaforma</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              È vietato:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Rivendere o redistribuire il servizio</li>
              <li>Utilizzare il servizio per scopi illegali o fraudolenti</li>
              <li>Tentare di violare la sicurezza della piattaforma</li>
              <li>Estrarre dati tramite scraping o bot non autorizzati</li>
              <li>Modificare, copiare o creare opere derivate del software</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Proprietà Intellettuale</h2>
            <p className="text-gray-700 leading-relaxed">
              Tutti i diritti di proprietà intellettuale relativi a DomusReport (codice sorgente, design,
              contenuti, marchi) appartengono a Mainstream Agency. L'utente riceve una licenza d'uso limitata,
              non esclusiva, non trasferibile per l'utilizzo del servizio secondo i termini concordati.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Valutazioni Immobiliari</h2>
            <p className="text-gray-700 leading-relaxed">
              Le valutazioni fornite da DomusReport sono calcolate automaticamente utilizzando dati OMI
              (Osservatorio del Mercato Immobiliare) e algoritmi proprietari. Le valutazioni hanno scopo
              indicativo e non sostituiscono una perizia professionale. Mainstream Agency non si assume
              responsabilità per decisioni commerciali basate esclusivamente su tali valutazioni.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disponibilità del Servizio</h2>
            <p className="text-gray-700 leading-relaxed">
              Ci impegniamo a garantire la massima disponibilità del servizio (uptime target: 99.5%). Tuttavia,
              il servizio potrebbe essere temporaneamente interrotto per manutenzione programmata, aggiornamenti
              o cause di forza maggiore. Non saremo responsabili per eventuali danni derivanti da interruzioni
              del servizio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitazione di Responsabilità</h2>
            <p className="text-gray-700 leading-relaxed">
              DomusReport è fornito "così com'è" senza garanzie di alcun tipo. Mainstream Agency non è
              responsabile per:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Perdite di profitti o opportunità commerciali</li>
              <li>Perdita di dati dovuta a malfunzionamenti</li>
              <li>Uso improprio del servizio da parte di terzi</li>
              <li>Inaccuratezza dei dati forniti dagli utenti finali</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Trattamento dei Dati</h2>
            <p className="text-gray-700 leading-relaxed">
              L'agenzia è Titolare del trattamento per i dati dei propri lead. DomusReport agisce come
              Responsabile del trattamento. Il trattamento dei dati è regolato dalla nostra Privacy Policy
              e da eventuali accordi specifici di Data Processing Agreement (DPA).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifiche ai Termini</h2>
            <p className="text-gray-700 leading-relaxed">
              Mainstream Agency si riserva il diritto di modificare questi Termini e Condizioni in qualsiasi
              momento. Le modifiche sostanziali saranno comunicate via email. L'uso continuato del servizio
              dopo la notifica costituisce accettazione dei nuovi termini.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Rescissione</h2>
            <p className="text-gray-700 leading-relaxed">
              L'utente può cancellare il proprio account in qualsiasi momento. Mainstream Agency si riserva
              il diritto di sospendere o terminare l'account in caso di violazione dei presenti Termini.
              In caso di cancellazione, i dati saranno conservati secondo quanto previsto dalla Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Legge Applicabile e Foro Competente</h2>
            <p className="text-gray-700 leading-relaxed">
              I presenti Termini e Condizioni sono regolati dalla legge italiana. Per qualsiasi controversia
              sarà competente in via esclusiva il Foro di Milano.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contatti</h2>
            <p className="text-gray-700 leading-relaxed">
              Per qualsiasi domanda relativa ai Termini e Condizioni, contatta:<br />
              <strong>Mainstream Agency</strong><br />
              Email: info@domusreport.it
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
