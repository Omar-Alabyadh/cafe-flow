-- Phase F1: additive financial schema foundation.
-- Historical Order and OrderItem rows remain valid because every new legacy-facing
-- snapshot column is nullable. This migration intentionally performs no backfill.

CREATE TYPE "PosPaymentMethod" AS ENUM (
  'CASH',
  'BANK_CARD',
  'ONE_PAY',
  'LY_PAY',
  'EDAFLY',
  'MOBI_CASH',
  'MASREFY_PAY',
  'YUSR_PAY',
  'YUSR_PAY_QR',
  'SADAD',
  'SAHARA_PAY'
);

CREATE TYPE "PosPaymentStatus" AS ENUM ('PENDING', 'CAPTURED', 'FAILED', 'CANCELLED');
CREATE TYPE "FinancialDataOrigin" AS ENUM ('NATIVE', 'BACKFILLED', 'MANUALLY_RECONCILED', 'LEGACY_UNKNOWN');
CREATE TYPE "FinancialDocumentType" AS ENUM ('ORDER', 'RECEIPT');

ALTER TABLE "Business"
ADD COLUMN "defaultCurrency" VARCHAR(3) NOT NULL DEFAULT 'LYD';

ALTER TABLE "Order"
ADD COLUMN "branchId" TEXT,
ADD COLUMN "orderNumber" TEXT,
ADD COLUMN "subtotalAmount" DECIMAL(18,3),
ADD COLUMN "discountTotal" DECIMAL(18,3),
ADD COLUMN "taxTotal" DECIMAL(18,3),
ADD COLUMN "totalAmount" DECIMAL(18,3),
ADD COLUMN "currency" VARCHAR(3),
ADD COLUMN "financialSnapshotVersion" INTEGER,
ADD COLUMN "financialDataOrigin" "FinancialDataOrigin",
ADD COLUMN "branchDataOrigin" "FinancialDataOrigin";

ALTER TABLE "OrderItem"
ADD COLUMN "productNameSnapshot" TEXT,
ADD COLUMN "productCodeSnapshot" TEXT,
ADD COLUMN "unitPrice" DECIMAL(18,3),
ADD COLUMN "lineSubtotal" DECIMAL(18,3),
ADD COLUMN "lineDiscountTotal" DECIMAL(18,3),
ADD COLUMN "lineTaxTotal" DECIMAL(18,3),
ADD COLUMN "lineTotal" DECIMAL(18,3);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "branchId" TEXT,
  "orderId" TEXT NOT NULL,
  "receiptNumber" TEXT,
  "amount" DECIMAL(18,3) NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "method" "PosPaymentMethod",
  "status" "PosPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "paidAt" TIMESTAMP(3),
  "receivedByUserId" TEXT,
  "receivedByDisplayNameSnapshot" TEXT,
  "reference" TEXT,
  "financialDataOrigin" "FinancialDataOrigin" NOT NULL DEFAULT 'LEGACY_UNKNOWN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentSequence" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "documentType" "FinancialDocumentType" NOT NULL,
  "currentValue" BIGINT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DocumentSequence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_businessId_orderNumber_key"
ON "Order"("businessId", "orderNumber");

CREATE INDEX "Order_businessId_branchId_idx"
ON "Order"("businessId", "branchId");

CREATE INDEX "Order_businessId_completedAt_idx"
ON "Order"("businessId", "completedAt");

CREATE UNIQUE INDEX "Payment_businessId_receiptNumber_key"
ON "Payment"("businessId", "receiptNumber");

CREATE INDEX "Payment_businessId_paidAt_idx"
ON "Payment"("businessId", "paidAt");

CREATE INDEX "Payment_branchId_paidAt_idx"
ON "Payment"("branchId", "paidAt");

CREATE INDEX "Payment_orderId_status_idx"
ON "Payment"("orderId", "status");

CREATE INDEX "Payment_receivedByUserId_idx"
ON "Payment"("receivedByUserId");

CREATE INDEX "Payment_method_idx"
ON "Payment"("method");

CREATE INDEX "Payment_financialDataOrigin_idx"
ON "Payment"("financialDataOrigin");

CREATE UNIQUE INDEX "DocumentSequence_businessId_documentType_key"
ON "DocumentSequence"("businessId", "documentType");

CREATE INDEX "DocumentSequence_businessId_idx"
ON "DocumentSequence"("businessId");

-- Prisma cannot express conditional uniqueness. Failed, pending, and cancelled
-- attempts may coexist; only a second captured attempt for the same order is blocked.
CREATE UNIQUE INDEX "Payment_one_captured_per_order_idx"
ON "Payment"("orderId")
WHERE "status" = 'CAPTURED';

ALTER TABLE "Order"
ADD CONSTRAINT "Order_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_receivedByUserId_fkey"
FOREIGN KEY ("receivedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentSequence"
ADD CONSTRAINT "DocumentSequence_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
