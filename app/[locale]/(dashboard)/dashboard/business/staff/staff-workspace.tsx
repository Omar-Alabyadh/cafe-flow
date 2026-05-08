"use client";

import { CatalogSideDrawer } from "@/components/ui/foundations/catalog-side-drawer";
import {
  getInviteStatusPresentation,
  getMemberRowStatusPresentation,
  getStaffRolePresentation,
  scopeLabelAr,
  staffRoleTitleAr,
} from "@/lib/staff/staff-presentational-ui";
import { MembershipRole, PermissionScope, StaffInviteStatus } from "@prisma/client";
import { Filter, Search, Trash2, UserRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getDirection } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { archiveStaffMembership } from "./actions";
import { AddStaffForm, type StaffDraft, type StaffFieldValues } from "./add-staff-form";
import { StaffInviteActionsUi } from "./staff-invite-actions-ui";

export type StaffListItem = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: MembershipRole;
  scope: PermissionScope;
  branchId: string | null;
  grantedPermissions: string[];
  revokedPermissions: string[];
  branchLabel: string;
  canArchive: boolean;
};

type BranchOption = { id: string; code: string; nameAr: string };

export type StaffInviteListItem = {
  id: string;
  /** Temporary owner-facing label until the invite is accepted. */
  publicInviteLabel: string;
  contactEmail: string | null;
  contactPhone: string | null;
  /** After acceptance: final system login identifier stored for audit. */
  finalSystemLogin: string | null;
  role: MembershipRole;
  scope: PermissionScope;
  branchId: string | null;
  branchLabel: string;
  status: StaffInviteStatus;
  /** Pre-formatted on the server so Client UI does not call `toLocaleString` (Node vs browser mismatch). */
  createdAtLabel: string;
  expiresAtLabel: string;
  isExpired: boolean;
  invitedByLabel: string;
};

function inviteStatusChipClass(tone: "pending" | "success" | "danger" | "muted"): string {
  const base = "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium";
  switch (tone) {
    case "pending":
      return `${base} border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/35 dark:text-amber-100`;
    case "success":
      return `${base} border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-100`;
    case "danger":
      return `${base} border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/35 dark:text-red-100`;
    default:
      return `${base} border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100`;
  }
}

function memberStatusChipClass(): string {
  return inviteStatusChipClass("success");
}

function RoleBadgeCell({ role }: { role: MembershipRole }) {
  const pres = getStaffRolePresentation(role);
  const title = staffRoleTitleAr(role);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50">
        <span aria-hidden>{pres.emoji}</span>
        <span>{title}</span>
      </span>
      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{pres.hintAr}</span>
    </div>
  );
}

function ArchiveMembershipButton({
  locale,
  membershipId,
  label,
}: {
  locale: string;
  membershipId: string;
  label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={archiveStaffMembership}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="membershipId" value={membershipId} />
      <button
        type="button"
        onClick={() => formRef.current?.requestSubmit()}
        className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-2 py-1 text-xs font-medium text-white"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>
    </form>
  );
}

