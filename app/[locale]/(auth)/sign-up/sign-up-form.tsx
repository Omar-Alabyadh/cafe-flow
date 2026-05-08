"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail, Lock, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { signUpWithCredentials, type SignUpState } from "./actions";

type SignUpFormProps = {
  locale: string;
  callbackUrl?: string;
  defaultEmail?: string;
};

const initialState: SignUpState = { error: null };

/**
 * Client form for credentials sign-up.
 * Arabic full name is required; English/Latin display name is optional for bilingual profile lines.
 */
export function SignUpForm({ locale, callbackUrl, defaultEmail }: SignUpFormProps) {
  const [state, formAction, isPending] = useActionState(signUpWithCredentials, initialState);
  const t = useTranslations("auth.signUp");
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "";
  const signInHref =
    safeCallback.length > 0
      ? `/${locale}/sign-in?callbackUrl=${encodeURIComponent(safeCallback)}`
      : `/${locale}/sign-in`;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="locale" value={locale} />
      {safeCallback ? <input type="hidden" name="callbackUrl" value={safeCallback} /> : null}

      <div className="space-y-1">
        <label htmlFor="fullName" className="text-sm font-medium">
          {t("fullNameLabel")}
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute inset-e-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pe-9 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="fullNameEn" className="text-sm font-medium">
          {t("fullNameEnLabel")}
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("fullNameEnHint")}</p>
        <input
          id="fullNameEn"
          name="fullNameEn"
          maxLength={120}
          autoComplete="nickname"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          {t("emailLabel")}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute inset-e-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={defaultEmail ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pe-9 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute inset-e-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pe-9 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute inset-e-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pe-9 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isPending ? t("submitting") : t("submit")}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {t("alreadyHaveAccount")}{" "}
        <Link href={signInHref} className="font-medium underline">
          {t("signInLink")}
        </Link>
      </p>
    </form>
  );
}
