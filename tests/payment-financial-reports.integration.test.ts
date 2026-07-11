import assert from "node:assert/strict";
import test from "node:test";
import { FinancialDataOrigin, OrderStatus, PosPaymentMethod, PosPaymentStatus, Prisma, PrismaClient } from "@prisma/client";

const url = process.env.F5_TEST_DATABASE_URL;
if (!url) test.skip("payment financial reports integration requires disposable F5_TEST_DATABASE_URL", () => {});
else {
  process.env.DATABASE_URL = url;
  const db = new PrismaClient({ datasources: { db: { url } } });
  test.after(async () => db.$disconnect());
  test("reports page eligible payment snapshots in the database", async () => {
    const { getPaymentFinancialReport } = await import("@/lib/finance/payment-financial-reports");
    await db.$executeRawUnsafe('TRUNCATE TABLE "AuditLog", "FinancialBackfillBatch", "Payment", "DocumentSequence", "OrderItem", "Order", "Product", "Branch", "Membership", "Business", "User" CASCADE');
    const user = await db.user.create({ data: { fullName: "Reporter", email: "f5@test.local", passwordHash: "x" } });
    const business = await db.business.create({ data: { code: "F5", nameAr: "F5", ownerId: user.id } });
    const branch = await db.branch.create({ data: { businessId: business.id, code: "F5", nameAr: "F5" } });
    const otherBranch = await db.branch.create({ data: { businessId: business.id, code: "F5B", nameAr: "F5B" } });
    const otherUser = await db.user.create({ data: { fullName: "Other", email: "f5-other@test.local", passwordHash: "x" } });
    const otherBusiness = await db.business.create({ data: { code: "F5O", nameAr: "F5O", ownerId: otherUser.id } });
    const otherTenantBranch = await db.branch.create({ data: { businessId: otherBusiness.id, code: "F5O", nameAr: "F5O" } });
    const product = await db.product.create({ data: { businessId: business.id, code: "P", nameAr: "P", basePrice: "999.99" } });
    async function sale(input: { method: PosPaymentMethod; amount: string; businessId?: string; branchId?: string; currency?: string; paidAt?: Date; origin?: FinancialDataOrigin; status?: PosPaymentStatus; orderAmount?: string }) {
      const businessId = input.businessId ?? business.id;
      const branchId = input.branchId ?? branch.id;
      const currency = input.currency ?? "LYD";
      const amount = input.orderAmount ?? input.amount;
      const order = await db.order.create({ data: { businessId, status: OrderStatus.COMPLETED, branchId, subtotalAmount: amount, discountTotal: "0", taxTotal: "0", totalAmount: amount, currency, financialDataOrigin: input.origin ?? FinancialDataOrigin.NATIVE } });
      if (businessId === business.id) await db.orderItem.create({ data: { orderId: order.id, productId: product.id, quantity: "1" } });
      await db.payment.create({ data: { businessId, branchId, orderId: order.id, receiptNumber: `R-${order.id}-1`, amount: input.amount, currency, method: input.method, status: input.status ?? PosPaymentStatus.CAPTURED, paidAt: input.paidAt ?? new Date("2026-07-12T10:00:00.000Z"), receivedByUserId: businessId === business.id ? user.id : otherUser.id, receivedByDisplayNameSnapshot: "Reporter", financialDataOrigin: input.origin ?? FinancialDataOrigin.NATIVE } });
    }
    await sale({ method: PosPaymentMethod.CASH, amount: "1.111" });
    await sale({ method: PosPaymentMethod.BANK_CARD, amount: "2.222" });
    await sale({ method: PosPaymentMethod.ONE_PAY, amount: "3.333" });
    await sale({ method: PosPaymentMethod.LY_PAY, amount: "4.444" });
    await sale({ method: PosPaymentMethod.EDAFLY, amount: "5.555" });
    await sale({ method: PosPaymentMethod.MOBI_CASH, amount: "6.666" });
    await sale({ method: PosPaymentMethod.MASREFY_PAY, amount: "7.777", origin: FinancialDataOrigin.MANUALLY_RECONCILED, paidAt: new Date("2026-07-12T20:59:59.999Z") });
    await sale({ method: PosPaymentMethod.CASH, amount: "90.000", branchId: otherBranch.id });
    await sale({ method: PosPaymentMethod.CASH, amount: "80.000", businessId: otherBusiness.id, branchId: otherTenantBranch.id });
    await sale({ method: PosPaymentMethod.CASH, amount: "70.000", origin: FinancialDataOrigin.LEGACY_UNKNOWN });
    await sale({ method: PosPaymentMethod.CASH, amount: "60.000", status: PosPaymentStatus.PENDING });
    await sale({ method: PosPaymentMethod.CASH, amount: "50.000", orderAmount: "51.000" });
    await sale({ method: PosPaymentMethod.CASH, amount: "30.000", paidAt: new Date("2026-07-12T22:00:00.000Z") });
    const input = { businessId: business.id, branchId: branch.id, currency: "LYD", startUtc: new Date("2026-07-12T09:00:00Z"), endUtc: new Date("2026-07-12T21:00:00Z"), pageSize: 3 };
    const report = await getPaymentFinancialReport({ ...input, page: 1 });
    const pageTwo = await getPaymentFinancialReport({ ...input, page: 2 });
    const pageThree = await getPaymentFinancialReport({ ...input, page: 3 });
    assert.equal(report.totalSales.toFixed(3), "31.108");
    assert.equal(report.cashSales.toFixed(3), "1.111");
    assert.equal(report.bankingSales.toFixed(3), "29.997");
    assert.equal(report.cashSales.add(report.bankingSales).toFixed(3), report.totalSales.toFixed(3));
    assert.equal(report.paymentCount, 7);
    assert.equal(report.totalPages, 3);
    assert.equal(report.details.length, 3);
    assert.equal(pageTwo.details.length, 3);
    assert.equal(pageThree.details.length, 1);
    assert.equal(pageTwo.totalSales.toFixed(3), report.totalSales.toFixed(3));
    assert.equal(pageThree.totalSales.toFixed(3), report.totalSales.toFixed(3));
    assert.equal(report.bankingMethods.find((row) => row.method === PosPaymentMethod.BANK_CARD)?.total.toFixed(3), "2.222");
    assert.equal(report.bankingMethods.reduce((sum, row) => sum.add(row.total), new Prisma.Decimal(0)).toFixed(3), report.bankingSales.toFixed(3));
    assert.equal(report.bankingMethods.length, 10);
    const pagedIds = [...report.details, ...pageTwo.details, ...pageThree.details].map((payment) => payment.id);
    assert.equal(new Set(pagedIds).size, 7);
    assert.deepEqual((await getPaymentFinancialReport({ ...input, page: 1 })).details.map((payment) => payment.id), report.details.map((payment) => payment.id));
    await db.product.update({ where: { id: product.id }, data: { basePrice: "1.00" } });
    const unchanged = await getPaymentFinancialReport({ businessId: business.id, branchId: branch.id, currency: "LYD", startUtc: input.startUtc, endUtc: input.endUtc });
    assert.equal(unchanged.totalSales.toFixed(3), "31.108");
  });
}
