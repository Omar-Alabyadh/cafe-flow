import { redirect } from "next/navigation";
import { MoneyValue } from "@/components/ui/foundations/money-value";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext } from "@/lib/authorization/context";
import { getPaymentFinancialReport } from "@/lib/finance/payment-financial-reports";
import { formatDateInputValueInTimeZone } from "@/lib/time-zone/format";
import { getUtcRangeForLocalDate } from "@/lib/time-zone/day-boundaries";
import { prisma } from "@/lib/prisma";

export default async function FinancialReportsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ from?: string; to?: string; branch?: string }> }) {
  const { locale } = await params; const userId = await getCurrentUserId(); if (!userId) redirect(`/${locale}/sign-in`);
  const context = await getCurrentBusinessMemberContext(userId); if (!hasPermission(context.member, "reports.financial.view")) return <UnauthorizedState locale={locale} title="غير مصرح" description="لا تملك صلاحية التقارير المالية." />;
  const query = await searchParams; const forcedBranch = context.member.branchId; const requestedBranch = forcedBranch ?? query.branch ?? null;
  const branches = await prisma.branch.findMany({ where: { businessId: context.business.id }, select: { id: true, code: true, nameAr: true } });
  if (requestedBranch && !branches.some((branch) => branch.id === requestedBranch)) return <main className="p-6">فرع غير صالح.</main>;
  const zone = requestedBranch ? (await prisma.branch.findUnique({ where: { id: requestedBranch }, select: { timeZone: true } }))?.timeZone ?? context.business.timeZone : context.business.timeZone;
  const today = formatDateInputValueInTimeZone(new Date(), zone); const from = query.from ?? today; const to = query.to ?? today;
  const fromRange = getUtcRangeForLocalDate({ date: from, timeZone: zone }); const toRange = getUtcRangeForLocalDate({ date: to, timeZone: zone });
  if (!fromRange || !toRange || fromRange.startUtc > toRange.startUtc) return <main className="p-6">نطاق التاريخ غير صالح.</main>;
  const report = await getPaymentFinancialReport({ businessId: context.business.id, branchId: requestedBranch, currency: context.business.defaultCurrency, startUtc: fromRange.startUtc, endUtc: toRange.nextDayStartUtc });
  return <PageContainer><h1 className="text-xl font-bold">التقارير المالية</h1><p className="mt-1 text-sm text-zinc-500">مبنية على الدفعات المقبوضة فقط · {report.currency} · {zone}</p><form className="my-5 flex flex-wrap gap-3"><input type="date" name="from" defaultValue={from} className="rounded border p-2"/><input type="date" name="to" defaultValue={to} className="rounded border p-2"/>{!forcedBranch ? <select name="branch" defaultValue={requestedBranch ?? ""} className="rounded border p-2"><option value="">كل الفروع</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.code} — {branch.nameAr}</option>)}</select> : null}<button className="rounded bg-zinc-900 px-4 py-2 text-white">تطبيق</button></form><div className="grid gap-3 sm:grid-cols-3"><Card label="إجمالي المبيعات" amount={report.totalSales.toString()}/><Card label="المبيعات النقدية" amount={report.cashSales.toString()}/><Card label="المبيعات المصرفية" amount={report.bankingSales.toString()}/></div><p className="mt-4 text-sm">عدد الدفعات المؤهلة: {report.paymentCount}</p><div className="mt-5 rounded border p-4"><h2 className="font-semibold">المبيعات حسب الطريقة المصرفية</h2>{report.bankingMethods.map((method) => <div className="mt-2 flex justify-between" key={method.method}><span>{method.method} · {method.count}</span><MoneyValue amount={method.total.toString()} size="sm" /></div>)}</div><div className="mt-5 rounded border border-amber-300 bg-amber-50 p-4 text-sm"><strong>طلبات تاريخية غير مسوّاة: {report.unresolvedLegacyOrders}</strong><p>هذه الطلبات مستبعدة من التقارير الرسمية وتتطلب التسوية. القيمة المالية غير متاحة دون دليل تاريخي موثوق.</p></div></PageContainer>;
}
function Card({ label, amount }: { label: string; amount: string }) { return <div className="rounded border p-4"><p className="text-sm text-zinc-500">{label}</p><MoneyValue amount={amount} size="lg" /></div>; }
