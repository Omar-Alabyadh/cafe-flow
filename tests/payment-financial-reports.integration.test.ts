import assert from "node:assert/strict";
import test from "node:test";
import { FinancialDataOrigin, OrderStatus, PosPaymentMethod, PosPaymentStatus, PrismaClient } from "@prisma/client";

const url = process.env.F5_TEST_DATABASE_URL;
if (!url) test.skip("payment financial reports integration requires disposable F5_TEST_DATABASE_URL", () => {});
else {
  process.env.DATABASE_URL = url;
  const db = new PrismaClient({ datasources: { db: { url } } });
  test.after(async () => db.$disconnect());
  test("reports use eligible captured payment snapshots, never current product prices", async () => {
    const { getPaymentFinancialReport } = await import("@/lib/finance/payment-financial-reports");
    await db.$executeRawUnsafe('TRUNCATE TABLE "AuditLog", "FinancialBackfillBatch", "Payment", "DocumentSequence", "OrderItem", "Order", "Product", "Branch", "Membership", "Business", "User" CASCADE');
    const user = await db.user.create({ data: { fullName: "Reporter", email: "f5@test.local", passwordHash: "x" } });
    const business = await db.business.create({ data: { code: "F5", nameAr: "F5", ownerId: user.id } });
    const branch = await db.branch.create({ data: { businessId: business.id, code: "F5", nameAr: "F5" } });
    const product = await db.product.create({ data: { businessId: business.id, code: "P", nameAr: "P", basePrice: "999.99" } });
    const paidAt = new Date("2026-07-12T10:00:00.000Z");
    async function sale(method: PosPaymentMethod, amount: string) { const order = await db.order.create({ data: { businessId: business.id, status: OrderStatus.COMPLETED, branchId: branch.id, subtotalAmount: amount, discountTotal: "0", taxTotal: "0", totalAmount: amount, currency: "LYD", financialDataOrigin: FinancialDataOrigin.NATIVE } }); await db.orderItem.create({ data: { orderId: order.id, productId: product.id, quantity: "1" } }); await db.payment.create({ data: { businessId: business.id, branchId: branch.id, orderId: order.id, receiptNumber: `R-${method}`, amount, currency: "LYD", method, status: PosPaymentStatus.CAPTURED, paidAt, receivedByUserId: user.id, receivedByDisplayNameSnapshot: "Reporter", financialDataOrigin: FinancialDataOrigin.NATIVE } }); }
    await sale(PosPaymentMethod.CASH, "1.111"); await sale(PosPaymentMethod.BANK_CARD, "2.222");
    const report = await getPaymentFinancialReport({ businessId: business.id, branchId: branch.id, currency: "LYD", startUtc: new Date("2026-07-12T00:00:00Z"), endUtc: new Date("2026-07-13T00:00:00Z") });
    assert.equal(report.totalSales.toFixed(3), "3.333"); assert.equal(report.cashSales.toFixed(3), "1.111"); assert.equal(report.bankingSales.toFixed(3), "2.222"); assert.equal(report.bankingMethods.find((row) => row.method === PosPaymentMethod.BANK_CARD)?.total.toFixed(3), "2.222"); assert.equal(report.bankingMethods.length, 10);
    await db.product.update({ where: { id: product.id }, data: { basePrice: "1.00" } });
    const unchanged = await getPaymentFinancialReport({ businessId: business.id, branchId: branch.id, currency: "LYD", startUtc: new Date("2026-07-12T00:00:00Z"), endUtc: new Date("2026-07-13T00:00:00Z") });
    assert.equal(unchanged.totalSales.toFixed(3), "3.333");
  });
}
