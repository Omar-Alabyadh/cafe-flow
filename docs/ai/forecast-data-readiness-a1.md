# CafeFlow AI Forecast A1 — Data Readiness Audit

## Scope and safety

This audit used only the verified `cafeflow-post-f3-financial-freeze-20260712-070446.dump` backup (SHA-256 `F1EB6DE16255779C50E4EB089728FB0B56DEC56C98FE9B83EDA03BD9F4BA14A3`) restored into a disposable local PostgreSQL 17 UTF-8 cluster. No production, Supabase instance, migration, restored row, or financial workflow was accessed or changed. Results below are aggregate and anonymized; they contain no business, branch, product, order, user, or payment identifiers.

Demand is defined exclusively as `OrderItem.quantity`, attributed to the UTC calendar date of `Order.completedAt`. Prices, revenue, payments, `paidAt`, current product prices, and missing branch assignments are deliberately excluded.

## Verified data state

| Measure | Result |
| --- | ---: |
| Businesses / branches | 3 / 4 |
| Orders / order items | 100 / 158 |
| Native orders / items | 4 / 4 |
| `LEGACY_UNKNOWN` orders / items | 96 / 154 |
| Payments / financial-backfill batches | 4 / 2 |
| Completed orders | 100 / 100 |

## Integrity and activity density

All sources span **2026-04-07 13:30:59Z through 2026-07-12 04:10:36Z**: 97 calendar days, 16 active dates, 6 active weeks, and 4 active months. There are 81 no-order days inside that observed range. Active-day order counts are 1 order on 4 days, 2 on 3, 3 on 2, 4 on 1, 6 on 1, 7 on 3, 8 on 1, and 43 on 1 (median 3, maximum 43). There are no duplicated `completedAt` timestamps and no future-dated orders.

`LEGACY_UNKNOWN` alone covers 2026-04-07 13:30:59Z through 2026-07-11 15:05:28Z (15 active dates, 6 weeks, 4 months); it has 2 missing `completedAt` values. Native data covers only 2026-07-12 02:25:41Z through 04:10:36Z: 1 active date, 1 week, 1 month, and no missing timestamp. The 2 missing timestamps cannot contribute to a dated demand series.

This is a sparse and highly irregular series, with a single 43-order day. It is technically queryable but cannot support statistically meaningful daily seasonality, trend, or multi-day validation.

## Demand quantity quality and products

All 158 order items have positive integer quantities: no missing, zero, negative, or fractional quantity. Total recorded demand is 615 units; median line quantity is 1 and maximum is 52. The Tukey IQR upper fence is 8.5 units, with 14 lines above it. These high quantities are valid recorded values but need robust treatment and review in any future model.

All order items map to a product and no product crosses business boundaries, so product identity is stable enough for tenant-isolated aggregation. Seven products appear in historical orders; only one appears in Native orders. Per-product observations range 3–55 (median 14); 2 products have fewer than 7 observations. Active sales days per product range 1–11 (median 3), with 6 of 7 below 7 active days. No inactive/archived product appears historically. Six historical products have a valid category across three categories; one has no category. Category data is descriptive only and is far too sparse for category-based modelling.

## Business and branch readiness

The three anonymized business aggregates are: 58 historical / 0 Native orders; 0 / 0; and 38 historical / 4 Native orders. The first two have no branch-attached sales. Of all 100 orders, 96 have no branch (all `LEGACY_UNKNOWN`); 4 Native orders belong to one branch. Missing historical branches must never be inferred or assigned.

Businesses must remain completely isolated: product identifiers and demand histories are tenant-specific. Business-level aggregation is technically possible only as a restricted pilot/diagnostic, while branch-level forecasting is not defensible.

## Time-series and model decision

| Capability | Classification |
| --- | --- |
| Next-day, business-level | Technically possible only |
| Seven-day | Not currently defensible |
| Product daily / product weekly | Not currently defensible |
| Branch level | Not currently defensible |
| Weekday seasonality, trend, holiday/event effects | Not currently defensible |

The safest initial model family, when sufficient history exists, is a **seasonal-naive baseline** (where weekly history supports it), compared against a short moving average and exponential smoothing. For intermittent products, compare a Croston-style method. A regularized calendar-feature regression is only appropriate after materially more dated observations. Heavier ML is unjustified without rolling backtests that beat these baselines.

Use leakage-safe rolling-origin evaluation: train only through each cutoff, forecast the next day and the next 7 days, then advance the cutoff. Compare MAE, WAPE, and signed bias against the naive baseline. Require at least 8 active weeks for a weekly baseline and at least 28 active daily observations spanning 8 weeks for a daily product model; otherwise return `INSUFFICIENT_HISTORY`, not a confident number. Expose a quality label (insufficient / low / validated) and never show an unreliable forecast as confident.

## Final readiness and implementation path

| Scope | Classification |
| --- | --- |
| Current production data overall | `DEMO_DATA_REQUIRED` |
| Business-level demand forecast | `READY_FOR_LIMITED_PILOT` |
| Branch-level demand forecast | `NOT_READY` |
| Product-level daily forecast | `NOT_READY` |
| Product-level weekly forecast | `NOT_READY` |
| Seven-day forecast | `NOT_READY` |

Choose **E**: combine a tightly restricted Native-only pilot with an isolated, clearly labelled academic Demo Business; never mix demo demand into real production reports. Do not generate demo data in A1. Historical quantities may remain useful only as anonymized business-level exploratory evidence; they are not adequate for a real production demand forecast.
