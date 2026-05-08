"use client";

import { CatalogSideDrawer } from "@/components/ui/foundations/catalog-side-drawer";
import { formatArabicLatnQuantity } from "@/lib/format/numbers";
import { CheckCircle2, ClipboardList, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addRecipeItem,
  createRecipeForProduct,
  removeRecipeItem,
  type RecipeActionState,
  updateRecipeItemQuantity,
} from "./actions";

type ProductRecipeItem = {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  unitName: string;
  quantity: string;
};

export type RecipeProductRow = {
  id: string;
  code: string;
  nameAr: string;
  recipeId: string | null;
  recipeItems: ProductRecipeItem[];
};

export type RecipeMaterialOption = {
  id: string;
  nameAr: string;
  unitName: string;
};

const initialActionState: RecipeActionState = { error: null };

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function RecipeStatusBadge({ itemsCount }: { itemsCount: number }) {
  const t = useTranslations("dashboard.business.recipes.workspace");
  if (itemsCount > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        {t("status.ready", { count: itemsCount })}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      <XCircle className="h-3.5 w-3.5" aria-hidden />
      {t("status.missing")}
    </span>
  );
}

function AddRecipeItemForm({
  locale,
  recipeId,
  availableMaterials,
  onSuccess,
}: {
  locale: string;
  recipeId: string;
  availableMaterials: RecipeMaterialOption[];
  onSuccess: () => void;
}) {
  const t = useTranslations("dashboard.business.recipes.workspace");
  const [state, formAction, pending] = useActionState(addRecipeItem, initialActionState);

  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    onSuccess();
  }, [state.success, state.completedAt, onSuccess]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="recipeId" value={recipeId} />
      <p className="text-sm font-semibold">{t("addItem.title")}</p>
      <div className="grid gap-3 sm:grid-cols-[1fr,160px,auto] sm:items-end">
        <div className="space-y-1">
          <label htmlFor="rm-add" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {t("addItem.material")}
          </label>
          <select
            id="rm-add"
            name="rawMaterialId"
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">{t("addItem.selectMaterial")}</option>
            {availableMaterials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameAr} ({m.unitName})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="rm-qty" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {t("addItem.quantity")}
          </label>
          <input
            id="rm-qty"
            name="quantity"
            required
            inputMode="decimal"
            placeholder="0.025"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <button
          type="submit"
          disabled={pending || availableMaterials.length === 0}
          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("addItem.submit")}
        </button>
      </div>
      {availableMaterials.length === 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {t("addItem.noMaterials")}
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function EditQuantityForm({
  locale,
  itemId,
  currentQuantity,
  onSuccess,
}: {
  locale: string;
  itemId: string;
  currentQuantity: string;
  onSuccess: () => void;
}) {
  const t = useTranslations("dashboard.business.recipes.workspace");
  const [state, formAction, pending] = useActionState(updateRecipeItemQuantity, initialActionState);

  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    onSuccess();
  }, [state.success, state.completedAt, onSuccess]);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="itemId" value={itemId} />
      <input
        name="quantity"
        defaultValue={currentQuantity}
        required
        inputMode="decimal"
        className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        {t("table.editQuantity")}
      </button>
      {state.error ? <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span> : null}
    </form>
  );
}

function RemoveRecipeItemButton({ locale, itemId }: { locale: string; itemId: string }) {
  const t = useTranslations("dashboard.business.recipes.workspace");
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={removeRecipeItem}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="itemId" value={itemId} />
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("table.confirmRemove"))) {
            formRef.current?.requestSubmit();
          }
        }}
        className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-700 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        {t("table.remove")}
      </button>
    </form>
  );
}

function CreateRecipeButton({
  locale,
  productId,
  onCreated,
}: {
  locale: string;
  productId: string;
  onCreated: () => void;
}) {
  const t = useTranslations("dashboard.business.recipes.workspace");
  const [state, formAction, pending] = useActionState(createRecipeForProduct, initialActionState);

  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    onCreated();
  }, [state.success, state.completedAt, onCreated]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="productId" value={productId} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {t("createRecipe.description")}
      </p>
      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? t("createRecipe.pending") : t("createRecipe.submit")}
      </button>
    </form>
  );
}

