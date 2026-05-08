import { EmptyState } from "@/components/ui/foundations/empty-state";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { canManageUsers, canViewStaffDirectory, getRoleDefaultScope } from "@/lib/authorization/access";
import { prisma } from "@/lib/prisma";
import { fetchStaffInvitesSafe } from "@/lib/staff/fetch-staff-invites-safe";
import { formatFullDateTime } from "@/lib/format/arabic-datetime";
import { requestTimeMs } from "@/lib/time/request-ms";
import { MembershipRole, PermissionScope, StaffInviteStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { getDirection } from "@/lib/i18n";
import { localizedCatalogName } from "@/lib/i18n/localized-catalog-name";
import { redirect } from "next/navigation";
import { StaffWorkspace } from "./staff-workspace";

type StaffPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Staff list = Membership rows; pending invites = StaffInvite rows.
 *
 * 404 is reserved for truly missing routes/resources. Lacking permission is authorization state:
 * we always render this route and return UnauthorizedState instead of notFound().
 */
export const dynamic = "force-dynamic";

export default async function StaffPage({ params }: StaffPageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.staff.page");
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/dashboard/business/staff`);
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      redirect(`/${locale}/dashboard/select-business`);
    }
    throw error;
  }

  if (!canViewStaffDirectory(context.member)) {
    return (
      <PageContainer>
        <header className="mb-6" dir={getDirection(locale)}>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("unauthorizedIntro")}</p>
        </header>
        <UnauthorizedState
          locale={locale}
          title={t("unauthorizedTitle")}
          description={t("unauthorizedDescription")}
        />
      </PageContainer>
    );
  }

  const canManageStaff = canManageUsers(context.member);

  const business = await prisma.business.findFirst({
    where: { id: context.business.id, archivedAt: null },
    include: {
      branches: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } },
      memberships: {
        where: { archivedAt: null },
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  // Never bundle this with the business query in Promise.all: a missing StaffInvite table would fail the whole page (often shown as 404 in dev).
  const invites = await fetchStaffInvitesSafe(context.business.id);

  if (!business) {
    return (
      <PageContainer>
        <header className="mb-6" dir={getDirection(locale)}>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("businessLoadFailed")}</p>
        </header>
        <EmptyState title={t("dataUnavailableTitle")} description={t("dataUnavailableDescription")} />
      </PageContainer>
    );
  }

  const branchById = new Map(business.branches.map((b) => [b.id, b]));
  /** Wall-clock snapshot for invite pending/expiry (server handler — use `requestTimeMs()` not `Date.now()` in this module for lint clarity). */
  const now = requestTimeMs();
  const pendingInvitesCount = invites.filter(
    (inv) => inv.status === StaffInviteStatus.PENDING && inv.expiresAt.getTime() > now,
  ).length;
  const staffCount = business.memberships.length;

  return (
    <PageContainer>
      <header className="mb-6 border-b border-zinc-200 pb-5 dark:border-zinc-800" dir={getDirection(locale)}>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {localizedCatalogName(locale, business.nameAr, business.nameEn)}
        </p>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-zinc-500">{t("staffCount")}</dt>
            <dd className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{staffCount}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-zinc-500">{t("pendingInvites")}</dt>
            <dd className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{pendingInvitesCount}</dd>
          </div>
        </dl>
      </header>

      <StaffWorkspace
        locale={locale}
        canManageStaff={canManageStaff}
        stats={{ staffCount, pendingInvitesCount }}
        branches={business.branches.map((b) => ({ id: b.id, code: b.code, nameAr: b.nameAr }))}
        invites={invites.map((inv) => ({
          id: inv.id,
          publicInviteLabel: inv.publicInviteLabel,
          contactEmail: inv.contactEmail ?? null,
          contactPhone: inv.contactPhone ?? null,
          finalSystemLogin: inv.email ?? null,
          role: inv.role,
          scope: inv.scope ?? PermissionScope.BRANCH_ONLY,
          branchId: inv.branchId,
          branchLabel: inv.branchId
            ? inv.branch
              ? `${inv.branch.code} — ${inv.branch.nameAr}`
              : "—"
            : t("allBranches"),
          status: inv.status,
          createdAtLabel: formatFullDateTime(inv.createdAt),
          expiresAtLabel: formatFullDateTime(inv.expiresAt),
          isExpired: inv.expiresAt.getTime() < now && inv.status !== StaffInviteStatus.ACCEPTED,
          invitedByLabel: `${inv.invitedBy.fullName} (${inv.invitedBy.email})`,
        }))}
        staff={business.memberships.map((m) => {
          const branchInfo = m.branchId ? branchById.get(m.branchId) : undefined;
          const branchLabel = m.branchId
            ? branchInfo
              ? `${branchInfo.code} — ${branchInfo.nameAr}`
              : "—"
            : t("allBranches");
          const canArchive = !(m.role === MembershipRole.OWNER && m.userId === business.ownerId);
          return {
            id: m.id,
            userId: m.userId,
            fullName: m.user.fullName,
            email: m.user.email,
            role: m.role,
            scope: m.scope ?? getRoleDefaultScope(m.role),
            branchId: m.branchId,
            grantedPermissions: m.grantedPermissions,
            revokedPermissions: m.revokedPermissions,
            branchLabel,
            canArchive,
          };
        })}
      />
    </PageContainer>
  );
}
