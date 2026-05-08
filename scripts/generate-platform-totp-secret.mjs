#!/usr/bin/env node
/**
 * Prints a random Base32 secret suitable for PLATFORM_TOTP_SECRET (RFC 4648 / authenticator apps).
 * Run: node scripts/generate-platform-totp-secret.mjs
 * Add the line to .env (never commit .env), then scan the otpauth URI in your authenticator or enter the secret manually.
 */
import crypto from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function toBase32(buf) {
  let bits = "";
  for (const byte of buf) {
    bits += byte.toString(2).padStart(8, "0");
  }
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    const val = parseInt(bits.slice(i, i + 5), 2);
    out += alphabet[val];
  }
  return out;
}

const secret = toBase32(crypto.randomBytes(20));
const issuer = "CafeFlow";
const account = "platform";
const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&period=30&digits=6`;

console.log("Add to .env (keep private):");
console.log(`PLATFORM_TOTP_SECRET="${secret}"`);
console.log("");
console.log("Authenticator URI (QR-capable apps):");
console.log(otpauth);
