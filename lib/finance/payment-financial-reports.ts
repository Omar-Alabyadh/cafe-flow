import "server-only";
import { FinancialDataOrigin, PosPaymentMethod, Prisma } from "@prisma/client";
import { roundMoney } from "@/lib/finance/money";
import { prisma } from "@/lib/prisma";

export const BANKING_PAYMENT_METHODS = Object.values(PosPaymentMethod).filter((method) => method !== PosPaymentMethod.CASH);
export type FinancialReportInput = { businessId: string; branchId?: string | null; currency: string; startUtc: Date; endUtc: Date; page?: number; pageSize?: number };
export function validateFinancialReportRange(input: Pick<FinancialReportInput, "startUtc" | "endUtc">) { if (Number.isNaN(input.startUtc.getTime()) || Number.isNaN(input.endUtc.getTime()) || input.startUtc >= input.endUtc) throw new Error("FINANCIAL_REPORT_RANGE_INVALID"); }
function utcTimestamp(value: Date) { return value.toISOString().replace("T", " ").replace("Z", ""); }

function eligible(input: FinancialReportInput) {
  const branch = input.branchId ? Prisma.sql`AND p."branchId" = ${input.branchId}` : Prisma.empty;
  const startUtc = utcTimestamp(input.startUtc); const endUtc = utcTimestamp(input.endUtc);
  return Prisma.sql`
    FROM "Payment" p JOIN "Order" o ON o.id = p."orderId"
    WHERE p."businessId" = ${input.businessId} ${branch} AND p.status = 'CAPTURED' AND p.currency = ${input.currency}
      AND p."paidAt" >= ${startUtc}::timestamp AND p."paidAt" < ${endUtc}::timestamp
      AND p.amount IS NOT NULL AND p.method IS NOT NULL AND p."branchId" IS NOT NULL AND p."paidAt" IS NOT NULL AND p."receivedByUserId" IS NOT NULL
      AND o."branchId" IS NOT NULL AND o.currency IS NOT NULL AND o."totalAmount" IS NOT NULL
      AND p."businessId" = o."businessId" AND p."branchId" = o."branchId" AND p.currency = o.currency AND p.amount = o."totalAmount"
      AND o."financialDataOrigin" IN ('NATIVE'::"FinancialDataOrigin", 'MANUALLY_RECONCILED'::"FinancialDataOrigin")
      AND (SELECT count(*) FROM "Payment" cp WHERE cp."orderId" = p."orderId" AND cp.status = 'CAPTURED') = 1`;
}

type Aggregate = { total: Prisma.Decimal | null; cash: Prisma.Decimal | null; banking: Prisma.Decimal | null; count: bigint };
type Method = { method: PosPaymentMethod; total: Prisma.Decimal | null; count: bigint };
type Detail = { receiptNumber: string | null; orderNumber: string | null; paidAt: Date; branchName: string; method: PosPaymentMethod; amount: Prisma.Decimal; currency: string; receivedByDisplayNameSnapshot: string | null; financialDataOrigin: FinancialDataOrigin; id: string };
export async function getPaymentFinancialReport(input: FinancialReportInput) {
  validateFinancialReportRange(input); const pageSize = Math.min(50, Math.max(1, Math.trunc(input.pageSize ?? 25))); const page = Math.max(1, Math.trunc(input.page ?? 1)); const predicate = eligible(input);
  const [aggregateRows, methodRows, countRows, detailRows, unresolvedLegacyOrders] = await Promise.all([
    prisma.$queryRaw<Aggregate[]>(Prisma.sql`SELECT COALESCE(SUM(p.amount),0) total, COALESCE(SUM(p.amount) FILTER (WHERE p.method='CASH'),0) cash, COALESCE(SUM(p.amount) FILTER (WHERE p.method<>'CASH'),0) banking, count(*) count ${predicate}`),
    prisma.$queryRaw<Method[]>(Prisma.sql`SELECT p.method, COALESCE(SUM(p.amount),0) total, count(*) count ${predicate} GROUP BY p.method`),
    prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`SELECT count(*) count ${predicate}`),
    prisma.$queryRaw<Detail[]>(Prisma.sql`SELECT p.id, p."receiptNumber", o."orderNumber", p."paidAt", (SELECT "nameAr" FROM "Branch" b WHERE b.id=p."branchId") "branchName", p.method, p.amount, p.currency, (SELECT "fullName" FROM "User" u WHERE u.id=p."receivedByUserId") "receivedByDisplayNameSnapshot", p."financialDataOrigin" ${predicate} ORDER BY p."paidAt" DESC, p.id DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`),
    prisma.order.count({ where: { businessId: input.businessId, financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN, status: "COMPLETED" } }),
  ]);
  const aggregate = aggregateRows[0] ?? { total: new Prisma.Decimal(0), cash: new Prisma.Decimal(0), banking: new Prisma.Decimal(0), count: BigInt(0) }; const byMethod = new Map(methodRows.map((row) => [row.method, row])); const bankingSales = roundMoney(aggregate.banking ?? 0);
  const bankingMethods = BANKING_PAYMENT_METHODS.map((method) => { const row = byMethod.get(method); const total = roundMoney(row?.total ?? 0); return { method, count: Number(row?.count ?? 0), total, percentage: bankingSales.isZero() ? new Prisma.Decimal(0) : roundMoney(total.div(bankingSales).mul(100)) }; });
  const count = Number(countRows[0]?.count ?? 0); return { currency: input.currency, totalSales: roundMoney(aggregate.total ?? 0), cashSales: roundMoney(aggregate.cash ?? 0), bankingSales, paymentCount: Number(aggregate.count), bankingMethods, unresolvedLegacyOrders, legacyFinancialValueAvailable: false, excludedPaymentCount: 0, details: detailRows.map((row) => ({ ...row, order: { orderNumber: row.orderNumber } })), page, pageSize, totalPages: Math.max(1, Math.ceil(count / pageSize)) };
}
