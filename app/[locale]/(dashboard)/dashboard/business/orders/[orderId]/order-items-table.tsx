import { MoneyValue } from "@/components/ui/foundations/money-value";
import { toPlainMoneyAmount } from "@/lib/format/libyan-dinar";
import { Prisma } from "@prisma/client";
import type { OrderItem, Product } from "@prisma/client";
import { OrderItemQuantityEditor } from "./order-item-quantity-editor";
import { OrderItemRemoveButton } from "./order-item-remove-button";
import { formatArabicLatnQuantity } from "@/lib/format/numbers";
import { getTranslations } from "next-intl/server";

type ItemRow = OrderItem & { product: Product };

export async function OrderItemsTable({
  locale,
  orderId,
  items,
  editable,
}: {
  locale: string;
  orderId: string;
  items: ItemRow[];
  editable: boolean;
}) {
  const t = await getTranslations("dashboard.business.orders.details.table");
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted text-foreground">
          <tr>
            <th className="px-4 py-3 text-start font-semibold">{t("product")}</th>
            <th className="px-4 py-3 text-start font-semibold">{t("code")}</th>
            <th className="px-4 py-3 text-right font-semibold">{t("unitPrice")}</th>
            <th className="px-4 py-3 text-right font-semibold">{t("quantity")}</th>
            <th className="px-4 py-3 text-right font-semibold">{t("lineTotal")}</th>
            {editable ? <th className="px-4 py-3 text-start font-semibold">{t("actions")}</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const lineTotal = new Prisma.Decimal(row.quantity.toString()).mul(
              new Prisma.Decimal(row.product.basePrice.toString()),
            );
            return (
              <tr key={row.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-3">{row.product.nameAr}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.product.code}</td>
                <td className="px-4 py-3 text-right">
                  <MoneyValue
                    amount={toPlainMoneyAmount(row.product.basePrice)}
                    size="sm"
                    className="inline-flex justify-end"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  {editable ? (
                    <OrderItemQuantityEditor
                      locale={locale}
                      orderId={orderId}
                      orderItemId={row.id}
                      defaultQuantity={row.quantity.toString()}
                      productNameAr={row.product.nameAr}
                    />
                  ) : (
                    <span className="font-mono tabular-nums">
                      {formatArabicLatnQuantity(row.quantity.toNumber())}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <MoneyValue
                    amount={toPlainMoneyAmount(lineTotal)}
                    size="sm"
                    className="inline-flex justify-end"
                  />
                </td>
                {editable ? (
                  <td className="px-4 py-3">
                    <OrderItemRemoveButton
                      locale={locale}
                      orderId={orderId}
                      orderItemId={row.id}
                      productNameAr={row.product.nameAr}
                    />
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
