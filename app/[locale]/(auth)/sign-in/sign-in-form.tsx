"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";
import { signInWithCredentials, type SignInState } from "./actions";
import { useTranslations } from "next-intl";

type SignInFormProps = {
  locale: string;
  callbackUrl?: string;
};

const initialState: SignInState = { error: null };

/**
 * Client form for credentials sign-in.
 * UI is intentionally simple so flow is easy to explain in presentations.
 */
export function SignInForm({ locale, callbackUrl }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(signInWithCredentials, initialState);
  const t = useTranslations("auth.signIn");

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? `/${locale}/dashboard`} />

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
            autoComplete="current-password"
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
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {isPending ? t("submitting") : t("submit")}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {t("noAccount")}{" "}
        <Link
          href={
            callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
              ? `/${locale}/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : `/${locale}/sign-up`
          }
          className="font-medium underline"
        >
          {t("createAccount")}
        </Link>
      </p>
    </form>
  );
}

