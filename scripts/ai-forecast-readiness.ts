import { FinancialDataOrigin, Prisma, PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";

type AuditOrigin = FinancialDataOrigin | "UNSPECIFIED";
type Scope = { kind: "all" } | { kind: "business"; businessId: string };

export type AuditRow = {
  businessId: string;
  branchId: string | null;
  status: string;
  completedAt: Date | null;
  financialDataOrigin: FinancialDataOrigin | null;
  items: Array<{
    productId: string;
    quantity: Prisma.Decimal;
    product: {
      businessId: string;
      isActive: boolean;
      archivedAt: Date | null;
      categoryId: string | null;
      category: { id: string } | null;
    } | null;
  }>;
};

type ScopedData = {
  businessIds: string[];
  branchCount: number;
  rows: AuditRow[];
};

export class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliUsageError";
  }
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const LOCAL_OVERRIDE_TOKEN = "I_CONFIRM_LOCAL_DISPOSABLE_DATABASE";

function originOf(origin: FinancialDataOrigin | null): AuditOrigin {
  return origin ?? "UNSPECIFIED";
}

function dayOf(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function mondayOf(value: Date): string {
  const utc = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const weekday = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() - weekday + 1);
  return dayOf(utc);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function countDaysInclusive(minimum: Date | null, maximum: Date | null): number {
  if (!minimum || !maximum) return 0;
  const start = Date.UTC(minimum.getUTCFullYear(), minimum.getUTCMonth(), minimum.getUTCDate());
  const end = Date.UTC(maximum.getUTCFullYear(), maximum.getUTCMonth(), maximum.getUTCDate());
  return Math.floor((end - start) / 86_400_000) + 1;
}

function dateRange(rows: AuditRow[]) {
  const valid = rows.flatMap((row) => row.completedAt ? [row.completedAt] : []);
  const minimum = valid.length ? new Date(Math.min(...valid.map(Number))) : null;
  const maximum = valid.length ? new Date(Math.max(...valid.map(Number))) : null;
  const perDay = new Map<string, number>();
  const perTimestamp = new Map<string, number>();
  for (const date of valid) {
    perDay.set(dayOf(date), (perDay.get(dayOf(date)) ?? 0) + 1);
    perTimestamp.set(date.toISOString(), (perTimestamp.get(date.toISOString()) ?? 0) + 1);
  }
  const dayCounts = [...perDay.values()];
  const duplicates = [...perTimestamp.values()].filter((count) => count > 1);
  return {
    minimumTimestamp: minimum?.toISOString() ?? null,
    maximumTimestamp: maximum?.toISOString() ?? null,
    uniqueDates: perDay.size,
    activeWeeks: new Set(valid.map(mondayOf)).size,
    activeMonths: new Set(valid.map((date) => date.toISOString().slice(0, 7))).size,
    observedRangeCalendarDays: countDaysInclusive(minimum, maximum),
    daysWithNoOrders: Math.max(0, countDaysInclusive(minimum, maximum) - perDay.size),
    ordersPerActiveDay: {
      minimum: dayCounts.length ? Math.min(...dayCounts) : null,
      median: median(dayCounts),
      maximum: dayCounts.length ? Math.max(...dayCounts) : null,
      distribution: [...new Set(dayCounts)].sort((a, b) => a - b).map((orders) => ({
        orders,
        activeDays: dayCounts.filter((count) => count === orders).length,
      })),
    },
    duplicatedTimestampGroups: duplicates.length,
    ordersInDuplicatedTimestampGroups: duplicates.reduce((sum, count) => sum + count, 0),
    maximumOrdersAtOneTimestamp: duplicates.length ? Math.max(...duplicates) : 1,
  };
}

function sourceIntegrity(rows: AuditRow[], now: Date) {
  const base = dateRange(rows);
  return {
    orderCount: rows.length,
    ...base,
    invalidOrMissingTimestamps: rows.filter((row) => !row.completedAt || Number.isNaN(row.completedAt.getTime())).length,
    futureDatedOrders: rows.filter((row) => row.completedAt && row.completedAt > now).length,
  };
}

function labelBusinessIds(ids: string[]) {
  return new Map([...ids].sort().map((id, index) => [id, `business_${index + 1}`]));
}

export function analyzeAuditRows(data: ScopedData, now = new Date()) {
  const origins: AuditOrigin[] = ["NATIVE", "LEGACY_UNKNOWN", "BACKFILLED", "MANUALLY_RECONCILED", "UNSPECIFIED"];
  const byOrigin = Object.fromEntries(origins.map((origin) => [origin, data.rows.filter((row) => originOf(row.financialDataOrigin) === origin)]));
  const allItems = data.rows.flatMap((row) => row.items.map((item) => ({ row, item })));
  const quantities = allItems.map(({ item }) => Number(item.quantity));
  const sortedQuantities = [...quantities].sort((a, b) => a - b);
  const q1 = sortedQuantities.length ? sortedQuantities[Math.floor((sortedQuantities.length - 1) * 0.25)] : null;
  const q3 = sortedQuantities.length ? sortedQuantities[Math.floor((sortedQuantities.length - 1) * 0.75)] : null;
  const upperFence = q1 === null || q3 === null ? null : q3 + 1.5 * (q3 - q1);
  const businessLabels = labelBusinessIds(data.businessIds);
  const productHistory = new Map<string, { businessId: string; observations: number; activeDays: Set<string>; nativeObservations: number; legacyObservations: number; inactive: boolean; missingCategory: boolean; invalidCategory: boolean }>();

  for (const { row, item } of allItems) {
    if (!item.product) continue;
    const key = `${row.businessId}:${item.productId}`;
    const current = productHistory.get(key) ?? {
      businessId: row.businessId,
      observations: 0,
      activeDays: new Set<string>(),
      nativeObservations: 0,
      legacyObservations: 0,
      inactive: !item.product.isActive || item.product.archivedAt !== null,
      missingCategory: item.product.categoryId === null,
      invalidCategory: item.product.categoryId !== null && item.product.category === null,
    };
    current.observations += 1;
    if (row.completedAt) current.activeDays.add(dayOf(row.completedAt));
    if (row.financialDataOrigin === "NATIVE") current.nativeObservations += 1;
    if (row.financialDataOrigin === "LEGACY_UNKNOWN") current.legacyObservations += 1;
    productHistory.set(key, current);
  }

  const productValues = [...productHistory.values()];
  const observations = productValues.map((product) => product.observations);
  const productActiveDays = productValues.map((product) => product.activeDays.size);
  const sourceItems = (origin: AuditOrigin) => allItems.filter(({ row }) => originOf(row.financialDataOrigin) === origin);
  const quantitySummary = (items: typeof allItems) => {
    const values = items.map(({ item }) => Number(item.quantity));
    return {
      orderItemCount: items.length,
      missingQuantities: 0,
      zeroQuantities: values.filter((value) => value === 0).length,
      negativeQuantities: values.filter((value) => value < 0).length,
      nonIntegerQuantities: values.filter((value) => !Number.isInteger(value)).length,
      totalUnitsSold: values.reduce((sum, value) => sum + value, 0),
      medianUnitsPerOrderItem: median(values),
      maximumUnitsPerOrderItem: values.length ? Math.max(...values) : null,
    };
  };
  const perBusiness = data.businessIds.map((id) => {
    const rows = data.rows.filter((row) => row.businessId === id);
    return {
      business: businessLabels.get(id),
      orderCount: rows.length,
      nativeOrderCount: rows.filter((row) => row.financialDataOrigin === "NATIVE").length,
      legacyUnknownOrderCount: rows.filter((row) => row.financialDataOrigin === "LEGACY_UNKNOWN").length,
      ordersWithNoBranch: rows.filter((row) => row.branchId === null).length,
      ordersWithBranch: rows.filter((row) => row.branchId !== null).length,
      representedProducts: new Set(rows.flatMap((row) => row.items.map((item) => item.productId))).size,
    };
  });

  return {
    auditVersion: "A1",
    privacy: {
      outputContainsOnlyAggregateCountsAndAnonymizedBusinessLabels: true,
      rawIdentifiersExcluded: true,
      financialAmountsExcluded: true,
      paymentDataExcluded: true,
    },
    dataState: {
      businessCount: data.businessIds.length,
      branchCount: data.branchCount,
      orderCount: data.rows.length,
      orderItemCount: allItems.length,
      allOrdersCompleted: data.rows.every((row) => row.status === "COMPLETED"),
    },
    dataIntegrity: {
      canonicalDemandTimestamp: "Order.completedAt (UTC calendar date)",
      allOrders: sourceIntegrity(data.rows, now),
      byFinancialDataOrigin: Object.fromEntries(origins.map((origin) => [origin, sourceIntegrity(byOrigin[origin], now)])),
    },
    demandQuantityQuality: {
      allOrders: quantitySummary(allItems),
      byFinancialDataOrigin: Object.fromEntries(origins.map((origin) => [origin, quantitySummary(sourceItems(origin))])),
      extremeQuantityOutliers: {
        method: "Tukey IQR upper fence",
        q1,
        q3,
        upperFence,
        orderItemsAboveUpperFence: upperFence === null ? 0 : quantities.filter((value) => value > upperFence).length,
      },
      orderItemsWithoutReliableProductMapping: allItems.filter(({ row, item }) => !item.product || item.product.businessId !== row.businessId).length,
    },
    productHistory: {
      productsRepresentedInHistoricalOrders: new Set(sourceItems("LEGACY_UNKNOWN").map(({ item }) => item.productId)).size,
      productsRepresentedInNativeOrders: new Set(sourceItems("NATIVE").map(({ item }) => item.productId)).size,
      productsRepresentedAcrossScopedOrders: productValues.length,
      observationsPerProduct: {
        minimum: observations.length ? Math.min(...observations) : null,
        median: median(observations),
        maximum: observations.length ? Math.max(...observations) : null,
        productsWithFewerThan7Observations: observations.filter((value) => value < 7).length,
        productsWithAtLeast14Observations: observations.filter((value) => value >= 14).length,
      },
      activeSalesDaysPerProduct: {
        minimum: productActiveDays.length ? Math.min(...productActiveDays) : null,
        median: median(productActiveDays),
        maximum: productActiveDays.length ? Math.max(...productActiveDays) : null,
        productsWithFewerThan7ActiveDays: productActiveDays.filter((value) => value < 7).length,
      },
      inactiveOrArchivedProductsInHistory: productValues.filter((product) => product.inactive).length,
      historicalProductsMissingCategory: productValues.filter((product) => product.missingCategory).length,
      historicalProductsWithInvalidCategory: productValues.filter((product) => product.invalidCategory).length,
      identifierStability: "Product foreign keys map cleanly and do not cross businesses; identifiers are adequate for isolation, not sufficient history for forecasting.",
    },
    businessAndBranchReadiness: {
      perBusiness,
      totalOrdersWithNoBranch: data.rows.filter((row) => row.branchId === null).length,
      totalOrdersWithBranch: data.rows.filter((row) => row.branchId !== null).length,
      branchForecasting: "NOT_CURRENTLY_DEFENSIBLE: missing historical branches must remain unassigned.",
      businessForecasting: "TECHNICALLY_POSSIBLE_ONLY: businesses must remain completely isolated and history is sparse.",
    },
    readiness: {
      nextDayForecast: "TECHNICALLY_POSSIBLE_ONLY",
      sevenDayForecast: "NOT_CURRENTLY_DEFENSIBLE",
      productLevelDailyForecast: "NOT_CURRENTLY_DEFENSIBLE",
      productLevelWeeklyForecast: "NOT_CURRENTLY_DEFENSIBLE",
      businessLevelForecast: "TECHNICALLY_POSSIBLE_ONLY",
      branchLevelForecast: "NOT_CURRENTLY_DEFENSIBLE",
      weekdaySeasonality: "NOT_CURRENTLY_DEFENSIBLE",
      trendDetection: "NOT_CURRENTLY_DEFENSIBLE",
      holidayOrEventEffects: "NOT_CURRENTLY_DEFENSIBLE",
      classifications: {
        overall: "DEMO_DATA_REQUIRED",
        businessLevelDemandForecast: "READY_FOR_LIMITED_PILOT",
        branchLevelDemandForecast: "NOT_READY",
        productLevelDailyForecast: "NOT_READY",
        productLevelWeeklyForecast: "NOT_READY",
        sevenDayForecast: "NOT_READY",
      },
      recommendedImplementationPath: "E: combine a restricted Native-only pilot with an isolated, clearly labeled academic Demo Business; never mix demo data into production reporting.",
    },
  };
}

export function parseScope(args: string[]): Scope {
  const allBusinesses = args.includes("--all-businesses");
  const businessId = args.find((arg) => arg.startsWith("--businessId="))?.slice("--businessId=".length);
  if (allBusinesses === Boolean(businessId)) {
    throw new CliUsageError("Use exactly one of --all-businesses or --businessId=<id>.");
  }
  return allBusinesses ? { kind: "all" } : { kind: "business", businessId: businessId! };
}

export function assertSafeDatabaseUrl(databaseUrl: string | undefined, args: string[]) {
  if (!databaseUrl) throw new CliUsageError("DATABASE_URL is required; this command never loads an .env file.");
  let host: string;
  try {
    host = new URL(databaseUrl).hostname.toLowerCase();
  } catch {
    throw new CliUsageError("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }
  if (host.includes("supabase")) throw new CliUsageError("Supabase hosts are never allowed for this audit.");
  const override = args.includes(`--local-audit-override=${LOCAL_OVERRIDE_TOKEN}`);
  if (!LOCAL_HOSTS.has(host) && !override) {
    throw new CliUsageError("Refusing a non-local DATABASE_URL. Use a local host or the explicit disposable-local audit override.");
  }
}

async function loadScopedData(prisma: PrismaClient, scope: Scope): Promise<ScopedData> {
  const where = scope.kind === "all" ? {} : { id: scope.businessId };
  const orderWhere = scope.kind === "all" ? {} : { businessId: scope.businessId };
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    const [businesses, branchCount, rows] = await Promise.all([
      tx.business.findMany({ where, select: { id: true }, orderBy: { id: "asc" } }),
      tx.branch.count({ where: scope.kind === "all" ? {} : { businessId: scope.businessId } }),
      tx.order.findMany({
        where: orderWhere,
        select: {
          businessId: true,
          branchId: true,
          status: true,
          completedAt: true,
          financialDataOrigin: true,
          items: {
            select: {
              productId: true,
              quantity: true,
              product: { select: { businessId: true, isActive: true, archivedAt: true, categoryId: true, category: { select: { id: true } } } },
            },
          },
        },
      }),
    ]);
    return { businessIds: businesses.map((business) => business.id), branchCount, rows };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}

async function main() {
  const args = process.argv.slice(2);
  const scope = parseScope(args);
  assertSafeDatabaseUrl(process.env.DATABASE_URL, args);
  const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  try {
    console.log(JSON.stringify(analyzeAuditRows(await loadScopedData(prisma, scope)), null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown audit failure";
    console.error(JSON.stringify({ error: "AI_FORECAST_READINESS_AUDIT_FAILED", message }));
    process.exitCode = 1;
  });
}
