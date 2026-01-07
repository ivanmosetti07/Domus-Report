-- Script SQL per importare dati OMI usando COPY (metodo più veloce)
--
-- ISTRUZIONI:
-- 1. Assicurati che il file data/omi-values.csv sia accessibile dal server PostgreSQL
-- 2. Esegui questo script con: psql $DATABASE_URL -f scripts/import-omi-direct.sql
--
-- NOTA: Se il file CSV non è accessibile dal server, usa l'approccio alternativo
-- con \copy (client-side) invece di COPY (server-side)

BEGIN;

-- Crea tabella temporanea per importazione CSV
CREATE TEMP TABLE omi_temp (
    citta TEXT,
    zona TEXT,
    cap TEXT,
    tipoImmobile TEXT,
    categoria TEXT,
    valoreMinMq TEXT,
    valoreMaxMq TEXT,
    valoreMedioMq TEXT,
    semestre TEXT,
    anno TEXT,
    fonte TEXT
);

-- Importa CSV nella tabella temporanea
-- NOTA: Modifica il percorso se necessario
\copy omi_temp FROM 'data/omi-values.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');

-- Inserisci nella tabella OMIValue con conversione tipi
INSERT INTO "OMIValue" (
    citta, zona, cap, "tipoImmobile", categoria,
    "valoreMinMq", "valoreMaxMq", "valoreMedioMq",
    semestre, anno, fonte, "dataAggiornamento"
)
SELECT
    citta,
    zona,
    NULLIF(cap, ''),
    tipoImmobile,
    NULLIF(categoria, ''),
    valoreMinMq::DECIMAL,
    valoreMaxMq::DECIMAL,
    valoreMedioMq::DECIMAL,
    semestre::INTEGER,
    anno::INTEGER,
    fonte,
    NOW()
FROM omi_temp
ON CONFLICT (citta, zona, "tipoImmobile", categoria, anno, semestre)
DO UPDATE SET
    "valoreMinMq" = EXCLUDED."valoreMinMq",
    "valoreMaxMq" = EXCLUDED."valoreMaxMq",
    "valoreMedioMq" = EXCLUDED."valoreMedioMq",
    cap = EXCLUDED.cap,
    fonte = EXCLUDED.fonte,
    "dataAggiornamento" = NOW();

-- Inserisci anche in PriceHistory
INSERT INTO "PriceHistory" (
    citta, zona, cap, "tipoImmobile",
    "valoreMinMq", "valoreMaxMq", "valoreMedioMq",
    semestre, anno, fonte
)
SELECT DISTINCT
    citta, zona, cap, "tipoImmobile",
    "valoreMinMq", "valoreMaxMq", "valoreMedioMq",
    semestre, anno, fonte
FROM "OMIValue"
ON CONFLICT (citta, zona, "tipoImmobile", anno, semestre)
DO UPDATE SET
    "valoreMinMq" = EXCLUDED."valoreMinMq",
    "valoreMaxMq" = EXCLUDED."valoreMaxMq",
    "valoreMedioMq" = EXCLUDED."valoreMedioMq",
    cap = EXCLUDED.cap,
    fonte = EXCLUDED.fonte;

-- Mostra statistiche finali
SELECT
    'OMIValue' as tabella,
    COUNT(*) as record_totali,
    COUNT(DISTINCT citta) as citta_uniche,
    COUNT(DISTINCT zona) as zone_uniche
FROM "OMIValue"
UNION ALL
SELECT
    'PriceHistory',
    COUNT(*),
    COUNT(DISTINCT citta),
    COUNT(DISTINCT zona)
FROM "PriceHistory";

COMMIT;

-- Fine importazione
\echo 'Importazione completata! ✅'
