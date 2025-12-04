import { formatCurrency } from './utils'

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
