-- Fase 8: Data Enrichment Avanzato
-- Tabelle per dati OMI dettagliati e storico prezzi zona

-- Tabella per valori OMI dettagliati per zona
CREATE TABLE "OMIValue" (
    "id" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "cap" TEXT,
    "tipoImmobile" TEXT NOT NULL, -- residenziale, commerciale, uffici, etc.
    "categoria" TEXT, -- abitazioni civili, abitazioni economiche, ville/villini, etc.
    "valoreMinMq" DECIMAL(10,2) NOT NULL,
    "valoreMaxMq" DECIMAL(10,2) NOT NULL,
    "valoreMedioMq" DECIMAL(10,2) NOT NULL,
    "semestre" INTEGER NOT NULL, -- 1 o 2
    "anno" INTEGER NOT NULL,
    "fonte" TEXT DEFAULT 'OMI', -- OMI, CSV, API, etc.
    "dataAggiornamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OMIValue_pkey" PRIMARY KEY ("id")
);

-- Tabella per storico prezzi zona (trend nel tempo)
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "cap" TEXT,
    "tipoImmobile" TEXT NOT NULL,
    "valoreMinMq" DECIMAL(10,2) NOT NULL,
    "valoreMaxMq" DECIMAL(10,2) NOT NULL,
    "valoreMedioMq" DECIMAL(10,2) NOT NULL,
    "semestre" INTEGER NOT NULL, -- 1 o 2
    "anno" INTEGER NOT NULL,
    "variazionePrecedente" DECIMAL(5,2), -- % variazione rispetto semestre precedente
    "numeroTransazioni" INTEGER, -- numero transazioni nel periodo (se disponibile)
    "fonte" TEXT DEFAULT 'OMI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- Tabella per insights automatici sulla zona
CREATE TABLE "ZoneInsight" (
    "id" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "cap" TEXT,
    "trend" TEXT NOT NULL, -- 'crescita', 'stabile', 'decrescita'
    "variazioneAnnuale" DECIMAL(5,2) NOT NULL, -- % variazione annuale
    "variazioneUltimoSemestre" DECIMAL(5,2), -- % variazione ultimo semestre
    "prezzoMedioAttuale" DECIMAL(10,2) NOT NULL,
    "descrizione" TEXT, -- descrizione testuale del trend
    "icona" TEXT, -- emoji o icon name
    "dataCalcolo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZoneInsight_pkey" PRIMARY KEY ("id")
);

-- Indici per performance
CREATE INDEX "OMIValue_citta_zona_idx" ON "OMIValue"("citta", "zona");
CREATE INDEX "OMIValue_cap_idx" ON "OMIValue"("cap");
CREATE INDEX "OMIValue_anno_semestre_idx" ON "OMIValue"("anno", "semestre");
CREATE UNIQUE INDEX "OMIValue_unique_idx" ON "OMIValue"("citta", "zona", "tipoImmobile", "categoria", "anno", "semestre");

CREATE INDEX "PriceHistory_citta_zona_idx" ON "PriceHistory"("citta", "zona");
CREATE INDEX "PriceHistory_cap_idx" ON "PriceHistory"("cap");
CREATE INDEX "PriceHistory_anno_semestre_idx" ON "PriceHistory"("anno", "semestre");
CREATE UNIQUE INDEX "PriceHistory_unique_idx" ON "PriceHistory"("citta", "zona", "tipoImmobile", "anno", "semestre");

CREATE INDEX "ZoneInsight_citta_zona_idx" ON "ZoneInsight"("citta", "zona");
CREATE INDEX "ZoneInsight_cap_idx" ON "ZoneInsight"("cap");
CREATE UNIQUE INDEX "ZoneInsight_unique_idx" ON "ZoneInsight"("citta", "zona", "dataCalcolo");
