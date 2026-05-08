import { getCurrentUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { BusinessStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { selectDashboardBusiness } from "./actions";
import { getTranslations } from "next-intl/server";
import { membershipRoleDisplayLabel } from "@/lib/dashboard/dashboard-identity";
import { localizedCatalogName } from "@/lib/i18n/localized-catalog-name";

type SelectBusinessPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Mandatory picker for users who belong to multiple businesses as staff.
 * We require explicit choice to prevent opening the wrong tenant by default.
 */
export default async function SelectBusinessPage({ params }: SelectBusinessPageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.selectBusiness");
  const tIdentity = await getTranslations("dashboard.identity");
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/dashboard/select-business`);
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId,
      archivedAt: null,
      isActive: true,
      business: { archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      business: { select: { id: true, nameAr: true, nameEn: true, code: true } },
    },
    distinct: ["businessId"],
  });

  if (memberships.length === 0) {
    redirect(`/${locale}/dashboard`);
  }

  if (memberships.length === 1) {
    const single = memberships[0];
    return (
      <div className="mx-auto w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("singleTitle")}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("singleDescription")}</p>
        <form action={selectDashboardBusiness} className="mt-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="businessId" value={single.business.id} />
          <button
            type="submit"
            className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {t("continue")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("multiTitle")}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("multiDescription")}</p>

      <div className="mt-5 space-y-3">
        {memberships.map((membership) => (
          <form key={membership.id} action={selectDashboardBusiness} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="businessId" value={membership.business.id} />
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {localizedCatalogName(locale, membership.business.nameAr, membership.business.nameEn)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t("businessCode", { code: membership.business.code })} —{" "}
              {t("membershipRole", {
                role: membershipRoleDisplayLabel(tIdentity, membership.role),
              })}
            </p>
            <button
              type="submit"
              className="mt-3 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {t("continueWithBusiness")}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
