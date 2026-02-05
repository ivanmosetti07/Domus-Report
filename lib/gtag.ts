/**
 * Google Analytics 4 - Custom Events
 * Documentazione: https://developers.google.com/analytics/devguides/collection/ga4/events
 */

// Dichiarazione globale per gtag
declare global {
  interface Window {
    gtag: (
      command: "event" | "config" | "js",
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

// Verifica se gtag è disponibile
const isGtagAvailable = (): boolean => {
  return typeof window !== "undefined" && typeof window.gtag === "function";
};

// Funzione generica per tracciare eventi
export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (!isGtagAvailable()) {
    console.debug("[GA4] gtag not available, skipping event:", eventName);
    return;
  }

  window.gtag("event", eventName, params);
  console.debug("[GA4] Event tracked:", eventName, params);
};

// ============================================
// EVENTI WIDGET
// ============================================

/** Widget aperto dall'utente */
export const trackWidgetOpen = (widgetId: string) => {
  trackEvent("widget_open", {
    widget_id: widgetId,
    event_category: "widget",
  });
};

/** Widget chiuso dall'utente */
export const trackWidgetClose = (widgetId: string) => {
  trackEvent("widget_close", {
    widget_id: widgetId,
    event_category: "widget",
  });
};

/** Conversazione iniziata nel widget */
export const trackConversationStart = (widgetId: string) => {
  trackEvent("conversation_start", {
    widget_id: widgetId,
    event_category: "widget",
  });
};

/** Messaggio inviato nel widget */
export const trackMessageSent = (widgetId: string, messageCount: number) => {
  trackEvent("message_sent", {
    widget_id: widgetId,
    message_count: messageCount,
    event_category: "widget",
  });
};

// ============================================
// EVENTI VALUTAZIONE
// ============================================

/** Valutazione immobiliare richiesta */
export const trackValuationRequest = (params: {
  widgetId: string;
  city: string;
  propertyType: string;
}) => {
  trackEvent("valuation_request", {
    widget_id: params.widgetId,
    city: params.city,
    property_type: params.propertyType,
    event_category: "valuation",
  });
};

/** Valutazione completata con successo */
export const trackValuationComplete = (params: {
  widgetId: string;
  city: string;
  estimatedValue: number;
  surface: number;
}) => {
  trackEvent("valuation_complete", {
    widget_id: params.widgetId,
    city: params.city,
    estimated_value: params.estimatedValue,
    surface: params.surface,
    event_category: "valuation",
    value: params.estimatedValue, // Per conversion value
  });
};

/** PDF valutazione scaricato */
export const trackPdfDownload = (widgetId: string) => {
  trackEvent("pdf_download", {
    widget_id: widgetId,
    event_category: "valuation",
  });
};

// ============================================
// EVENTI LEAD
// ============================================

/** Lead generato (conversione principale) */
export const trackLeadGenerated = (params: {
  widgetId: string;
  city: string;
  hasPhone: boolean;
  hasEmail: boolean;
}) => {
  trackEvent("generate_lead", {
    widget_id: params.widgetId,
    city: params.city,
    has_phone: params.hasPhone,
    has_email: params.hasEmail,
    event_category: "lead",
  });
};

/** Contatto lead iniziato (da dashboard) */
export const trackLeadContacted = (leadId: string) => {
  trackEvent("lead_contacted", {
    lead_id: leadId,
    event_category: "lead",
  });
};

/** Status lead aggiornato */
export const trackLeadStatusChange = (params: {
  leadId: string;
  oldStatus: string;
  newStatus: string;
}) => {
  trackEvent("lead_status_change", {
    lead_id: params.leadId,
    old_status: params.oldStatus,
    new_status: params.newStatus,
    event_category: "lead",
  });
};

// ============================================
// EVENTI AGENZIA (DASHBOARD)
// ============================================

/** Registrazione agenzia completata */
export const trackAgencySignup = (city: string) => {
  trackEvent("sign_up", {
    method: "email",
    city: city,
    event_category: "agency",
  });
};

/** Login agenzia */
export const trackAgencyLogin = () => {
  trackEvent("login", {
    method: "email",
    event_category: "agency",
  });
};

/** Codice widget copiato */
export const trackWidgetCodeCopied = () => {
  trackEvent("widget_code_copied", {
    event_category: "agency",
  });
};

/** Esportazione dati (CSV/Excel) */
export const trackDataExport = (format: "csv" | "excel") => {
  trackEvent("data_export", {
    format: format,
    event_category: "agency",
  });
};

// ============================================
// EVENTI LANDING PAGE
// ============================================

/** CTA cliccata sulla landing */
export const trackCtaClick = (ctaName: string, location: string) => {
  trackEvent("cta_click", {
    cta_name: ctaName,
    location: location,
    event_category: "landing",
  });
};

/** Demo widget aperto sulla landing */
export const trackDemoWidgetOpen = () => {
  trackEvent("demo_widget_open", {
    event_category: "landing",
  });
};

/** Sezione pricing visualizzata */
export const trackPricingView = () => {
  trackEvent("pricing_view", {
    event_category: "landing",
  });
};

// ============================================
// EVENTI ERRORE
// ============================================

/** Errore tracciato */
export const trackError = (params: {
  errorType: string;
  errorMessage: string;
  location: string;
}) => {
  trackEvent("error", {
    error_type: params.errorType,
    error_message: params.errorMessage,
    location: params.location,
    event_category: "error",
  });
};
