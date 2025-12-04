-- Aggiungi campi per tracking valutazioni mensili alla tabella subscriptions
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "valuations_used_this_month" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "extra_valuations_purchased" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "valuations_reset_date" TIMESTAMP(3);
