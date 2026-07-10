-- Add nullable POS idempotency key.
-- Existing orders keep NULL; PostgreSQL unique indexes allow multiple NULL values.
ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT;

-- Enforce one committed order per POS checkout attempt key.
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
