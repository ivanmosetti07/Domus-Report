import { formatCurrency } from './utils'

// ─── Template notifica nuovo lead all'agenzia ────────────────────────────────

interface NewLeadNotificationData {
  agencyName: string
  leadName: string
  leadEmail: string
  leadPhone?: string | null
  propertyAddress: string
  propertyCity: string
  propertySurface: number
  estimatedPrice: number
  dashboardUrl: string
}

export function generateNewLeadNotificationHTML(data: NewLeadNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Lead - Domus Report</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f4f4; }
    .email-container { background-color: #ffffff; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 13px; margin-top: 8px; }
    .content { padding: 30px 20px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 24px 0 10px; }
    .info-grid { background: #f9fafb; border-radius: 8px; padding: 18px; margin-bottom: 16px; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; }
    .info-value { font-weight: 600; color: #111827; }
    .price-box { background: #16a34a; color: #fff; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
    .price-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.85; }
    .price-box .price { font-size: 28px; font-weight: bold; margin-top: 4px; }
    .cta { display: block; background: #2563eb; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; text-align: center; margin: 24px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Nuovo Lead Ricevuto!</h1>
      <div class="badge">Domus Report</div>
    </div>
    <div class="content">
      <p>Ciao <strong>${data.agencyName}</strong>, hai ricevuto una nuova richiesta di valutazione immobiliare.</p>

      <div class="section-title">Contatto</div>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Nome</span><span class="info-value">${data.leadName}</span></div>
        <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.leadEmail}</span></div>
        ${data.leadPhone ? `<div class="info-row"><span class="info-label">Telefono</span><span class="info-value">${data.leadPhone}</span></div>` : ''}
      </div>

      <div class="section-title">Immobile</div>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Indirizzo</span><span class="info-value">${data.propertyAddress}</span></div>
        <div class="info-row"><span class="info-label">Città</span><span class="info-value">${data.propertyCity}</span></div>
        <div class="info-row"><span class="info-label">Superficie</span><span class="info-value">${data.propertySurface} m²</span></div>
      </div>

      <div class="price-box">
        <div class="label">Prezzo Stimato</div>
        <div class="price">${formatCurrency(data.estimatedPrice)}</div>
      </div>

      <a href="${data.dashboardUrl}" class="cta">Vedi il Lead nella Dashboard →</a>

      <p style="font-size: 13px; color: #6b7280; margin-top: 8px;">
        Accedi alla dashboard per contattare il cliente e inviare il report completo con il PDF allegato.
      </p>
    </div>
    <div class="footer">
      <p>Notifica automatica da <strong>Domus Report</strong></p>
      <p>Gestisci le preferenze di notifica nella tua dashboard.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function generateNewLeadNotificationText(data: NewLeadNotificationData): string {
  return `
NUOVO LEAD - Domus Report

Ciao ${data.agencyName}, hai ricevuto una nuova richiesta di valutazione.

CONTATTO
Nome: ${data.leadName}
Email: ${data.leadEmail}${data.leadPhone ? `\nTelefono: ${data.leadPhone}` : ''}

IMMOBILE
Indirizzo: ${data.propertyAddress}
Città: ${data.propertyCity}
Superficie: ${data.propertySurface} m²
Prezzo Stimato: ${formatCurrency(data.estimatedPrice)}

Accedi alla dashboard: ${data.dashboardUrl}
  `.trim()
}

// ─── Template notifica admin - nuova agenzia registrata ──────────────────────

interface NewAgencyNotificationData {
  agencyName: string
  agencyEmail: string
  agencyCity: string
  registeredAt: Date
}

export function generateNewAgencyNotificationHTML(data: NewAgencyNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Nuova Agenzia - Domus Report</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background: #f4f4f4; }
    .email-container { background: #fff; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #fff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .content { padding: 30px 20px; }
    .info-grid { background: #f9fafb; border-radius: 8px; padding: 18px; }
    .info-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; }
    .info-value { font-weight: 600; }
    .footer { background: #f9fafb; padding: 16px 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Nuova Agenzia Registrata</h1>
    </div>
    <div class="content">
      <p>Una nuova agenzia si è appena iscritta sulla piattaforma <strong>Domus Report</strong>.</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Nome Agenzia</span><span class="info-value">${data.agencyName}</span></div>
        <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.agencyEmail}</span></div>
        <div class="info-row"><span class="info-label">Città</span><span class="info-value">${data.agencyCity}</span></div>
        <div class="info-row"><span class="info-label">Registrata il</span><span class="info-value">${data.registeredAt.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</span></div>
      </div>
    </div>
    <div class="footer">Domus Report Admin Notifications</div>
  </div>
</body>
</html>
  `.trim()
}

export function generateNewAgencyNotificationText(data: NewAgencyNotificationData): string {
  return `
NUOVA AGENZIA REGISTRATA - Domus Report

Nome: ${data.agencyName}
Email: ${data.agencyEmail}
Città: ${data.agencyCity}
Registrata il: ${data.registeredAt.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}
  `.trim()
}

interface EmailTemplateData {
  agencyName: string
  leadName: string
  propertyAddress: string
  estimatedPrice: number
  customMessage?: string
}

export function generateReportEmailHTML(data: EmailTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Valutazione Immobiliare</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      background-color: #ffffff;
      margin: 20px auto;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .custom-message {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
      font-style: italic;
    }
    .property-info {
      background-color: #f9fafb;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .property-info h3 {
      color: #2563eb;
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    .property-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    .price-highlight {
      background-color: #2563eb;
      color: #ffffff;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
      margin: 20px 0;
    }
    .price-highlight .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .price-highlight .price {
      font-size: 32px;
      font-weight: bold;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
    }
    .disclaimer {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>📊 Report Valutazione Immobiliare</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        <p>Gentile ${data.leadName},</p>
        <p>Grazie per aver richiesto la valutazione del tuo immobile. Siamo lieti di inviarti il report dettagliato.</p>
      </div>

      ${data.customMessage ? `
      <div class="custom-message">
        <strong>${data.agencyName} dice:</strong><br>
        ${data.customMessage}
      </div>
      ` : ''}

      <!-- Property Info -->
      <div class="property-info">
        <h3>🏠 Immobile Valutato</h3>
        <p><strong>Indirizzo:</strong> ${data.propertyAddress}</p>
      </div>

      <!-- Price Highlight -->
      <div class="price-highlight">
        <div class="label">Prezzo Stimato</div>
        <div class="price">${formatCurrency(data.estimatedPrice)}</div>
      </div>

      <p style="text-align: center; margin: 25px 0;">
        Il report completo con tutti i dettagli della valutazione è allegato a questa email in formato PDF.
      </p>

      <div style="text-align: center;">
        <p><strong>📎 Consulta il PDF allegato per maggiori dettagli</strong></p>
      </div>

      <p style="margin-top: 30px; font-size: 14px;">
        Se hai domande o desideri ulteriori informazioni, non esitare a contattarci. Saremo felici di assisterti.
      </p>

      <p style="margin-top: 20px;">
        Cordiali saluti,<br>
        <strong>${data.agencyName}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>${data.agencyName}</strong></p>
      <p>Report generato automaticamente da Domus Report</p>

      <div class="disclaimer">
        <p>Questo documento è stato generato automaticamente. La valutazione è indicativa e basata su dati OMI (Osservatorio del Mercato Immobiliare). Per una valutazione professionale e definitiva, ti invitiamo a contattare i nostri esperti.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function generateReportEmailText(data: EmailTemplateData): string {
  return `
Report Valutazione Immobiliare

Gentile ${data.leadName},

Grazie per aver richiesto la valutazione del tuo immobile. Siamo lieti di inviarti il report dettagliato.

${data.customMessage ? `
${data.agencyName} dice:
${data.customMessage}
` : ''}

IMMOBILE VALUTATO
Indirizzo: ${data.propertyAddress}

PREZZO STIMATO: ${formatCurrency(data.estimatedPrice)}

Il report completo con tutti i dettagli della valutazione è allegato a questa email in formato PDF.

Se hai domande o desideri ulteriori informazioni, non esitare a contattarci. Saremo felici di assisterti.

Cordiali saluti,
${data.agencyName}

---
Report generato automaticamente da Domus Report
Questo documento è stato generato automaticamente. La valutazione è indicativa e basata su dati OMI (Osservatorio del Mercato Immobiliare).
  `.trim()
}
