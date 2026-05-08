import { Coffee } from "lucide-react";

type BrandLockupProps = {
  compact?: boolean;
};

export function BrandLockup({ compact = false }: BrandLockupProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-emerald-600 p-2 text-white shadow-sm dark:bg-emerald-500">
        <Coffee className="h-4 w-4" />
      </div>
      <div>
        <p className={`font-semibold leading-none ${compact ? "text-sm" : "text-base"}`}>CafeFlow</p>
        <p className="text-xs text-zinc-500">Coffee Operations OS</p>
      </div>
    </div>
  );
}

