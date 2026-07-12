import assert from "node:assert/strict";
import test from "node:test";
import { FinancialDataOrigin, PosPaymentMethod, PosPaymentStatus, Prisma, PrismaClient } from "@prisma/client";
import { classifyBackfillDatabaseFailure, formatBackfillFailure } from "@/lib/finance/backfill-diagnostics";
import { applyHistoricalBackfill, previewHistoricalBackfill } from "@/lib/finance/historical-backfill";

const url = process.env.F2_TEST_DATABASE_URL;
if (!url) test.skip("backfill integration requires disposable F2_TEST_DATABASE_URL", () => {});
else {
  process.env.DATABASE_URL = url;
  const db = new PrismaClient({ datasources: { db: { url } } });

  async function resetDatabase() {
    await db.$executeRawUnsafe('TRUNCATE TABLE "AuditLog", "FinancialBackfillBatch", "Payment", "OrderItem", "Order", "DocumentSequence", "StockMovement", "RawMaterialStock", "Product", "Branch", "Business", "User" CASCADE');
  }

  test.after(async () => db.$disconnect());

  test("P2028 transaction expiry is deterministically classified without exposing database details", async () => {
    await assert.rejects(
      () => db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_sleep(0.05)`;
      }, { maxWait: 1_000, timeout: 1 }),
      (error: unknown) => {
        assert.ok(error instanceof Prisma.PrismaClientKnownRequestError);
        assert.equal(error.code, "P2028");
        assert.equal(classifyBackfillDatabaseFailure(error), "TRANSACTION_EXPIRED");
        const diagnostic = formatBackfillFailure(error, "apply");
        assert.match(diagnostic, /"code":"P2028"/);
        assert.match(diagnostic, /"reason":"TRANSACTION_EXPIRED"/);
        assert.match(diagnostic, /Database transaction expired before Apply completed/);
        assert.doesNotMatch(diagnostic, /pg_sleep|127\.0\.0\.1|postgresql/i);
        return true;
      },
    );
  });

  test("backfill bulk Apply handles the 58 Order / 100 Item scope without crossing tenants or native records", async () => {
    await resetDatabase();
    const owner = await db.user.create({ data: { fullName: "F3 Owner", email: "f3-owner@test.local", passwordHash: "x" } });
    const otherOwner = await db.user.create({ data: { fullName: "F3 Other", email: "f3-other@test.local", passwordHash: "x" } });
    const business = await db.business.create({ data: { code: "F3", nameAr: "F3", ownerId: owner.id } });
    const otherBusiness = await db.business.create({ data: { code: "F3O", nameAr: "F3 Other", ownerId: otherOwner.id } });
    const branch = await db.branch.create({ data: { businessId: business.id, code: "F3", nameAr: "F3" } });
    const product = await db.product.create({ data: { businessId: business.id, code: "F3", nameAr: "F3 product", basePrice: "1.00" } });
    const otherProduct = await db.product.create({ data: { businessId: otherBusiness.id, code: "F3O", nameAr: "F3 other product", basePrice: "1.00" } });

    await db.order.createMany({ data: Array.from({ length: 58 }, () => ({ businessId: business.id, status: "COMPLETED" as const })) });
    const legacyOrders = await db.order.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "asc" } });
    await db.orderItem.createMany({
      data: legacyOrders.flatMap((order, index) => Array.from({ length: index < 42 ? 2 : 1 }, () => ({ orderId: order.id, productId: product.id, quantity: "1" }))),
    });

    const nativeOrder = await db.order.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        status: "COMPLETED",
        subtotalAmount: "12.000",
        discountTotal: "4.000",
        taxTotal: "3.000",
        totalAmount: "11.000",
        currency: "USD",
        financialDataOrigin: FinancialDataOrigin.NATIVE,
      },
    });
    await db.orderItem.create({ data: { orderId: nativeOrder.id, productId: product.id, quantity: "1", lineDiscountTotal: "4.000", lineTaxTotal: "3.000" } });
    await db.payment.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        orderId: nativeOrder.id,
        amount: "11.000",
        currency: "USD",
        method: PosPaymentMethod.CASH,
        status: PosPaymentStatus.CAPTURED,
        paidAt: new Date(),
        receivedByUserId: owner.id,
        financialDataOrigin: FinancialDataOrigin.NATIVE,
      },
    });

    const otherOrder = await db.order.create({ data: { businessId: otherBusiness.id, status: "COMPLETED" } });
    const otherItem = await db.orderItem.create({ data: { orderId: otherOrder.id, productId: otherProduct.id, quantity: "1" } });
    const protectedCounts = {
      payments: await db.payment.count({ where: { businessId: business.id } }),
      sequences: await db.documentSequence.count({ where: { businessId: business.id } }),
      stocks: await db.rawMaterialStock.count({ where: { businessId: business.id } }),
      movements: await db.stockMovement.count({ where: { businessId: business.id } }),
    };

    const before = await previewHistoricalBackfill(business.id);
    assert.equal(before.totalOrders, 59);
    assert.equal(before.nativeOrders, 1);
    assert.equal(before.candidates, 58);
    assert.equal(before.orderUpdates, 58);
    assert.equal(before.itemUpdates, 100);

    const applied = await applyHistoricalBackfill({ businessId: business.id, backfillVersion: "test-v1", idempotencyKey: "key-58-100", confirmationToken: "APPLY_FINANCIAL_BACKFILL" });
    assert.equal(applied.replayed, false);
    assert.equal(await db.order.count({ where: { businessId: business.id, financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } }), 58);

    const nativeAfter = await db.order.findUniqueOrThrow({ where: { id: nativeOrder.id }, include: { items: true } });
    assert.equal(nativeAfter.currency, "USD");
    assert.equal(nativeAfter.discountTotal?.toFixed(3), "4.000");
    assert.equal(nativeAfter.taxTotal?.toFixed(3), "3.000");
    assert.equal(nativeAfter.financialDataOrigin, FinancialDataOrigin.NATIVE);
    assert.equal(nativeAfter.items[0]?.lineDiscountTotal?.toFixed(3), "4.000");
    assert.equal(nativeAfter.items[0]?.lineTaxTotal?.toFixed(3), "3.000");

    const otherAfter = await db.order.findUniqueOrThrow({ where: { id: otherOrder.id }, include: { items: true } });
    assert.equal(otherAfter.currency, null);
    assert.equal(otherAfter.financialDataOrigin, null);
    assert.equal(otherAfter.items[0]?.id, otherItem.id);
    assert.equal(otherAfter.items[0]?.lineDiscountTotal, null);
    assert.equal(otherAfter.items[0]?.lineTaxTotal, null);

    assert.deepEqual({
      payments: await db.payment.count({ where: { businessId: business.id } }),
      sequences: await db.documentSequence.count({ where: { businessId: business.id } }),
      stocks: await db.rawMaterialStock.count({ where: { businessId: business.id } }),
      movements: await db.stockMovement.count({ where: { businessId: business.id } }),
    }, protectedCounts);
    assert.equal(await db.financialBackfillBatch.count({ where: { businessId: business.id, status: "COMPLETED" } }), 1);

    const replay = await applyHistoricalBackfill({ businessId: business.id, backfillVersion: "test-v1", idempotencyKey: "key-58-100", confirmationToken: "APPLY_FINANCIAL_BACKFILL" });
    assert.equal(replay.replayed, true);
    assert.equal(await db.financialBackfillBatch.count({ where: { businessId: business.id } }), 1);
    assert.equal(await db.auditLog.count({ where: { businessId: business.id } }), 1);

    const after = await previewHistoricalBackfill(business.id);
    assert.equal(after.orderUpdates, 0);
    assert.equal(after.itemUpdates, 0);
  });
}
