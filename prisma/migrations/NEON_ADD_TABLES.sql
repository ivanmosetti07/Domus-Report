-- ============================================================================
-- DOMUS REPORT - NUOVE TABELLE DATABASE
-- Esegui questo SQL su Neon Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- PRIORITÀ ALTA - Core Features
-- ============================================================================

-- 1. AGENCY SESSIONS - Gestione Sessioni JWT
CREATE TABLE "agency_sessions" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "agency_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "agency_sessions_agency_id_idx" ON "agency_sessions"("agency_id");
CREATE INDEX "agency_sessions_token_hash_idx" ON "agency_sessions"("token_hash");
CREATE INDEX "agency_sessions_expires_at_idx" ON "agency_sessions"("expires_at");

ALTER TABLE "agency_sessions" ADD CONSTRAINT "agency_sessions_agency_id_fkey"
    FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. LEAD STATUSES - Status e Note Lead (CRM)
CREATE TABLE "lead_statuses" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "note" TEXT,
    "created_by_agency_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_statuses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lead_statuses_lead_id_idx" ON "lead_statuses"("lead_id");
CREATE INDEX "lead_statuses_status_idx" ON "lead_statuses"("status");

ALTER TABLE "lead_statuses" ADD CONSTRAINT "lead_statuses_lead_id_fkey"
    FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lead_statuses" ADD CONSTRAINT "lead_statuses_created_by_agency_id_fkey"
    FOREIGN KEY ("created_by_agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. SUBSCRIPTIONS - Piano e Billing
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "trial_ends_at" TIMESTAMP(3),
    "next_billing_date" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "payment_method_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscriptions_agency_id_key" ON "subscriptions"("agency_id");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX "subscriptions_next_billing_date_idx" ON "subscriptions"("next_billing_date");

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_agency_id_fkey"
    FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- PRIORITÀ MEDIA - Enhancement Features
-- ============================================================================

-- 4. AUDIT LOGS - Tracking Azioni (GDPR Compliance)
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_agency_id_idx" ON "audit_logs"("agency_id");
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_agency_id_fkey"
    FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. AGENCY SETTINGS - Configurazione Agenzia
CREATE TABLE "agency_settings" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "notifications_email" BOOLEAN NOT NULL DEFAULT true,
    "email_on_new_lead" BOOLEAN NOT NULL DEFAULT true,
    "time_zone" TEXT NOT NULL DEFAULT 'Europe/Rome',
    "language" TEXT NOT NULL DEFAULT 'it',
    "widget_theme" TEXT NOT NULL DEFAULT 'default',
    "custom_css" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "agency_settings_agency_id_key" ON "agency_settings"("agency_id");

ALTER TABLE "agency_settings" ADD CONSTRAINT "agency_settings_agency_id_fkey"
    FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. PROPERTY ATTACHMENTS - File Upload Immobili
CREATE TABLE "property_attachments" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "property_attachments_property_id_idx" ON "property_attachments"("property_id");

ALTER TABLE "property_attachments" ADD CONSTRAINT "property_attachments_property_id_fkey"
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- PRIORITÀ BASSA - Advanced Features
-- ============================================================================

-- 7. NOTIFICATIONS - Sistema Notifiche In-App
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lead_id" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_agency_id_idx" ON "notifications"("agency_id");
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_agency_id_fkey"
    FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_lead_id_fkey"
    FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. ANALYTICS DAILY - Metriche e Conversion Rate
CREATE TABLE "analytics_daily" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "widget_impressions" INTEGER NOT NULL DEFAULT 0,
    "widget_clicks" INTEGER NOT NULL DEFAULT 0,
    "leads_generated" INTEGER NOT NULL DEFAULT 0,
    "valuations_completed" INTEGER NOT NULL DEFAULT 0,
    "conversion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_daily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "analytics_daily_agency_date_key" ON "analytics_daily"("agency_id", "date");
CREATE INDEX "analytics_daily_date_idx" ON "analytics_daily"("date");

ALTER TABLE "analytics_daily" ADD CONSTRAINT "analytics_daily_agency_id_fkey"
    FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. WIDGET EVENTS - Tracking Eventi Widget
CREATE TABLE "widget_events" (
    "id" TEXT NOT NULL,
    "widget_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "event_type" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "widget_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "widget_events_widget_id_idx" ON "widget_events"("widget_id");
CREATE INDEX "widget_events_event_type_idx" ON "widget_events"("event_type");
CREATE INDEX "widget_events_created_at_idx" ON "widget_events"("created_at");

-- 10. EMAIL TEMPLATES - Template Email Automazione
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html_body" TEXT NOT NULL,
    "text_body" TEXT NOT NULL,
    "variables" JSONB,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "email_templates_agency_id_idx" ON "email_templates"("agency_id");
CREATE INDEX "email_templates_type_idx" ON "email_templates"("type");

ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_agency_id_fkey"
    FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- FINE MIGRATION
-- ============================================================================

-- Verifica tabelle create
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
