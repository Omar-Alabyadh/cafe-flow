import assert from "node:assert/strict";
import test from "node:test";
import { FinancialDataOrigin, OrderStatus, PosPaymentMethod, PrismaClient } from "@prisma/client";

const url = process.env.F4_TEST_DATABASE_URL;
if (!url) test.skip("legacy reconciliation integration requires disposable F4_TEST_DATABASE_URL", () => {});
else {
  process.env.DATABASE_URL = url;
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
    assert.equal(isOfficialPaymentReportEligible({ ...order, payments: [] }), false);
    const paymentRequestsBefore = await db.paymentRequest.count();
    const result = await reconcileLegacyOrder({ orderId: order.id, branchId: branch.id, receiverUserId: receiver.id, method: PosPaymentMethod.CASH, paidAt: new Date(), evidenceDescription: "receipt", reason: "historical proof", linePrices: [{ orderItemId: item.id, unitPrice: "1.235" }] }, { businessId: business.id, userId: owner.id });
    assert.equal(result.replayed, false);
    const saved = await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true, payments: true } });
    assert.equal(saved.status, OrderStatus.COMPLETED); assert.equal(saved.totalAmount?.toFixed(3), "2.470"); assert.equal(saved.subtotalAmount?.toFixed(3), "2.470"); assert.equal(saved.discountTotal?.toFixed(3), "0.000"); assert.equal(saved.taxTotal?.toFixed(3), "0.000"); assert.equal(saved.currency, "LYD"); assert.equal(saved.financialDataOrigin, FinancialDataOrigin.MANUALLY_RECONCILED); assert.equal(saved.reconciliationEvidenceDescription, "receipt"); assert.equal(saved.reconciliationReason, "historical proof"); assert.equal(saved.reconciledByUserId, owner.id); assert.ok(saved.reconciledAt); assert.equal(saved.items[0]?.unitPrice?.toFixed(3), "1.235"); assert.equal(saved.items[0]?.lineTotal?.toFixed(3), "2.470"); assert.equal(saved.payments.length, 1); assert.equal(saved.payments[0]?.amount.toFixed(3), "2.470"); assert.equal(saved.payments[0]?.businessId, saved.businessId); assert.equal(saved.payments[0]?.branchId, saved.branchId); assert.equal(saved.payments[0]?.currency, saved.currency); assert.match(saved.orderNumber ?? "", /^ORD-HIS-\d+$/); assert.match(saved.payments[0]?.receiptNumber ?? "", /^RCT-HIS-\d+$/); assert.equal(await db.stockMovement.count({ where: { businessId: business.id } }), beforeStock); assert.equal(await db.product.findUniqueOrThrow({ where: { id: product.id } }).then((row) => row.basePrice.toFixed(2)), "999.99"); assert.equal(await db.paymentRequest.count(), paymentRequestsBefore); assert.equal(await db.auditLog.count({ where: { entityId: order.id } }), 1); assert.equal(isOfficialPaymentReportEligible(saved), true);
    const sequencesBeforeReplay = await db.documentSequence.count({ where: { businessId: business.id } });
    const replay = await reconcileLegacyOrder({ orderId: order.id, branchId: branch.id, receiverUserId: receiver.id, method: PosPaymentMethod.CASH, paidAt: new Date(), evidenceDescription: "other", reason: "other", linePrices: [{ orderItemId: item.id, unitPrice: "9.999" }] }, { businessId: business.id, userId: owner.id });
    assert.equal(replay.replayed, true); assert.equal(await db.payment.count({ where: { orderId: order.id } }), 1); assert.equal(await db.auditLog.count({ where: { entityId: order.id } }), 1); assert.equal(await db.documentSequence.count({ where: { businessId: business.id } }), sequencesBeforeReplay);
    const otherOwner = await db.user.create({ data: { fullName: "Other", email: "f4-other@test.local", passwordHash: "x" } });
    const otherBusiness = await db.business.create({ data: { code: "F4O", nameAr: "Other", ownerId: otherOwner.id } });
    const otherBranch = await db.branch.create({ data: { businessId: otherBusiness.id, code: "OTH", nameAr: "Other" } });
    const legacy = await db.order.create({ data: { businessId: business.id, status: OrderStatus.COMPLETED, completedAt: new Date(), financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } });
    const legacyItem = await db.orderItem.create({ data: { orderId: legacy.id, productId: product.id, quantity: "1.000" } });
    await assert.rejects(() => reconcileLegacyOrder({ orderId: legacy.id, branchId: otherBranch.id, receiverUserId: receiver.id, method: PosPaymentMethod.CASH, paidAt: new Date(), evidenceDescription: "proof", reason: "proof", linePrices: [{ orderItemId: legacyItem.id, unitPrice: "1.000" }] }, { businessId: business.id, userId: owner.id }), /RECONCILIATION_BRANCH_INVALID/);

    const otherProduct = await db.product.create({ data: { businessId: otherBusiness.id, code: "OP", nameAr: "Other", basePrice: "1.00" } });
    const otherOrder = await db.order.create({ data: { businessId: otherBusiness.id, status: OrderStatus.COMPLETED, completedAt: new Date(), financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } });
    const otherItem = await db.orderItem.create({ data: { orderId: otherOrder.id, productId: otherProduct.id, quantity: "1.000" } });
    await assert.rejects(() => reconcileLegacyOrder({ orderId: otherOrder.id, branchId: otherBranch.id, receiverUserId: otherOwner.id, method: PosPaymentMethod.CASH, paidAt: new Date(), evidenceDescription: "proof", reason: "proof", linePrices: [{ orderItemId: otherItem.id, unitPrice: "1.000" }] }, { businessId: business.id, userId: owner.id }), /RECONCILIATION_ORDER_NOT_FOUND/);

    await db.membership.create({ data: { userId: otherOwner.id, businessId: otherBusiness.id, role: "OWNER", scope: "ALL_BRANCHES" } });
    const receiverCheckOrder = await db.order.create({ data: { businessId: business.id, status: OrderStatus.COMPLETED, completedAt: new Date(), financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } });
    const receiverCheckItem = await db.orderItem.create({ data: { orderId: receiverCheckOrder.id, productId: product.id, quantity: "1.000" } });
    await assert.rejects(() => reconcileLegacyOrder({ orderId: receiverCheckOrder.id, branchId: branch.id, receiverUserId: otherOwner.id, method: PosPaymentMethod.CASH, paidAt: new Date(), evidenceDescription: "proof", reason: "proof", linePrices: [{ orderItemId: receiverCheckItem.id, unitPrice: "1.000" }] }, { businessId: business.id, userId: owner.id }), /RECONCILIATION_RECEIVER_INVALID/);

    const concurrentOrder = await db.order.create({ data: { businessId: business.id, status: OrderStatus.COMPLETED, completedAt: new Date(), financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } });
    const concurrentItem = await db.orderItem.create({ data: { orderId: concurrentOrder.id, productId: product.id, quantity: "1.000" } });
    const sequenceBefore = new Map((await db.documentSequence.findMany({ where: { businessId: business.id } })).map((row) => [row.documentType, row.currentValue]));
    const concurrentInput = { orderId: concurrentOrder.id, branchId: branch.id, receiverUserId: receiver.id, method: PosPaymentMethod.CASH, paidAt: new Date(), evidenceDescription: "concurrent proof", reason: "concurrent proof", linePrices: [{ orderItemId: concurrentItem.id, unitPrice: "2.000" }] };
    const concurrentResults = await Promise.all([reconcileLegacyOrder(concurrentInput, { businessId: business.id, userId: owner.id }), reconcileLegacyOrder(concurrentInput, { businessId: business.id, userId: owner.id })]);
    assert.deepEqual(concurrentResults.map((entry) => entry.replayed).sort(), [false, true]);
    assert.equal(await db.payment.count({ where: { orderId: concurrentOrder.id } }), 1);
    assert.equal(await db.auditLog.count({ where: { entityId: concurrentOrder.id } }), 1);
    assert.equal(await db.stockMovement.count({ where: { businessId: business.id } }), beforeStock);
    for (const row of await db.documentSequence.findMany({ where: { businessId: business.id } })) assert.equal(row.currentValue, (sequenceBefore.get(row.documentType) ?? BigInt(0)) + BigInt(1));
  });
}
