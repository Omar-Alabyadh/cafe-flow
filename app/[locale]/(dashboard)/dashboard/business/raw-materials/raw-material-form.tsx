"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { saveRawMaterial, type SaveRawMaterialState } from "./actions";

const initial: SaveRawMaterialState = { error: null };

type Option = { id: string; label: string };
export type RawMaterialDraft = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  unitId: string;
  supplierId: string | null;
  costPerUnit: string;
  minimumQuantity: number;
};

export type RawMaterialFieldValues = {
  code: string;
  nameAr: string;
  nameEn: string;
  unitId: string;
  supplierId: string;
  costPerUnit: string;
  minimumQuantity: string;
};

export function RawMaterialForm({
  locale,
  units,
  suppliers,
  fieldsKey,
  initialValues,
  editingRawMaterialId,
  onCancel,
  onSaveSuccess,
  onDirtyChange,
  embedTitle = false,
  hideInlineCancel = false,
}: {
  locale: string;
  units: Option[];
  suppliers: Option[];
  fieldsKey: string;
  initialValues: RawMaterialFieldValues;
  editingRawMaterialId: string | null;
  onCancel: () => void;
  onSaveSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
}) {
  const t = useTranslations("dashboard.business.rawMaterials.form");
  const [state, formAction, pending] = useActionState(saveRawMaterial, initial);
  const [code, setCode] = useState(initialValues.code);
  const [nameAr, setNameAr] = useState(initialValues.nameAr);
  const [nameEn, setNameEn] = useState(initialValues.nameEn);
  const [unitId, setUnitId] = useState(initialValues.unitId);
  const [supplierId, setSupplierId] = useState(initialValues.supplierId);
  const [costPerUnit, setCostPerUnit] = useState(initialValues.costPerUnit);
  const [minimumQuantity, setMinimumQuantity] = useState(initialValues.minimumQuantity);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const baselineRef = useRef(JSON.stringify(initialValues));

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);
  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(
      JSON.stringify({ code, nameAr, nameEn, unitId, supplierId, costPerUnit, minimumQuantity }) !== baselineRef.current,
    );
  }, [code, nameAr, nameEn, unitId, supplierId, costPerUnit, minimumQuantity, onDirtyChange]);
  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    const t = window.setTimeout(() => onSaveSuccessRef.current(), 0);
    return () => window.clearTimeout(t);
  }, [state.success, state.completedAt]);

  return (
    <form key={fieldsKey} action={formAction} className="w-full space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="rawMaterialId" value={editingRawMaterialId ?? ""} />
      {embedTitle ? null : <h3 className="text-base font-semibold">{editingRawMaterialId ? t("editTitle") : t("createTitle")}</h3>}

      <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="mb-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{t("sections.identity")}</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="rm-code">{t("fields.code")}</label>
            <input id="rm-code" name="code" value={code} onChange={(e) => setCode(e.target.value)} required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder={t("fields.codePlaceholder")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="rm-nameAr">{t("fields.nameAr")}</label>
            <input id="rm-nameAr" name="nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="rm-nameEn">{t("fields.nameEn")}</label>
            <input id="rm-nameEn" name="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="mb-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{t("sections.stock")}</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="rm-unit">{t("fields.unitId")}</label>
            <select id="rm-unit" name="unitId" value={unitId} onChange={(e) => setUnitId(e.target.value)} required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
              <option value="">{t("fields.selectUnit")}</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="rm-cost">{t("fields.costPerUnit")}</label>
            <input id="rm-cost" name="costPerUnit" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="12.50" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="rm-min">{t("fields.minimumQuantity")}</label>
            <input id="rm-min" name="minimumQuantity" type="number" min={0} value={minimumQuantity} onChange={(e) => setMinimumQuantity(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="mb-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{t("sections.supplier")}</p>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="rm-supplier">{t("fields.supplierId")}</label>
          <select id="rm-supplier" name="supplierId" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <option value="">{t("fields.noSupplier")}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || units.length === 0}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? t("saving") : editingRawMaterialId ? t("update") : t("save")}
      </button>
      {!hideInlineCancel ? (
        <button type="button" onClick={onCancel} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600">
          {t("cancel")}
        </button>
      ) : null}
      {units.length === 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">{t("unitsRequiredHint")}</p>
      ) : null}
    </form>
  );
}
