"use client";

import { useActionState, useRef, useState } from "react";
import { cancelStaffInvite, resendStaffInvite, type ResendStaffInviteState } from "./actions";
import { Link2, RefreshCw } from "lucide-react";
import { StaffInviteStatus } from "@prisma/client";
import { useTranslations } from "next-intl";

const initial: ResendStaffInviteState = { error: null };

type StaffInviteActionsUiProps = {
  locale: string;
  inviteId: string;
  status: StaffInviteStatus;
  isExpired: boolean;
};

/**
 * Pending/expired invites can rotate the secret (old URLs stop working). Accepted/cancelled rows are read-only.
 */
export function StaffInviteActionsUi({ locale, inviteId, status, isExpired }: StaffInviteActionsUiProps) {
  const t = useTranslations("dashboard.business.staff.inviteActions");
  const cancelRef = useRef<HTMLFormElement>(null);
  const [resendState, resendAction, resendPending] = useActionState(resendStaffInvite, initial);
  const [copied, setCopied] = useState(false);

  const canRegenerate = status === StaffInviteStatus.PENDING || status === StaffInviteStatus.EXPIRED;
  const canCancel = status === StaffInviteStatus.PENDING;

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("copyFallback"), url);
    }
  }

  return (
    <div className="flex min-w-[200px] flex-col gap-2">
      {resendState.error ? (
        <p className="text-xs text-red-700 dark:text-red-300">{resendState.error}</p>
      ) : null}
      {resendState.inviteUrl ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50/80 p-2 text-xs dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="mb-1 font-medium text-emerald-900 dark:text-emerald-100">{t("newLink")}</p>
          {resendState.publicInviteLabel ? (
            <p className="mb-1 font-mono text-[11px] text-amber-900 dark:text-amber-100">
              {t("publicLabel")}: {resendState.publicInviteLabel}
            </p>
          ) : null}
          <p className="break-all font-mono text-[11px] text-emerald-950 dark:text-emerald-50">{resendState.inviteUrl}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => void copyUrl(resendState.inviteUrl ?? "")}
              className="inline-flex items-center gap-1 rounded border border-emerald-700 px-2 py-1 text-[11px] font-medium text-emerald-900 dark:border-emerald-500 dark:text-emerald-100"
            >
              <Link2 className="h-3 w-3" />
              {copied ? t("copied") : t("copy")}
            </button>
            {resendState.shareText ? (
              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(resendState.shareText ?? "")}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="rounded border border-emerald-700 px-2 py-1 text-[11px] font-medium text-emerald-900 dark:border-emerald-500 dark:text-emerald-100"
              >
                {t("whatsapp")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {canRegenerate ? (
          <form action={resendAction} className="inline">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="inviteId" value={inviteId} />
            <button
              type="submit"
              disabled={resendPending}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-60 dark:border-zinc-600"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resendPending ? "animate-spin" : ""}`} />
              {isExpired || status === StaffInviteStatus.EXPIRED ? t("regenerate") : t("resend")}
            </button>
          </form>
        ) : null}

        {canCancel ? (
          <form ref={cancelRef} action={cancelStaffInvite}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="inviteId" value={inviteId} />
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t("confirmCancel"))) {
                  cancelRef.current?.requestSubmit();
                }
              }}
              className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-800 dark:border-red-900 dark:text-red-200"
            >
              {t("cancel")}
            </button>
          </form>
        ) : null}

        {!canRegenerate && !canCancel ? <span className="text-xs text-zinc-400">—</span> : null}
      </div>
    </div>
  );
}
