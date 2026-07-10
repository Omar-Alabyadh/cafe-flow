"use client";

import { CatalogSideDrawer } from "@/components/ui/foundations/catalog-side-drawer";
import { MoneyValue } from "@/components/ui/foundations/money-value";
import { Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { archiveAddon } from "./actions";
import { AddonForm, type AddonDraft, type AddonFieldValues } from "./addon-form";

export type AddonListItem = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  extraPrice: string;
};

type AddonsWorkspaceProps = {
  locale: string;
  addons: AddonListItem[];
};

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function ArchiveAddonButton({ locale, id }: { locale: string; id: string }) {
  const t = useTranslations("dashboard.business.addons.workspace");
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={archiveAddon} className="inline">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("confirmArchive"))) {
            formRef.current?.requestSubmit();
          }
        }}
        className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        {t("archive")}
      </button>
    </form>
  );
}

export function AddonsWorkspace({ locale, addons }: AddonsWorkspaceProps) {
  const t = useTranslations("dashboard.business.addons.workspace");
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AddonDraft | null>(null);
  const [draftTick, setDraftTick] = useState(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return addons;
    return addons.filter((a) => {
      if (a.code.toLowerCase().includes(q)) return true;
      if (a.nameAr.toLowerCase().includes(q)) return true;
      if (a.nameEn && a.nameEn.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [addons, debouncedSearch]);

  const bumpDraft = useCallback(() => setDraftTick((x) => x + 1), []);
  const onDirtyChange = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const tryCloseDrawer = useCallback(() => {
    if (dirtyRef.current && !window.confirm(t("confirmCloseUnsaved"))) {
      return;
    }
    dirtyRef.current = false;
    setDrawerOpen(false);
    setEditing(null);
    bumpDraft();
  }, [bumpDraft, t]);

  const openCreate = useCallback(() => {
    dirtyRef.current = false;
    setEditing(null);
    bumpDraft();
    setDrawerOpen(true);
  }, [bumpDraft]);

  const openEdit = useCallback((row: AddonListItem) => {
    dirtyRef.current = false;
    setEditing({
      id: row.id,
      code: row.code,
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      extraPrice: row.extraPrice,
    });
    setDrawerOpen(true);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(t("savedToast"));
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3200);
    dirtyRef.current = false;
    setDrawerOpen(false);
    setEditing(null);
    bumpDraft();
    router.refresh();
  }, [bumpDraft, router, t]);

  const initialValues: AddonFieldValues = editing
    ? {
        code: editing.code,
        nameAr: editing.nameAr,
        nameEn: editing.nameEn ?? "",
        extraPrice: editing.extraPrice,
      }
    : {
        code: "",
        nameAr: "",
        nameEn: "",
        extraPrice: "",
      };

  return (
    <div className="cf-surface rounded-xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">{t("listTitle")}</p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("addButton")}
        </button>
      </div>

      {addons.length > 0 ? (
        <div className="mb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={`w-full rounded-lg border border-zinc-300 bg-white py-2.5 ps-10 text-sm dark:border-zinc-700 dark:bg-zinc-950 ${search.trim() ? "pe-10" : "pe-3"}`}
            />
            {search.trim() ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-e-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {addons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-14 text-center dark:border-zinc-800">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Sparkles className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
          </div>
          <p className="text-base font-semibold">{t("empty.title")}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("empty.description")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          {t("empty.noResults")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.code")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.name")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.extraPrice")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEdit(row)}
                  className="cursor-pointer border-t border-zinc-200 hover:bg-zinc-100/90 dark:border-zinc-800 dark:hover:bg-zinc-800/65"
                >
                  <td className="px-4 py-3 font-mono text-xs">{row.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.nameAr}</div>
                    {row.nameEn ? <div className="text-xs text-zinc-500">{row.nameEn}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <MoneyValue amount={row.extraPrice} size="sm" className="inline-flex justify-end" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1 rounded-md border-2 border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800/80"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t("edit")}
                      </button>
                      <ArchiveAddonButton locale={locale} id={row.id} />
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
        onRequestClose={tryCloseDrawer}
        footer={
          <button
            type="button"
            onClick={tryCloseDrawer}
            className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800/80"
          >
            {t("cancel")}
          </button>
        }
      >
        <AddonForm
          locale={locale}
          fieldsKey={editing ? editing.id : `new-${draftTick}`}
          initialValues={initialValues}
          editingAddonId={editing?.id ?? null}
          onCancel={tryCloseDrawer}
          onSaveSuccess={handleSaveSuccess}
          onDirtyChange={onDirtyChange}
          embedTitle
          hideInlineCancel
        />
      </CatalogSideDrawer>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-60 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100">
          <span aria-hidden>✔️</span>
          <span>{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
