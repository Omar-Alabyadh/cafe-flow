import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import {
  FinancialDocumentType,
  PosPaymentMethod,
  PosPaymentStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";

const testDatabaseUrl = process.env.F2_TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  test.skip("database integration requires F2_TEST_DATABASE_URL for a disposable database", () => {});
} else {
  const prisma = new PrismaClient({ datasources: { db: { url: testDatabaseUrl } } });

  async function resetDatabase() {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Payment", "OrderItem", "Order", "DocumentSequence", "Product", "Category", "Branch", "Business", "User" CASCADE');
  }

  async function fixture(suffix = randomUUID()) {
    const user = await prisma.user.create({
      data: { fullName: "Finance Test", email: `${suffix}@test.local`, passwordHash: "test" },
    });
    const business = await prisma.business.create({
      data: { code: `B${suffix.replace(/-/g, "").slice(0, 16)}`, nameAr: "Test", ownerId: user.id },
    });
    const branch = await prisma.branch.create({
      data: { businessId: business.id, code: "B01", nameAr: "Branch" },
    });
    const order = await prisma.order.create({
      data: { businessId: business.id, branchId: branch.id, status: "COMPLETED" },
    });
    return { user, business, branch, order };
  }

  async function allocate(tx: Prisma.TransactionClient, businessId: string, documentType: FinancialDocumentType) {
    const rows = await tx.$queryRaw<Array<{ currentValue: bigint }>>(Prisma.sql`
      INSERT INTO "DocumentSequence" ("id", "businessId", "documentType", "currentValue", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${businessId}, ${documentType}::"FinancialDocumentType", 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("businessId", "documentType")
      DO UPDATE SET "currentValue" = "DocumentSequence"."currentValue" + 1, "updatedAt" = CURRENT_TIMESTAMP
      RETURNING "currentValue"
    `);
    return rows[0]!.currentValue;
  }

  test.before(async () => resetDatabase());
  test.after(async () => prisma.$disconnect());

  test("database: pending, failed, and cancelled attempts coexist; a second captured payment is rejected", async () => {
    const { business, branch, order } = await fixture();
    for (const status of [PosPaymentStatus.PENDING, PosPaymentStatus.FAILED, PosPaymentStatus.CANCELLED, PosPaymentStatus.CAPTURED]) {
      await prisma.payment.create({
        data: {
          businessId: business.id, branchId: branch.id, orderId: order.id, amount: "1.000", currency: "LYD",
          method: PosPaymentMethod.CASH, status,
        },
      });
    }
    await assert.rejects(() => prisma.payment.create({
      data: { businessId: business.id, branchId: branch.id, orderId: order.id, amount: "1.000", currency: "LYD", method: PosPaymentMethod.CASH, status: PosPaymentStatus.CAPTURED },
    }));
  });

  test("database: order and receipt numbers are unique only within their business", async () => {
    const first = await fixture();
    const second = await fixture();
    await prisma.order.update({ where: { id: first.order.id }, data: { orderNumber: "ORD-B01-1" } });
    await prisma.order.update({ where: { id: second.order.id }, data: { orderNumber: "ORD-B01-1" } });
    await assert.rejects(() => prisma.order.create({ data: { businessId: first.business.id, orderNumber: "ORD-B01-1" } }));
    await prisma.payment.create({ data: { businessId: first.business.id, branchId: first.branch.id, orderId: first.order.id, receiptNumber: "RCT-B01-1", amount: "1.000", currency: "LYD" } });
    await prisma.payment.create({ data: { businessId: second.business.id, branchId: second.branch.id, orderId: second.order.id, receiptNumber: "RCT-B01-1", amount: "1.000", currency: "LYD" } });
  });

  test("database: nullable legacy fields remain valid", async () => {
    const { business, order } = await fixture();
    const product = await prisma.product.create({ data: { businessId: business.id, code: "P1", nameAr: "Product", basePrice: "1.00" } });
    await prisma.order.update({ where: { id: order.id }, data: { branchId: null, orderNumber: null, subtotalAmount: null, totalAmount: null, currency: null } });
    await prisma.orderItem.create({ data: { orderId: order.id, productId: product.id, quantity: "1" } });
    await prisma.payment.create({ data: { businessId: business.id, orderId: order.id, amount: "1.000", currency: "LYD", method: null, paidAt: null, receivedByUserId: null, receiptNumber: null } });
  });

  test("database: DocumentSequence is scoped by business and document type", async () => {
    const first = await fixture();
    const second = await fixture();
    await prisma.documentSequence.create({ data: { businessId: first.business.id, documentType: FinancialDocumentType.ORDER } });
    await prisma.documentSequence.create({ data: { businessId: first.business.id, documentType: FinancialDocumentType.RECEIPT } });
    await prisma.documentSequence.create({ data: { businessId: second.business.id, documentType: FinancialDocumentType.ORDER } });
    await assert.rejects(() => prisma.documentSequence.create({ data: { businessId: first.business.id, documentType: FinancialDocumentType.ORDER } }));
  });

  test("database: concurrent sequence allocation is unique and continuous", async () => {
    const { business } = await fixture();
    const values = await Promise.all(Array.from({ length: 12 }, () => prisma.$transaction((tx) => allocate(tx, business.id, FinancialDocumentType.ORDER))));
    assert.deepEqual(values.map(Number).sort((a, b) => a - b), Array.from({ length: 12 }, (_, index) => index + 1));
  });

  test("database: a rolled-back allocation does not consume a sequence value", async () => {
    const { business } = await fixture();
    await assert.rejects(() => prisma.$transaction(async (tx) => { await allocate(tx, business.id, FinancialDocumentType.RECEIPT); throw new Error("rollback"); }));
    const value = await prisma.$transaction((tx) => allocate(tx, business.id, FinancialDocumentType.RECEIPT));
    assert.equal(value, BigInt(1));
  });
}
