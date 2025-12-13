import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Privacy Policy - DomusReport",
  description: "Informativa sulla privacy di DomusReport",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="legal-page marketing-prose">
        <h1>Privacy Policy</h1>
        <p>Ultimo aggiornamento: Dicembre 2024</p>

        <section>
          <h2>1. Introduzione</h2>
          <p>
            La presente Privacy Policy descrive come DomusReport, sviluppato da Mainstream Agency,
            raccoglie, utilizza e protegge i dati personali degli utenti che utilizzano la piattaforma.
          </p>
          <p>
            Ci impegniamo a proteggere la privacy degli utenti nel rispetto del Regolamento Generale
            sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679).
          </p>
        </section>

        <section>
          <h2>2. Titolare del Trattamento</h2>
          <p>
            Mainstream Agency<br />
            Email: info@domusreport.it
          </p>
        </section>

        <section>
          <h2>3. Dati Raccolti</h2>
          <p>
            Nel corso dell'utilizzo della piattaforma, raccogliamo le seguenti categorie di dati:
          </p>
          <ul>
            <li><strong>Dati di registrazione delle agenzie:</strong> nome, email, città, password (criptata)</li>
            <li><strong>Dati dei lead:</strong> nome, cognome, email, telefono (opzionale)</li>
            <li><strong>Dati immobiliari:</strong> indirizzo, tipologia, superficie, caratteristiche</li>
            <li><strong>Dati di utilizzo:</strong> interazioni con il widget, conversazioni, timestamp</li>
            <li><strong>Dati tecnici:</strong> indirizzo IP, browser, cookie tecnici necessari al funzionamento</li>
          </ul>
        </section>

        <section>
          <h2>4. Finalità del Trattamento</h2>
          <p>I dati personali vengono trattati per le seguenti finalità:</p>
          <ul>
            <li>Erogazione del servizio di valutazione immobiliare</li>
            <li>Gestione degli account delle agenzie</li>
            <li>Generazione e consegna dei lead alle agenzie</li>
            <li>Miglioramento del servizio e analisi statistiche</li>
            <li>Comunicazioni relative al servizio</li>
            <li>Adempimento di obblighi legali e fiscali</li>
          </ul>
        </section>

        <section>
          <h2>5. Base Giuridica</h2>
          <p>Il trattamento dei dati personali si basa su:</p>
          <ul>
            <li>Esecuzione del contratto (per l'erogazione del servizio)</li>
            <li>Consenso dell'interessato (per comunicazioni marketing)</li>
            <li>Legittimo interesse (per miglioramenti del servizio)</li>
            <li>Adempimento di obblighi di legge</li>
          </ul>
        </section>

        <section>
          <h2>6. Conservazione dei Dati</h2>
          <p>
            I dati personali vengono conservati per il tempo necessario alle finalità per cui sono stati
            raccolti e in conformità agli obblighi di legge. I dati dei lead vengono conservati per tutta
            la durata dell'account dell'agenzia, salvo richiesta di cancellazione da parte dell'interessato.
          </p>
        </section>

        <section>
          <h2>7. Diritti degli Interessati</h2>
          <p>In qualità di interessato, hai diritto a:</p>
          <ul>
            <li>Accedere ai tuoi dati personali</li>
            <li>Rettificare i dati inesatti o incompleti</li>
            <li>Richiedere la cancellazione dei dati</li>
            <li>Limitare il trattamento</li>
            <li>Opporti al trattamento</li>
            <li>Richiedere la portabilità dei dati</li>
            <li>Revocare il consenso in qualsiasi momento</li>
            <li>Proporre reclamo all'Autorità Garante</li>
          </ul>
          <p>
            Per esercitare i tuoi diritti, contattaci all'indirizzo: info@domusreport.it
          </p>
        </section>

        <section>
          <h2>8. Sicurezza</h2>
          <p>
            Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali da accessi
            non autorizzati, perdita, distruzione o divulgazione. I dati sono protetti mediante crittografia
            SSL/TLS, password criptate e accesso limitato ai soli operatori autorizzati.
          </p>
        </section>

        <section>
          <h2>9. Cookie</h2>
          <p>
            DomusReport utilizza cookie tecnici strettamente necessari al funzionamento del servizio.
            Non utilizziamo cookie di profilazione o tracciamento a fini pubblicitari.
          </p>
        </section>

        <section>
          <h2>10. Modifiche alla Privacy Policy</h2>
          <p>
            Ci riserviamo il diritto di modificare questa Privacy Policy. Le modifiche saranno pubblicate
            su questa pagina con indicazione della data di ultimo aggiornamento.
          </p>
        </section>

        <section>
          <h2>11. Contatti</h2>
          <p>
            Per qualsiasi domanda o richiesta relativa alla presente Privacy Policy, contatta:<br />
            <strong>Email:</strong> info@domusreport.it
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
