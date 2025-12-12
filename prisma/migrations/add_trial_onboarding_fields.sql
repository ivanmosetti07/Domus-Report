-- Migration: Aggiunge campi per trial configurabile e onboarding
-- Data: 2025-12-12
-- Descrizione: Aggiunge trial_days e onboarding_completed_at a Subscription

-- Aggiungi nuovi campi alla tabella subscriptions
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS trial_days INTEGER,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Aggiorna eventuali subscription esistenti per impostare onboarding completato
UPDATE subscriptions
SET onboarding_completed_at = created_at
WHERE onboarding_completed_at IS NULL;

-- Commenta: I dati esistenti manterranno i trial_days NULL (compatibilità retroattiva)
