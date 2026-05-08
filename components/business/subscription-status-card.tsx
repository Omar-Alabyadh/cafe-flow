import { getCurrentBusinessSubscription } from "@/lib/subscription/business-subscription";
import { formatDateLine } from "@/lib/format/arabic-datetime";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { SubscriptionStatus } from "@prisma/client";
import { BadgeCheck, CalendarClock, Layers3 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SubscriptionStatusCard({ businessId }: { businessId: string }) {
  const current = await getCurrentBusinessSubscription(businessId);
  const t = await getTranslations("dashboard.subscriptionCard");
  const tCommon = await getTranslations("common");

  function statusLabel(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.TRIALING:
        return t("statusLabels.TRIALING");
      case SubscriptionStatus.ACTIVE:
        return t("statusLabels.ACTIVE");
      case SubscriptionStatus.PENDING_PAYMENT:
        return t("statusLabels.PENDING_PAYMENT");
      case SubscriptionStatus.EXPIRED:
        return t("statusLabels.EXPIRED");
      case SubscriptionStatus.CANCELED:
        return t("statusLabels.CANCELED");
      case SubscriptionStatus.PAST_DUE:
        return t("statusLabels.PAST_DUE");
      default:
        return t("statusLabels.ACTIVE");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-3 flex items-center gap-2 font-semibold">
        <BadgeCheck className="h-4 w-4 text-emerald-500" />
        {t("title")}
      </p>
      {!current ? (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <div className="grid gap-2 text-zinc-600 dark:text-zinc-400 md:grid-cols-2">
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{t("plan")}:</span> {current.planNameAr}
          </p>
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{t("status")}:</span> {statusLabel(current.status)}
          </p>
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            <Layers3 className="me-1 inline h-4 w-4 text-zinc-500" />
            {t("branchLimit")}: {formatArabicLatnInteger(current.branchLimit)}
          </p>
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            <Layers3 className="me-1 inline h-4 w-4 text-zinc-500" />
            {t("staffLimit")}: {formatArabicLatnInteger(current.staffLimit)}
          </p>
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950 md:col-span-2">
            <CalendarClock className="me-1 inline h-4 w-4 text-amber-500" />
            {t("trialEnds")}: {current.trialEndsAt ? formatDateLine(current.trialEndsAt) : tCommon("emDash")}
          </p>
        </div>
      )}
    </div>
  );
}
