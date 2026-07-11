CREATE TYPE "FinancialBackfillBatchStatus" AS ENUM ('PREVIEWED', 'APPROVED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TABLE "FinancialBackfillBatch" (
  "id" TEXT NOT NULL, "businessId" TEXT NOT NULL, "actorUserId" TEXT,
  "backfillVersion" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL,
  "status" "FinancialBackfillBatchStatus" NOT NULL DEFAULT 'PREVIEWED',
  "previewSummary" TEXT, "appliedSummary" TEXT, "failureSummary" TEXT,
  "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinancialBackfillBatch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinancialBackfillBatch_businessId_backfillVersion_idempotencyKey_key" ON "FinancialBackfillBatch"("businessId", "backfillVersion", "idempotencyKey");
CREATE INDEX "FinancialBackfillBatch_businessId_status_idx" ON "FinancialBackfillBatch"("businessId", "status");
CREATE INDEX "FinancialBackfillBatch_actorUserId_idx" ON "FinancialBackfillBatch"("actorUserId");
ALTER TABLE "FinancialBackfillBatch" ADD CONSTRAINT "FinancialBackfillBatch_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialBackfillBatch" ADD CONSTRAINT "FinancialBackfillBatch_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
