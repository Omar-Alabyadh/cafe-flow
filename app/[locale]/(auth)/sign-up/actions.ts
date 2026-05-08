"use server";

import { hashPassword } from "@/lib/auth/password";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type SignUpState = {
  error: string | null;
};

/**
 * Simple sign-up foundation:
 * validates basic fields, ensures unique email, stores hashed password,
 * then redirects user to sign-in page.
 */
export async function signUpWithCredentials(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  const fullName = String(formData.get("fullName") ?? "").trim();
  const fullNameEnRaw = String(formData.get("fullNameEn") ?? "").trim();
  const fullNameEn = fullNameEnRaw.length > 0 ? fullNameEnRaw : null;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: t("auth.signUp.missingFields") };
  }
  if (fullNameEn && fullNameEn.length > 120) {
    return { error: t("auth.signUp.nameEnTooLong") };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: t("auth.signUp.invalidEmail") };
  }
  if (password.length < 8) {
    return { error: t("auth.signUp.passwordTooShort") };
  }
  if (password !== confirmPassword) {
    return { error: t("auth.signUp.passwordMismatch") };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { error: t("auth.signUp.emailTaken") };
  }

  const passwordHash = await hashPassword(password);

  const created = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
    },
    select: { id: true },
  });

  /**
   * English display name is written with raw SQL so sign-up still works if the loaded
   * `PrismaClient` predates the `fullNameEn` column in the generated client (same dev
   * hot-reload issue as dashboard identity). After `prisma generate`, you could move
   * this back into `data: { fullNameEn }` on create if you prefer a single statement.
   */
  if (fullNameEn) {
    try {
      await prisma.$executeRaw(
        Prisma.sql`UPDATE "User" SET "fullNameEn" = ${fullNameEn} WHERE "id" = ${created.id}`,
      );
    } catch {
      /* column missing in DB until migration: account is still created */
    }
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "").trim();
  const safeCallback =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "";
  const signInPath =
    safeCallback.length > 0
      ? `/${locale}/sign-in?callbackUrl=${encodeURIComponent(safeCallback)}`
      : `/${locale}/sign-in`;
  redirect(signInPath);
}

