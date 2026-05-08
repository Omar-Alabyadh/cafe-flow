#!/usr/bin/env node
/**
 * Prints expected TOTP codes from `.env` → `PLATFORM_TOTP_SECRET` (same Base32 + HOTP rules as the app).
 *
 * Use this when authenticator shows codes that never match the server:
 * - If **none** of the printed codes match your phone, your phone entry does **not** use the same secret as `.env`.
 * - If they **do** match but the web form still fails, paste that fact (without secrets) and we debug env loading next.
 *
 * Run: npm run platform:totp-now
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.error("No .env file in project root.");
  process.exit(1);
}

const envText = fs.readFileSync(envPath, "utf8");
let secretLine = "";
for (const line of envText.split(/\r?\n/)) {
  if (line.trimStart().startsWith("PLATFORM_TOTP_SECRET=")) {
    secretLine = line;
    break;
  }
}
if (!secretLine) {
  console.error("PLATFORM_TOTP_SECRET not found in .env");
  process.exit(1);
}

const rawVal = secretLine.split("=").slice(1).join("=").trim();
const secretB32 = rawVal.replace(/^["']|["']$/g, "").trim();

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32ToBuffer(input) {
  const cleaned = input.replace(/\s+/g, "").replace(/=+$/g, "").toUpperCase();
  if (!cleaned || !/^[A-Z2-7]+$/i.test(cleaned)) return null;
  let bits = "";
  for (const c of cleaned.toUpperCase()) {
    const v = alphabet.indexOf(c);
    if (v === -1) return null;
    bits += v.toString(2).padStart(5, "0");
  }
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    out.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(out);
}

function hotpCode(secret, counter) {
  const buf = Buffer.allocUnsafe(8);
  buf.writeBigUInt64BE(counter, 0);
  const h = crypto.createHmac("sha1", secret).update(buf).digest();
  const o = h[h.length - 1] & 0x0f;
  const bin =
    ((h[o] & 0x7f) << 24) |
    ((h[o + 1] & 0xff) << 16) |
    ((h[o + 2] & 0xff) << 8) |
    (h[o + 3] & 0xff);
  return String(bin % 1_000_000).padStart(6, "0");
}

function totpAt(secret, unixMs, stepSec) {
  const counter = BigInt(Math.floor(unixMs / 1000 / stepSec));
  return hotpCode(secret, counter);
}

const key = base32ToBuffer(secretB32);
if (!key || key.length < 4) {
  console.error("PLATFORM_TOTP_SECRET is not valid Base32 for this tool.");
  process.exit(1);
}

const now = Date.now();
const step = 30;
console.log("Expected 6-digit codes (30s step, SHA-1) from your current .env secret:");
for (let w = -3; w <= 3; w += 1) {
  const t = now + w * step * 1000;
  const code = totpAt(key, t, step);
  const label = w === 0 ? "now" : `${w > 0 ? "+" : ""}${w} step(s)`;
  console.log(`  ${label.padEnd(14)} → ${code}`);
}
console.log("");
console.log("Compare with your authenticator app. If none match: delete the CafeFlow entry and re-add the secret from .env (or run npm run platform:totp-secret).");
