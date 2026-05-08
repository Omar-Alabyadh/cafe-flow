import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Second factor for the SaaS operator console (`/dashboard/platform`).
 *
 * Why this exists:
 * - Session JWT alone proves "signed in earlier"; a shared device or token leak should not expose
 *   cross-tenant subscription data without re-proving the account password.
 * - We store a short-lived signed cookie (httpOnly) after bcrypt verification — same password hash as normal sign-in,
 *   plus optional fourth-layer checks (`PLATFORM_TOTP_SECRET` / `PLATFORM_EXTRA_SECRET` — see `platform-fourth-layer.ts`).
 *
 * What it does NOT replace:
 * - `PLATFORM_OWNER_EMAIL` + `User.isPlatformOwner` still gate *who* may attempt step-up (see `isPlatformOperator`).
 * - Production must use HTTPS so the cookie is not sent in clear text (`secure` in production).
 */

export const PLATFORM_STEP_UP_COOKIE = "cf_platform_stepup_v1";

const DEFAULT_TTL_MINUTES = 240;

function stepUpTtlMs(): number {
  const raw = process.env.PLATFORM_STEP_UP_TTL_MINUTES?.trim();
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
  const minutes = Number.isFinite(n) && n > 0 && n <= 24 * 60 ? n : DEFAULT_TTL_MINUTES;
  return minutes * 60 * 1000;
}

function signingSecret(): string | null {
  const s = process.env.AUTH_SECRET?.trim();
  return s && s.length > 0 ? s : null;
}

type Payload = { sub: string; exp: number };

function signPayload(payload: Payload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function parseAndVerifyToken(raw: string, secret: string, expectedUserId: string): boolean {
  const parts = raw.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  if (!body || !sig) return false;
  const expectedSig = createHmac("sha256", secret).update(body).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  let payload: Payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
  } catch {
    return false;
  }
  if (!payload || typeof payload.sub !== "string" || typeof payload.exp !== "number") return false;
  if (payload.sub !== expectedUserId) return false;
  if (Date.now() > payload.exp) return false;
  return true;
}

/** In-memory lockout (per Node process). For multi-instance production, add Redis or similar. */
const failureState = new Map<string, { count: number; lockedUntil: number }>();

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

export function isPlatformStepUpLocked(userId: string): boolean {
  const row = failureState.get(userId);
  if (!row) return false;
  if (Date.now() < row.lockedUntil) return true;
  if (Date.now() >= row.lockedUntil) {
    failureState.delete(userId);
  }
  return false;
}

export function recordPlatformStepUpFailure(userId: string): void {
  const row = failureState.get(userId) ?? { count: 0, lockedUntil: 0 };
  const now = Date.now();
  if (now < row.lockedUntil) return;
  row.count += 1;
  if (row.count >= MAX_FAILURES) {
    row.lockedUntil = now + LOCK_MS;
    row.count = 0;
  }
  failureState.set(userId, row);
}

export function clearPlatformStepUpFailures(userId: string): void {
  failureState.delete(userId);
}

/**
 * Returns true when the signed cookie matches this user, signature is valid, and expiry has not passed.
 * Missing `AUTH_SECRET` fails closed (no access).
 */
export async function hasValidPlatformStepUpCookie(userId: string): Promise<boolean> {
  const secret = signingSecret();
  if (!secret) return false;
  const store = await cookies();
  const raw = store.get(PLATFORM_STEP_UP_COOKIE)?.value ?? "";
  if (!raw) return false;
  return parseAndVerifyToken(raw, secret, userId);
}

/**
 * Issues a fresh operator-console cookie after password verification.
 */
export async function setPlatformStepUpCookie(userId: string): Promise<void> {
  const secret = signingSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET is required to issue platform step-up cookies.");
  }
  const ttlMs = stepUpTtlMs();
  const payload: Payload = { sub: userId, exp: Date.now() + ttlMs };
  const token = signPayload(payload, secret);
  const store = await cookies();
  const maxAgeSec = Math.ceil(ttlMs / 1000);
  store.set(PLATFORM_STEP_UP_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSec,
  });
}

export async function clearPlatformStepUpCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PLATFORM_STEP_UP_COOKIE);
}
