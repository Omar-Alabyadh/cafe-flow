"use client";

import { CatalogSideDrawer } from "@/components/ui/foundations/catalog-side-drawer";
import { Building2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { archiveBranch } from "./actions";
import { CreateBranchForm, type BranchDraft, type BranchFieldValues } from "./create-branch-form";

export type BranchListItem = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  isActive: boolean;
};

function ArchiveBranchButton({ locale, branchId, branchName }: { locale: string; branchId: string; branchName: string }) {
  const t = useTranslations("dashboard.business.branches.workspace");
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={archiveBranch}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="branchId" value={branchId} />
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("confirmArchive", { name: branchName }))) formRef.current?.requestSubmit();
        }}
        className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-2 py-1 text-xs font-medium text-white"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {t("archive")}
      </button>
    </form>
  );
}

export function BranchesWorkspace({ locale, branches }: { locale: string; branches: BranchListItem[] }) {
  const t = useTranslations("dashboard.business.branches.workspace");
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BranchDraft | null>(null);
  const [draftTick, setDraftTick] = useState(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => b.code.toLowerCase().includes(q) || b.nameAr.toLowerCase().includes(q));
  }, [search, branches]);

  const initialValues: BranchFieldValues = editing
    ? { code: editing.code, nameAr: editing.nameAr, nameEn: editing.nameEn ?? "" }
    : { code: "", nameAr: "", nameEn: "" };

  const closeDrawer = () => {
    if (dirtyRef.current && !window.confirm(t("confirmCloseUnsaved"))) return;
    dirtyRef.current = false;
    setDrawerOpen(false);
    setEditing(null);
    setDraftTick((x) => x + 1);
  };

  return (
    <div className="cf-surface rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{t("listTitle")}</p>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
            setDraftTick((x) => x + 1);
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          {t("addButton")}
        </button>
      </div>

      {branches.length > 0 ? (
        <div className="mb-4 relative">
          <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 ps-10 pe-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          {search ? (
            <button type="button" onClick={() => setSearch("")} className="absolute inset-e-1 top-1/2 -translate-y-1/2 rounded-md p-1">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-14 text-center dark:border-zinc-800">
          <Building2 className="mb-3 h-8 w-8 text-zinc-500" />
          <p className="text-base font-semibold">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("emptyDescription")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.code")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.name")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.status")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setEditing({ id: b.id, code: b.code, nameAr: b.nameAr, nameEn: b.nameEn });
                    setDrawerOpen(true);
                  }}
                  className="cursor-pointer border-t border-zinc-200 hover:bg-zinc-100/90 dark:border-zinc-800 dark:hover:bg-zinc-800/65"
                >
                  <td className="px-4 py-3 font-mono text-xs">{b.code}</td>
                  <td className="px-4 py-3">{b.nameAr}</td>
                  <td className="px-4 py-3">{b.isActive ? t("status.active") : t("status.inactive")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing({ id: b.id, code: b.code, nameAr: b.nameAr, nameEn: b.nameEn });
                          setDrawerOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border-2 border-zinc-300 px-2 py-1 text-xs font-medium"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t("edit")}
                      </button>
                      <ArchiveBranchButton locale={locale} branchId={b.id} branchName={b.nameAr} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CatalogSideDrawer
        open={drawerOpen}
        title={editing ? t("drawer.editTitle") : t("drawer.createTitle")}
        onRequestClose={closeDrawer}
        footer={
          <button type="button" onClick={closeDrawer} className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm font-medium">
            {t("close")}
          </button>
        }
      >
        <CreateBranchForm
          locale={locale}
          fieldsKey={editing ? editing.id : `new-${draftTick}`}
          initialValues={initialValues}
          editingBranchId={editing?.id ?? null}
          onCancel={closeDrawer}
          onSaveSuccess={() => {
            setToast(t("savedToast"));
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

      {toast ? <div className="fixed bottom-5 left-1/2 z-60 -translate-x-1/2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{toast}</div> : null}
    </div>
  );
}
