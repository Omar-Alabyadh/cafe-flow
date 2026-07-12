import { applyHistoricalBackfill, HISTORICAL_BACKFILL_VERSION, previewHistoricalBackfill } from "@/lib/finance/historical-backfill";
import { BackfillStage, formatBackfillFailure } from "@/lib/finance/backfill-diagnostics";

let currentStage: BackfillStage = "argument-validation";

class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliUsageError";
  }
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
  if (error instanceof CliUsageError) {
    console.error(`Finance backfill command failed: ${JSON.stringify({ stage: currentStage, errorClass: error.constructor.name, message: error.message })}`);
  } else {
    console.error(`Finance backfill command failed: ${formatBackfillFailure(error, currentStage)}`);
  }
  process.exitCode = 1;
});
