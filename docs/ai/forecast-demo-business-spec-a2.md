# CafeFlow AI Forecast A2 — Academic Demo Business Specification

## Purpose and identity

The demo is an academic simulation, not a customer tenant and not production history. Its visible name is **CafeFlow Academic Demo / بيانات CafeFlow التجريبية** and every forecast page includes **Demo Forecast / توقع تجريبي** plus the sentence “Synthetic academic data — not real sales.”

For the MVP, “Demo Business” is a server-only deterministic fixture, not a `Business` database row. This is the strongest isolation available under the financial freeze: it cannot appear in financial reports, POS, payments, inventory, sales analytics, orders, or database backups because it is never written there.

## Dataset requirements for A3

- 120 generated calendar days (permitted range: 90–180), in the configured demo operational timezone.
- 8–12 clearly labelled synthetic products across at least three synthetic categories.
- Daily quantity observations only; no price, revenue, discount, tax, payment, inventory, or customer data.
- A weekday pattern for several products, including quieter weekend demand where appropriate to the scenario.
- At least two intermittent products with many zero-demand days.
- One controlled, documented upward or downward trend with a bounded slope.
- A small number of deterministic outlier days; outliers must be recorded in fixture metadata for explanation.
- A fixed published seed, for example `CAFeflow-A3-DEMO-2026-01`, and a version string. Same seed/version must reproduce the same output exactly.

Synthetic observations should be constructed by a deterministic pseudo-random generator from explicit base demand, weekday multiplier, trend, intermittency probability, and documented outlier schedule. The generator must never call external services, use production rows as a seed, or claim that its outputs are observed sales.

## Access and isolation

- Only an authenticated Owner or Manager of the currently active real business may enter demo mode.
- Demo mode ignores the active business catalog, branch, orders, and financial state. It does not disclose them.
- The demo uses a display-only synthetic business scope. It is not selectable in business switching and has no branch-level demo forecast in the MVP unless an independent synthetic branch fixture is added later.
- Demo forecasts always return `dataSource = DEMO_ONLY` and `forecastMode = ACADEMIC_DEMO`.
- Demo outputs are excluded by construction from official financial reports; no report change is required.

## Safe creation and removal

In A3, add a server-only fixture module and deterministic generator only after separately approving implementation. Do not create Prisma records, payments, orders, products, stock movements, or migrations. Tests should assert deterministic generation, the demo label, Owner/Manager restriction, `DEMO_ONLY` data source, and inability to reach report extractors.

In A4, remove the demo by deleting the fixture module, its isolated service branch, and its UI entry. Since no database data is created, removal requires no deletion job, migration, financial reconciliation, or historical backfill. A later decision to persist demo fixtures would require a new security review, an explicit demo registry, report-exclusion tests, and separate migration approval.

## Academic presentation

The thesis must state that the demo validates architecture, model selection, rolling-origin evaluation, and user communication—not real-world forecast accuracy. Charts must label synthetic dates and quantities, show the deterministic seed/version in an appendix, and never compare demo outcomes to production revenue.