export function StaffWorkspace({
  locale,
  staff,
  branches,
  invites,
  canManageStaff,
  stats,
}: {
  locale: string;
  staff: StaffListItem[];
  branches: BranchOption[];
  invites: StaffInviteListItem[];
  canManageStaff: boolean;
  stats: { staffCount: number; pendingInvitesCount: number };
}) {
  const t = useTranslations("dashboard.business.staff.workspace");
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StaffDraft | null>(null);
  const [draftTick, setDraftTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const [staffSearch, setStaffSearch] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState<MembershipRole | "">("");
  const [staffBranchFilter, setStaffBranchFilter] = useState<string>("");
  const [staffStatusFilter, setStaffStatusFilter] = useState<"all" | "active">("all");

  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteRoleFilter, setInviteRoleFilter] = useState<MembershipRole | "">("");
  const [inviteBranchFilter, setInviteBranchFilter] = useState<string>("");
  const [inviteStatusFilter, setInviteStatusFilter] = useState<StaffInviteStatus | "">("");

  const staffRolesInData = useMemo(() => {
    const s = new Set<MembershipRole>();
    staff.forEach((m) => s.add(m.role));
    return [...s].sort();
  }, [staff]);

  const inviteRolesInData = useMemo(() => {
    const s = new Set<MembershipRole>();
    invites.forEach((i) => s.add(i.role));
    return [...s].sort();
  }, [invites]);

  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    return staff.filter((m) => {
      if (q && !m.email.toLowerCase().includes(q) && !m.fullName.toLowerCase().includes(q)) {
        return false;
      }
      if (staffRoleFilter && m.role !== staffRoleFilter) return false;
      if (staffBranchFilter && (m.branchId ?? "") !== staffBranchFilter) return false;
      if (staffStatusFilter === "active") {
        /* Hook kept for future staff status expansion. */
      }
      return true;
    });
  }, [staff, staffSearch, staffRoleFilter, staffBranchFilter, staffStatusFilter]);

  const filteredInvites = useMemo(() => {
    const q = inviteSearch.trim().toLowerCase();
    return invites.filter((inv) => {
      if (q) {
        const hay = [
          inv.publicInviteLabel,
          inv.contactEmail ?? "",
          inv.contactPhone ?? "",
          inv.finalSystemLogin ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (inviteRoleFilter && inv.role !== inviteRoleFilter) return false;
      if (inviteStatusFilter && inv.status !== inviteStatusFilter) return false;
      if (inviteBranchFilter === "__none__") {
        if (inv.branchId != null) return false;
      } else if (inviteBranchFilter && inv.branchId !== inviteBranchFilter) {
        return false;
      }
      return true;
    });
  }, [invites, inviteSearch, inviteRoleFilter, inviteBranchFilter, inviteStatusFilter]);

  const initialValues: StaffFieldValues = editing
    ? { email: editing.email, role: editing.role, scope: editing.scope, branchId: editing.branchId ?? "" }
    : { email: "", role: "CASHIER", scope: "BRANCH_ONLY", branchId: "" };

  const closeDrawer = () => {
    if (dirtyRef.current && !window.confirm(t("confirmDiscardChanges"))) return;
    dirtyRef.current = false;
    setDrawerOpen(false);
    setEditing(null);
    setDraftTick((x) => x + 1);
  };

  const memberStatus = getMemberRowStatusPresentation();

  return (
    <div className="space-y-8" dir={getDirection(locale)}>
      <section className="cf-surface rounded-xl p-4" aria-labelledby="staff-members-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="staff-members-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {t("members.title")}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">{t("members.subtitle", { count: stats.staffCount })}</p>
          </div>
          {canManageStaff ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setDrawerOpen(true);
                setDraftTick((x) => x + 1);
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              + {t("members.addButton")}
            </button>
          ) : null}
        </div>

        {staff.length > 0 ? (
          <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <Filter className="h-3.5 w-3.5" />
              {t("filters.title")}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2">
                <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder={t("filters.searchStaffPlaceholder")}
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 ps-10 pe-3 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                />
                {staffSearch ? (
                  <button
                    type="button"
                    onClick={() => setStaffSearch("")}
                    className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500"
                    aria-label={t("filters.clearSearchAria")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter((e.target.value || "") as MembershipRole | "")}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                aria-label={t("filters.staffRoleAria")}
              >
                <option value="">{t("filters.allRoles")}</option>
                {staffRolesInData.map((r) => (
                  <option key={r} value={r}>
                    {staffRoleTitleAr(r)}
                  </option>
                ))}
              </select>
              <select
                value={staffBranchFilter}
                onChange={(e) => setStaffBranchFilter(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                aria-label={t("filters.staffBranchAria")}
              >
                <option value="">{t("filters.allBranches")}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.nameAr}
                  </option>
                ))}
              </select>
              <select
                value={staffStatusFilter}
                onChange={(e) => setStaffStatusFilter(e.target.value as "all" | "active")}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                aria-label={t("filters.staffStatusAria")}
              >
                <option value="all">{t("filters.allStatuses")}</option>
                <option value="active">{t("filters.activeStatus")}</option>
              </select>
            </div>
          </div>
        ) : null}

        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-14 text-center dark:border-zinc-800">
            <UserRound className="mb-3 h-8 w-8 text-zinc-500" />
            <p className="text-base font-semibold">{t("members.emptyTitle")}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("members.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[760px] text-sm md:min-w-[920px]">
              <thead className="bg-muted text-foreground">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold">{t("members.table.name")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("members.table.login")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("members.table.role")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("members.table.status")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("members.table.scope")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("members.table.branch")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("members.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((m) => (
                  <tr
                    key={m.id}
                    role={canManageStaff && m.canArchive ? "button" : undefined}
                    tabIndex={canManageStaff && m.canArchive ? 0 : undefined}
                    onClick={() => {
                      if (!canManageStaff || !m.canArchive) return;
                      setEditing({
                        id: m.id,
                        email: m.email,
                        role: m.role,
                        scope: m.scope,
                        branchId: m.branchId,
                        grantedPermissions: m.grantedPermissions,
                        revokedPermissions: m.revokedPermissions,
                      });
                      setDrawerOpen(true);
                    }}
                    className={`border-t border-zinc-200 dark:border-zinc-800 ${
                      canManageStaff && m.canArchive
                        ? "cursor-pointer hover:bg-zinc-100/90 dark:hover:bg-zinc-800/65"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">{m.fullName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadgeCell role={m.role} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={memberStatusChipClass()}>
                        <span aria-hidden>{memberStatus.emoji}</span>
                        {memberStatus.labelAr}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{scopeLabelAr(m.scope)}</td>
                    <td className="px-4 py-3">{m.branchLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {m.canArchive && canManageStaff ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing({
                                  id: m.id,
                                  email: m.email,
                                  role: m.role,
                                  scope: m.scope,
                                  branchId: m.branchId,
                                  grantedPermissions: m.grantedPermissions,
                                  revokedPermissions: m.revokedPermissions,
                                });
                                setDrawerOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-md border-2 border-zinc-300 px-2 py-1 text-xs font-medium dark:border-zinc-600"
                            >
                              {t("members.editButton")}
                            </button>
                            <ArchiveMembershipButton locale={locale} membershipId={m.id} label={t("members.archiveButton")} />
                          </>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStaff.length === 0 ? (
              <p className="border-t border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
                {t("members.noFilterResults")}
              </p>
            ) : null}
          </div>
        )}
      </section>

      {canManageStaff || invites.length > 0 ? (
        <section className="cf-surface rounded-xl p-4" aria-labelledby="staff-invites-heading">
          <h2 id="staff-invites-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {t("invites.title")}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {t("invites.subtitle")}{" "}
            <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">{stats.pendingInvitesCount}</span>
          </p>

          {invites.length > 0 ? (
            <>
              <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  <Filter className="h-3.5 w-3.5" />
                  {t("invites.filtersTitle")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative sm:col-span-2">
                    <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="search"
                      value={inviteSearch}
                      onChange={(e) => setInviteSearch(e.target.value)}
                      placeholder={t("filters.searchInvitesPlaceholder")}
                      className="w-full rounded-lg border border-zinc-300 bg-white py-2 ps-10 pe-3 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                    />
                    {inviteSearch ? (
                      <button
                        type="button"
                        onClick={() => setInviteSearch("")}
                        className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500"
                        aria-label={t("filters.clearSearchAria")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <select
                    value={inviteRoleFilter}
                    onChange={(e) => setInviteRoleFilter((e.target.value || "") as MembershipRole | "")}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                    aria-label={t("filters.inviteRoleAria")}
                  >
                    <option value="">{t("filters.allRoles")}</option>
                    {inviteRolesInData.map((r) => (
                      <option key={r} value={r}>
                        {staffRoleTitleAr(r)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={inviteStatusFilter}
                    onChange={(e) => setInviteStatusFilter((e.target.value || "") as StaffInviteStatus | "")}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                    aria-label={t("filters.inviteStatusAria")}
                  >
                    <option value="">{t("filters.allInviteStatuses")}</option>
                    <option value={StaffInviteStatus.PENDING}>{t("invites.status.pending")}</option>
                    <option value={StaffInviteStatus.ACCEPTED}>{t("invites.status.accepted")}</option>
                    <option value={StaffInviteStatus.CANCELLED}>{t("invites.status.cancelled")}</option>
                    <option value={StaffInviteStatus.EXPIRED}>{t("invites.status.expired")}</option>
                  </select>
                  <select
                    value={inviteBranchFilter}
                    onChange={(e) => setInviteBranchFilter(e.target.value)}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:col-span-2 lg:col-span-1 dark:border-zinc-600 dark:bg-zinc-950"
                    aria-label={t("filters.inviteBranchAria")}
                  >
                    <option value="">{t("filters.allOrNoBranch")}</option>
                    <option value="__none__">{t("filters.noBranchOnly")}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} — {b.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full min-w-[820px] text-sm md:min-w-[960px]">
                  <thead className="bg-muted text-foreground">
                    <tr>
                      <th className="px-3 py-2 text-start font-semibold">{t("invites.table.publicLabel")}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t("invites.table.role")}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t("invites.table.scope")}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t("invites.table.branch")}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t("invites.table.status")}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t("invites.table.expiresAt")}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t("invites.table.invitedBy")}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t("invites.table.createdAt")}</th>
                      {canManageStaff ? <th className="px-3 py-2 text-start font-semibold">{t("invites.table.actions")}</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvites.map((inv) => {
                        const st = getInviteStatusPresentation(inv);
                        return (
                          <tr key={inv.id} className="border-t border-zinc-200 dark:border-zinc-800">
                            <td className="px-3 py-2 text-xs">
                              <div className="font-mono">{inv.publicInviteLabel}</div>
                              {inv.status === StaffInviteStatus.ACCEPTED && inv.finalSystemLogin ? (
                                <div className="mt-1 text-[11px] text-zinc-500">
                                  {t("invites.finalLoginLabel")}:{" "}
                                  <span className="font-mono text-zinc-800 dark:text-zinc-200">{inv.finalSystemLogin}</span>
                                </div>
                              ) : null}
                              {inv.contactEmail || inv.contactPhone ? (
                                <div className="mt-1 text-[11px] text-zinc-500">
                                  {t("invites.contactLabel")}: {[inv.contactEmail, inv.contactPhone].filter(Boolean).join(" · ")}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-3 py-2">
                              <RoleBadgeCell role={inv.role} />
                            </td>
                            <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{scopeLabelAr(inv.scope)}</td>
                            <td className="px-3 py-2">{inv.branchLabel}</td>
                            <td className="px-3 py-2">
                              <span className={inviteStatusChipClass(st.tone)}>
                                <span aria-hidden>{st.emoji}</span>
                                {st.labelAr}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-zinc-600">{inv.expiresAtLabel}</td>
                            <td className="px-3 py-2 text-xs text-zinc-600">{inv.invitedByLabel}</td>
                            <td className="px-3 py-2 text-xs text-zinc-600">{inv.createdAtLabel}</td>
                            {canManageStaff ? (
                              <td className="px-3 py-2">
                                <StaffInviteActionsUi
                                  locale={locale}
                                  inviteId={inv.id}
                                  status={inv.status}
                                  isExpired={inv.isExpired}
                                />
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {filteredInvites.length === 0 ? (
                  <p className="border-t border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
                    {t("invites.noFilterResults")}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {t("invites.emptyDescription")}
            </p>
          )}
        </section>
      ) : null}

      <CatalogSideDrawer
        open={drawerOpen}
        title={editing ? t("drawer.editTitle") : t("drawer.createTitle")}
        onRequestClose={closeDrawer}
        footer={
          <button
            type="button"
            onClick={closeDrawer}
            className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm font-medium dark:border-zinc-600"
          >
            {t("drawer.close")}
          </button>
        }
      >
        <AddStaffForm
          key={editing ? editing.id : `new-${draftTick}`}
          locale={locale}
          branches={branches}
          initialValues={initialValues}
          editingMembershipId={editing?.id ?? null}
          initialGrantedPermissions={editing?.grantedPermissions ?? []}
          initialRevokedPermissions={editing?.revokedPermissions ?? []}
          onCancel={closeDrawer}
          onInviteCreated={() => {
            router.refresh();
          }}
          onSaveSuccess={(message) => {
            setToast(message ?? t("toast.default"));
            setDrawerOpen(false);
            setEditing(null);
            router.refresh();
          }}
          onDirtyChange={(dirty) => {
            dirtyRef.current = dirty;
          }}
          embedTitle
          hideInlineCancel
        />
      </CatalogSideDrawer>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-60 -translate-x-1/2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
