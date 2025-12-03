-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "widget_id" TEXT NOT NULL,
    "piano" TEXT NOT NULL DEFAULT 'free',
    "attiva" BOOLEAN NOT NULL DEFAULT true,
    "data_creazione" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "agenzia_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "data_richiesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "indirizzo" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "cap" TEXT,
    "latitudine" DOUBLE PRECISION,
    "longitudine" DOUBLE PRECISION,
    "tipo" TEXT NOT NULL,
    "superficie_mq" INTEGER NOT NULL,
    "piano" INTEGER,
    "ascensore" BOOLEAN,
    "stato" TEXT NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valuations" (
    "id" TEXT NOT NULL,
    "immobile_id" TEXT NOT NULL,
    "prezzo_minimo" INTEGER NOT NULL,
    "prezzo_massimo" INTEGER NOT NULL,
    "prezzo_stimato" INTEGER NOT NULL,
    "valore_omi_base" INTEGER NOT NULL,
    "coefficiente_piano" DOUBLE PRECISION NOT NULL,
    "coefficiente_stato" DOUBLE PRECISION NOT NULL,
    "spiegazione" TEXT NOT NULL,
    "data_calcolo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valuations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "messaggi" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agencies_email_key" ON "agencies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_widget_id_key" ON "agencies"("widget_id");

-- CreateIndex
CREATE INDEX "leads_agenzia_id_idx" ON "leads"("agenzia_id");

-- CreateIndex
CREATE INDEX "leads_data_richiesta_idx" ON "leads"("data_richiesta");

-- CreateIndex
CREATE UNIQUE INDEX "properties_lead_id_key" ON "properties"("lead_id");

-- CreateIndex
CREATE INDEX "properties_lead_id_idx" ON "properties"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "valuations_immobile_id_key" ON "valuations"("immobile_id");

-- CreateIndex
CREATE INDEX "valuations_immobile_id_idx" ON "valuations"("immobile_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_lead_id_key" ON "conversations"("lead_id");

-- CreateIndex
CREATE INDEX "conversations_lead_id_idx" ON "conversations"("lead_id");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_agenzia_id_fkey" FOREIGN KEY ("agenzia_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_immobile_id_fkey" FOREIGN KEY ("immobile_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
