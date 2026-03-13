-- DropIndex
DROP INDEX "affiliates_stripe_connect_id_key";

-- AlterTable
ALTER TABLE "affiliates" DROP COLUMN "payouts_enabled",
DROP COLUMN "stripe_connect_id",
DROP COLUMN "stripe_connect_onboarded",
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "iban_account_holder" TEXT;

-- AlterTable
ALTER TABLE "commissions" DROP COLUMN "stripe_transfer_id",
ADD COLUMN     "payment_reference" TEXT;

