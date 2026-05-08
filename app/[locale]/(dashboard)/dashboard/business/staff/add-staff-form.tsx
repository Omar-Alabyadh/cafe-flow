"use client";

import { getEffectivePermissions, getRoleBasePermissions, getRoleDefaultScope } from "@/lib/authorization/access";
import {
  BUSINESS_STAFF_ASSIGNABLE_ROLES,
  BUSINESS_STAFF_ROLE_LABELS_AR,
  PERMISSION_GROUPS,
  PERMISSION_TEMPLATES,
  ROLE_FORBIDDEN_PERMISSIONS,
  ROLE_HINTS_AR,
  SENSITIVE_PERMISSION_WARNINGS,
  isBusinessStaffAssignableRole,
  type PermissionKey,
  type PermissionTemplateKey,
} from "@/lib/authorization/permissions";
import { INVITE_TEMPLATE_LABELS_AR } from "@/lib/staff/invite-template-labels-ar";
import {
  PERMISSION_TEMPLATE_UI,
  classifyStaffFormMessage,
  getStaffRolePresentation,
  scopeLabelAr,
  staffRoleTitleAr,
} from "@/lib/staff/staff-presentational-ui";
import { MembershipRole, PermissionScope } from "@prisma/client";
import { useTranslations } from "next-intl";
import { getDirection } from "@/lib/i18n";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  createStaffInvite,
  resetStaffPermissions,
  saveStaffMembership,
  type CreateStaffInviteState,
  type SaveStaffState,
} from "./actions";

type BranchOption = { id: string; code: string; nameAr: string };

/** Template tiles: icon + stronger active border/tint (selection logic unchanged). */
function templateButtonClasses(key: PermissionTemplateKey, isActive: boolean): string {
  const ui = PERMISSION_TEMPLATE_UI[key];
  const base =
    "flex w-full items-start gap-2 rounded-lg border px-2 py-2 text-start text-xs font-medium transition-colors";
  if (isActive) {
    return `${base} border-2 ${ui.activeBorderClass} ${ui.activeBgClass} text-zinc-900 shadow-sm ring-1 ring-black/5 dark:text-zinc-50 dark:ring-white/10`;
  }
  return `${base} border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800`;
}

