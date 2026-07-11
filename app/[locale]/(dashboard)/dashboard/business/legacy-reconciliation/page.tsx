import Link from "next/link";
import { redirect } from "next/navigation";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { FinancialDataOrigin, OrderStatus } from "@prisma/client";

export default async function LegacyReconciliationPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string; q?: string }> }) {
  const { locale } = await params; const userId = await getCurrentUserId(); if (!userId) redirect(`/${locale}/sign-in`);
  const context = await getCurrentBusinessMemberContext(userId);
  if (!hasPermission(context.member, "financial.legacy.reconcile")) return <UnauthorizedState locale={locale} title="غير مصرح" description="لا تملك صلاحية تسوية السجلات المالية التاريخية." />;
  const { page = "1", q = "" } = await searchParams; const take = 25; const skip = Math.max(0, Number(page) - 1) * take;
  const where = { businessId: context.business.id, status: OrderStatus.COMPLETED, financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN, ...(q ? { id: { contains: q, mode: "insensitive" as const } } : {}) };
  const [orders, unresolved, reconciled] = await Promise.all([prisma.order.findMany({ where, select: { id: true, createdAt: true, completedAt: true, _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, skip, take }), prisma.order.count({ where: { businessId: context.business.id, status: OrderStatus.COMPLETED, financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } }), prisma.order.count({ where: { businessId: context.business.id, financialDataOrigin: FinancialDataOrigin.MANUALLY_RECONCILED } })]);
  return <PageContainer><h1 className="text-xl font-bold">تسوية المبيعات التاريخية</h1><p className="mt-2 text-sm text-amber-700">الطلبات غير المسوّاة مستبعدة من التقارير المالية الرسمية. لا تستخدم أسعار المنتجات الحالية كدليل تاريخي.</p><dl className="my-5 grid gap-3 sm:grid-cols-3"><div>غير مسوّاة: {unresolved}</div><div>مسوّاة: {reconciled}</div><div>المتبقي: {unresolved}</div></dl><form className="mb-4" method="get"><input name="q" defaultValue={q} placeholder="معرّف الطلب" className="rounded border px-3 py-2" /><button className="ms-2 rounded bg-zinc-900 px-3 py-2 text-white">بحث</button></form><div className="space-y-2">{orders.map((order) => <Link className="block rounded border p-3 hover:bg-zinc-50" key={order.id} href={`/${locale}/dashboard/business/legacy-reconciliation/${order.id}`}>طلب تاريخي · عناصر: {order._count.items} · {order.createdAt.toLocaleDateString(locale)}</Link>)}</div>{orders.length === take ? <Link className="mt-4 inline-block underline" href={`?page=${Number(page) + 1}&q=${encodeURIComponent(q)}`}>التالي</Link> : null}</PageContainer>;
}
