-- Runs after IN_PROGRESS exists and is committed (previous migration).
-- Drafts that already have lines were effectively "being worked"; promote them.
UPDATE "Order"
SET "status" = 'IN_PROGRESS'::"OrderStatus"
WHERE "status" = 'DRAFT'::"OrderStatus"
  AND EXISTS (SELECT 1 FROM "OrderItem" oi WHERE oi."orderId" = "Order"."id");
