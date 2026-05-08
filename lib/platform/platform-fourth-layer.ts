import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

/**
 * Optional fourth layer for `/dashboard/platform` step-up (after session + operator identity + password).
 *
 * Two independent env-only factors (not stored on `User`):
 * - `PLATFORM_TOTP_SECRET`: Base32 secret for an authenticator app (RFC 6238, 30s, SHA-1).
 * - `PLATFORM_EXTRA_SECRET`: static passphrase compared in constant time with the form field.
 *
 * Policy:
 * - If a variable is **set** (non-empty after trim), that factor is **required** on every step-up.
 * - If **both** are set, **both** must succeed (defense in depth).
 * - If **neither** is set, step-up stays password-only (backward compatible for local dev).
 */

const RAW_TOTP = () => process.env.PLATFORM_TOTP_SECRET?.trim() ?? "";
const RAW_EXTRA = () => process.env.PLATFORM_EXTRA_SECRET?.trim() ?? "";

/** UI: show TOTP field when operator configured a non-empty secret (even if malformed — verify step returns misconfigured). */
export function isPlatformTotpFieldEnabled(): boolean {
  return RAW_TOTP().length > 0;
}

export function isPlatformExtraSecretFieldEnabled(): boolean {
  return RAW_EXTRA().length > 0;
}

export function getPlatformFourthLayerUIFlags(): { totp: boolean; extraSecret: boolean } {
  return {
    totp: isPlatformTotpFieldEnabled(),
    extraSecret: isPlatformExtraSecretFieldEnabled(),
  };
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32ToBuffer(input: string): Buffer | null {
  const cleaned = input.replace(/\s+/g, "").replace(/=+$/g, "").toUpperCase();
  if (!cleaned || !/^[A-Z2-7]+$/i.test(cleaned)) return null;
  let bits = "";
  for (const c of cleaned.toUpperCase()) {
    const v = BASE32_ALPHABET.indexOf(c);
    if (v === -1) return null;
    bits += v.toString(2).padStart(5, "0");
  }
  const out: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    out.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(out);
}

function hotpCode(secret: Buffer, counter: bigint): string {
  const buf = Buffer.allocUnsafe(8);
  // RFC 4226 / RFC 6238: 8-byte **unsigned** big-endian counter.
  buf.writeBigUInt64BE(counter, 0);
  const h = createHmac("sha1", secret).update(buf).digest();
  const o = h[h.length - 1] ?? 0;
  const offset = o & 0x0f;
  const bin =
    ((h[offset] ?? 0) & 0x7f) * 0x1000000 +
    ((h[offset + 1] ?? 0) & 0xff) * 0x10000 +
    ((h[offset + 2] ?? 0) & 0xff) * 0x100 +
    ((h[offset + 3] ?? 0) & 0xff);
  const code = bin % 1_000_000;
  return String(code).padStart(6, "0");
}

function totpCodeAt(secret: Buffer, unixMs: number, stepSec: number): string {
  const counter = BigInt(Math.floor(unixMs / 1000 / stepSec));
  return hotpCode(secret, counter);
}

function normalizeTotpDigits(value: string): string {
  // Accept Arabic-Indic and Extended Arabic-Indic numerals from RTL keyboards.
  return value
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    // Remove whitespace, bidi marks, and any non-digit separators/paste artifacts.
    .replace(/[\u200e\u200f\u061c]/g, "")
    .replace(/[^\d]/g, "");
}

/**
 * Accepts current window ±`PLATFORM_TOTP_STEPS` (default 2 → ±60s) for clock skew.
 * Max steps capped at 30 (15 minutes) to avoid accidental weak configuration.
 */
export function verifyPlatformTotp(secretBase32: string, userCode: string): boolean {
  return getPlatformTotpVerificationDetails(secretBase32, userCode).ok;
}

export type PlatformTotpVerificationDetails = {
  ok: boolean;
  normalizedLength: number;
  matchedWindow: number | null;
  reason: "secret_invalid" | "code_invalid" | "mismatch" | "match";
};

/** Optional extra drift tolerance (±N steps of 30s). Default 2; cap 30. */
function totpDriftSteps(): number {
  const raw = process.env.PLATFORM_TOTP_STEPS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(n) || n < 0) return 2;
  return Math.min(Math.max(n, 0), 30);
}

/**
 * Internal diagnostics for operator TOTP troubleshooting.
 * Exposes no secret material and no generated server code values.
 */
export function getPlatformTotpVerificationDetails(
  secretBase32: string,
  userCode: string,
): PlatformTotpVerificationDetails {
  const secret = base32ToBuffer(secretBase32);
  if (!secret || secret.length < 4) {
    return { ok: false, normalizedLength: 0, matchedWindow: null, reason: "secret_invalid" };
  }
  const digits = normalizeTotpDigits(userCode);
  if (!/^\d{6}$/.test(digits)) {
    return { ok: false, normalizedLength: digits.length, matchedWindow: null, reason: "code_invalid" };
  }
  const step = 30;
  const drift = totpDriftSteps();
  const now = Date.now();
  for (let w = -drift; w <= drift; w += 1) {
    const t = now + w * step * 1000;
    if (totpCodeAt(secret, t, step) === digits) {
      return { ok: true, normalizedLength: digits.length, matchedWindow: w, reason: "match" };
    }
  }
  return { ok: false, normalizedLength: digits.length, matchedWindow: null, reason: "mismatch" };
}

function parseTotpSecretOrNull(): string | null {
  const raw = RAW_TOTP();
  if (!raw) return null;
  const buf = base32ToBuffer(raw);
  if (!buf || buf.length < 4) return null;
  return raw.replace(/\s+/g, "").replace(/=+$/g, "").toUpperCase();
}

function verifyExtraSecret(userValue: string): boolean {
  const expected = RAW_EXTRA();
  if (!expected) return true;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(userValue, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type FourthLayerVerifyResult =
  | { ok: true }
  | { ok: false; error: "misconfigured_totp" | "missing_totp" | "invalid_totp" | "missing_extra" | "invalid_extra" };

/**
 * Validates optional fourth-layer fields from the step-up form.
 * Call only **after** account password has already been verified.
 */
export function verifyPlatformFourthLayerFromForm(formData: FormData): FourthLayerVerifyResult {
  const totpConfigured = RAW_TOTP().length > 0;
  const extraConfigured = RAW_EXTRA().length > 0;

  if (totpConfigured) {
    const secret = parseTotpSecretOrNull();
    if (!secret) {
      return { ok: false, error: "misconfigured_totp" };
    }
    const code = String(formData.get("totp") ?? "").trim();
    if (!code) {
      return { ok: false, error: "missing_totp" };
    }
    const details = getPlatformTotpVerificationDetails(secret, code);
    if (process.env.PLATFORM_TOTP_DEBUG === "1") {
      const maskedCode = normalizeTotpDigits(code).replace(/\d(?=\d{2})/g, "*");
      console.info("[platform-step-up] totp-check", {
        ok: details.ok,
        reason: details.reason,
        normalizedLength: details.normalizedLength,
        matchedWindow: details.matchedWindow,
        codeMasked: maskedCode,
      });
    }
    if (!details.ok) {
      return { ok: false, error: "invalid_totp" };
    }
  }

  if (extraConfigured) {
    const extra = String(formData.get("extraSecret") ?? "");
    if (!extra) {
      return { ok: false, error: "missing_extra" };
    }
    if (!verifyExtraSecret(extra)) {
      return { ok: false, error: "invalid_extra" };
    }
  }

  return { ok: true };
}
