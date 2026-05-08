import { LogoutButton } from "@/components/auth/logout-button";
import { getEffectivePermissions } from "@/lib/authorization/access";
import { isPermissionTemplateKey } from "@/lib/authorization/permissions";
import { getCurrentUserId } from "@/lib/auth/session";
import { hashStaffInviteToken } from "@/lib/staff/invite-token";
import { INVITE_TEMPLATE_LABELS_AR } from "@/lib/staff/invite-template-labels-ar";
import { membershipRoleLoginSlug } from "@/lib/staff/membership-role-login-slug";
import { prisma } from "@/lib/prisma";
import { PermissionScope, StaffInviteStatus } from "@prisma/client";
import { InviteRegistrationSection } from "./invite-register-form";
import { staffRoleTitleAr } from "@/lib/staff/staff-presentational-ui";
import { getTranslations } from "next-intl/server";

type InvitePageProps = {
  params: Promise<{ locale: string; token: string }>;
};

export const dynamic = "force-dynamic";

/**
 * Secure staff onboarding only: no marketing chrome (this route lives outside `(public)` layout).
 * Token → single `StaffInvite` row; acceptance binds `Membership` to that row’s `businessId` only.
 */
export default async function StaffInvitePage({ params }: InvitePageProps) {
  const { locale, token } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = await getTranslations("invite.page");
  const trimmed = token?.trim() ?? "";
  if (!trimmed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16" dir={dir}>
        <h1 className="text-lg font-semibold">{t("invalid.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("invalid.description")}
        </p>
      </div>
    );
  }

  const tokenHash = hashStaffInviteToken(trimmed);
  const invite = await prisma.staffInvite.findUnique({
    where: { tokenHash },
    include: {
      business: { select: { nameAr: true, archivedAt: true } },
      branch: { select: { code: true, nameAr: true } },
    },
  });

  if (!invite || invite.business.archivedAt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16" dir={dir}>
        <h1 className="text-lg font-semibold">{t("notFound.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("notFound.description")}
        </p>
      </div>
    );
  }

  const now = new Date();
  const expired = invite.expiresAt < now;
  /**
   * Do not treat ACCEPTED as blocked at the page shell: after registration the invite row is ACCEPTED, and a
   * server re-render would hide the client form and its success UI. The client section decides between success,
   * registration form, and "already used" using `inviteAccepted` plus pinned client state.
   */
  const blocked =
    invite.status === StaffInviteStatus.CANCELLED ||
    invite.status === StaffInviteStatus.EXPIRED ||
    expired;
  const inviteAccepted = invite.status === StaffInviteStatus.ACCEPTED;

  if (expired && invite.status === StaffInviteStatus.PENDING) {
    await prisma.staffInvite.update({
      where: { id: invite.id },
      data: { status: StaffInviteStatus.EXPIRED },
    });
  }

  const templateKey =
    invite.templateKey && isPermissionTemplateKey(invite.templateKey) ? invite.templateKey : "CUSTOM";
  const templateLabel = INVITE_TEMPLATE_LABELS_AR[templateKey];

  const effectivePermissionCount = getEffectivePermissions({
    id: "invite-preview",
    userId: "invite-preview",
    businessId: invite.businessId,
    branchId: invite.branchId,
    role: invite.role,
    scope: invite.scope,
    grantedPermissions: invite.grantedPermissions ?? [],
    revokedPermissions: invite.revokedPermissions ?? [],
  }).size;

  const userId = await getCurrentUserId();
  const loggedIn = Boolean(userId);

  const branchLine = invite.branch
    ? `${invite.branch.code} — ${invite.branch.nameAr}`
    : invite.scope === PermissionScope.ALL_BRANCHES
      ? t("fields.allBranches")
      : "—";

  const roleSlug = membershipRoleLoginSlug(invite.role);

  return (
    <div className="mx-auto max-w-lg px-4 py-12" dir={dir}>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>

      <div className="mt-5 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <p>
          <span className="text-zinc-500">{t("fields.businessLabel")} </span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{invite.business.nameAr}</span>
        </p>
        <p>
          <span className="text-zinc-500">{t("fields.roleLabel")} </span>
          {staffRoleTitleAr(invite.role)}
        </p>
        <p>
          <span className="text-zinc-500">{t("fields.branchLabel")} </span>
          {branchLine}
        </p>
        <p>
          <span className="text-zinc-500">{t("fields.templateLabel")} </span>
          {t("fields.templateValue", { template: templateLabel, count: effectivePermissionCount })}
        </p>
      </div>

      <p className="mt-5 rounded-lg border border-sky-200 bg-sky-50/90 px-3 py-3 text-xs leading-relaxed text-sky-950 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100">
        {t("loginHint.prefix")} <span className="font-semibold">{t("loginHint.systemLoginTitle")}</span> —{" "}
        <span className="font-semibold">{t("loginHint.roleBased")}</span>. {t("loginHint.pattern")}{" "}
        <code className="rounded bg-white/90 px-1.5 py-0.5 font-mono text-[11px] dark:bg-zinc-900/90">
          staff.{roleSlug}
        </code>
        <span className="text-sky-900/85 dark:text-sky-100/85">
          {" "}{t("loginHint.suffix")}
        </span>
      </p>

      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {t("immutabilityNote")}
      </p>

      {blocked ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          {invite.status === StaffInviteStatus.CANCELLED
            ? t("blocked.cancelled")
            : t("blocked.expired")}
        </div>
      ) : loggedIn ? (
        <div className="mt-8 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-100">
          <p className="font-medium">{t("signedIn.title")}</p>
          <p>{t("signedIn.description")}</p>
          <LogoutButton locale={locale} />
        </div>
      ) : (
        <div className="mt-8">
          <InviteRegistrationSection locale={locale} token={trimmed} inviteAccepted={inviteAccepted} />
        </div>
      )}
    </div>
  );
}
