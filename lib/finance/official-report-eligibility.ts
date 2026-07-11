import { FinancialDataOrigin, PosPaymentStatus } from "@prisma/client";

export function isOfficialPaymentReportEligible(order: {
  businessId: string; branchId: string | null; currency: string | null; totalAmount: unknown | null;
  financialDataOrigin: FinancialDataOrigin | null;
  payments: Array<{ businessId: string; branchId: string | null; currency: string; amount: unknown; method: unknown; status: PosPaymentStatus; paidAt: Date | null; receivedByUserId: string | null }>;
}): boolean {
  const captured = order.payments.filter((payment) => payment.status === PosPaymentStatus.CAPTURED);
  const payment = captured[0];
  return captured.length === 1 && order.financialDataOrigin !== FinancialDataOrigin.LEGACY_UNKNOWN && Boolean(payment && order.branchId && order.currency && order.totalAmount !== null && payment.amount !== null && payment.method && payment.paidAt && payment.receivedByUserId && payment.businessId === order.businessId && payment.branchId === order.branchId && payment.currency === order.currency);
}
