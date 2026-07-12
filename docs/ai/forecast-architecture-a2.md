# CafeFlow AI Forecast A2 — Production-Safe Architecture

## Decision

Adopt a two-mode architecture with a strict data boundary:

| Mode | Purpose | Eligible data | Result when gates fail |
| --- | --- | --- | --- |
| `REAL_PILOT` | Limited real-business pilot | Completed, timestamped, tenant-scoped `NATIVE` order quantities only | `INSUFFICIENT_HISTORY` |
| `ACADEMIC_DEMO` | Thesis demonstration | Deterministic, isolated synthetic demand fixture only | `INSUFFICIENT_HISTORY` only if the fixture is malformed |

This is the safe response to A1: the real dataset has just 4 Native orders on one date, while 96 legacy orders lack trusted branches. The system forecasts demand quantities only. It never derives historical revenue, price, payment method, `paidAt`, or a missing branch.

## Invariants

- A real forecast is scoped to the active server-derived business. Data from two businesses is never pooled.
- `REAL_PILOT` reads only `Order.status = COMPLETED`, a non-null `completedAt`, `financialDataOrigin = NATIVE`, order-item quantity, and a product owned by that business.
- A branch forecast additionally requires a non-null branch in that business and a trusted native branch attribution. Legacy missing branches remain absent.
- `ACADEMIC_DEMO` is generated outside `Business`, `Order`, `OrderItem`, `Payment`, inventory, and report storage. It therefore cannot enter financial or operational reports.
- The forecast domain is read-only. It never changes orders, order items, payments, inventory, stock movements, or document sequences.
- A failed history gate produces a typed result with `quality = INSUFFICIENT_HISTORY`, no predicted quantity, and an explanatory reason.

## Demand extraction pipeline

1. Resolve the authenticated user and active business context on the server.
2. Resolve the requested mode. The client may request a mode and horizon, never a business ID.
3. For `REAL_PILOT`, filter completed Native orders by the derived business ID; exclude rows without `completedAt`, products outside that business, and all financial fields.
4. For branch scope, also filter to the selected authorized branch and require trusted Native branch attribution. Do not backfill or infer branch IDs.
5. Aggregate `OrderItem.quantity` by operational business/branch day and product. Include zero-demand calendar days between the first and last eligible date so intermittency is measurable.
6. Apply gates, then select and backtest only the allowed simple models. Return a forecast contract or insufficient history.
7. For `ACADEMIC_DEMO`, obtain observations from the deterministic fixture generator instead of Prisma. Its data source is permanently `DEMO_ONLY`.

The extractor must select no money, price, payment, tax, discount, currency, receipt, or inventory column. It should use a PostgreSQL read-only transaction when it reaches the database.

## Conservative history gates

All rules use the local operational date of the authorized scope, not a client-supplied timezone. “Fresh” means the last eligible observation is no more than seven calendar days before generation.

| Capability | Minimum gate |
| --- | --- |
| Business next-day | 56 calendar days of coverage, 8 distinct active weeks, 28 active sales dates, 40 qualifying Native orders, fresh data |
| Branch next-day | Business gate plus 84 calendar days, 12 active weeks, 42 active sales dates, 60 qualifying Native orders, and every included order has trusted native branch attribution |
| Product next-day | Its parent scope passes; product has 56 calendar days of coverage, 50 order-item observations, 28 active sales dates, 8 active weeks, and fresh data |
| Any seven-day result | Relevant next-day gate plus 84 calendar days, 12 active weeks, 56 active sales dates for business/branch (42 for product), and at least 3 historical observations for every weekday requested |
| Seasonal naive candidate | Relevant gate plus at least 3 prior matching weekday values for each forecasted weekday |
| Moving-average candidate | Relevant gate plus 28 consecutive calendar observations; zero days are retained; no more than 25% missing dates |
| Croston-style candidate | Relevant product gate plus 84 calendar days, 20 non-zero demand dates, and non-zero demand on at most 50% of covered dates |

These are eligibility gates, not a promise of forecast quality. A1 fails every real-pilot gate today, so A3 must return `INSUFFICIENT_HISTORY` for real data rather than a number.

## Deterministic model policy

1. Always construct the seasonal-naive baseline when its weekday rule is met. It predicts the most recent same-weekday quantity.
2. Evaluate a 7-day moving average only for dense, stable series; it cannot replace the baseline merely because it runs.
3. Evaluate Croston-style intermittent-demand forecasting only for eligible intermittent products.
4. Select a non-baseline candidate only when it has lower WAPE by at least 5% than seasonal naive, no worse MAE, and acceptable bias. Otherwise retain seasonal naive.
5. If no candidate passes or the baseline is ineligible, return `INSUFFICIENT_HISTORY`.
6. Regularized calendar regression is a future candidate only after the same gate, successful backtests, and a documented experiment. Neural networks, boosted trees, and LLM forecasting are out of scope.

Predicted quantities are non-negative. Bounds are empirical residual bounds from backtesting, clipped at zero. They are uncertainty intervals, not a confidence percentage.

## Leakage-safe backtesting and quality

Use rolling-origin folds. For each cutoff, train only on dates before the cutoff, predict the next day (and separately the next seven days), compare against observations, then advance the cutoff. Calendar expansion must be calculated from the training window only. Product, branch, and business series remain isolated in every fold.

