import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { EmptyState } from "@/components/ui/foundations/empty-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { getCurrentUserId } from "@/lib/auth/session";
import { canFinalizeOrderWithStockDeduction, hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { canShowCompleteOrderAction, isOrderEditable } from "@/lib/orders/order.service";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { formatLibyanDinar, libyanDinarTextDir } from "@/lib/format/libyan-dinar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AddOrderItemForm } from "./add-order-item-form";
import { CompleteOrderButton } from "./complete-order-button";
import { OrderItemsTable } from "./order-items-table";
import { formatFullDateTime } from "@/lib/format/arabic-datetime";
import { getTranslations } from "next-intl/server";

type PageProps = { params: Promise<{ locale: string; orderId: string }> };

export default async function OrderDetailsPage({ params }: PageProps) {
  const { locale, orderId } = await params;
  const t = await getTranslations("dashboard.business.orders.details");
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) redirect(`/${locale}/dashboard/select-business`);
    throw error;
  }
  if (!hasPermission(context.member, "orders.view")) {
    return <UnauthorizedState locale={locale} title={t("unauthorizedTitle")} description={t("unauthorizedDescription")} />;
  }
  const businessId = context.business.id;

  const [order, products] = await Promise.all([
    prisma.order.findFirst({
      where: { id: orderId, businessId, archivedAt: null },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.product.findMany({
      where: { businessId, archivedAt: null, isActive: true },
      orderBy: { nameAr: "asc" },
    }),
  ]);

  if (!order) {
    notFound();
  }

  const productOptions = products.map((p) => ({
    id: p.id,
    label: `${p.nameAr} (${p.code})`,
  }));

  const itemCount = order.items.length;
  const orderTotal = order.items.reduce(
    (sum, row) =>
      sum.add(
        new Prisma.Decimal(row.quantity.toString()).mul(new Prisma.Decimal(row.product.basePrice.toString())),
      ),
    new Prisma.Decimal(0),
  );
  const editable = isOrderEditable(order.status) && hasPermission(context.member, "orders.create");
  const canComplete =
    canShowCompleteOrderAction(order.status, itemCount) && canFinalizeOrderWithStockDeduction(context.member);
  const isEmptyDraft = order.status === OrderStatus.DRAFT && itemCount === 0;

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href={`/${locale}/dashboard/business/orders`} className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← {t("backToOrders")}
        </Link>
      </div>

      <div className="cf-surface mb-6 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("orderId")}</p>
            <p className="mt-1 font-mono text-lg font-semibold tracking-tight">{order.id}</p>
            {order.notes ? (
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{t("notes")}: {order.notes}</p>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <OrderStatusBadge status={order.status} itemCount={itemCount} />
            {isEmptyDraft ? (
              <p className="max-w-md text-xs text-zinc-600 dark:text-zinc-400">
                {t("emptyDraftHint")}
              </p>
            ) : null}
          </div>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("createdAt")}</dt>
            <dd className="mt-0.5 text-right font-medium tabular-nums">{formatFullDateTime(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("completedAt")}</dt>
            <dd className="mt-0.5 text-right font-medium tabular-nums">
              {order.completedAt ? formatFullDateTime(order.completedAt) : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {!editable ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">{t("readonlyTitle")}</p>
          <p className="mt-1 text-xs opacity-90">
            {t("readonlyDescription")}
          </p>
        </div>
      ) : null}

      {editable && canComplete ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="mb-2 text-sm text-emerald-900 dark:text-emerald-100">
            {t("completeHint")}
          </p>
          <CompleteOrderButton locale={locale} orderId={order.id} />
        </div>
      ) : null}

      {editable && !canComplete ? (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <p className="font-medium">{t("cannotCompleteTitle")}</p>
          <p className="mt-1 text-xs">{t("cannotCompleteHint")}</p>
        </div>
      ) : null}

      {editable ? (
        <AddOrderItemForm locale={locale} orderId={order.id} products={productOptions} />
      ) : null}

      <div className="mb-3 mt-8">
        <h2 className="text-base font-semibold">{t("itemsTitle")}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {editable ? t("itemsEditableHint") : t("itemsReadonlyHint")}
        </p>
      </div>

      <p className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">
        <span>{t("total")}: </span>
        <span dir={libyanDinarTextDir(locale)} className="tabular-nums font-medium">
          {formatLibyanDinar(orderTotal, locale)}
        </span>
      </p>

      {order.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <OrderItemsTable locale={locale} orderId={order.id} items={order.items} editable={editable} />
      )}
    </PageContainer>
  );
}
