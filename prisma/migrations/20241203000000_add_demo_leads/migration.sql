-- CreateTable
CREATE TABLE "demo_leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "indirizzo" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "superficie_mq" INTEGER NOT NULL,
    "piano" INTEGER,
    "ascensore" BOOLEAN,
    "stato" TEXT NOT NULL,
    "prezzo_minimo" INTEGER NOT NULL,
    "prezzo_massimo" INTEGER NOT NULL,
    "prezzo_stimato" INTEGER NOT NULL,
    "messaggi" JSONB NOT NULL,
    "data_richiesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demo_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "demo_leads_data_richiesta_idx" ON "demo_leads"("data_richiesta");

-- CreateIndex
CREATE INDEX "demo_leads_email_idx" ON "demo_leads"("email");
