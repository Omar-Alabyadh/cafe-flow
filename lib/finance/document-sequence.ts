import "server-only";

import { randomUUID } from "crypto";
import { FinancialDocumentType, Prisma } from "@prisma/client";

/**
 * Atomically allocates the next business/document value inside the caller's
 * transaction. PostgreSQL row locking and ON CONFLICT make concurrent calls
 * serialize; a surrounding rollback also rolls back the allocation.
 */
export async function allocateDocumentSequence(
  tx: Prisma.TransactionClient,
  businessId: string,
  documentType: FinancialDocumentType,
): Promise<bigint> {
  const rows = await tx.$queryRaw<Array<{ currentValue: bigint }>>(Prisma.sql`
    INSERT INTO "DocumentSequence" (
      "id", "businessId", "documentType", "currentValue", "createdAt", "updatedAt"
    ) VALUES (
      ${randomUUID()}, ${businessId}, ${documentType}::"FinancialDocumentType", 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT ("businessId", "documentType")
    DO UPDATE SET
      "currentValue" = "DocumentSequence"."currentValue" + 1,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "currentValue"
  `);

  const value = rows[0]?.currentValue;
  if (value === undefined) throw new Error("DOCUMENT_SEQUENCE_ALLOCATION_FAILED");
  return value;
}

export function formatFinancialDocumentNumber(
  documentType: FinancialDocumentType,
  branchCodeSnapshot: string,
  sequence: bigint,
): string {
  const branchCode = branchCodeSnapshot.trim().toUpperCase();
  if (!branchCode || sequence <= BigInt(0)) throw new Error("DOCUMENT_NUMBER_INPUT_INVALID");
  const prefix = documentType === FinancialDocumentType.ORDER ? "ORD" : "RCT";
  return `${prefix}-${branchCode}-${sequence.toString()}`;
}
