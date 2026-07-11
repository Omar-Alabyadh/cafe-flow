import "server-only";

import { FinancialDataOrigin, PosPaymentMethod, PosPaymentStatus, Prisma } from "@prisma/client";
import { isOfficialPaymentReportEligible } from "@/lib/finance/official-report-eligibility";
import { roundMoney, ZERO_MONEY } from "@/lib/finance/money";
import { prisma } from "@/lib/prisma";

export const BANKING_PAYMENT_METHODS = Object.values(PosPaymentMethod).filter((method) => method !== PosPaymentMethod.CASH);
export type FinancialReportInput = { businessId: string; branchId?: string | null; currency: string; startUtc: Date; endUtc: Date; page?: number; pageSize?: number };

export function validateFinancialReportRange(input: Pick<FinancialReportInput, "startUtc" | "endUtc">) {
  if (Number.isNaN(input.startUtc.getTime()) || Number.isNaN(input.endUtc.getTime()) || input.startUtc >= input.endUtc) throw new Error("FINANCIAL_REPORT_RANGE_INVALID");
}

export async function getPaymentFinancialReport(input: FinancialReportInput) {
  validateFinancialReportRange(input);
  const [payments, unresolvedLegacyOrders] = await Promise.all([
    prisma.payment.findMany({
      where: { businessId: input.businessId, status: PosPaymentStatus.CAPTURED, currency: input.currency, paidAt: { gte: input.startUtc, lt: input.endUtc }, ...(input.branchId ? { branchId: input.branchId } : {}) },
      include: { order: { select: { id: true, businessId: true, branchId: true, currency: true, totalAmount: true, financialDataOrigin: true, orderNumber: true, payments: { select: { businessId: true, branchId: true, currency: true, amount: true, method: true, status: true, paidAt: true, receivedByUserId: true } } } } },
      orderBy: { paidAt: "desc" },
    }),
    prisma.order.count({ where: { businessId: input.businessId, financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN, status: "COMPLETED" } }),
  ]);
  const eligible = payments.filter((payment) => payment.order && isOfficialPaymentReportEligible({ ...payment.order, payments: payment.order.payments }));
  const sum = (rows: typeof eligible) => roundMoney(rows.reduce((total, row) => total.add(row.amount), ZERO_MONEY));
  const cashPayments = eligible.filter((payment) => payment.method === PosPaymentMethod.CASH);
  const bankingPayments = eligible.filter((payment) => payment.method !== PosPaymentMethod.CASH);
  const bankingMethods = BANKING_PAYMENT_METHODS.map((method) => { const rows = bankingPayments.filter((payment) => payment.method === method); return { method, count: rows.length, total: sum(rows) }; });
  const totalSales = sum(eligible); const cashSales = sum(cashPayments); const bankingSales = sum(bankingPayments);
  const pageSize = Math.min(50, Math.max(1, Math.trunc(input.pageSize ?? 25))); const page = Math.max(1, Math.trunc(input.page ?? 1));
  return { currency: input.currency, totalSales, cashSales, bankingSales, paymentCount: eligible.length, bankingMethods: bankingMethods.map((row) => ({ ...row, percentage: bankingSales.isZero() ? new Prisma.Decimal(0) : roundMoney(row.total.div(bankingSales).mul(100)) })), unresolvedLegacyOrders, legacyFinancialValueAvailable: false, excludedPaymentCount: payments.length - eligible.length, details: eligible.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalPages: Math.max(1, Math.ceil(eligible.length / pageSize)) };
}