function InviteStepStrip() {
  const t = useTranslations("dashboard.business.staff.form");
  const steps = [
    t("steps.items.1"),
    t("steps.items.2"),
    t("steps.items.3"),
    t("steps.items.4"),
    t("steps.items.5"),
  ] as const;
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/90 p-3 dark:border-zinc-600 dark:bg-zinc-900/50">
      <p className="mb-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{t("steps.title")}</p>
      <ol className="flex flex-wrap gap-2">
        {steps.map((label, i) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900">
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FormFeedbackBlock({ message }: { message: string }) {
  const tier = classifyStaffFormMessage(message);
  const icon = tier === "blocking" ? "❌" : tier === "warning" ? "⚠️" : "ℹ️";
  const box =
    tier === "blocking"
      ? "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/35 dark:text-red-50"
      : tier === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-50"
        : "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/35 dark:text-sky-50";
  return (
    <div className={`flex gap-2 rounded-lg border px-3 py-2.5 text-sm ${box}`} role="alert">
      <span className="shrink-0 pt-0.5" aria-hidden>
        {icon}
      </span>
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}

type AddStaffFormProps = {
  locale: string;
  branches: BranchOption[];
  initialValues: StaffFieldValues;
  editingMembershipId: string | null;
  initialGrantedPermissions: string[];
  initialRevokedPermissions: string[];
  onCancel: () => void;
  onSaveSuccess: (message?: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onInviteCreated?: () => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
};

const initial: SaveStaffState = { error: null };
const initialInvite: CreateStaffInviteState = { error: null };

export type StaffDraft = {
  id: string;
  email: string;
  role: MembershipRole;
  scope: PermissionScope;
  branchId: string | null;
  grantedPermissions: string[];
  revokedPermissions: string[];
};

export type StaffFieldValues = {
  email: string;
  role: MembershipRole;
  scope: PermissionScope;
  branchId: string;
};

/**
 * Membership may still contain legacy OWNER / SUPER_ADMIN rows from early data.
 * The staff drawer only edits operational roles; map forbidden values to a safe default for the UI.
 */
function resolveStaffFormRoleScope(values: StaffFieldValues): { role: MembershipRole; scope: PermissionScope } {
  if (isBusinessStaffAssignableRole(values.role)) {
    return { role: values.role, scope: values.scope };
  }
  const role = MembershipRole.MANAGER;
  return { role, scope: getRoleDefaultScope(role) };
}

export function AddStaffForm({
  locale,
  branches,
  initialValues,
  editingMembershipId,
  initialGrantedPermissions,
  initialRevokedPermissions,
  onCancel,
  onSaveSuccess,
  onDirtyChange,
  onInviteCreated,
  embedTitle = false,
  hideInlineCancel = false,
}: AddStaffFormProps) {
  const t = useTranslations("dashboard.business.staff.form");
  const tCommon = useTranslations("common");
  const [state, formAction, pending] = useActionState(saveStaffMembership, initial);
  const [inviteState, inviteAction, invitePending] = useActionState(createStaffInvite, initialInvite);
  const [resetState, resetAction, resetPending] = useActionState(resetStaffPermissions, initial);
  const initialResolved = resolveStaffFormRoleScope(initialValues);
  const [role, setRole] = useState<MembershipRole>(initialResolved.role);
  const [scope, setScope] = useState<PermissionScope>(initialResolved.scope);
  const [branchId, setBranchId] = useState(initialValues.branchId);
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>(initialGrantedPermissions);
  const [revokedPermissions, setRevokedPermissions] = useState<string[]>(initialRevokedPermissions);
  const [template, setTemplate] = useState<PermissionTemplateKey>("CUSTOM");
  /** Short-lived copy/share feedback toast. */
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const baselineRef = useRef(
    editingMembershipId
      ? JSON.stringify({
          email: initialValues.email,
          role: initialResolved.role,
          scope: initialResolved.scope,
          branchId: initialValues.branchId,
          grantedPermissions: initialGrantedPermissions,
          revokedPermissions: initialRevokedPermissions,
          template: "CUSTOM",
        })
      : JSON.stringify({
          role: initialResolved.role,
          scope: initialResolved.scope,
          branchId: initialValues.branchId,
          grantedPermissions: initialGrantedPermissions,
          revokedPermissions: initialRevokedPermissions,
          template: "CUSTOM",
        }),
  );

  const basePermissions = getRoleBasePermissions(role);

  function flashFeedback(message: string) {
    setCopyFeedback(message);
    window.setTimeout(() => setCopyFeedback(null), 2800);
  }

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);
  useEffect(() => {
    if (!onDirtyChange) return;
    if (editingMembershipId) {
      onDirtyChange(
        JSON.stringify({
          email: initialValues.email,
          role,
          scope,
          branchId,
          grantedPermissions,
          revokedPermissions,
        }) !== baselineRef.current,
      );
    } else {
      onDirtyChange(JSON.stringify({ role, scope, branchId, grantedPermissions, revokedPermissions }) !== baselineRef.current);
    }
  }, [
    editingMembershipId,
    initialValues.email,
    role,
    scope,
    branchId,
    grantedPermissions,
    revokedPermissions,
    onDirtyChange,
  ]);
  useEffect(() => {
    if (!state.success || !state.completedAt || !editingMembershipId) return;
    const msg = state.successMessage ?? t("saveSuccessFallback");
    const timer = window.setTimeout(() => onSaveSuccessRef.current(msg), 0);
    return () => window.clearTimeout(timer);
  }, [state.success, state.completedAt, state.successMessage, editingMembershipId, t]);
  useEffect(() => {
    if (!resetState.success || !resetState.completedAt) return;
    const timer = window.setTimeout(() => onSaveSuccessRef.current(t("resetSuccessFallback")), 0);
    return () => window.clearTimeout(timer);
  }, [resetState.success, resetState.completedAt, t]);

  /**
   * Parent remounts this form via `key` when switching member vs new invite, so `useState` initializers
   * and `baselineRef` stay in sync without a sync effect (avoids setState-in-effect lint / cascading renders).
   */

  function togglePermission(permission: PermissionKey, nextEnabled: boolean) {
    setTemplate("CUSTOM");
    const isDefault = basePermissions.has(permission);
    if (nextEnabled) {
      setRevokedPermissions((prev) => prev.filter((p) => p !== permission));
      if (isDefault) {
        setGrantedPermissions((prev) => prev.filter((p) => p !== permission));
      } else {
        setGrantedPermissions((prev) => (prev.includes(permission) ? prev : [...prev, permission]));
      }
      return;
    }

    setGrantedPermissions((prev) => prev.filter((p) => p !== permission));
    if (isDefault) {
      setRevokedPermissions((prev) => (prev.includes(permission) ? prev : [...prev, permission]));
    } else {
      setRevokedPermissions((prev) => prev.filter((p) => p !== permission));
    }
  }

  function applyTemplate(nextTemplate: PermissionTemplateKey) {
    setTemplate(nextTemplate);
    if (nextTemplate === "CUSTOM") return;
    if (nextTemplate === "DEFAULT") {
      setGrantedPermissions([]);
      setRevokedPermissions([]);
      return;
    }
    const enabled = PERMISSION_TEMPLATES[nextTemplate];
    const granted = enabled.filter((permission) => !basePermissions.has(permission));
    const revoked = [...basePermissions].filter((permission) => !enabled.includes(permission));
    setGrantedPermissions(granted);
    setRevokedPermissions(revoked);
  }

  const branchScopeSelected = scope === PermissionScope.BRANCH_ONLY;

  /** Effective permission count for invite summary (same rules as server-side membership). */
  const summaryEffectivePermissionCount = getEffectivePermissions({
    id: "invite-form",
    userId: "invite-form",
    businessId: "invite-form",
    branchId: branchScopeSelected && branchId ? branchId : null,
    role,
    scope,
    grantedPermissions,
    revokedPermissions,
  }).size;

  const showInviteSuccess =
    !editingMembershipId && Boolean(inviteState.inviteUrl && inviteState.completedAt && !inviteState.error);

  if (showInviteSuccess && inviteState.inviteUrl) {
    const rolePres = getStaffRolePresentation(role);
    const sharePayload = {
      title: t("success.shareTitle"),
      text: inviteState.shareText ?? inviteState.inviteUrl ?? "",
      url: inviteState.inviteUrl ?? "",
    };
    return (
      <div className="w-full space-y-4 pb-6" dir={getDirection(locale)}>
        {copyFeedback ? (
          <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
            {copyFeedback}
          </p>
        ) : null}
        <div className="rounded-xl border-2 border-emerald-300 bg-linear-to-b from-emerald-50 to-white p-4 text-sm text-emerald-950 shadow-sm dark:border-emerald-700 dark:from-emerald-950/40 dark:to-zinc-950 dark:text-emerald-100">
          <p className="text-base font-bold">✅ {t("success.title")}</p>
          <p className="mt-3 text-xs font-semibold text-emerald-900 dark:text-emerald-200">{t("success.publicLabelTitle")}</p>
          <p className="mt-1 break-all rounded-md border border-amber-200/90 bg-amber-50/90 px-2 py-2 font-mono text-[11px] text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50">
            {inviteState.publicInviteLabel ?? tCommon("emDash")}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed opacity-90">
            {t("success.publicLabelHint")}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <span className="text-zinc-600 dark:text-emerald-200/80">🧑‍💼 {t("summary.role")}: </span>
              <span>
                {rolePres.emoji} {staffRoleTitleAr(role)} — {rolePres.hintAr}
              </span>
            </li>
          </ul>
          <p className="mt-3 text-xs leading-relaxed opacity-90">
            {t("success.warning")}
          </p>
          <p className="mt-3 text-xs font-semibold text-emerald-900 dark:text-emerald-200">🔗 {t("success.inviteLink")}</p>
          <p className="mt-1 break-all rounded-md border border-emerald-200/80 bg-white/90 px-2 py-2 font-mono text-[11px] dark:border-emerald-800 dark:bg-zinc-900/90">
            {inviteState.inviteUrl}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-emerald-800 px-3 py-2 text-xs font-medium text-white dark:bg-emerald-700"
              onClick={() => {
                void navigator.clipboard.writeText(inviteState.inviteUrl ?? "").then(
                  () => flashFeedback(t("success.copiedInviteUrl")),
                  () => window.prompt(t("success.copyFallback"), inviteState.inviteUrl ?? ""),
                );
              }}
            >
              {t("success.copyLink")}
            </button>
            <button
              type="button"
              className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-medium dark:border-zinc-600"
              onClick={() => {
                void navigator.clipboard.writeText(inviteState.shareText ?? inviteState.inviteUrl ?? "").then(
                  () => flashFeedback(t("success.copiedShareText")),
                  () => {},
                );
              }}
            >
              {t("success.copyShareText")}
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function" ? (
              <button
                type="button"
                className="rounded-md border border-emerald-800/40 px-3 py-2 text-xs font-medium dark:border-emerald-500/40"
                onClick={() =>
                  void navigator.share(sharePayload).then(
                    () => flashFeedback(t("success.shared")),
                    () => {},
                  )
                }
              >
                {t("success.shareNative")}
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-md border border-emerald-800/40 px-3 py-2 text-xs font-medium dark:border-emerald-500/40"
              onClick={() => {
                flashFeedback(t("success.openedWhatsapp"));
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(inviteState.shareText ?? inviteState.inviteUrl ?? "")}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              {t("success.shareWhatsapp")}
            </button>
          </div>
        </div>
        <button
          type="button"
          className="w-full rounded-md bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          onClick={() => {
            onInviteCreated?.();
            onSaveSuccess(t("success.doneCtaToast"));
          }}
        >
          {t("success.doneCta")}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <form action={editingMembershipId ? formAction : inviteAction} className="space-y-4 pb-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="membershipId" value={editingMembershipId ?? ""} />
      <input type="hidden" name="permissionTemplate" value={template} />
      {grantedPermissions.map((permission) => (
        <input key={`grant-${permission}`} type="hidden" name="grantedPermissions" value={permission} />
      ))}
      {revokedPermissions.map((permission) => (
        <input key={`revoke-${permission}`} type="hidden" name="revokedPermissions" value={permission} />
      ))}
      {embedTitle ? null : <h3 className="text-base font-semibold">{editingMembershipId ? t("editTitle") : t("createTitle")}</h3>}
      {editingMembershipId ? (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t("editDescription")}
        </p>
      ) : (
        <>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t("createInfoTitle")}</p>
            <p className="mt-1">
              {t("createInfoDescription")}
            </p>
          </div>
          <InviteStepStrip />
        </>
      )}

      {editingMembershipId ? (
        <div className="space-y-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("loginReadOnly")}</p>
          <p className="font-mono text-xs text-zinc-900 dark:text-zinc-100">{initialValues.email}</p>
        </div>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="staff-role" className="text-sm font-medium">
          {t("fields.role")}
        </label>
        <select
          id="staff-role"
          name="role"
          value={role}
          onChange={(e) => {
            const nextRole = e.target.value as StaffFieldValues["role"];
            setRole(nextRole);
            // Keep scope aligned with selected role defaults without effect-based setState.
            setScope(getRoleDefaultScope(nextRole));
          }}
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {BUSINESS_STAFF_ASSIGNABLE_ROLES.map((value) => (
            <option key={value} value={value}>
              {BUSINESS_STAFF_ROLE_LABELS_AR[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="staff-role-hint" className="text-sm font-medium">
          {t("fields.roleHint")}
        </label>
        <p id="staff-role-hint" className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          {ROLE_HINTS_AR[role]}
        </p>
      </div>
      <div className="space-y-1">
        <label htmlFor="staff-scope" className="text-sm font-medium">
          {t("fields.scope")}
        </label>
        <select
          id="staff-scope"
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as PermissionScope)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="ALL_BRANCHES">{t("scope.allBranches")}</option>
          <option value="BRANCH_ONLY">{t("scope.branchOnly")}</option>
          <option value="OWN_ONLY">{t("scope.ownOnly")}</option>
          <option value="NONE">{t("scope.none")}</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="staff-branch" className="text-sm font-medium">
          {t("fields.branch")}
        </label>
        <select
          id="staff-branch"
          name="branchId"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          disabled={!branchScopeSelected}
          required={branchScopeSelected}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">{branchScopeSelected ? t("branch.selectRequired") : t("branch.notRequired")}</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.code} — {b.nameAr}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500">
          {branchScopeSelected
            ? t("branch.hintRequired")
            : t("branch.hintNotRequired")}
        </p>
      </div>
      <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="text-sm font-semibold">{t("templates.title")}</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              "DEFAULT",
              "POS_ONLY",
              "INVENTORY_ONLY",
              "READ_ONLY",
              "CUSTOM",
            ] as const satisfies readonly PermissionTemplateKey[]
          ).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyTemplate(key)}
              className={templateButtonClasses(key, template === key)}
            >
              <span className="pt-0.5" aria-hidden>
                {PERMISSION_TEMPLATE_UI[key].icon}
              </span>
              <span>{INVITE_TEMPLATE_LABELS_AR[key]}</span>
            </button>
          ))}
        </div>
        <p className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          <span className="rounded-md bg-zinc-200 px-2 py-0.5 dark:bg-zinc-700">{t("templates.current")}</span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>{PERMISSION_TEMPLATE_UI[template].icon}</span>
            {INVITE_TEMPLATE_LABELS_AR[template]}
          </span>
        </p>
      </div>
      <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="text-sm font-semibold">{t("permissions.title")}</p>
        <p className="text-xs text-zinc-500">
          {t("permissions.description")}
        </p>
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.key} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
            <p className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">{group.labelAr}</p>
            <div className="grid gap-2">
              {group.permissions.map((permission) => {
                const isDefault = basePermissions.has(permission);
                const isGranted = grantedPermissions.includes(permission);
                const isRevoked = revokedPermissions.includes(permission);
                const isForbiddenForRole = (ROLE_FORBIDDEN_PERMISSIONS[role] ?? []).includes(permission);
                const checked = isRevoked ? false : isDefault || isGranted;
                const statusLabel = isGranted
                  ? `➕ ${t("permissions.status.added")}`
                  : isRevoked
                    ? `➖ ${t("permissions.status.removed")}`
                    : `✅ ${t("permissions.status.default")}`;
                return (
                  <div key={permission} className="rounded border border-zinc-100 px-2 py-1.5 text-xs dark:border-zinc-800">
                    <label className="flex items-center justify-between gap-2">
                      <span className="font-mono">{permission}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500">{statusLabel}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => togglePermission(permission, event.target.checked)}
                          disabled={isForbiddenForRole}
                          className="h-4 w-4"
                        />
                      </span>
                    </label>
                    {isForbiddenForRole ? (
                      <p className="mt-1 text-[11px] text-red-700 dark:text-red-300">
                        {t("permissions.forbiddenForRole")}
                      </p>
                    ) : null}
                    {SENSITIVE_PERMISSION_WARNINGS[permission] ? (
                      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                        {SENSITIVE_PERMISSION_WARNINGS[permission]}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!editingMembershipId ? (
        <div className="space-y-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{t("contact.title")}</p>
          <div className="space-y-1">
            <label htmlFor="staff-contact-email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("contact.emailLabel")}
            </label>
            <input
              id="staff-contact-email"
              name="contactEmail"
              type="email"
              autoComplete="off"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder={t("contact.emailPlaceholder")}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="staff-contact-phone" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("contact.phoneLabel")}
            </label>
            <input
              id="staff-contact-phone"
              name="contactPhone"
              type="tel"
              maxLength={40}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder={t("contact.phonePlaceholder")}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="staff-invite-note" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t("contact.noteLabel")}
            </label>
            <textarea
              id="staff-invite-note"
              name="note"
              rows={2}
              maxLength={2000}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder={t("contact.notePlaceholder")}
            />
          </div>
        </div>
      ) : null}

      {inviteState.error || state.error || resetState.error ? (
        <FormFeedbackBlock message={(inviteState.error ?? state.error ?? resetState.error) as string} />
      ) : null}

      {!editingMembershipId ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="mb-2 font-semibold text-zinc-800 dark:text-zinc-100">📌 {t("summary.title")}</p>
          <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
            <li>
              <span className="text-zinc-500">{t("summary.role")}: </span>
              {staffRoleTitleAr(role)} ({getStaffRolePresentation(role).hintAr})
            </li>
            <li>
              <span className="text-zinc-500">{t("summary.scope")}: </span>
              {scopeLabelAr(scope)}
            </li>
            <li>
              <span className="text-zinc-500">{t("summary.branch")}: </span>
              {branchScopeSelected
                ? branches.find((b) => b.id === branchId)?.code ?? (branchId ? "…" : t("summary.noBranchSelected"))
                : t("summary.notApplicable")}
            </li>
            <li>
              <span className="text-zinc-500">{t("summary.template")}: </span>
              <span className="inline-flex items-center gap-1">
                <span aria-hidden>{PERMISSION_TEMPLATE_UI[template].icon}</span>
                {INVITE_TEMPLATE_LABELS_AR[template]}
              </span>
            </li>
            <li>
              <span className="text-zinc-500">{t("summary.effectivePermissions")}: </span>
              <span className="font-semibold tabular-nums">{summaryEffectivePermissionCount}</span>
            </li>
            <li>
              <span className="text-zinc-500">{t("summary.inviteStatus")}: </span>
              {t("summary.inviteStatusValue")}
            </li>
          </ul>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending || resetPending || invitePending}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {editingMembershipId
          ? pending
            ? t("buttons.saving")
            : t("buttons.save")
          : invitePending
            ? t("buttons.inviting")
            : t("buttons.invite")}
      </button>
      </form>
      {editingMembershipId ? (
        <form action={resetAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="membershipId" value={editingMembershipId} />
          <button
            type="submit"
            onClick={(event) => {
              if (window.confirm(t("reset.confirm"))) return;
              event.preventDefault();
            }}
            className="w-full rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          >
            {resetPending ? t("reset.pending") : t("reset.submit")}
          </button>
        </form>
      ) : null}
      {!hideInlineCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600"
        >
          {t("buttons.cancel")}
        </button>
      ) : null}
    </div>
  );
}
