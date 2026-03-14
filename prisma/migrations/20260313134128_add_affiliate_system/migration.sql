-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "billing_interval" TEXT NOT NULL DEFAULT 'monthly';

-- CreateTable
CREATE TABLE "affiliates" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "stripe_connect_id" TEXT,
    "stripe_connect_onboarded" BOOLEAN NOT NULL DEFAULT false,
    "payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "data_creazione" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_sessions" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "affiliate_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "referral_code_id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "converted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "referral_id" TEXT NOT NULL,
    "stripe_invoice_id" TEXT NOT NULL,
    "stripe_transfer_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "invoice_amount_cents" INTEGER NOT NULL,
    "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_email_key" ON "affiliates"("email");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_stripe_connect_id_key" ON "affiliates"("stripe_connect_id");

-- CreateIndex
CREATE INDEX "affiliates_email_idx" ON "affiliates"("email");

-- CreateIndex
CREATE INDEX "affiliate_sessions_affiliate_id_idx" ON "affiliate_sessions"("affiliate_id");

-- CreateIndex
CREATE INDEX "affiliate_sessions_token_hash_idx" ON "affiliate_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "affiliate_sessions_expires_at_idx" ON "affiliate_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_codes_affiliate_id_idx" ON "referral_codes"("affiliate_id");

-- CreateIndex
CREATE INDEX "referral_codes_code_idx" ON "referral_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_agency_id_key" ON "referrals"("agency_id");

-- CreateIndex
CREATE INDEX "referrals_affiliate_id_idx" ON "referrals"("affiliate_id");

-- CreateIndex
CREATE INDEX "referrals_agency_id_idx" ON "referrals"("agency_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "commissions_affiliate_id_idx" ON "commissions"("affiliate_id");

-- CreateIndex
CREATE INDEX "commissions_referral_id_idx" ON "commissions"("referral_id");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_created_at_idx" ON "commissions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_stripe_invoice_id_affiliate_id_key" ON "commissions"("stripe_invoice_id", "affiliate_id");

-- AddForeignKey
ALTER TABLE "affiliate_sessions" ADD CONSTRAINT "affiliate_sessions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
