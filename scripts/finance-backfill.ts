import { applyHistoricalBackfill, HISTORICAL_BACKFILL_VERSION, previewHistoricalBackfill } from "@/lib/finance/historical-backfill";

async function main() {
  const args = new Map(process.argv.slice(2).map((arg) => {
    const [key, value = ""] = arg.split("=");
    return [key, value];
  }));
  const businessId = args.get("--businessId") ?? "";

  if (!businessId) throw new Error("--businessId is required");

  if (!args.has("--apply")) {
    console.log(JSON.stringify(await previewHistoricalBackfill(businessId)));
    return;
  }

  const idempotencyKey = args.get("--idempotencyKey") ?? "";
  const confirmation = args.get("--confirm") ?? "";
  if (!idempotencyKey || confirmation !== "APPLY_FINANCIAL_BACKFILL") {
    throw new Error("Apply requires --idempotencyKey and --confirm=APPLY_FINANCIAL_BACKFILL");
  }

  console.log(JSON.stringify(await applyHistoricalBackfill({
    businessId,
    backfillVersion: args.get("--version") || HISTORICAL_BACKFILL_VERSION,
    idempotencyKey,
    confirmationToken: confirmation,
  })));
}

void main().catch(() => {
  console.error("Finance backfill command failed.");
  process.exitCode = 1;
});
