"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LogOut,
  PackageSearch,
  ReceiptText,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { signOutFromPos, submitPosOrder, type PosSubmitState } from "@/app/[locale]/(dashboard)/dashboard/business/pos/actions";
import { PaymentMethodSelector, type PosBankingMethod, type PosPaymentMode } from "./payment-method-selector";
import { MoneyValue } from "@/components/ui/foundations/money-value";

export type PosCategory = { id: string; label: string };
export type PosProduct = {
  id: string;
  /** Locale-resolved label for grid, cart, and search. */
  displayName: string;
  nameAr: string;
  nameEn: string | null;
  price: number;
  categoryId: string | null;
  isPopular: boolean;
  outOfStock: boolean;
  lowStock: boolean;
};
type CartItem = { productId: string; displayName: string; price: number; quantity: number };

/** POS header identity passed from trusted server-side context. */
export type PosSessionIdentityStrip = {
  userFullName: string;
  roleLabelAr: string;
  branchLabelAr: string;
  businessNameAr: string;
};

type PosFullscreenModeProps = {
  categories: PosCategory[];
  products: PosProduct[];
  locale?: string;
  sessionIdentity?: PosSessionIdentityStrip;
};

const initialState: PosSubmitState = { error: null, success: null };

function isTypingInField(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function createPosRequestKey(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  if (typeof cryptoApi?.getRandomValues !== "function") {
    return "";
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Hold-to-repeat for cart +/- (after a short delay) — faster for high-volume POS without extra taps.
 */
function PosQtyHoldButton({
  label,
  onStep,
  disabled,
  className,
}: {
  label: string;
  onStep: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const holdRef = useRef<{ delay?: number; repeat?: number }>({});
  const clearHold = () => {
    if (holdRef.current.delay) window.clearTimeout(holdRef.current.delay);
    if (holdRef.current.repeat) window.clearInterval(holdRef.current.repeat);
    holdRef.current = {};
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={() => {
        if (disabled) return;
        onStep();
        holdRef.current.delay = window.setTimeout(() => {
          holdRef.current.repeat = window.setInterval(onStep, 75);
        }, 420);
      }}
      onPointerUp={clearHold}
      onPointerLeave={clearHold}
      onPointerCancel={clearHold}
      className={className}
    >
      {label}
    </button>
  );
}

export function PosFullscreenMode({ categories, products, locale = "ar", sessionIdentity }: PosFullscreenModeProps) {
  const t = useTranslations("pos");
  const tCommon = useTranslations("common");
  const tPaymentMethods = useTranslations("pos.payment.bankingMethods");
  const isArabic = locale === "ar";
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const catalogSectionRef = useRef<HTMLElement>(null);
  const productsGridSectionRef = useRef<HTMLElement>(null);
  const cartPanelRef = useRef<HTMLElement>(null);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  /** One visible toast at a time — new message replaces the previous (no stacked overflow). */
  const [toast, setToast] = useState<{ text: string; variant: "success" | "error" } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  /** CSS tap animation class window (cf-pos-product-tap in globals.css). */
  const [tapAnimProductId, setTapAnimProductId] = useState<string | null>(null);
  /** Brief ring on cart panel after successful checkout. */
  const [checkoutSuccessFlash, setCheckoutSuccessFlash] = useState(false);
  const [lastHoveredProductId, setLastHoveredProductId] = useState<string | null>(null);
  const [activeCartLineId, setActiveCartLineId] = useState<string | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PosPaymentMode>("cash");
  const [bankingMethod, setBankingMethod] = useState<PosBankingMethod>("bank_card");
  const [requestKey, setRequestKey] = useState("");
  const [state, formAction, pending] = useActionState(submitPosOrder, initialState);
  const [signOutPending, startSignOut] = useTransition();
  const lastHandledSuccessMessageRef = useRef<string | null>(null);
  const lastHandledErrorRef = useRef<string | null>(null);
  const checkoutFlashEndRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, variant: "success" | "error", ms = 1300) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ text, variant });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, ms);
  }, []);

  const filteredProducts = useMemo(() => {
    const byCategory = activeCategoryId
      ? products.filter((product) => product.categoryId === activeCategoryId)
      : products;
    const keyword = search.trim().toLowerCase();
    if (!keyword) return byCategory;
    return byCategory.filter((product) => {
      const hay = `${product.displayName} ${product.nameAr} ${product.nameEn ?? ""}`.toLowerCase();
      return hay.includes(keyword);
    });
  }, [products, activeCategoryId, search]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const itemsCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  /** Active cart line for +/- shortcuts, derived from selected or most recent line. */
  const effectiveActiveCartLineId = useMemo(() => {
    if (cart.length === 0) return null;
    if (activeCartLineId && cart.some((c) => c.productId === activeCartLineId)) {
      return activeCartLineId;
    }
    return cart[cart.length - 1]!.productId;
  }, [cart, activeCartLineId]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const runId = window.setTimeout(() => {
      setRequestKey((current) => current || createPosRequestKey());
    }, 0);
    return () => window.clearTimeout(runId);
  }, []);

  /**
   * After successful checkout: clear cart and show toast.
   * Deferred to a macrotask to avoid synchronous state updates inside effects.
   * The request key rotates only after confirmed success; transient retries keep
   * the same database-backed identity for this checkout attempt.
   */
  useEffect(() => {
    if (!state.success) {
      lastHandledSuccessMessageRef.current = null;
      return;
    }
    if (lastHandledSuccessMessageRef.current === state.success) return;
    lastHandledSuccessMessageRef.current = state.success;

    const runId = window.setTimeout(() => {
      setCart([]);
      setRequestKey(createPosRequestKey());
      setIsMobileCartOpen(false);
      setLastAddedProductId(null);
      setTapAnimProductId(null);
      showToast(t("toast.orderCompleted"), "success", 1600);
      setCheckoutSuccessFlash(true);
      if (checkoutFlashEndRef.current) window.clearTimeout(checkoutFlashEndRef.current);
      checkoutFlashEndRef.current = window.setTimeout(() => {
        setCheckoutSuccessFlash(false);
        checkoutFlashEndRef.current = null;
      }, 650);
    }, 0);

    return () => {
      window.clearTimeout(runId);
      if (checkoutFlashEndRef.current) {
        window.clearTimeout(checkoutFlashEndRef.current);
        checkoutFlashEndRef.current = null;
      }
    };
  }, [state.success, showToast, t]);

  /** API error toast, also deferred to avoid sync setState inside effect. */
  useEffect(() => {
    if (!state.error) {
      lastHandledErrorRef.current = null;
      return;
    }
    const message = state.error;
    if (lastHandledErrorRef.current === message) return;
    lastHandledErrorRef.current = message;
    const runId = window.setTimeout(() => {
      showToast(message, "error", 2200);
    }, 0);
    return () => window.clearTimeout(runId);
  }, [state.error, showToast]);

  const addProduct = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product || product.outOfStock) return;

      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (!existing) {
          return [...prev, { productId, displayName: product.displayName, price: product.price, quantity: 1 }];
        }
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      });

      setActiveCartLineId(productId);
      showToast(t("toast.productAdded", { product: product.displayName }), "success", 1300);
      setTapAnimProductId(productId);
      window.setTimeout(() => setTapAnimProductId((id) => (id === productId ? null : id)), 170);
      setLastAddedProductId(productId);
      window.setTimeout(() => setLastAddedProductId((prev) => (prev === productId ? null : prev)), 300);

      queueMicrotask(() => {
        setSearch("");
        searchInputRef.current?.focus();
      });
    },
    [products, showToast, t],
  );

  const tryEnterAddProduct = useCallback(() => {
    const inStock = (p: PosProduct) => !p.outOfStock;
    if (filteredProducts.length === 1) {
      const only = filteredProducts[0];
      if (only && inStock(only)) addProduct(only.id);
      return;
    }
    if (lastHoveredProductId) {
      const hit = filteredProducts.find((p) => p.id === lastHoveredProductId);
      if (hit && inStock(hit)) addProduct(hit.id);
    }
  }, [filteredProducts, lastHoveredProductId, addProduct]);

  const increase = useCallback((productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  /** Quantity never drops below 1; remove line via trash button or Backspace shortcut. */
  const decrease = useCallback((productId: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const next = item.quantity - 1;
        return { ...item, quantity: next < 1 ? 1 : next };
      }),
    );
  }, []);

  function remove(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function setQuantity(productId: string, quantity: number) {
    const q = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: q } : item)),
    );
  }

  /**
   * Cashier shortcuts: only when focus is NOT in inputs (guards avoid breaking search, qty fields, selects).
   */
  useEffect(() => {
    function onGlobalKeyDown(e: KeyboardEvent) {
      if (isTypingInField(document.activeElement)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        tryEnterAddProduct();
        return;
      }
      if (e.key === "Backspace") {
        if (cart.length === 0) return;
        e.preventDefault();
        setCart((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
        return;
      }
      if (e.key === "+" || e.key === "Add") {
        if (cart.length === 0 || !effectiveActiveCartLineId) return;
        e.preventDefault();
        increase(effectiveActiveCartLineId);
        return;
      }
      if (e.key === "-" || e.key === "Subtract") {
        if (cart.length === 0 || !effectiveActiveCartLineId) return;
        e.preventDefault();
        decrease(effectiveActiveCartLineId);
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [cart, effectiveActiveCartLineId, tryEnterAddProduct, increase, decrease]);

  const paymentSummary = paymentMode === "cash" ? t("payment.cash") : tPaymentMethods(bankingMethod);

  function handlePosSignOut() {
    const fd = new FormData();
    fd.set("locale", locale);
    startSignOut(() => {
      void signOutFromPos(fd);
    });
  }

  return (
    <>
      {toast ? (
        <div
          className={`pointer-events-none fixed left-1/2 top-4 z-60 flex max-w-[min(92vw,420px)] -translate-x-1/2 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-center text-sm font-semibold shadow-lg ${isArabic ? "[direction:rtl]" : "[direction:ltr]"} ${
            toast.variant === "success"
              ? "bg-zinc-900 text-white dark:bg-emerald-950 dark:text-emerald-50"
              : "bg-red-900 text-white dark:bg-red-950 dark:text-red-50"
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="shrink-0 opacity-90" aria-hidden>
            {toast.variant === "success" ? "✔️" : "⚠️"}
          </span>
          <span className="min-w-0 leading-snug">{toast.text}</span>
        </div>
      ) : null}

    <form action={formAction} className="fixed inset-0 z-50 h-dvh overflow-hidden bg-background text-foreground">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="idempotencyKey" value={requestKey} />
      <input
        type="hidden"
        name="cart"
        value={JSON.stringify(cart.map((item) => ({ productId: item.productId, quantity: item.quantity })))}
      />

      <div className="flex h-full overflow-hidden bg-background">
        <aside className="flex h-full w-[72px] shrink-0 flex-col items-center border-e border-border bg-card py-3 xl:w-[78px]">
          <div className="flex flex-col items-center gap-2">
            {/* Cashier production rule: keep only one quick action in POS side rail. */}
            <button
              type="button"
              title={t("actions.goToOrders")}
              onClick={() => router.push(`/${locale}/dashboard/business/orders`)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-emerald-600 bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
            >
              <ReceiptText className="h-5 w-5" />
            </button>
            {/** Direct server-action call: more reliable than nested form submit for sign-out. */}
            <button
              type="button"
              title={t("actions.signOut")}
              disabled={signOutPending}
              onClick={handlePosSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-muted active:scale-95 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </aside>

        <main className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2 ${isArabic ? "[direction:rtl]" : "[direction:ltr]"}`}>
          <div className="shrink-0 space-y-1.5">
            <header className="rounded-md border border-border bg-card p-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">{t("header.title")}</h1>
                  <p className="text-[11px] text-zinc-500">{t("header.subtitle")}</p>
                </div>
                <div
                  className={`max-w-[min(64vw,560px)] sm:max-w-[640px] ${isArabic ? "text-end [direction:rtl]" : "text-start [direction:ltr]"}`}
                >
                  <div
                    className={`flex flex-wrap gap-x-2 gap-y-1 text-[11px] leading-snug text-zinc-500 sm:whitespace-nowrap ${isArabic ? "items-center justify-end" : "items-center justify-start"}`}
                  >
                    <p className="inline-flex min-w-0 items-baseline gap-1">
                      <span className="text-zinc-400">{t("header.user")}:</span>
                      <span className="max-w-36 truncate font-medium text-zinc-700 dark:text-zinc-300 sm:max-w-48">
                        {sessionIdentity?.userFullName ?? tCommon("emDash")}
                      </span>
                    </p>
                    <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>|</span>
                    <p className="inline-flex min-w-0 items-baseline gap-1">
                      <span className="text-zinc-400">{t("header.role")}:</span>
                      <span className="max-w-28 truncate font-medium text-zinc-700 dark:text-zinc-300 sm:max-w-36">
                        {sessionIdentity?.roleLabelAr ?? tCommon("emDash")}
                      </span>
                    </p>
                    <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>|</span>
                    <p className="inline-flex min-w-0 items-baseline gap-1">
                      <span className="text-zinc-400">{t("header.branch")}:</span>
                      <span className="max-w-28 truncate font-medium text-zinc-700 dark:text-zinc-300 sm:max-w-36">
                        {sessionIdentity?.branchLabelAr ?? tCommon("emDash")}
                      </span>
                    </p>
                    <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>|</span>
                    <p className="inline-flex min-w-0 items-baseline gap-1">
                      <span className="text-zinc-400">{t("header.business")}:</span>
                      <span className="max-w-32 truncate font-medium text-zinc-700 dark:text-zinc-300 sm:max-w-40">
                        {sessionIdentity?.businessNameAr ?? tCommon("emDash")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </header>

            <section
              ref={catalogSectionRef}
              className="min-w-0 space-y-1 rounded-md border border-border bg-muted/50 p-2"
            >
              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    tryEnterAddProduct();
                  }
                }}
                placeholder={t("search.placeholder")}
                className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground"
              />
              <div className="-mx-0.5 flex min-w-0 gap-1 overflow-x-auto overflow-y-hidden pb-0.5 [scrollbar-width:thin]">
                <button
                  type="button"
                  onClick={() => setActiveCategoryId(null)}
                  className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${
                    activeCategoryId === null
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-border bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("categories.all")}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${
                      activeCategoryId === category.id
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-border bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section
            ref={productsGridSectionRef}
            className="mt-1.5 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden rounded-md border border-border bg-card p-2 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product.id)}
                  onMouseEnter={() => setLastHoveredProductId(product.id)}
                  onFocus={() => setLastHoveredProductId(product.id)}
                  disabled={product.outOfStock}
                  className={`group flex min-w-0 flex-col rounded-md border border-border bg-card p-2 text-start transition-transform duration-150 ease-out will-change-transform ${
                    tapAnimProductId === product.id ? "cf-pos-product-tap" : ""
                  } ${
                    product.outOfStock
                      ? "cursor-not-allowed opacity-55"
                      : "hover:border-emerald-400 hover:shadow-sm"
                  } ${lastAddedProductId === product.id ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-background transition-shadow duration-300" : ""}`}
                >
                  <div className="mb-1.5 flex h-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <PackageSearch className="h-4 w-4" />
                  </div>
                  <p className="line-clamp-2 text-xs font-extrabold leading-snug text-zinc-900 dark:text-zinc-100">{product.displayName}</p>
                  <p className="mt-1 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    <MoneyValue amount={product.price} size="sm" />
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {product.isPopular ? (
                      <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        {t("product.popular")}
                      </span>
                    ) : null}
                    {product.lowStock ? (
                      <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        {t("product.lowStock")}
                      </span>
                    ) : null}
                    {product.outOfStock ? (
                      <span className="rounded-md bg-zinc-200 px-1.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {t("product.outOfStock")}
                      </span>
                    ) : null}
                  </div>
                  {!product.outOfStock ? (
                    <p className="mt-1 text-[10px] font-bold text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
                      {t("product.tapToAdd")}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside
          ref={cartPanelRef}
          tabIndex={-1}
          className={`flex h-full min-h-0 w-[24%] min-w-[300px] max-w-[400px] shrink-0 flex-col border-s border-border bg-muted p-2.5 ${isArabic ? "[direction:rtl]" : "[direction:ltr]"} outline-none transition-shadow duration-500 ${
            checkoutSuccessFlash ? "ring-2 ring-emerald-500/60 ring-offset-2 ring-offset-background" : ""
          }`}
        >
          <div className="mb-2 shrink-0 flex items-center justify-between">
            <h2 className="text-sm font-extrabold">{t("order.currentOrder")}</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {t("order.itemsCount", { count: itemsCount })}
              </span>
              <span className="text-[11px] font-semibold text-zinc-500">#{cart.length > 0 ? "A-1024" : "----"}</span>
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pe-1">
            {cart.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/40 px-5 py-10 text-center">
                <ShoppingCart className="h-16 w-16 text-zinc-300 dark:text-zinc-600" aria-hidden />
                <div className="max-w-[240px]">
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{t("order.emptyTitle")}</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{t("order.emptyDescription")}</p>
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                {cart.map((item) => (
                  <li
                    key={item.productId}
                    onClick={() => setActiveCartLineId(item.productId)}
                    className={`cursor-pointer rounded-md border border-border bg-card p-2.5 ${
                      effectiveActiveCartLineId === item.productId
                        ? "border-emerald-500 ring-1 ring-emerald-500/30"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-extrabold">{item.displayName}</p>
                        <p className="text-xs text-zinc-500">
                          <MoneyValue amount={item.price} size="sm" />
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          remove(item.productId);
                        }}
                        className="rounded-md p-1 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <PosQtyHoldButton
                          label="−"
                          onStep={() => decrease(item.productId)}
                          className="h-6 w-6 rounded-md border border-zinc-300 text-xs font-bold transition active:scale-95"
                        />
                        <input
                          type="number"
                          min={1}
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(event) => setQuantity(item.productId, Number(event.target.value || 1))}
                          className="h-7 w-12 rounded-md border border-zinc-300 text-center text-xs font-bold tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
                        />
                        <PosQtyHoldButton
                          label="+"
                          onStep={() => increase(item.productId)}
                          className="h-6 w-6 rounded-md border border-zinc-300 text-xs font-bold transition active:scale-95"
                        />
                      </div>
                      <p className="text-sm font-extrabold text-zinc-700 dark:text-zinc-200">
                        <MoneyValue amount={item.price * item.quantity} size="sm" />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-2 shrink-0 space-y-2 border-t border-border bg-card pt-2 pb-[max(env(safe-area-inset-bottom),14px)]">
            <div className="rounded-md border border-border bg-muted/60 p-2.5 text-xs">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">{t("totals.subtotal")}</span>
                <span className="font-extrabold">
                  <MoneyValue amount={total} size="md" />
                </span>
              </div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-zinc-500">{t("totals.tax")}</span>
                <span className="text-zinc-500">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">{t("totals.discount")}</span>
                <span className="text-zinc-500">--</span>
              </div>
              <div className="mt-1 border-t border-border pt-1.5 text-sm">
                <div className="flex items-center justify-between font-extrabold">
                  <span>{t("totals.total")}</span>
                  <span>
                    <MoneyValue amount={total} size="md" />
                  </span>
                </div>
              </div>
            </div>

            <PaymentMethodSelector
              mode={paymentMode}
              selectedBankingMethod={bankingMethod}
              onModeChange={setPaymentMode}
              onBankingMethodChange={setBankingMethod}
            />

            {state.error ? (
              <p className="rounded-lg bg-red-50 p-2 text-xs font-medium text-red-800 dark:bg-red-950/40 dark:text-red-200">
                {state.error}
              </p>
            ) : null}
            <p className="text-[11px] font-semibold text-zinc-500">{t("payment.summary", { method: paymentSummary })}</p>
            {/* Disabled when cart is empty or during submit. */}
            <button
              type="submit"
              disabled={pending || cart.length === 0 || !requestKey}
              className="flex min-h-[44px] w-full items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 data-loading:animate-pulse"
              data-loading={pending ? true : undefined}
            >
              {pending ? (
                t("actions.submittingOrder")
              ) : (
                <>
                  <span>{t("actions.completeOrder")}</span>
                  <MoneyValue amount={total} size="sm" />
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-3 bottom-20 z-30 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileCartOpen((prev) => !prev)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold text-foreground"
        >
          {isMobileCartOpen ? t("mobile.hideCart") : t("mobile.showCart", { count: itemsCount })}
        </button>
      </div>

      {isMobileCartOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[78vh] rounded-t-xl border-t border-border bg-card p-3 lg:hidden">
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="space-y-2 overflow-y-auto pb-28">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-5 py-8 text-center">
                <ShoppingCart className="h-14 w-14 text-zinc-300 dark:text-zinc-600" aria-hidden />
                <div className="max-w-[240px]">
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{t("order.emptyTitle")}</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{t("order.emptyDescription")}</p>
                </div>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {cart.map((item) => (
                  <li key={`mobile-${item.productId}`}>
                    <div className="rounded-lg border border-border bg-card/80 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{item.displayName}</p>
                        <button
                          type="button"
                          onClick={() => remove(item.productId)}
                          className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                        >
                          {t("actions.remove")}
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PosQtyHoldButton
                            label="−"
                            onStep={() => decrease(item.productId)}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-lg transition active:scale-95"
                          />
                          <input
                            type="number"
                            min={1}
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={(event) => setQuantity(item.productId, Number(event.target.value || 1))}
                            className="h-8 w-16 rounded-md border border-zinc-300 text-center text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
                          />
                          <PosQtyHoldButton
                            label="+"
                            onStep={() => increase(item.productId)}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-lg transition active:scale-95"
                          />
                        </div>
                        <p className="text-xs font-bold"><MoneyValue amount={item.price * item.quantity} size="sm" /></p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <PaymentMethodSelector
              mode={paymentMode}
              selectedBankingMethod={bankingMethod}
              onModeChange={setPaymentMode}
              onBankingMethodChange={setBankingMethod}
            />
          </div>
        </div>
      ) : null}
    </form>
    </>
  );
}
