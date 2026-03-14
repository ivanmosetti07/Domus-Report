import { formatCurrency } from './utils'

// ─── Layout base condiviso ──────────────────────────────────────────────────

function emailLayout(options: {
  headerTitle: string
  headerSubtitle?: string
  headerGradient: string
  bodyHtml: string
  unsubscribeUrl: string
}): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.headerTitle} - Domus Report</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f4f4; }
    .email-container { background-color: #ffffff; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: ${options.headerGradient}; color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
    .header .subtitle { font-size: 14px; opacity: 0.9; margin-top: 8px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 13px; margin-top: 8px; }
    .content { padding: 30px 20px; }
    .content p { font-size: 15px; margin: 12px 0; color: #374151; }
    .highlight-box { background: #f0f9ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
    .stat-grid { display: flex; gap: 12px; margin: 20px 0; }
    .stat-card { flex: 1; background: #f9fafb; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-card .number { font-size: 24px; font-weight: bold; color: #2563eb; }
    .stat-card .label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .step-list { margin: 20px 0; }
    .step-item { display: flex; gap: 12px; margin: 12px 0; align-items: flex-start; }
    .step-number { background: #2563eb; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; }
    .step-text { font-size: 14px; color: #374151; padding-top: 4px; }
    .cta { display: block; background: #2563eb; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; text-align: center; margin: 24px 0; font-size: 16px; }
    .cta-secondary { display: block; background: transparent; color: #2563eb !important; text-decoration: none; padding: 12px 24px; border: 2px solid #2563eb; border-radius: 6px; font-weight: bold; text-align: center; margin: 16px 0; font-size: 14px; }
    .price-box { background: #16a34a; color: #fff; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
    .price-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.85; }
    .price-box .price { font-size: 28px; font-weight: bold; margin-top: 4px; }
    .comparison-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    .comparison-table th { background: #f9fafb; padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; }
    .comparison-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .comparison-table .check { color: #16a34a; font-weight: bold; }
    .comparison-table .cross { color: #dc2626; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .unsubscribe { font-size: 11px; color: #9ca3af; margin-top: 12px; }
    .unsubscribe a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${options.headerTitle}</h1>
      ${options.headerSubtitle ? `<p class="subtitle">${options.headerSubtitle}</p>` : ''}
      <div class="badge">Domus Report</div>
    </div>
    <div class="content">
      ${options.bodyHtml}
    </div>
    <div class="footer">
      <p>Domus Report - Il tuo agente AI per la valutazione immobiliare</p>
      <div class="unsubscribe">
        <a href="${options.unsubscribeUrl}">Disiscriviti da queste email</a>
      </div>
    </div>
  </div>
</body>
</html>`
}

// ─── Interfacce ─────────────────────────────────────────────────────────────

interface DemoNurtureData {
  firstName: string
  city: string
  estimatedPrice: number
  appUrl: string
  unsubscribeUrl: string
}

interface OnboardingData {
  agencyName: string
  appUrl: string
  unsubscribeUrl: string
}

interface FreeUpgradeData {
  agencyName: string
  valuationsUsed: number
  valuationsLimit: number
  leadsGenerated: number
  appUrl: string
  unsubscribeUrl: string
}

// ═══════════════════════════════════════════════════════════════════════════
// FLUSSO A: Demo Nurture (Demo → Iscritto)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Step 1 (1h dopo demo) ──────────────────────────────────────────────────

export function generateDemoNurtureStep1HTML(data: DemoNurtureData): string {
  return emailLayout({
    headerTitle: 'La tua valutazione immobiliare',
    headerSubtitle: `Immobile a ${data.city}`,
    headerGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.firstName}</strong>,</p>
      <p>Poco fa hai provato la nostra demo e hai ottenuto una valutazione per il tuo immobile a <strong>${data.city}</strong>.</p>

      <div class="price-box">
        <div class="label">Valore Stimato</div>
        <div class="price">${formatCurrency(data.estimatedPrice)}</div>
      </div>

      <p>Questa stessa esperienza puoi offrirla ai <strong>visitatori del tuo sito web</strong>. Ecco come funziona:</p>

      <div class="step-list">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-text"><strong>Registrati gratis</strong> — crea il tuo account in 30 secondi</div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-text"><strong>Personalizza il widget</strong> — scegli colori e stile del tuo brand</div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-text"><strong>Installa sul tuo sito</strong> — copia e incolla una riga di codice</div>
        </div>
      </div>

      <p>I visitatori del tuo sito potranno ottenere una valutazione istantanea, e tu riceverai i loro dati di contatto come <strong>lead qualificati</strong>.</p>

      <a href="${data.appUrl}/register" class="cta">Registrati Gratis</a>
      <a href="${data.appUrl}/#pricing" class="cta-secondary">Scopri i Piani</a>
    `
  })
}

export function generateDemoNurtureStep1Text(data: DemoNurtureData): string {
  return `Ciao ${data.firstName},

Poco fa hai provato la nostra demo e hai ottenuto una valutazione per il tuo immobile a ${data.city}.

VALORE STIMATO: ${formatCurrency(data.estimatedPrice)}

Questa stessa esperienza puoi offrirla ai visitatori del tuo sito web:

1. Registrati gratis — crea il tuo account in 30 secondi
2. Personalizza il widget — scegli colori e stile del tuo brand
3. Installa sul tuo sito — copia e incolla una riga di codice

I visitatori potranno ottenere una valutazione istantanea, e tu riceverai i loro dati come lead qualificati.

Registrati: ${data.appUrl}/register
Scopri i piani: ${data.appUrl}/#pricing

---
Disiscriviti: ${data.unsubscribeUrl}`
}

// ─── Step 2 (24h dopo demo) ─────────────────────────────────────────────────

export function generateDemoNurtureStep2HTML(data: DemoNurtureData): string {
  return emailLayout({
    headerTitle: 'Come generare 3x lead con l\'AI',
    headerSubtitle: 'Le agenzie che lo usano non tornano indietro',
    headerGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.firstName}</strong>,</p>
      <p>Sai che il <strong>78% dei proprietari</strong> cerca una valutazione online prima di contattare un'agenzia?</p>

      <div class="highlight-box">
        <strong>Il problema:</strong> Se non offri una valutazione sul tuo sito, quei proprietari vanno dalla concorrenza.
      </div>

      <p>Con Domus Report, il tuo sito diventa una <strong>macchina per generare lead</strong>:</p>

      <div style="margin: 20px 0;">
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="background:#f0fdf4; border-radius:8px; padding:16px; text-align:center; width:33%;">
              <div style="font-size:28px; font-weight:bold; color:#16a34a;">24/7</div>
              <div style="font-size:12px; color:#6b7280; margin-top:4px;">Attivo sempre</div>
            </td>
            <td style="width:4%;"></td>
            <td style="background:#eff6ff; border-radius:8px; padding:16px; text-align:center; width:33%;">
              <div style="font-size:28px; font-weight:bold; color:#2563eb;">3x</div>
              <div style="font-size:12px; color:#6b7280; margin-top:4px;">Piu lead</div>
            </td>
            <td style="width:4%;"></td>
            <td style="background:#fdf4ff; border-radius:8px; padding:16px; text-align:center; width:33%;">
              <div style="font-size:28px; font-weight:bold; color:#9333ea;">98%</div>
              <div style="font-size:12px; color:#6b7280; margin-top:4px;">Precisione OMI</div>
            </td>
          </tr>
        </table>
      </div>

      <p>Non hai bisogno di competenze tecniche. Il widget si installa con <strong>una riga di codice</strong> e funziona su qualsiasi sito web.</p>

      <a href="${data.appUrl}/register" class="cta">Inizia la Prova Gratuita</a>

      <p style="font-size: 13px; color: #6b7280; text-align: center;">Nessuna carta di credito richiesta per il piano Free</p>
    `
  })
}

export function generateDemoNurtureStep2Text(data: DemoNurtureData): string {
  return `Ciao ${data.firstName},

Sai che il 78% dei proprietari cerca una valutazione online prima di contattare un'agenzia?

IL PROBLEMA: Se non offri una valutazione sul tuo sito, quei proprietari vanno dalla concorrenza.

Con Domus Report, il tuo sito diventa una macchina per generare lead:
- Attivo 24/7
- 3x piu lead rispetto ai form tradizionali
- 98% precisione grazie ai dati OMI

Non hai bisogno di competenze tecniche. Il widget si installa con una riga di codice.

Inizia la prova gratuita: ${data.appUrl}/register
Nessuna carta di credito richiesta per il piano Free.

---
Disiscriviti: ${data.unsubscribeUrl}`
}

// ─── Step 3 (72h dopo demo) ─────────────────────────────────────────────────

export function generateDemoNurtureStep3HTML(data: DemoNurtureData): string {
  return emailLayout({
    headerTitle: 'Non perdere questa opportunita',
    headerSubtitle: 'Il tuo agente AI ti aspetta',
    headerGradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.firstName}</strong>,</p>
      <p>Qualche giorno fa hai testato il nostro widget di valutazione immobiliare. Hai visto come funziona, hai visto i risultati.</p>

      <div class="highlight-box">
        <strong>Mentre leggi questa email</strong>, i tuoi competitor stanno raccogliendo lead dal loro sito con chatbot AI. Non restare indietro.
      </div>

      <p>Ecco cosa ottieni <strong>gratis</strong> con Domus Report:</p>

      <div style="margin: 16px 0;">
        <table style="width:100%; font-size:14px;">
          <tr><td style="padding:8px 0;">&#10003; Widget AI personalizzabile</td></tr>
          <tr><td style="padding:8px 0;">&#10003; 5 valutazioni gratuite al mese</td></tr>
          <tr><td style="padding:8px 0;">&#10003; Notifiche email per ogni lead</td></tr>
          <tr><td style="padding:8px 0;">&#10003; Dashboard con tutti i contatti</td></tr>
          <tr><td style="padding:8px 0;">&#10003; Setup in meno di 2 minuti</td></tr>
        </table>
      </div>

      <a href="${data.appUrl}/register" class="cta">Registrati Gratis Ora</a>

      <p style="font-size: 13px; color: #6b7280; text-align: center;">
        Questa e l'ultima email di questa serie. Se cambi idea, potrai sempre registrarti su <a href="${data.appUrl}" style="color:#2563eb;">domusreport.it</a>
      </p>
    `
  })
}

export function generateDemoNurtureStep3Text(data: DemoNurtureData): string {
  return `Ciao ${data.firstName},

Qualche giorno fa hai testato il nostro widget di valutazione immobiliare. Hai visto come funziona, hai visto i risultati.

Mentre leggi questa email, i tuoi competitor stanno raccogliendo lead dal loro sito con chatbot AI.

Ecco cosa ottieni GRATIS con Domus Report:
- Widget AI personalizzabile
- 5 valutazioni gratuite al mese
- Notifiche email per ogni lead
- Dashboard con tutti i contatti
- Setup in meno di 2 minuti

Registrati gratis: ${data.appUrl}/register

Questa e l'ultima email di questa serie.

---
Disiscriviti: ${data.unsubscribeUrl}`
}

// ═══════════════════════════════════════════════════════════════════════════
// FLUSSO B: Onboarding Completion (Widget non configurato)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Step 1 (24h dopo registrazione) ────────────────────────────────────────

export function generateOnboardingStep1HTML(data: OnboardingData): string {
  return emailLayout({
    headerTitle: 'Il tuo widget ti aspetta!',
    headerSubtitle: 'Configuralo in 2 minuti',
    headerGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.agencyName}</strong>,</p>
      <p>Hai creato il tuo account su Domus Report, ottimo! Ora manca solo un passaggio per iniziare a ricevere lead: <strong>configurare il widget</strong>.</p>

      <div class="highlight-box">
        <strong>Ci vogliono solo 2 minuti.</strong> Scegli i colori del tuo brand, personalizza lo stile e copia il codice sul tuo sito.
      </div>

      <p>Ecco come fare:</p>

      <div class="step-list">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-text">Vai nella sezione <strong>"Widget"</strong> della tua dashboard</div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-text">Scegli <strong>colori e stile</strong> che si adattano al tuo sito</div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-text"><strong>Copia il codice</strong> e incollalo prima del tag &lt;/body&gt; del tuo sito</div>
        </div>
      </div>

      <a href="${data.appUrl}/dashboard/widgets" class="cta">Configura il Widget Ora</a>

      <p style="font-size: 13px; color: #6b7280; text-align: center;">
        Hai bisogno di aiuto? Rispondi a questa email e ti aiuteremo.
      </p>
    `
  })
}

export function generateOnboardingStep1Text(data: OnboardingData): string {
  return `Ciao ${data.agencyName},

Hai creato il tuo account su Domus Report! Ora manca solo un passaggio: configurare il widget.

Ci vogliono solo 2 minuti:
1. Vai nella sezione "Widget" della tua dashboard
2. Scegli colori e stile che si adattano al tuo sito
3. Copia il codice e incollalo nel tuo sito

Configura ora: ${data.appUrl}/dashboard/widgets

Hai bisogno di aiuto? Rispondi a questa email.

---
Disiscriviti: ${data.unsubscribeUrl}`
}

// ─── Step 2 (72h dopo registrazione) ────────────────────────────────────────

export function generateOnboardingStep2HTML(data: OnboardingData): string {
  return emailLayout({
    headerTitle: 'I tuoi competitor sono gia online',
    headerSubtitle: 'Non restare indietro',
    headerGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.agencyName}</strong>,</p>
      <p>Ogni giorno che passa senza il widget sul tuo sito, sono lead che vanno alla concorrenza.</p>

      <div style="margin: 20px 0;">
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="background:#fef2f2; border-radius:8px; padding:16px; text-align:center; width:48%;">
              <div style="font-size:14px; font-weight:bold; color:#dc2626;">Senza Widget</div>
              <div style="font-size:12px; color:#6b7280; margin-top:8px;">I visitatori lasciano il tuo sito senza lasciare contatto</div>
            </td>
            <td style="width:4%;"></td>
            <td style="background:#f0fdf4; border-radius:8px; padding:16px; text-align:center; width:48%;">
              <div style="font-size:14px; font-weight:bold; color:#16a34a;">Con Widget</div>
              <div style="font-size:12px; color:#6b7280; margin-top:8px;">Ogni visitatore diventa un lead qualificato con nome, email e telefono</div>
            </td>
          </tr>
        </table>
      </div>

      <p>Le agenzie sulla nostra piattaforma ricevono in media <strong>12 lead al mese</strong> gia dal primo mese di attivazione.</p>

      <a href="${data.appUrl}/dashboard/widgets" class="cta">Configura il Widget Adesso</a>
    `
  })
}

export function generateOnboardingStep2Text(data: OnboardingData): string {
  return `Ciao ${data.agencyName},

Ogni giorno senza il widget sul tuo sito sono lead persi.

SENZA WIDGET: I visitatori lasciano il tuo sito senza lasciare contatto.
CON WIDGET: Ogni visitatore diventa un lead qualificato con nome, email e telefono.

Le agenzie sulla piattaforma ricevono in media 12 lead al mese dal primo mese.

Configura ora: ${data.appUrl}/dashboard/widgets

---
Disiscriviti: ${data.unsubscribeUrl}`
}

// ─── Step 3 (7 giorni dopo registrazione) ───────────────────────────────────

export function generateOnboardingStep3HTML(data: OnboardingData): string {
  return emailLayout({
    headerTitle: 'Possiamo aiutarti?',
    headerSubtitle: 'Il team Domus Report e qui per te',
    headerGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.agencyName}</strong>,</p>
      <p>Abbiamo notato che non hai ancora configurato il widget sul tuo sito. Tutto bene?</p>

      <p>Se hai bisogno di assistenza, siamo qui per aiutarti. Possiamo:</p>

      <div style="margin: 16px 0;">
        <table style="width:100%; font-size:14px;">
          <tr><td style="padding:8px 0;">&#10003; Guidarti nella configurazione passo per passo</td></tr>
          <tr><td style="padding:8px 0;">&#10003; Installare il widget direttamente sul tuo sito</td></tr>
          <tr><td style="padding:8px 0;">&#10003; Personalizzare il widget con i colori del tuo brand</td></tr>
          <tr><td style="padding:8px 0;">&#10003; Rispondere a qualsiasi domanda tecnica</td></tr>
        </table>
      </div>

      <div class="highlight-box">
        <strong>Rispondi semplicemente a questa email</strong> e un membro del nostro team ti contatterà entro 24 ore.
      </div>

      <a href="${data.appUrl}/dashboard/widgets" class="cta">Configura il Widget</a>
      <a href="mailto:support@domusreport.it" class="cta-secondary">Contatta il Supporto</a>

      <p style="font-size: 13px; color: #6b7280; text-align: center;">
        Questa e l'ultima email di questa serie.
      </p>
    `
  })
}

export function generateOnboardingStep3Text(data: OnboardingData): string {
  return `Ciao ${data.agencyName},

Abbiamo notato che non hai ancora configurato il widget. Tutto bene?

Possiamo aiutarti:
- Guidarti nella configurazione passo per passo
- Installare il widget direttamente sul tuo sito
- Personalizzare il widget con i colori del tuo brand
- Rispondere a qualsiasi domanda tecnica

Rispondi a questa email e ti contatteremo entro 24 ore.

Configura il widget: ${data.appUrl}/dashboard/widgets
Contatta il supporto: support@domusreport.it

---
Disiscriviti: ${data.unsubscribeUrl}`
}

// ═══════════════════════════════════════════════════════════════════════════
// FLUSSO C: Free → Basic Upgrade
// ═══════════════════════════════════════════════════════════════════════════

// ─── Step 1 (7 giorni dopo registrazione) ───────────────────────────────────

export function generateFreeUpgradeStep1HTML(data: FreeUpgradeData): string {
  const remaining = Math.max(0, data.valuationsLimit - data.valuationsUsed)

  return emailLayout({
    headerTitle: 'Le tue valutazioni stanno finendo',
    headerSubtitle: `${remaining} valutazioni rimaste questo mese`,
    headerGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.agencyName}</strong>,</p>
      <p>Hai gia usato <strong>${data.valuationsUsed} su ${data.valuationsLimit}</strong> valutazioni gratuite questo mese. Ottimo lavoro!</p>

      <div style="margin: 20px 0; background: #f9fafb; border-radius: 8px; padding: 20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:14px; color:#6b7280;">Utilizzo mensile</span>
          <span style="font-size:14px; font-weight:bold;">${data.valuationsUsed}/${data.valuationsLimit}</span>
        </div>
        <div style="background:#e5e7eb; border-radius:4px; height:8px; overflow:hidden;">
          <div style="background:${remaining <= 1 ? '#dc2626' : '#f59e0b'}; height:100%; width:${Math.min(100, (data.valuationsUsed / data.valuationsLimit) * 100)}%; border-radius:4px;"></div>
        </div>
      </div>

      ${data.leadsGenerated > 0 ? `
      <p>Hai gia generato <strong>${data.leadsGenerated} lead</strong> - immagina quanti ne potresti ottenere con <strong>50 valutazioni al mese</strong>.</p>
      ` : ''}

      <p>Con il <strong>piano Basic</strong> (50 euro/mese) ottieni:</p>

      <div style="margin: 16px 0;">
        <table style="width:100%; font-size:14px;">
          <tr><td style="padding:8px 0;">&#10003; <strong>50 valutazioni</strong> al mese (10x di piu)</td></tr>
          <tr><td style="padding:8px 0;">&#10003; <strong>3 widget</strong> personalizzabili</td></tr>
          <tr><td style="padding:8px 0;">&#10003; <strong>Analytics completo</strong> con conversion rate</td></tr>
          <tr><td style="padding:8px 0;">&#10003; <strong>Custom branding</strong> senza logo Domus Report</td></tr>
          <tr><td style="padding:8px 0;">&#10003; <strong>Supporto prioritario</strong></td></tr>
        </table>
      </div>

      <a href="${data.appUrl}/dashboard/subscription" class="cta">Passa al Piano Basic</a>
    `
  })
}

export function generateFreeUpgradeStep1Text(data: FreeUpgradeData): string {
  const remaining = Math.max(0, data.valuationsLimit - data.valuationsUsed)
  return `Ciao ${data.agencyName},

Hai usato ${data.valuationsUsed} su ${data.valuationsLimit} valutazioni gratuite questo mese. Rimangono ${remaining}.

${data.leadsGenerated > 0 ? `Hai gia generato ${data.leadsGenerated} lead. Immagina quanti ne potresti ottenere con 50 valutazioni al mese.` : ''}

Con il piano Basic (50 euro/mese) ottieni:
- 50 valutazioni al mese (10x di piu)
- 3 widget personalizzabili
- Analytics completo
- Custom branding
- Supporto prioritario

Upgrade: ${data.appUrl}/dashboard/subscription

---
Disiscriviti: ${data.unsubscribeUrl}`
}

// ─── Step 2 (14 giorni dopo registrazione) ──────────────────────────────────

export function generateFreeUpgradeStep2HTML(data: FreeUpgradeData): string {
  const potentialLeads = Math.max(data.leadsGenerated * 10, 30)

  return emailLayout({
    headerTitle: 'Stai lasciando lead sul tavolo',
    headerSubtitle: `Potresti generare fino a ${potentialLeads} lead al mese`,
    headerGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.agencyName}</strong>,</p>
      <p>Con il piano Free hai un limite di <strong>${data.valuationsLimit} valutazioni al mese</strong>. Ogni valutazione che non puoi fare e un potenziale lead perso.</p>

      <table class="comparison-table">
        <tr>
          <th></th>
          <th style="text-align:center;">Free</th>
          <th style="text-align:center; background:#eff6ff;">Basic</th>
        </tr>
        <tr>
          <td>Valutazioni/mese</td>
          <td style="text-align:center;">5</td>
          <td style="text-align:center; background:#eff6ff; font-weight:bold;">50</td>
        </tr>
        <tr>
          <td>Widget</td>
          <td style="text-align:center;">1</td>
          <td style="text-align:center; background:#eff6ff; font-weight:bold;">3</td>
        </tr>
        <tr>
          <td>Analytics</td>
          <td style="text-align:center;"><span class="cross">&#10007;</span></td>
          <td style="text-align:center; background:#eff6ff;"><span class="check">&#10003;</span></td>
        </tr>
        <tr>
          <td>Custom Branding</td>
          <td style="text-align:center;"><span class="cross">&#10007;</span></td>
          <td style="text-align:center; background:#eff6ff;"><span class="check">&#10003;</span></td>
        </tr>
        <tr>
          <td>Supporto Prioritario</td>
          <td style="text-align:center;"><span class="cross">&#10007;</span></td>
          <td style="text-align:center; background:#eff6ff;"><span class="check">&#10003;</span></td>
        </tr>
        <tr>
          <td><strong>Prezzo</strong></td>
          <td style="text-align:center;">0 euro</td>
          <td style="text-align:center; background:#eff6ff; font-weight:bold;">50 euro/mese</td>
        </tr>
      </table>

      <div class="highlight-box">
        <strong>Fai i conti:</strong> Se un singolo lead vale in media 500 euro di provvigione, il piano Basic si ripaga con <strong>un solo lead al mese</strong>.
      </div>

      <a href="${data.appUrl}/dashboard/subscription" class="cta">Passa a Basic - 50 euro/mese</a>
    `
  })
}

export function generateFreeUpgradeStep2Text(data: FreeUpgradeData): string {
  return `Ciao ${data.agencyName},

Con il piano Free hai solo ${data.valuationsLimit} valutazioni al mese. Ogni valutazione mancata e un lead perso.

CONFRONTO FREE vs BASIC:
- Valutazioni: 5 vs 50
- Widget: 1 vs 3
- Analytics: No vs Si
- Custom Branding: No vs Si
- Supporto Prioritario: No vs Si
- Prezzo: 0 euro vs 50 euro/mese

Se un singolo lead vale 500 euro di provvigione, il piano Basic si ripaga con UN SOLO LEAD al mese.

Upgrade: ${data.appUrl}/dashboard/subscription

---
Disiscriviti: ${data.unsubscribeUrl}`
}

// ─── Step 3 (21 giorni dopo registrazione) ──────────────────────────────────

export function generateFreeUpgradeStep3HTML(data: FreeUpgradeData): string {
  return emailLayout({
    headerTitle: 'Prova Basic gratis per 7 giorni',
    headerSubtitle: 'Nessuna carta di credito richiesta',
    headerGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    unsubscribeUrl: data.unsubscribeUrl,
    bodyHtml: `
      <p>Ciao <strong>${data.agencyName}</strong>,</p>
      <p>Abbiamo una proposta per te: <strong>prova il piano Basic gratuitamente per 7 giorni</strong>.</p>

      <div class="highlight-box">
        Nessun impegno, nessuna carta di credito. Se non ti convince, torni automaticamente al piano Free.
      </div>

      <p>Durante il trial avrai accesso a:</p>

      <div style="margin: 16px 0;">
        <table style="width:100%; font-size:14px;">
          <tr><td style="padding:8px 0;">&#10003; <strong>50 valutazioni</strong> per testare il volume reale</td></tr>
          <tr><td style="padding:8px 0;">&#10003; <strong>Analytics completo</strong> per misurare i risultati</td></tr>
          <tr><td style="padding:8px 0;">&#10003; <strong>3 widget</strong> per diversi siti o landing page</td></tr>
          <tr><td style="padding:8px 0;">&#10003; <strong>Custom branding</strong> con i tuoi colori</td></tr>
        </table>
      </div>

      ${data.leadsGenerated > 0 ? `
      <p>Con ${data.leadsGenerated} lead gia generati, immagina cosa potresti fare con <strong>10 volte le valutazioni</strong>.</p>
      ` : ''}

      <a href="${data.appUrl}/dashboard/subscription" class="cta">Inizia il Trial Gratuito di 7 Giorni</a>

      <p style="font-size: 13px; color: #6b7280; text-align: center;">
        Questa e l'ultima email di questa serie. Potrai sempre fare l'upgrade dalla tua <a href="${data.appUrl}/dashboard/subscription" style="color:#2563eb;">dashboard</a>.
      </p>
    `
  })
}

export function generateFreeUpgradeStep3Text(data: FreeUpgradeData): string {
  return `Ciao ${data.agencyName},

Prova il piano Basic GRATUITAMENTE per 7 giorni.

Nessun impegno, nessuna carta di credito. Se non ti convince, torni al piano Free.

Durante il trial avrai:
- 50 valutazioni per testare il volume reale
- Analytics completo per misurare i risultati
- 3 widget per diversi siti o landing page
- Custom branding con i tuoi colori

${data.leadsGenerated > 0 ? `Con ${data.leadsGenerated} lead gia generati, immagina cosa faresti con 10x le valutazioni.` : ''}

Inizia il trial: ${data.appUrl}/dashboard/subscription

Questa e l'ultima email di questa serie.

---
Disiscriviti: ${data.unsubscribeUrl}`
}
