"use client";

import { useActionState } from "react";
import { confirmPlatformStepUp, type PlatformStepUpState } from "./step-up-actions";

type Labels = {
  title: string;
  description: string;
  passwordLabel: string;
  totpLabel: string;
  totpHint: string;
  extraSecretLabel: string;
  extraSecretHint: string;
  submit: string;
  submitting: string;
  securityNote: string;
};

const initial: PlatformStepUpState = { error: null };

type PlatformStepUpFormProps = {
  locale: string;
  labels: Labels;
  fourthLayer: { totp: boolean; extraSecret: boolean };
};

/**
 * Client form for operator password re-entry. Server action sets httpOnly cookie on success.
 */
export function PlatformStepUpForm({ locale, labels, fourthLayer }: PlatformStepUpFormProps) {
  const [state, formAction, pending] = useActionState(confirmPlatformStepUp, initial);

  return (
    <div className="cf-surface mx-auto max-w-md rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{labels.title}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{labels.description}</p>
      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <div>
          <label htmlFor="platform-step-up-password" className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {labels.passwordLabel}
          </label>
          <input
            id="platform-step-up-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        {fourthLayer.totp ? (
          <div>
            <label htmlFor="platform-step-up-totp" className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {labels.totpLabel}
            </label>
            <input
              id="platform-step-up-totp"
              name="totp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="000000"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm tracking-widest dark:border-zinc-700 dark:bg-zinc-950"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{labels.totpHint}</p>
          </div>
        ) : null}
        {fourthLayer.extraSecret ? (
          <div>
            <label htmlFor="platform-step-up-extra" className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {labels.extraSecretLabel}
            </label>
            <input
              id="platform-step-up-extra"
              name="extraSecret"
              type="password"
              autoComplete="off"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{labels.extraSecretHint}</p>
          </div>
        ) : null}
        {state.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {pending ? labels.submitting : labels.submit}
        </button>
      </form>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">{labels.securityNote}</p>
    </div>
  );
}