export function RecipesWorkspace({
  locale,
  products,
  materials,
}: {
  locale: string;
  products: RecipeProductRow[];
  materials: RecipeMaterialOption[];
}) {
  const t = useTranslations("dashboard.business.recipes.workspace");
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const filteredProducts = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.nameAr.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }, [products, debounced]);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const itemsByMaterialId = new Set(selectedProduct?.recipeItems.map((x) => x.rawMaterialId) ?? []);
  const availableMaterials = materials.filter((m) => !itemsByMaterialId.has(m.id));

  return (
    <div className="cf-surface rounded-xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">{t("title")}</p>
      </div>

      {products.length > 0 ? (
        <div className="mb-4">
          <label className="sr-only" htmlFor="recipes-search">
            {t("searchLabel")}
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              id="recipes-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={`w-full rounded-lg border border-zinc-300 bg-white py-2.5 ps-10 text-sm dark:border-zinc-700 dark:bg-zinc-950 ${search.trim() ? "pe-10" : "pe-3"}`}
            />
          </div>
        </div>
      ) : null}

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-10 text-center dark:border-zinc-800">
          <div className="mb-3 text-4xl" aria-hidden>
            📘
          </div>
          <p className="text-base font-semibold">{t("empty.title")}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("empty.description")}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          {t("empty.noResults")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.product")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.code")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.recipeStatus")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const itemsCount = p.recipeItems.length;
                const active = p.id === selectedProductId;
                return (
                  <tr
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProductId(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedProductId(p.id);
                      }
                    }}
                    className={`cursor-pointer border-t border-zinc-200 transition-colors dark:border-zinc-800 ${active ? "bg-emerald-50/80 dark:bg-emerald-950/30" : "hover:bg-zinc-100/90 dark:hover:bg-zinc-800/65"}`}
                  >
                    <td className="px-4 py-3">{p.nameAr}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                    <td className="px-4 py-3">
                      <RecipeStatusBadge itemsCount={itemsCount} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductId(p.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border-2 border-zinc-300 bg-transparent px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
                      >
                        <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                        {t("table.manage")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CatalogSideDrawer
        open={Boolean(selectedProduct)}
        onRequestClose={() => setSelectedProductId(null)}
        title={selectedProduct ? t("drawer.titleWithName", { name: selectedProduct.nameAr }) : t("drawer.title")}
      >
        {selectedProduct ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
              <p className="font-medium">{selectedProduct.nameAr}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{t("drawer.productCode", { code: selectedProduct.code })}</p>
            </div>

            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
              {t("drawer.info")}
            </p>

            {!selectedProduct.recipeId ? (
              <CreateRecipeButton locale={locale} productId={selectedProduct.id} onCreated={handleRefresh} />
            ) : (
              <>
                <AddRecipeItemForm
                  locale={locale}
                  recipeId={selectedProduct.recipeId}
                  availableMaterials={availableMaterials}
                  onSuccess={handleRefresh}
                />

                {selectedProduct.recipeItems.length === 0 ? (
                  <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                    {t("drawer.emptyRecipeItems")}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full min-w-[620px] text-sm">
                      <thead className="bg-muted text-foreground">
                        <tr>
                          <th className="px-4 py-3 text-start font-semibold">{t("table.material")}</th>
                          <th className="px-4 py-3 text-start font-semibold">{t("table.quantity")}</th>
                          <th className="px-4 py-3 text-start font-semibold">{t("table.unit")}</th>
                          <th className="px-4 py-3 text-start font-semibold">{t("table.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProduct.recipeItems.map((item) => (
                          <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                            <td className="px-4 py-3">{item.rawMaterialName}</td>
                            <td className="px-4 py-3 font-mono text-xs tabular-nums">
                              {formatArabicLatnQuantity(Number(item.quantity))}
                            </td>
                            <td className="px-4 py-3">{item.unitName}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <EditQuantityForm
                                  locale={locale}
                                  itemId={item.id}
                                  currentQuantity={item.quantity}
                                  onSuccess={handleRefresh}
                                />
                                <RemoveRecipeItemButton locale={locale} itemId={item.id} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
      </CatalogSideDrawer>
    </div>
  );
}
