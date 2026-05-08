import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  helperText?: string;
  icon?: ReactNode;
};

/**
 * Small metric card foundation.
 * Business values will be connected in future phases only.
 */
export function StatCard({ label, value, helperText, icon }: StatCardProps) {
  return (
    <div className="cf-surface rounded-xl p-5 shadow-sm">
      <p className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {icon ? <span className="text-emerald-600 dark:text-emerald-400">{icon}</span> : null}
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-3xl font-semibold text-foreground">{value}</p>
      {helperText ? (
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

