"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { getCurrentUserId } from "@/lib/auth/session";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import {
  clearPlatformStepUpFailures,
  isPlatformStepUpLocked,
  recordPlatformStepUpFailure,
  setPlatformStepUpCookie,
} from "@/lib/platform/platform-step-up-cookie";
import { verifyPlatformFourthLayerFromForm } from "@/lib/platform/platform-fourth-layer";
import { isPlatformOperator } from "@/lib/platform/require-platform-operator";
import { redirect } from "next/navigation";

export type PlatformStepUpState = {
  error: string | null;
};

/**
 * Re-verifies the signed-in operator's **account password** before issuing the short-lived platform cookie.
 * Email is already bound to the session; this action only checks password hash for the same user id.
 */
export async function confirmPlatformStepUp(
  _prev: PlatformStepUpState,
  formData: FormData,
): Promise<PlatformStepUpState> {
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  const userId = await getCurrentUserId();
  if (!userId || !(await isPlatformOperator(userId))) {
    return { error: t("platformStepUp.notOperator") };
  }
  if (isPlatformStepUpLocked(userId)) {
    return { error: t("platformStepUp.locked") };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { error: t("platformStepUp.missingPassword") };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, archivedAt: true },
  });
  if (!user || user.archivedAt || !user.passwordHash) {
    recordPlatformStepUpFailure(userId);
    return { error: t("platformStepUp.invalidPassword") };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    recordPlatformStepUpFailure(userId);
    return { error: t("platformStepUp.invalidPassword") };
  }

  const fourth = verifyPlatformFourthLayerFromForm(formData);
  if (!fourth.ok) {
    recordPlatformStepUpFailure(userId);
    switch (fourth.error) {
      case "misconfigured_totp":
        return { error: t("platformStepUp.misconfiguredTotp") };
      case "missing_totp":
        return { error: t("platformStepUp.missingTotp") };
      case "invalid_totp":
        return { error: t("platformStepUp.invalidTotp") };
      case "missing_extra":
        return { error: t("platformStepUp.missingExtra") };
      case "invalid_extra":
        return { error: t("platformStepUp.invalidExtra") };
      default:
        return { error: t("platformStepUp.invalidPassword") };
    }
  }

  clearPlatformStepUpFailures(userId);
  try {
    await setPlatformStepUpCookie(userId);
  } catch {
    return { error: t("platformStepUp.misconfigured") };
  }
  redirect(`/${locale}/dashboard/platform`);
}
