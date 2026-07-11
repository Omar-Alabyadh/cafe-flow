import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("finance backfill CLI starts under the current tsx CommonJS transform", () => {
  const result = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/finance-backfill.ts"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Finance backfill command failed\./);
  assert.doesNotMatch(result.stderr, /top-level await|Transform failed/i);
});
