import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

function runCli(args: string[] = []) {
  return spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/finance-backfill.ts", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

test("finance backfill CLI starts under the current tsx CommonJS transform", () => {
  const result = runCli();
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Finance backfill command failed: /);
  assert.match(result.stderr, /"stage":"argument-validation"/);
  assert.match(result.stderr, /"errorClass":"CliUsageError"/);
  assert.match(result.stderr, /"message":"--businessId is required"/);
  assert.doesNotMatch(result.stderr, /top-level await|Transform failed/i);
});

test("finance backfill CLI reports missing Apply safeguards without exposing its business argument", () => {
  const businessArgument = "not-a-real-business-id";
  const result = runCli(["--apply", `--businessId=${businessArgument}`]);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Finance backfill command failed: /);
  assert.match(result.stderr, /"stage":"argument-validation"/);
  assert.match(result.stderr, /"errorClass":"CliUsageError"/);
  assert.match(result.stderr, /Apply requires --idempotencyKey and --confirm=APPLY_FINANCIAL_BACKFILL/);
  assert.doesNotMatch(result.stderr, new RegExp(businessArgument));
});
