const FIXED_OFFSET_PATTERN = /^[+-]\d{2}(?::?\d{2})?$/;

export type TimeZoneValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: "required" | "fixedOffset" | "invalid" };

export function normalizeTimeZoneInput(value: unknown): string {
  return String(value ?? "").trim();
}

export function isValidIanaTimeZone(value: unknown): value is string {
  return validateTimeZone(value).ok;
}

export function validateTimeZone(value: unknown): TimeZoneValidationResult {
  const normalized = normalizeTimeZoneInput(value);
  if (!normalized) return { ok: false, error: "required" };
  if (FIXED_OFFSET_PATTERN.test(normalized)) return { ok: false, error: "fixedOffset" };

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: normalized }).format(new Date(0));
    return { ok: true, value: normalized };
  } catch {
    return { ok: false, error: "invalid" };
  }
}

export function normalizeOptionalTimeZone(value: unknown): string | null {
  const normalized = normalizeTimeZoneInput(value);
  if (!normalized) return null;
  const result = validateTimeZone(normalized);
  return result.ok ? result.value : null;
}
