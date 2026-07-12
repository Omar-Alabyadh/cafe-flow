import { applyHistoricalBackfill, HISTORICAL_BACKFILL_VERSION, previewHistoricalBackfill } from "@/lib/finance/historical-backfill";
import { Prisma } from "@prisma/client";

type BackfillStage = "argument-validation" | "preview" | "apply";
let currentStage: BackfillStage = "argument-validation";

class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliUsageError";
  }
}

function formatFailure(error: unknown, stage: BackfillStage) {
  const failure: { stage: BackfillStage; errorClass: string; code?: string; message: string } = {
    stage,
    errorClass: error instanceof Error ? error.constructor.name : "UnknownError",
    message: "Unexpected command error.",
  };

  if (error instanceof CliUsageError) {
    failure.message = error.message;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    failure.code = error.code;
    failure.message = "Database operation failed.";
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    failure.message = "Database operation failed.";
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    failure.code = error.errorCode;
    failure.message = "Database connection initialization failed.";
  }

  return JSON.stringify(failure);
}

async function main() {
  const args = new Map(process.argv.slice(2).map((arg) => {
    const [key, value = ""] = arg.split("=");
    return [key, value];
  }));
  const businessId = args.get("--businessId") ?? "";

  if (!businessId) throw new CliUsageError("--businessId is required");

  if (!args.has("--apply")) {
    currentStage = "preview";
    console.log(JSON.stringify(await previewHistoricalBackfill(businessId)));
    return;
  }

  const idempotencyKey = args.get("--idempotencyKey") ?? "";
  const confirmation = args.get("--confirm") ?? "";
  if (!idempotencyKey || confirmation !== "APPLY_FINANCIAL_BACKFILL") {
    throw new CliUsageError("Apply requires --idempotencyKey and --confirm=APPLY_FINANCIAL_BACKFILL");
  }

  currentStage = "apply";
  console.log(JSON.stringify(await applyHistoricalBackfill({
    businessId,
    backfillVersion: args.get("--version") || HISTORICAL_BACKFILL_VERSION,
    idempotencyKey,
    confirmationToken: confirmation,
  })));
}

void main().catch((error) => {
  console.error(`Finance backfill command failed: ${formatFailure(error, currentStage)}`);
  process.exitCode = 1;
});
