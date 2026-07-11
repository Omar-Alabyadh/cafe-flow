import { normalizeOptionalTimeZone } from "@/lib/time-zone/validation";

export const FALLBACK_TIME_ZONE = "UTC";

export type EffectiveTimeZoneMode = "operational" | "viewer";

export function resolveOperationalTimeZone({
  branchTimeZone,
  businessTimeZone,
}: {
  branchTimeZone?: string | null;
  businessTimeZone?: string | null;
}): string {
  return normalizeOptionalTimeZone(branchTimeZone) ?? normalizeOptionalTimeZone(businessTimeZone) ?? FALLBACK_TIME_ZONE;
}

export function resolveViewerTimeZone({
  userTimeZone,
  browserTimeZone,
}: {
  userTimeZone?: string | null;
  browserTimeZone?: string | null;
}): string {
  return normalizeOptionalTimeZone(userTimeZone) ?? normalizeOptionalTimeZone(browserTimeZone) ?? FALLBACK_TIME_ZONE;
}

export function resolveEffectiveTimeZone({
  mode,
  branchTimeZone,
  businessTimeZone,
  userTimeZone,
  browserTimeZone,
}: {
  mode: EffectiveTimeZoneMode;
  branchTimeZone?: string | null;
  businessTimeZone?: string | null;
  userTimeZone?: string | null;
  browserTimeZone?: string | null;
}): string {
  if (mode === "viewer") {
    return resolveViewerTimeZone({ userTimeZone, browserTimeZone });
  }

  return resolveOperationalTimeZone({ branchTimeZone, businessTimeZone });
}
