"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { completeStaffInviteRegistration, type RegisterInviteState } from "./actions";
import { useTranslations } from "next-intl";

const initial: RegisterInviteState = { error: null };

/** Pinned after a successful registration in this tab so RSC refreshes cannot drop the success UI. */
type InviteSuccessPayload = {
  systemLoginEmail: string;
  systemLoginLocalPart: string | null;
  registeredFullNameAr: string | null;
  registeredRoleTitleAr: string | null;
};

function payloadFromActionState(state: RegisterInviteState): InviteSuccessPayload | null {
  if (!state.success || !state.systemLoginEmail) {
    return null;
  }
  return {
    systemLoginEmail: state.systemLoginEmail,
    systemLoginLocalPart: state.systemLoginLocalPart ?? null,
    registeredFullNameAr: state.registeredFullNameAr ?? null,
    registeredRoleTitleAr: state.registeredRoleTitleAr ?? null,
  };
}

function displayLocalPart(payload: InviteSuccessPayload): string {
  return (
    payload.systemLoginLocalPart ??
    (payload.systemLoginEmail.includes("@") ? payload.systemLoginEmail.split("@")[0] : payload.systemLoginEmail)
  );
}

type InviteRegistrationSectionProps = {
  locale: string;
  token: string;
  /** From server: invite row is ACCEPTED (used for "already used" vs form; must not hide fresh success UI). */
  inviteAccepted: boolean;
};

/** Allow Latin letters, spaces, dot, apostrophe, hyphen; fold to lowercase for stable login segments. */
function sanitizeInviteEnglishNameInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z\s.'-]/g, "")
    .replace(/\s+/g, " ")
    .trimStart();
}

/**
 * Post-registration success: stays visible until the user acts. Shows Arabic name + role, the short login segment,
 * then the full internal login (`local@tenant.cafeflow.local`). Copy writes the full identifier for sign-in.
 */
