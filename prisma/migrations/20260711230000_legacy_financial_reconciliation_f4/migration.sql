-- Phase F4: additive reconciliation metadata. Historical rows remain unchanged.
ALTER TABLE "Order"
  ADD COLUMN "reconciliationEvidenceDescription" TEXT,
  ADD COLUMN "reconciliationReason" TEXT,
  ADD COLUMN "reconciledAt" TIMESTAMP(3),
  ADD COLUMN "reconciledByUserId" TEXT;

CREATE INDEX "Order_reconciledByUserId_idx" ON "Order"("reconciledByUserId");
ALTER TABLE "Order"
  ADD CONSTRAINT "Order_reconciledByUserId_fkey"
  FOREIGN KEY ("reconciledByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
