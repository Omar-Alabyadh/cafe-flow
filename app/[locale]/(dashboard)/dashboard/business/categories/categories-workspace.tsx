"use client";

import { CatalogSideDrawer } from "@/components/ui/foundations/catalog-side-drawer";
import { Pencil, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { archiveCategory } from "./actions";
import { CategoryForm, type CategoryDraft, type CategoryFieldValues } from "./category-form";

export type CategoryListItem = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  description: string | null;
  productCount: number;
};

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function NameBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex max-w-56 truncate rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-900 dark:bg-violet-950/60 dark:text-violet-200">
      {name}
    </span>
  );
}

/** Archive uses a form submit so server action handles authorization and audit. */
function ArchiveCategoryButton({ locale, id, nameAr }: { locale: string; id: string; nameAr: string }) {
  const t = useTranslations("dashboard.business.categories.workspace");
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={archiveCategory} className="inline">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("confirmArchive"))) {
            formRef.current?.requestSubmit();
          }
        }}
        className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-700 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-500"
        aria-label={t("aria.archive", { name: nameAr })}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        {t("archive")}
      </button>
    </form>
  );
}

type CategoriesWorkspaceProps = {
  locale: string;
  categories: CategoryListItem[];
};

/**
 * Categories workspace for list, search, and create/edit drawer flow.
 */
export function CategoriesWorkspace({ locale, categories }: CategoriesWorkspaceProps) {
  const t = useTranslations("dashboard.business.categories.workspace");
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDraft | null>(null);
  const [draftTick, setDraftTick] = useState(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const dirtyRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  const bumpDraft = useCallback(() => setDraftTick((x) => x + 1), []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      if (c.code.toLowerCase().includes(q)) return true;
      if (c.nameAr.toLowerCase().includes(q)) return true;
      if (c.nameEn && c.nameEn.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [categories, debouncedSearch]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const onDirtyChange = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
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
    if (drawerOpen && dirtyRef.current && !window.confirm(t("confirmProceedUnsaved"))) {
      return;
    }
    dirtyRef.current = false;
    setEditing(null);
    bumpDraft();
    setDrawerOpen(true);
  }, [bumpDraft, drawerOpen, t]);

  const openEdit = useCallback(
    (c: CategoryListItem) => {
      if (
        drawerOpen &&
        dirtyRef.current &&
        !window.confirm(t("confirmSwitchUnsaved"))
      ) {
        return;
      }
      dirtyRef.current = false;
      setEditing({
        id: c.id,
        code: c.code,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        description: c.description,
      });
      setDrawerOpen(true);
    },
    [drawerOpen, t],
  );

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

  const defaultEmpty = useMemo((): CategoryFieldValues => {
    return {
      code: "",
      nameAr: "",
      nameEn: "",
      description: "",
    };
  }, []);

  const initialValues: CategoryFieldValues = editing
    ? {
        code: editing.code,
        nameAr: editing.nameAr,
        nameEn: editing.nameEn ?? "",
        description: editing.description ?? "",
      }
    : defaultEmpty;

  const fieldsKey = editing ? editing.id : `new-${draftTick}`;
  const drawerTitle = editing ? t("drawer.editTitle") : t("drawer.createTitle");

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

      {categories.length > 0 ? (
        <div className="mb-4">
          <label className="sr-only" htmlFor="category-search">
            {t("searchLabel")}
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 inset-s-3"
              aria-hidden
            />
            <input
              id="category-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={`w-full rounded-lg border border-zinc-300 bg-white py-2.5 ps-10 text-sm dark:border-zinc-700 dark:bg-zinc-950 ${search.trim() ? "pe-10" : "pe-3"}`}
              autoComplete="off"
            />
            {search.trim() ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-e-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label={t("clearSearch")}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        {t("archiveRule")}
      </p>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-14 text-center dark:border-zinc-800">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800"
            aria-hidden
          >
            <Tag className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
          </div>
          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{t("empty.title")}</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">{t("empty.description")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          {t("empty.noResults")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.code")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.name")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.english")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.description")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isRowActive = drawerOpen && editing?.id === c.id;
                return (
                  <tr
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openEdit(c)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openEdit(c);
                      }
                    }}
                    className={`cursor-pointer border-t border-zinc-200 transition-colors duration-150 dark:border-zinc-800 ${
                      isRowActive
                        ? "bg-emerald-50/90 hover:bg-emerald-100/90 dark:bg-emerald-950/35 dark:hover:bg-emerald-950/45"
                        : "hover:bg-zinc-100/90 dark:hover:bg-zinc-800/65"
                    }`}
                  >
                    <td className="px-4 py-3 align-middle font-mono text-xs">{c.code}</td>
                    <td className="px-4 py-3 align-middle">
                      <NameBadge name={c.nameAr} />
                    </td>
                    <td className="px-4 py-3 align-middle text-zinc-600 dark:text-zinc-400">
                      {c.nameEn ?? "—"}
                    </td>
                    <td className="max-w-48 px-4 py-3 align-middle text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="line-clamp-2">{c.description?.trim() ? c.description : "—"}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="inline-flex w-fit items-center gap-1 rounded-md border-2 border-zinc-300 bg-transparent px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
                          aria-label={t("aria.edit", { name: c.nameAr })}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          {t("edit")}
                        </button>
                        {c.productCount > 0 ? (
                          <p className="text-xs font-medium text-amber-800 dark:text-amber-200" role="alert">
                            {t("cannotArchive")}
                          </p>
                        ) : (
                          <ArchiveCategoryButton locale={locale} id={c.id} nameAr={c.nameAr} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CatalogSideDrawer
        open={drawerOpen}
        title={drawerTitle}
        onRequestClose={tryCloseDrawer}
        banner={
          editing ? (
            <p className="rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-xs font-medium text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-100">
              {t("drawer.editingBanner")}
            </p>
          ) : null
        }
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
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          {t("drawer.hint")}
        </p>
        <CategoryForm
          locale={locale}
          fieldsKey={fieldsKey}
          initialValues={initialValues}
          editingCategoryId={editing?.id ?? null}
          onCancel={tryCloseDrawer}
          onSaveSuccess={handleSaveSuccess}
          onDirtyChange={onDirtyChange}
          embedTitle
          hideInlineCancel
        />
      </CatalogSideDrawer>

      {toast ? (
        <div
          className="fixed bottom-5 left-1/2 z-60 flex max-w-[min(90vw,24rem)] -translate-x-1/2 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100"
          role="status"
          aria-live="polite"
        >
          <span aria-hidden>✔️</span>
          <span>{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
