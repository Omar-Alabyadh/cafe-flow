"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId } from "react";

type CatalogSideDrawerProps = {
  open: boolean;
  title: string;
  onRequestClose: () => void;
  children: ReactNode;
  /** Optional strip under title (e.g. edit-mode banner). */
  banner?: ReactNode;
  /** Optional footer actions, usually cancel controls. */
  footer?: ReactNode;
};

/**
 * Wide centered modal with internal scrolling for business forms.
 * The historical name `CatalogSideDrawer` remains to avoid import breakage.
 */
export function CatalogSideDrawer({
  open,
  title,
  onRequestClose,
  children,
  banner,
  footer,
}: CatalogSideDrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onRequestClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[1px] dark:bg-foreground/25"
        aria-label="Close panel"
        onClick={onRequestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl ring-1 ring-border/60"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-background/40 px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold leading-snug text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onRequestClose}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {banner ? <div className="shrink-0 border-b border-border px-4 py-3">{banner}</div> : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-border bg-background/30 px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
