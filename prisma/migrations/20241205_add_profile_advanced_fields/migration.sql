-- AlterTable: Aggiungi campi profilo avanzato alla tabella agencies
ALTER TABLE "agencies"
ADD COLUMN IF NOT EXISTS "logo_url" TEXT,
ADD COLUMN IF NOT EXISTS "telefono" TEXT,
ADD COLUMN IF NOT EXISTS "indirizzo" TEXT,
ADD COLUMN IF NOT EXISTS "sito_web" TEXT,
ADD COLUMN IF NOT EXISTS "partita_iva" TEXT;

-- AlterTable: Aggiungi campi brand colors e preferenze alla tabella agency_settings
ALTER TABLE "agency_settings"
ADD COLUMN IF NOT EXISTS "brand_colors" JSONB,
ADD COLUMN IF NOT EXISTS "date_format" TEXT NOT NULL DEFAULT 'DD/MM/YYYY';
