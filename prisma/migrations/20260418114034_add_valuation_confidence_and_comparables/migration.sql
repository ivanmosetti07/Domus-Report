-- AlterTable
ALTER TABLE "valuations" ADD COLUMN     "comparables_data" JSONB,
ADD COLUMN     "confidence" TEXT DEFAULT 'media',
ADD COLUMN     "confidence_score" INTEGER,
ADD COLUMN     "data_completeness" INTEGER,
ADD COLUMN     "omi_zone_match" TEXT,
ADD COLUMN     "price_per_sqm" INTEGER,
ADD COLUMN     "warnings" JSONB;
