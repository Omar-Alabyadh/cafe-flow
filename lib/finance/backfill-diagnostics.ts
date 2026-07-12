import { Prisma } from "@prisma/client";

export type BackfillDatabaseFailure = "DATABASE_OPERATION_FAILED" | "TRANSACTION_EXPIRED";
export type BackfillStage = "argument-validation" | "preview" | "apply";

export function classifyBackfillDatabaseFailure(error: unknown): BackfillDatabaseFailure {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2028"
    ? "TRANSACTION_EXPIRED"
    : "DATABASE_OPERATION_FAILED";
}

export function formatBackfillFailure(error: unknown, stage: BackfillStage) {
  const failure: { stage: BackfillStage; errorClass: string; code?: string; reason?: string; message: string } = {
    stage,
    errorClass: error instanceof Error ? error.constructor.name : "UnknownError",
    message: "Unexpected command error.",
  };

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    failure.code = error.code;
    failure.reason = classifyBackfillDatabaseFailure(error);
    failure.message = failure.reason === "TRANSACTION_EXPIRED"
      ? "Database transaction expired before Apply completed."
      : "Database operation failed.";
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    failure.message = "Database operation failed.";
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    failure.code = error.errorCode;
    failure.message = "Database connection initialization failed.";
  }

  return JSON.stringify(failure);
}