function InviteAcceptanceSuccessView({
  locale,
  state,
}: {
  locale: string;
  state: RegisterInviteState & { success: true; systemLoginEmail: string };
}) {
  const t = useTranslations("invite.register");
  const displayLocal =
    state.systemLoginLocalPart ??
    (state.systemLoginEmail.includes("@") ? state.systemLoginEmail.split("@")[0] : state.systemLoginEmail);

  const [copied, setCopied] = useState(false);

  const signInHref = `/${locale}/sign-in`;

  async function copyFullLogin() {
    try {
      await navigator.clipboard.writeText(state.systemLoginEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("success.copyFallbackPrompt"), state.systemLoginEmail);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border-2 border-emerald-300 bg-emerald-50/95 p-6 text-center shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40">
      <p className="text-lg font-bold text-emerald-950 dark:text-emerald-50">{t("success.title")}</p>
      <p className="mt-1 text-sm text-emerald-900/90 dark:text-emerald-100/90">{t("success.description")}</p>

      <dl className="mt-5 space-y-3 border-t border-emerald-200/80 pt-5 text-start text-sm dark:border-emerald-800/80">
        <div>
          <dt className="text-xs font-medium text-emerald-800/80 dark:text-emerald-200/80">{t("success.fields.name")}</dt>
          <dd className="mt-0.5 font-semibold text-emerald-950 dark:text-emerald-50">
            {state.registeredFullNameAr ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-emerald-800/80 dark:text-emerald-200/80">{t("success.fields.role")}</dt>
          <dd className="mt-0.5 font-semibold text-emerald-950 dark:text-emerald-50">
            {state.registeredRoleTitleAr ?? "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-emerald-200/80 pt-5 text-start dark:border-emerald-800/80">
        <p className="text-center text-sm font-semibold text-emerald-950 dark:text-emerald-50">{t("success.shortLoginTitle")}</p>
        <p
          className="mt-2 break-all rounded-lg border border-emerald-200/90 bg-white px-4 py-3 text-center font-mono text-lg font-semibold tracking-tight text-emerald-950 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-100"
          dir="ltr"
        >
          {displayLocal}
        </p>

        <p className="mt-4 text-xs font-medium leading-snug text-emerald-900 dark:text-emerald-100/95">
          <span className="me-1" aria-hidden>
            📌
          </span>
          {t("success.fullLoginLabel")}
        </p>
        <p
          className="mt-1.5 break-all rounded-lg border border-emerald-300/80 bg-white/90 px-3 py-2.5 text-center font-mono text-sm font-medium text-emerald-950 dark:border-emerald-600/80 dark:bg-zinc-950 dark:text-emerald-100"
          dir="ltr"
        >
          {state.systemLoginEmail}
        </p>

        <p className="mt-3 text-xs font-medium leading-snug text-emerald-900 dark:text-emerald-100/95">
          {t("success.fullLoginHint")}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-emerald-900/75 dark:text-emerald-100/75">
          {t("success.fullLoginSubHint")}
        </p>
        <button
          type="button"
          onClick={() => void copyFullLogin()}
          className="mt-3 w-full rounded-md border border-emerald-700 bg-white px-4 py-2.5 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100/80 dark:border-emerald-500 dark:bg-zinc-900 dark:text-emerald-100 dark:hover:bg-emerald-950/80"
        >
          {t("success.copyButton")}
        </button>
        {copied ? (
          <p className="mt-2 text-xs font-medium text-emerald-800 dark:text-emerald-200" role="status">
            {t("success.copied")}
          </p>
        ) : null}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-emerald-900/85 dark:text-emerald-100/85">
        {t("success.finalHint")}
      </p>

      <div className="mt-5 flex w-full flex-col gap-2">
        <Link
          href={signInHref}
          className="inline-flex w-full items-center justify-center rounded-md bg-emerald-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {t("success.signInButton")}
        </Link>
        <a
          href={signInHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-md border border-emerald-700 bg-white px-4 py-2.5 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100/80 dark:border-emerald-500 dark:bg-zinc-900 dark:text-emerald-100 dark:hover:bg-emerald-950/80"
        >
          {t("success.signInNewTabButton")}
        </a>
      </div>
    </div>
  );
}

/**
 * Client shell for invite registration: keeps `useActionState` mounted while the invite is ACCEPTED so the success
 * screen is not replaced by the server "already used" branch. Pins success in React state for the same session.
 */
export function InviteRegistrationSection({ locale, token, inviteAccepted }: InviteRegistrationSectionProps) {
  const t = useTranslations("invite.register");
  const [state, formAction, pending] = useActionState(completeStaffInviteRegistration, initial);
  const [firstNameEn, setFirstNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");

  const [successData, setSuccessData] = useState<InviteSuccessPayload | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  /**
   * Keep success state pinned in a deferred task so the action refresh does not briefly
   * switch the UI back to the "already accepted" branch.
   */
  useEffect(() => {
    const payload = payloadFromActionState(state);
    if (!payload) return;

    const runId = window.setTimeout(() => {
      setSuccessData((prev) => prev ?? payload);
      setJustRegistered(true);
    }, 0);

    return () => window.clearTimeout(runId);
  }, [state]);

  const activeSuccess = successData ?? payloadFromActionState(state);
  const displayLocal = activeSuccess ? displayLocalPart(activeSuccess) : "";

  if (activeSuccess && displayLocal) {
    return (
      <InviteAcceptanceSuccessView
        locale={locale}
        state={{
          error: null,
          success: true,
          systemLoginEmail: activeSuccess.systemLoginEmail,
          systemLoginLocalPart: activeSuccess.systemLoginLocalPart,
          registeredFullNameAr: activeSuccess.registeredFullNameAr,
          registeredRoleTitleAr: activeSuccess.registeredRoleTitleAr,
        }}
      />
    );
  }

  if (inviteAccepted && !justRegistered) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        {t("alreadyAccepted")}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="firstNameAr">
            {t("fields.firstNameAr")}
          </label>
          <input
            id="firstNameAr"
            name="firstNameAr"
            required
            autoComplete="off"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
          <p className="text-[11px] text-zinc-500">{t("fields.arabicHint")}</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lastNameAr">
            {t("fields.lastNameAr")}
          </label>
          <input
            id="lastNameAr"
            name="lastNameAr"
            required
            autoComplete="off"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="firstNameEn">
            {t("fields.firstNameEn")}
          </label>
          <input
            id="firstNameEn"
            name="firstNameEn"
            required
            value={firstNameEn}
            onChange={(e) => setFirstNameEn(sanitizeInviteEnglishNameInput(e.target.value))}
            autoComplete="given-name"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lastNameEn">
            {t("fields.lastNameEn")}
          </label>
          <input
            id="lastNameEn"
            name="lastNameEn"
            required
            value={lastNameEn}
            onChange={(e) => setLastNameEn(sanitizeInviteEnglishNameInput(e.target.value))}
            autoComplete="family-name"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>
      </div>
      <p className="text-[11px] text-zinc-500">
        {t("fields.englishHint")}
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="password">
          {t("fields.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          {t("fields.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? t("submitPending") : t("submit")}
      </button>
    </form>
  );
}
