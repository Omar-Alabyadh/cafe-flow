import "server-only";

import { routing } from "@/i18n/routing";
import type { BranchLimitResult, StaffLimitResult, SubscriptionGuardFailure } from "@/lib/subscription/business-subscription";
import { createTranslator } from "next-intl";
import { hasLocale } from "next-intl";
import { cache } from "react";

import type messagesAr from "../../messages/ar.json";

type AppMessages = typeof messagesAr;

/**
 * Resolves the locale coming from hidden `FormData` fields (`locale`) the same way
 * as `i18n/request.ts`: only `routing.locales` are accepted; everything else falls back to Arabic.
 */
export function normalizeServerActionLocale(raw: string): string {
  return hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
}

/**
 * Loads `messages/{locale}.json` and returns a `next-intl` translator scoped to the `serverActions` namespace.
 *
 * Why this exists:
 * - Server actions cannot rely on React context from `NextIntlClientProvider`.
 * - We still want **one** dictionary (`messages/*.json`) so AR/EN stay aligned and nothing is hardcoded in actions.
 *
 * The function is wrapped in `cache()` so multiple validations inside the same request do not re-import JSON repeatedly.
 */
export const getServerActionTranslator = cache(async (rawLocale: string) => {
  const locale = normalizeServerActionLocale(rawLocale);
  const messages = (await import(`../../messages/${locale}.json`)).default as AppMessages;
  return createTranslator({
    locale,
    messages,
    namespace: "serverActions",
  });
});

export type ServerActionTranslator = Awaited<ReturnType<typeof getServerActionTranslator>>;

type SubscriptionLimitFailure =
  | SubscriptionGuardFailure
  | { code: "BRANCH_LIMIT"; limit: number }
  | { code: "STAFF_LIMIT"; limit: number };

/**
 * Maps structured subscription / plan-limit failures to localized copy.
 * Call sites stay free of English sentences while `business-subscription.ts` stays UI-agnostic.
 */
export function translateSubscriptionLimitFailure(
  t: ServerActionTranslator,
  failure: SubscriptionLimitFailure,
): string {
  switch (failure.code) {
    case "NO_SUBSCRIPTION":
      return t("subscription.noSubscription");
    case "SUBSCRIPTION_NOT_USABLE":
      return t("subscription.notUsable", { status: failure.status });
    case "BRANCH_LIMIT":
      return t("subscription.branchLimit", { limit: failure.limit });
    case "STAFF_LIMIT":
      return t("subscription.staffLimit", { limit: failure.limit });
    default:
      return t("subscription.unknown");
  }
}

export function translateBranchLimitCheck(t: ServerActionTranslator, result: BranchLimitResult): string | null {
  if (result.ok) return null;
  return translateSubscriptionLimitFailure(t, result.failure);
}

export function translateStaffLimitCheck(t: ServerActionTranslator, result: StaffLimitResult): string | null {
  if (result.ok) return null;
  return translateSubscriptionLimitFailure(t, result.failure);
}
