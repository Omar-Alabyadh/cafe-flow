"use server";

import { signIn } from "@/auth";
import { resolvePostSignInDestination, sanitizeInternalCallback } from "@/lib/auth/post-sign-in-route";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { prisma } from "@/lib/prisma";
import { setActiveBusinessCookie } from "@/lib/tenant/active-business-cookie";
import { BusinessStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export type SignInState = {
  error: string | null;
};

/**
 * Server action for credentials login.
 * Keeping login on server keeps password handling straightforward and secure.
 */
export async function signInWithCredentials(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  const callbackUrlRaw = String(formData.get("callbackUrl") ?? "");
  const defaultRoute = `/${locale}/dashboard`;

  if (!email || !password) {
    return {
      error: t("auth.signIn.missingFields"),
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: defaultRoute,
    });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, archivedAt: true },
    });
    if (user && !user.archivedAt) {
      const memberships = await prisma.membership.findMany({
        where: {
          userId: user.id,
          archivedAt: null,
          isActive: true,
          business: { archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
        },
        select: { businessId: true },
        distinct: ["businessId"],
      });
      if (memberships.length === 1) {
        await setActiveBusinessCookie(memberships[0].businessId);
      }
    }
    const resolved =
      user && !user.archivedAt
        ? await resolvePostSignInDestination(user.id, locale)
        : { destination: defaultRoute };
    const redirectTo = sanitizeInternalCallback(callbackUrlRaw || resolved.destination, resolved.destination);

    redirect(redirectTo);
  } catch (error) {
    // We avoid `instanceof AuthError` because the thrown value may not share the same
    // constructor reference after bundling, which makes `instanceof` throw at runtime.
    if (error !== null && typeof error === "object" && "type" in error) {
      const type = (error as { type?: unknown }).type;
      if (type === "CredentialsSignin") {
        return {
          error: t("auth.signIn.invalidCredentials"),
        };
      }
    }
    throw error;
  }
}
