export const FINANCIAL_AUDIT_ACTIONS = {
  SNAPSHOT_CREATED: "financial.snapshot.created",
  PAYMENT_ATTEMPT_CREATED: "financial.payment.attempt_created",
  PAYMENT_CAPTURED: "financial.payment.captured",
  PAYMENT_FAILED: "financial.payment.failed",
  PAYMENT_CANCELLED: "financial.payment.cancelled",
  BACKFILL_PREVIEWED: "financial.backfill.previewed",
  BACKFILL_APPLIED: "financial.backfill.applied",
  LEGACY_RECONCILIATION_APPLIED: "financial.legacy_reconciliation.applied",
  ORDER_NUMBER_ISSUED: "financial.order_number.issued",
  RECEIPT_NUMBER_ISSUED: "financial.receipt_number.issued",
} as const;

export type FinancialAuditAction = (typeof FINANCIAL_AUDIT_ACTIONS)[keyof typeof FINANCIAL_AUDIT_ACTIONS];
