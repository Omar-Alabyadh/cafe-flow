# CafeFlow AI Forecast A4 — Secure Server Integration

## Integration shape

A4 adds a server-only adapter, `lib/ai/forecast/server/forecast-server.ts`, over the pure A3 engine. It exports `getForecastReadiness`, `generateRealPilotForecast`, and `generateAcademicDemoForecast` for a future server component or server action. No public API route, UI page, navigation item, server action, cache, scheduler, persistence table, migration, or write path is added in A4.

The adapter uses the existing `getCurrentUserId`, `getCurrentBusinessMemberContext`, `canAccessBranch`, and shared Prisma client patterns. The orchestration service is dependency-injected so its authorization, extraction, engine invocation, and DTO mapping are testable without a database.

## Authentication, authorization, and tenant isolation

1. The service requires an authenticated user; otherwise it returns `UNAUTHENTICATED`.
2. It resolves the active business and membership on the server. A client request has no business-ID field; an attempted extra `businessId` is rejected as `INVALID_INPUT`.
3. A missing or invalid membership returns `FORBIDDEN`. A4 initially permits only `OWNER` and `MANAGER` for both real and demo forecasting.
4. For branch scope, the service applies existing `canAccessBranch`, then reads the branch with both the derived `businessId` and the submitted branch reference. A branch outside the current tenant is `INVALID_SCOPE`; an unauthorized member is `FORBIDDEN`.
5. Database identifiers remain internal. DTOs have only safe sequential product references, display labels, authorized branch display labels, and aggregate forecast information.

## Native-only real-demand extraction

The Prisma adapter uses a single bounded `Order.findMany` query. It filters by the server-derived business, `OrderStatus.COMPLETED`, `FinancialDataOrigin.NATIVE`, non-null `completedAt`, and a maximum 180-day window. It takes at most 5,000 order rows and orders deterministically by completion then creation timestamp.

The selected fields are only branch attribution, completion timestamp, data-origin markers, order-item quantity, and product identity/ownership/activity/display fields. No `Payment` query occurs. No price, subtotal, total, tax, discount, currency, receipt, payment method, revenue, inventory, or order identifier is selected or supplied to A3.

Extraction checks again in the service before mapping: completed state, Native origin, valid timestamp, active non-archived product belonging to the active business, and finite positive quantity. Demand is grouped by product, preserving separation. Empty eligible history produces a client-safe `INSUFFICIENT_HISTORY` DTO rather than an exception.

## Business and branch scope

Business scope aggregates only eligible Native quantities across the active business while keeping each product as a separate A3 series. Branch scope adds an exact authorized branch match and requires `branchDataOrigin = NATIVE` for every included record. Null branches and legacy/untrusted branch attribution are excluded; missing branches are never inferred.

The A3 branch history gate still decides whether a numerical result is defensible. A4 does not change the A1 conclusion: the present real dataset should normally return insufficient history.

## Demo flow

`ACADEMIC_DEMO` is Owner/Manager-only and business scope only. It invokes `generateAcademicDemoDemand` from A3 and never calls the order-demand repository. It returns exact `ACADEMIC_DEMO` / `DEMO_ONLY` metadata plus **Demo Forecast / توقع تجريبي** labels. It creates no rows and cannot enter POS, payments, financial reports, inventory, sales analytics, or any operational query.

## Computation boundaries

Supported horizons are exactly one and seven days. The history query is bounded to 180 days and 5,000 orders; at most 20 products are forecast per request. Product selection uses a server-mapped safe `product-N` reference, not a client-supplied database product ID. Unsupported horizons, malformed scope selectors, and non-existent product references return safe typed errors.

The MVP has a process-local in-progress guard keyed by the authenticated internal request scope. It prevents duplicate concurrent computation but is not a durable distributed rate limiter. Durable per-user/per-business rate limiting and observability are future work; no new dependency was introduced.

## Client-safe DTO and errors

The DTO includes mode, data source, scope type, authorized branch label, safe product reference/label, forecast values and dates, bounds, quality, model family, training range, observation and active-day counts, generation time, explanation, aggregate MAE/WAPE/bias/fold count when available, demo labels, and an explicit insufficient-history state. It never contains raw business, membership, branch, product, order, payment, or Prisma details, and it never contains a numeric confidence percentage.

Safe errors are limited to `UNAUTHENTICATED`, `FORBIDDEN`, `INVALID_SCOPE`, `INVALID_INPUT`, `INSUFFICIENT_HISTORY`, `COMPUTATION_LIMIT`, and `INTERNAL_ERROR`. SQL, stack traces, and raw identifiers are not returned.

## Read-only guarantee and limitations

The only database methods in A4 are `findFirst` for branch validation and `findMany` for the bounded order read. There are no mutations, transactions, migrations, persistence tables, production scripts, or connections made during development or testing. The A4 tests use injected mocks; no database was accessed.

A5 may add the Arabic-first UI and a narrow server action that calls these server-only functions. It must not accept arbitrary business IDs, weaken the Native-only query, expose raw identifiers, or represent insufficient history as a confident numeric forecast.
