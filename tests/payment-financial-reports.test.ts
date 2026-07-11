import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("payment report service keeps server-only and all banking methods", () => {
  const source = readFileSync("lib/finance/payment-financial-reports.ts", "utf8");
  assert.match(source, /import "server-only"/);
  assert.match(source, /filter\(\(method\) => method !== PosPaymentMethod\.CASH\)/);
  assert.match(source, /gte: input\.startUtc, lt: input\.endUtc/);
});
