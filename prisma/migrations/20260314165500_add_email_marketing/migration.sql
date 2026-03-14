-- AlterTable
ALTER TABLE "demo_leads" ADD COLUMN     "converted_to_agency_id" TEXT,
ADD COLUMN     "email_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'landing_demo';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "onboarding_completed_at" TIMESTAMP(3),
ADD COLUMN     "trial_days" INTEGER;

-- AlterTable
ALTER TABLE "widget_configs" ADD COLUMN     "question_mode" TEXT NOT NULL DEFAULT 'long';

-- DropTable
DROP TABLE "OMIValue";

-- DropTable
DROP TABLE "PriceHistory";

-- DropTable
DROP TABLE "ZoneInsight";

-- CreateTable
CREATE TABLE "omi_values" (
    "id" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "cap" TEXT,
    "tipo_immobile" TEXT NOT NULL,
    "categoria" TEXT,
    "valore_min_mq" DECIMAL(10,2) NOT NULL,
    "valore_max_mq" DECIMAL(10,2) NOT NULL,
    "valore_medio_mq" DECIMAL(10,2) NOT NULL,
    "semestre" INTEGER NOT NULL,
    "anno" INTEGER NOT NULL,
    "fonte" TEXT NOT NULL DEFAULT 'OMI',
    "data_aggiornamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "omi_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "cap" TEXT,
    "tipo_immobile" TEXT NOT NULL,
    "valore_min_mq" DECIMAL(10,2) NOT NULL,
    "valore_max_mq" DECIMAL(10,2) NOT NULL,
    "valore_medio_mq" DECIMAL(10,2) NOT NULL,
    "semestre" INTEGER NOT NULL,
    "anno" INTEGER NOT NULL,
    "variazione_precedente" DECIMAL(5,2),
    "numero_transazioni" INTEGER,
    "fonte" TEXT NOT NULL DEFAULT 'OMI',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_insights" (
    "id" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "cap" TEXT,
    "trend" TEXT NOT NULL,
    "variazione_annuale" DECIMAL(5,2) NOT NULL,
    "variazione_ultimo_semestre" DECIMAL(5,2),
    "prezzo_medio_attuale" DECIMAL(10,2) NOT NULL,
    "descrizione" TEXT,
    "icona" TEXT,
    "data_calcolo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zone_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "flow_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaign_steps" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "delay_hours" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "template_key" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_campaign_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_sends" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "recipient_name" TEXT,
    "recipient_type" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "message_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_sends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_unsubscribes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_unsubscribes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "omi_values_citta_zona_idx" ON "omi_values"("citta", "zona");

-- CreateIndex
CREATE INDEX "omi_values_cap_idx" ON "omi_values"("cap");

-- CreateIndex
CREATE INDEX "omi_values_anno_semestre_idx" ON "omi_values"("anno", "semestre");

-- CreateIndex
CREATE UNIQUE INDEX "omi_values_citta_zona_tipo_immobile_categoria_anno_semestre_key" ON "omi_values"("citta", "zona", "tipo_immobile", "categoria", "anno", "semestre");

-- CreateIndex
CREATE INDEX "price_history_citta_zona_idx" ON "price_history"("citta", "zona");

-- CreateIndex
CREATE INDEX "price_history_cap_idx" ON "price_history"("cap");

-- CreateIndex
CREATE INDEX "price_history_anno_semestre_idx" ON "price_history"("anno", "semestre");

-- CreateIndex
CREATE UNIQUE INDEX "price_history_citta_zona_tipo_immobile_anno_semestre_key" ON "price_history"("citta", "zona", "tipo_immobile", "anno", "semestre");

-- CreateIndex
CREATE INDEX "zone_insights_citta_zona_idx" ON "zone_insights"("citta", "zona");

-- CreateIndex
CREATE INDEX "zone_insights_cap_idx" ON "zone_insights"("cap");

-- CreateIndex
CREATE UNIQUE INDEX "zone_insights_citta_zona_data_calcolo_key" ON "zone_insights"("citta", "zona", "data_calcolo");

-- CreateIndex
CREATE UNIQUE INDEX "email_campaigns_name_key" ON "email_campaigns"("name");

-- CreateIndex
CREATE INDEX "email_campaigns_flow_type_idx" ON "email_campaigns"("flow_type");

-- CreateIndex
CREATE INDEX "email_campaigns_is_active_idx" ON "email_campaigns"("is_active");

-- CreateIndex
CREATE INDEX "email_campaign_steps_campaign_id_idx" ON "email_campaign_steps"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_campaign_steps_campaign_id_step_order_key" ON "email_campaign_steps"("campaign_id", "step_order");

-- CreateIndex
CREATE INDEX "email_sends_campaign_id_idx" ON "email_sends"("campaign_id");

-- CreateIndex
CREATE INDEX "email_sends_step_id_idx" ON "email_sends"("step_id");

-- CreateIndex
CREATE INDEX "email_sends_recipient_email_idx" ON "email_sends"("recipient_email");

-- CreateIndex
CREATE INDEX "email_sends_recipient_id_recipient_type_idx" ON "email_sends"("recipient_id", "recipient_type");

-- CreateIndex
CREATE INDEX "email_sends_status_scheduled_at_idx" ON "email_sends"("status", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_unsubscribes_email_key" ON "email_unsubscribes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "demo_leads_converted_to_agency_id_key" ON "demo_leads"("converted_to_agency_id");

-- AddForeignKey
ALTER TABLE "email_campaign_steps" ADD CONSTRAINT "email_campaign_steps_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "email_campaign_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