Each model is evaluated against the seasonal-naive baseline with MAE, WAPE, and signed bias: `sum(predicted - actual) / sum(actual)` where the denominator is non-zero. Folds with no actual demand report MAE but do not define WAPE; they must not improve a candidate by omission.

| Quality | Requirements |
| --- | --- |
| `HIGH` | 8+ valid folds; WAPE <= 0.25; absolute bias <= 0.10; no material degradation against baseline |
| `MEDIUM` | 6+ valid folds; WAPE <= 0.35; absolute bias <= 0.15; selected policy passes |
| `LOW` | 4+ valid folds; WAPE <= 0.50; absolute bias <= 0.25; selected policy passes; UI warns users |
| `INSUFFICIENT_HISTORY` | Any history gate fails, fewer than 4 valid folds, WAPE undefined for all folds, or no candidate/baseline passes |

Reject a model whose WAPE exceeds 0.50, absolute bias exceeds 0.25, has fewer than four valid folds, or is not at least as good as the baseline under the selection rule. The fallback is a passing seasonal-naive baseline; otherwise it is `INSUFFICIENT_HISTORY`.

## Computation and storage

For the MVP, calculate on demand through a server-only service. Do not add forecast tables, a cache, a scheduler, or a migration. A request-local deduplication key and a small per-user/per-business rate limit are sufficient computation guards for the deadline. The UI shows `generatedAt`; it does not imply persistence.

If later measurements show a persistent cache is necessary, introduce it only in a separate approved migration. A proposed `ForecastRun` would contain `businessId`, nullable `branchId`, `forecastMode`, `dataSource`, opaque product reference, horizon, model family/version, training start/end, observation and active-day counts, bounds, generated timestamp, expiry, and a demo-isolation marker. It must have a composite tenant/mode/source index and never be queried by financial reporting. This is a schema proposal only, not an A2 change.

## Server/API boundary and authorization

Use a server-only forecast domain service invoked by the dashboard server component and a narrowly typed server action for a refresh. Do not expose a public, arbitrary-business forecast API.

- Require an authenticated session and `getCurrentBusinessMemberContext`-style active context.
- The service derives `businessId` from that context. A client cannot submit one.
- Owner and Manager may select forecast configuration and `ACADEMIC_DEMO`; read access for other roles is deferred until an explicit `forecasts.view` permission exists.
- For branch scope, validate that the requested branch belongs to the derived business and that the member has `ALL_BRANCHES` or the exact authorized branch. A branch-only member cannot select another branch.
- Treat product selection as an opaque, server-validated reference from the already authorized catalog; never trust a client-provided raw ID as scope.
- Return generic `NOT_AUTHORIZED`, `INVALID_SCOPE`, `RATE_LIMITED`, and `FORECAST_UNAVAILABLE` messages. Log diagnostic codes without raw identifiers or row data.
- Enforce a per-user and per-active-business computation limit (for example, 6 refreshes per minute) before extraction; reject concurrent duplicate requests.

The typed response contract and error boundaries are specified in [forecast-api-contract-a2.md](forecast-api-contract-a2.md).

## UI architecture

Add a dashboard navigation entry, **AI Forecast / التوقع الذكي**, without redesigning existing pages. Arabic is the default reading order and English equivalents remain available.

The page receives an already authorized server result and has five explicit states: loading skeleton, available forecast, insufficient history, demo mode, and recoverable error. It shows a scope selector, one- or seven-day horizon selector, product cards/table, high-demand products, data-quality explanation, model explanation, bounds, and last-generated timestamp. It never shows revenue, price, payment, or a fabricated percentage confidence.

`ACADEMIC_DEMO` has a persistent high-contrast badge: **Demo Forecast / توقع تجريبي**. It also states that the series is synthetic and not a real business result. `LOW` quality has a visible warning; `INSUFFICIENT_HISTORY` replaces numeric cards with the specific gate that failed and a next-data-needed explanation.

## Security and privacy review

| Threat | Control |
| --- | --- |
| Tenant leakage | Server-derived business context; every query filters business before product/branch; no cross-tenant aggregation |
| Demo/real mixing | Separate data-source enum; demo fixture never enters Prisma operational tables or report queries; mode shown in every result |
| Unauthorized access | Authentication, Owner/Manager configuration rule, membership and branch validation, safe denial responses |
| ID exposure | No arbitrary business IDs; opaque product/branch selection references; aggregate diagnostics only |
| Repeated expensive generation | Per-user/business rate limit, duplicate-request guard, bounded horizon/model set |
| Stale result | No persistent cache in MVP; `generatedAt` is displayed; future cache requires expiry and training-window metadata |
| Misleading confidence | Quality labels and residual bounds, no percentage; inadequate history returns no prediction |
| Prompt injection | Not applicable: A2 introduces no LLM or untrusted natural-language prompt path |

## Academic rationale and limitations

A1 found only 16 active dates over 97 days, one Native day, sparse product histories, and untrusted branch history. Building a complex production model from this would overfit and misrepresent certainty. Seasonal naive, moving average, and Croston-style methods are explainable baselines whose performance can be tested honestly with rolling-origin splits. The isolated synthetic demo is academically honest because it is explicitly labelled, deterministic, and excluded from production reporting; it demonstrates the interface and evaluation method without claiming fabricated history is real.

Future work requires more Native daily demand, trusted branches, documented promotions/holidays, formal experiment tracking, monitoring for drift, and a separately approved cache or persistence design. No forecast should influence financial, inventory, purchasing, or staffing decisions until it has passed the stated gates and backtests.
