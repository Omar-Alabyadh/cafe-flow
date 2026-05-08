"use client";

import { CatalogSideDrawer } from "@/components/ui/foundations/catalog-side-drawer";
import { Pencil, Plus, Ruler, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { archiveUnit } from "./actions";
import { UnitForm, type UnitDraft, type UnitFieldValues } from "./unit-form";

export type UnitListItem = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  symbol: string | null;
  linkedRawMaterialsCount: number;
};

function ArchiveUnitButton({ locale, id }: { locale: string; id: string }) {
  const t = useTranslations("dashboard.business.units.workspace");
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={archiveUnit}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("confirmArchive"))) formRef.current?.requestSubmit();
        }}
        className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-2 py-1 text-xs font-medium text-white"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {t("archive")}
      </button>
    </form>
  );
}

export function UnitsWorkspace({ locale, units }: { locale: string; units: UnitListItem[] }) {
  const t = useTranslations("dashboard.business.units.workspace");
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<UnitDraft | null>(null);
  const [draftTick, setDraftTick] = useState(0);

  const initialValues: UnitFieldValues = editing
    ? { code: editing.code, nameAr: editing.nameAr, nameEn: editing.nameEn ?? "", symbol: editing.symbol ?? "" }
    : { code: "", nameAr: "", nameEn: "", symbol: "" };

  return (
    <div className="cf-surface rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold">{t("listTitle")}</p>
        <button type="button" onClick={() => { setEditing(null); setDrawerOpen(true); setDraftTick((x) => x + 1); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" />
          {t("addButton")}
        </button>
      </div>

      {units.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-14 text-center dark:border-zinc-800">
          <Ruler className="mb-3 h-8 w-8 text-zinc-500" />
          <p className="text-base font-semibold">{t("emptyTitle")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.code")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.name")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.symbol")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id} role="button" tabIndex={0} onClick={() => { setEditing({ id: u.id, code: u.code, nameAr: u.nameAr, nameEn: u.nameEn, symbol: u.symbol }); setDrawerOpen(true); }} className="cursor-pointer border-t border-zinc-200 hover:bg-zinc-100/90 dark:border-zinc-800 dark:hover:bg-zinc-800/65">
                  <td className="px-4 py-3 font-mono text-xs">{u.code}</td>
                  <td className="px-4 py-3">{u.nameAr}</td>
                  <td className="px-4 py-3">{u.symbol ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => { setEditing({ id: u.id, code: u.code, nameAr: u.nameAr, nameEn: u.nameEn, symbol: u.symbol }); setDrawerOpen(true); }} className="inline-flex items-center gap-1 rounded-md border-2 border-zinc-300 px-2 py-1 text-xs font-medium">
                        <Pencil className="h-3.5 w-3.5" />
                        {t("edit")}
                      </button>
                      {u.linkedRawMaterialsCount > 0 ? (
                        <span className="text-xs text-amber-800">{t("cannotArchive")}</span>
                      ) : (
                        <ArchiveUnitButton locale={locale} id={u.id} />
                      )}
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
        onRequestClose={() => setDrawerOpen(false)}
      >
        <UnitForm
          locale={locale}
          fieldsKey={editing ? editing.id : `new-${draftTick}`}
          initialValues={initialValues}
          editingUnitId={editing?.id ?? null}
          onCancel={() => setDrawerOpen(false)}
          onSaveSuccess={() => {
            setDrawerOpen(false);
            setEditing(null);
            router.refresh();
          }}
          embedTitle
          hideInlineCancel
        />
      </CatalogSideDrawer>
    </div>
  );
}
