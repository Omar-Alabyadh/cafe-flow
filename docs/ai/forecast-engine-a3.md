# CafeFlow AI Forecast A3 — Explainable Forecast Engine

## Scope and safety

A3 implements a pure TypeScript demand-forecasting core. It has no Prisma import, database access, financial field, API route, server action, UI, migration, cache, scheduler, or runtime dependency beyond the project’s existing TypeScript toolchain. It consumes only trusted scope references, product keys, date-only demand quantities, optional trusted branch references, and a data-source classification.

The engine supports exactly two non-mixable modes: `REAL_PILOT` with `NATIVE_ONLY` data, and `ACADEMIC_DEMO` with `DEMO_ONLY` data. A mode/source mismatch, product mix, scope mix, or source mix fails closed. Ordinary lack of history is not an exception: it returns typed `INSUFFICIENT_HISTORY` results with null quantity and bounds.

## Contracts and date handling

`DemandObservation` deliberately contains only `date`, `productKey`, `quantity`, `scopeReference`, optional trusted branch information, and `dataSource`. It has no price, amount, tax, discount, payment, currency, inventory, order, or user field. `ForecastResult` contains the mode, scope, product key, date, quantity bounds, quality, model family, training range, observation statistics, generation timestamp, reason, and data source; it has no confidence percentage.

Dates use strict `YYYY-MM-DD` calendar semantics. Validation reconstructs the date with `Date.UTC`, date addition uses UTC calendar operations, and weekday/week calculations never use the local machine timezone. Demand is normalized into a complete zero-filled daily sequence from first to last date, so intermittent demand is measurable without treating missing dates as unknown demand.

## Implemented algorithms

### Seasonal naive

For each target date, seasonal naive returns the latest earlier observation with the same ISO weekday. It is the approved baseline because it is easy to explain and gives a meaningful weekly comparison when at least three matching weekday observations exist.

### Simple moving average

The implementation returns the arithmetic mean of the most recent seven daily values. It is considered only for dense series (at least half the periods have demand) with coefficient of variation at most 1.5. Multi-day forecasts are recursive: a previous prediction, never a future actual, becomes the next history point.

### Croston-style intermittent forecasting

The implementation maintains exponentially smoothed non-zero demand size and interval estimates using `alpha = 0.1`, then forecasts their ratio. It is considered only for intermittent product series with at least 84 calendar days and 20 non-zero periods. It is an explainable option for demand with many zero days, not a generic replacement for the baseline.

All model outputs must be finite and non-negative. Final quantities and bounds are rounded to two decimal places. Bounds use the selected model’s rolling-origin MAE as a residual scale (`±1.96 × MAE`, minimum width one unit), clipped at zero; they are uncertainty bounds, not statistical confidence percentages.

## History gates

| Gate | Next-day | Seven-day |
| --- | ---: | ---: |
| Daily observations | 50 | 84 |
| Calendar coverage | 56 days | 84 days |
| Active sales days | 28 | 42 |
| Active sales weeks | 8 | 12 |
| Weekday repetitions | 3 for every requested weekday | 3 for every requested weekday |
| Branch scope | trusted branch reference on every included point | same |
| Croston candidate | 84 days and 20 non-zero periods | same |

The core receives daily demand rather than private order rows, so the A2 “qualifying Native order count” must be enforced at A4 extraction time before data enters this contract. The A3 gates are additional conservative checks; they cannot make the current A1 real dataset eligible.

## Rolling-origin backtesting and metrics

For each fold, the engine slices training observations strictly before the evaluation origin. It recursively forecasts the next one or seven dates without inserting future actuals. The engine exposes aggregate fold count, aggregate MAE, WAPE, and signed bias only.

- `MAE = mean(abs(predicted - actual))`
- `WAPE = sum(abs(predicted - actual)) / sum(actual)`
- `bias = sum(predicted - actual) / sum(actual)`

When all actual demand is zero, WAPE and bias are `null`, never `NaN` or infinity. At least four valid folds are required. A candidate is rejected if it has fewer than four folds, invalid predictions, WAPE above 0.50, absolute bias above 0.25, or an undefined WAPE/bias.

## Deterministic model selection and quality

Seasonal naive is evaluated whenever weekday repetition is sufficient. Moving average is evaluated only for stable dense demand; Croston only for sufficiently long intermittent demand. A non-baseline candidate wins only if it improves WAPE by at least 5% without worsening MAE. Otherwise the passing seasonal-naive baseline remains selected. If the baseline fails, no model is selected.

| Quality | Backtest rule |
| --- | --- |
| `HIGH` | 8+ folds, WAPE <= 0.25, absolute bias <= 0.10 |
| `MEDIUM` | 6+ folds, WAPE <= 0.35, absolute bias <= 0.15 |
| `LOW` | 4+ folds, WAPE <= 0.50, absolute bias <= 0.25 |
| `INSUFFICIENT_HISTORY` | A history gate, fold, metric, baseline, or stability rule fails |

Quality is based on observed backtesting behavior and history, not on the fact that a result is Demo data. No model is selected merely because it executes.

## Deterministic academic Demo data

`generateAcademicDemoDemand` creates an in-memory fixture with a fixed documented seed, `CAFeflow-A3-DEMO-2026-01`. It produces exactly 120 explicit dates beginning 2026-01-01 and four neutral keys: `demo-product-1` through `demo-product-4`.

- Product 1 is a stable weekday-pattern series with quieter weekends.
- Product 2 is intermittent and contains many zero-demand dates.
- Product 3 has a bounded upward trend.
- Product 4 has an additional weekday pattern.
- Three documented controlled outliers are injected.

All quantities are non-negative integers. The generator labels every observation `ACADEMIC_DEMO` / `DEMO_ONLY`; it contains no real identifiers or financial/operational fields and performs no writes. Identical seed input produces structurally identical output.

## Limitations and A4 boundary

This is an explainable AI/ML demand feature because it turns historical quantities into testable forecasts, selects models through leakage-safe empirical evaluation, and communicates uncertainty and insufficiency explicitly. It is not a production integration yet. A4 must add server-derived tenant context, read-only Native extraction, access control, request limiting, and UI/API boundaries without weakening the A3 contract. It must return insufficient history for the current real dataset until A2 gates are genuinely met.
