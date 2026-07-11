import assert from "node:assert/strict";
import test from "node:test";
import { FinancialDataOrigin, OrderStatus, PosPaymentMethod, PrismaClient } from "@prisma/client";

const url = process.env.F4_TEST_DATABASE_URL;
if (!url) test.skip("legacy reconciliation integration requires disposable F4_TEST_DATABASE_URL", () => {});
else {
  const db = new PrismaClient({ datasources: { db: { url } } });
  test.after(async () => db.$disconnect());
  test("reconciliation atomically creates immutable financial facts without stock effects", async () => {
    const { reconcileLegacyOrder } = await import("@/lib/finance/legacy-reconciliation");
    const { isOfficialPaymentReportEligible } = await import("@/lib/finance/official-report-eligibility");
    await db.$executeRawUnsafe('TRUNCATE TABLE "AuditLog", "FinancialBackfillBatch", "Payment", "DocumentSequence", "OrderItem", "Order", "Product", "Branch", "Membership", "Business", "User" CASCADE');
    const owner = await db.user.create({ data: { fullName: "Owner", email: "f4-owner@test.local", passwordHash: "x" } });
    const receiver = await db.user.create({ data: { fullName: "Receiver", email: "f4-receiver@test.local", passwordHash: "x" } });
    const business = await db.business.create({ data: { code: "F4", nameAr: "F4", ownerId: owner.id } });
    await db.membership.createMany({ data: [{ userId: owner.id, businessId: business.id, role: "OWNER", scope: "ALL_BRANCHES" }, { userId: receiver.id, businessId: business.id, role: "CASHIER", scope: "BRANCH_ONLY" }] });
    const branch = await db.branch.create({ data: { businessId: business.id, code: "HIS", nameAr: "Historical" } });
    const product = await db.product.create({ data: { businessId: business.id, code: "P", nameAr: "Reference", basePrice: "999.99" } });
    const order = await db.order.create({ data: { businessId: business.id, status: OrderStatus.COMPLETED, completedAt: new Date(), financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } });
    const item = await db.orderItem.create({ data: { orderId: order.id, productId: product.id, quantity: "2.000" } });
    const beforeStock = await db.stockMovement.count({ where: { businessId: business.id } });
    const result = await reconcileLegacyOrder({ orderId: order.id, branchId: branch.id, receiverUserId: receiver.id, method: PosPaymentMethod.CASH, paidAt: new Date(), evidenceDescription: "receipt", reason: "historical proof", linePrices: [{ orderItemId: item.id, unitPrice: "1.235" }] }, { businessId: business.id, userId: owner.id });
    assert.equal(result.replayed, false);
    const saved = await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true, payments: true } });
    assert.equal(saved.status, OrderStatus.COMPLETED); assert.equal(saved.totalAmount?.toFixed(3), "2.470"); assert.equal(saved.currency, "LYD"); assert.equal(saved.financialDataOrigin, FinancialDataOrigin.MANUALLY_RECONCILED); assert.equal(saved.items[0]?.unitPrice?.toFixed(3), "1.235"); assert.equal(saved.payments.length, 1); assert.equal(saved.payments[0]?.amount.toFixed(3), "2.470"); assert.equal(await db.stockMovement.count({ where: { businessId: business.id } }), beforeStock); assert.equal(await db.auditLog.count({ where: { entityId: order.id } }), 1); assert.equal(isOfficialPaymentReportEligible(saved), true);
    const replay = await reconcileLegacyOrder({ orderId: order.id, branchId: branch.id, receiverUserId: receiver.id, method: PosPaymentMethod.CASH, paidAt: new Date(), evidenceDescription: "other", reason: "other", linePrices: [{ orderItemId: item.id, unitPrice: "9.999" }] }, { businessId: business.id, userId: owner.id });
    assert.equal(replay.replayed, true); assert.equal(await db.payment.count({ where: { orderId: order.id } }), 1); assert.equal(await db.auditLog.count({ where: { entityId: order.id } }), 1);
  });
}
