-- CreateTable
CREATE TABLE "lead_submission_attempts" (
    "id" TEXT NOT NULL,
    "widget_id" TEXT,
    "agency_id" TEXT,
    "email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "status" TEXT NOT NULL,
    "error_code" TEXT,
    "error_message" TEXT,
    "saved_lead_id" TEXT,
    "http_status" INTEGER,
    "ip_address" TEXT,
    "body_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_submission_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_submission_attempts_status_idx" ON "lead_submission_attempts"("status");

-- CreateIndex
CREATE INDEX "lead_submission_attempts_email_idx" ON "lead_submission_attempts"("email");

-- CreateIndex
CREATE INDEX "lead_submission_attempts_widget_id_idx" ON "lead_submission_attempts"("widget_id");

-- CreateIndex
CREATE INDEX "lead_submission_attempts_created_at_idx" ON "lead_submission_attempts"("created_at");
