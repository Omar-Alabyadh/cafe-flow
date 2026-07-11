import { notFound, redirect } from "next/navigation";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { FinancialDataOrigin, OrderStatus } from "@prisma/client";
import { LegacyReconciliationForm } from "../reconciliation-form";

export default async function LegacyReconciliationDetail({ params }: { params: Promise<{ locale: string; orderId: string }> }) {
  const { locale, orderId } = await params; const userId = await getCurrentUserId(); if (!userId) redirect(`/${locale}/sign-in`);
  const context = await getCurrentBusinessMemberContext(userId);
  if (!hasPermission(context.member, "financial.legacy.reconcile")) return <UnauthorizedState locale={locale} title="غير مصرح" description="لا تملك صلاحية التسوية." />;
  const [order, branches, members] = await Promise.all([
    prisma.order.findFirst({ where: { id: orderId, businessId: context.business.id, status: OrderStatus.COMPLETED }, include: { items: { include: { product: true }, orderBy: { createdAt: "asc" } } } }),
    prisma.branch.findMany({ where: { businessId: context.business.id }, select: { id: true, code: true, nameAr: true, archivedAt: true }, orderBy: { code: "asc" } }),
    prisma.membership.findMany({ where: { businessId: context.business.id, archivedAt: null }, select: { userId: true, user: { select: { fullName: true, archivedAt: true } } }, orderBy: { createdAt: "asc" } }),
  ]);
  if (!order) notFound();
  if (order.financialDataOrigin !== FinancialDataOrigin.LEGACY_UNKNOWN) return <main className="p-6">تمت تسوية هذا الطلب أو لا يحتاج إلى تسوية.</main>;
  return <LegacyReconciliationForm locale={locale} order={{ id: order.id, createdAt: order.createdAt.toISOString(), completedAt: order.completedAt?.toISOString() ?? null, items: order.items.map((item) => ({ id: item.id, quantity: item.quantity.toString(), productName: item.product.nameAr, productPrice: item.product.basePrice.toString() })) }} branches={branches.map((branch) => ({ ...branch, archivedAt: Boolean(branch.archivedAt) }))} receivers={members.map((member) => ({ id: member.userId, name: member.user.fullName }))} />;
}
