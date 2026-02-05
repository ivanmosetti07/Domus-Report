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
// EVENTI SUBSCRIPTION / REVENUE (BUSINESS KPI)
// ============================================

/** Piano selezionato durante onboarding */
export const trackPlanSelected = (params: {
  planType: "free" | "basic" | "premium";
  value: number; // prezzo in EUR (0, 50, 100)
  hasTrial: boolean;
}) => {
  trackEvent("select_plan", {
    plan_type: params.planType,
    value: params.value,
    has_trial: params.hasTrial,
    currency: "EUR",
    event_category: "subscription",
  });
};

/** Trial iniziato (per piani a pagamento) */
export const trackTrialStart = (params: {
  planType: "basic" | "premium";
  trialDays: number;
  value: number; // valore potenziale mensile
}) => {
  trackEvent("begin_trial", {
    plan_type: params.planType,
    trial_days: params.trialDays,
    value: params.value,
    currency: "EUR",
    event_category: "subscription",
  });
};

/** Acquisto completato - evento GA4 standard per e-commerce */
export const trackPurchase = (params: {
  transactionId: string;
  planType: "basic" | "premium";
  value: number; // importo in EUR
  isFirstPurchase: boolean;
}) => {
  trackEvent("purchase", {
    transaction_id: params.transactionId,
    value: params.value,
    currency: "EUR",
    items: [
      {
        item_id: params.planType,
        item_name: `Piano ${params.planType.charAt(0).toUpperCase() + params.planType.slice(1)}`,
        item_category: "subscription",
        price: params.value,
        quantity: 1,
      },
    ],
    is_first_purchase: params.isFirstPurchase,
    event_category: "subscription",
  });
};

/** Upgrade piano (da free a basic/premium o da basic a premium) */
export const trackSubscriptionUpgrade = (params: {
  fromPlan: "free" | "basic";
  toPlan: "basic" | "premium";
  value: number; // nuovo valore mensile
}) => {
  trackEvent("subscription_upgrade", {
    from_plan: params.fromPlan,
    to_plan: params.toPlan,
    value: params.value,
    currency: "EUR",
    event_category: "subscription",
  });
};

/** Downgrade piano */
export const trackSubscriptionDowngrade = (params: {
  fromPlan: "basic" | "premium";
  toPlan: "free" | "basic";
  lostValue: number; // valore perso
}) => {
  trackEvent("subscription_downgrade", {
    from_plan: params.fromPlan,
    to_plan: params.toPlan,
    lost_value: params.lostValue,
    currency: "EUR",
    event_category: "subscription",
  });
};

/** Cancellazione subscription */
export const trackSubscriptionCancel = (params: {
  planType: "basic" | "premium";
  value: number; // MRR perso
  reason?: string;
}) => {
  trackEvent("subscription_cancel", {
    plan_type: params.planType,
    value: params.value,
    currency: "EUR",
    reason: params.reason,
    event_category: "subscription",
  });
};

/** Acquisto valutazioni extra */
export const trackExtraValuationsPurchase = (params: {
  quantity: number;
  value: number; // importo totale EUR
}) => {
  trackEvent("extra_valuations_purchase", {
    quantity: params.quantity,
    value: params.value,
    currency: "EUR",
    event_category: "subscription",
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
