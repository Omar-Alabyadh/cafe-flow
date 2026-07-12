# CafeFlow AI Forecast A5 — Arabic-First Bilingual UI

## Route and navigation

The localized dashboard route is `/{locale}/dashboard/business/ai-forecast`, implemented at `app/[locale]/(dashboard)/dashboard/business/ai-forecast/page.tsx`. One new **AI Forecast / التوقع الذكي** item appears in the existing Management & Reports sidebar group after Reports, using the existing Sparkles icon. The sidebar role policy exposes it only to Owner and Manager; the server remains the final authority.

The route follows the existing dashboard App Router and `next-intl` conventions. The surrounding locale layout supplies `dir="rtl"` for Arabic and `dir="ltr"` for English, so the page preserves the application’s light, dark, and system theme behavior without a redesign.

## Authorization and server boundary

The page performs the existing authenticated-user and active-business-context checks before rendering selectors. It returns the existing unauthorized state for non-Owner/Manager users. It reads only the active business’s active branches to prepare safe selector values.

The only new boundary is `actions.ts`, a `use server` action. The client submits only mode, scope, one of the two supported horizons, and an opaque `branch-N` selector value. It never sends a business, membership, user, order, payment, product, or database record. For branch scope, the action resolves `branch-N` against the current active business on the server, checks branch access, and then calls the A4 server-only service. A4 repeats authentication, membership, tenant, branch, and mode/data-source validation.

No public endpoint, cache, job, persistence table, migration, or database write was added.

## User flows

### REAL_PILOT

The Arabic label is **البيانات الحقيقية — تجربة محدودة** and English is **Real Data — Limited Pilot**. The mode card explains that only trusted Native demand is used, `LEGACY_UNKNOWN` history is excluded, and insufficient history is expected to block a forecast for the current real dataset. It never changes to Demo automatically.

### ACADEMIC_DEMO

The Arabic label is **توقع تجريبي** and English is **Demo Forecast**. It calls A4’s in-memory deterministic A3 fixture only. Returned Demo metadata triggers a prominent bilingual banner that states the data is synthetic for academic demonstration, not real café history, and does not enter orders, payments, inventory, reports, or analytics. Demo supports business scope only.

## Controls and states

Controls include mode, business/branch scope, server-authorized branch selector, next-day/next-seven-days horizon, and explicit Generate Forecast button. A5 intentionally omits product filtering until a future UI can present stable safe product references without an automatic demand query. The page never generates a forecast on render.

The client keeps its selected controls while showing safe recoverable errors. It disables the fieldset and submit button while the server action is pending, exposes an `aria-live` result region, and has explicit initial, loading, success, insufficient-history, Demo, unauthenticated, forbidden, invalid scope/input, computation-limit, and internal-error paths.

For `INSUFFICIENT_HISTORY`, it renders exactly:

> There is not enough historical data to generate a reliable forecast.

The Arabic equivalent is complete and localized. The state displays no invented quantity, chart, or confidence percentage and explains that CafeFlow intentionally avoids unreliable predictions.

## Results, quality, models, and metrics

Available results use a responsive semantic table with product label, date, predicted quantity, lower/upper bounds, quality, and model. Null, negative, `NaN`, infinite, and malformed values render as localized “Unavailable”; they never render as zero. The highest finite quantity receives an **Expected higher demand / طلب متوقع أعلى** cue based on quantity only.

The summary includes mode, data source, authorized branch label, generated timestamp, training range, observations, and active sales days. No raw identifiers or financial values are rendered. `HIGH`, `MEDIUM`, `LOW`, and `INSUFFICIENT_HISTORY` have text labels and accessible descriptions, not color-only meaning or a fake confidence percentage.

The disclosure section explains Seasonal Naive, Moving Average, and Croston in both languages. It states that numeric forecasting uses explainable statistical methods selected through history gates and rolling-origin backtesting—not an LLM or neural network. When A4 provides safe aggregate metrics, MAE, WAPE, and bias are formatted locally and explained without treating them as production-readiness proof.

## Security, privacy, and performance

The Client Component imports only the server-action reference and safe types; it imports no Prisma or server-only module. The client DTO includes safe labels/references, not Business, Membership, Branch, Order, or Payment IDs. Client errors are translated from safe A4 codes; SQL, Prisma details, paths, exceptions, and stack traces are never displayed.

Generation occurs only after an explicit action. A5 inherits A4’s limits: horizons 1/7, 180-day history window, 5,000 orders, 20 products, and the process-local duplicate guard. It adds no localStorage, persistent cache, scheduler, chart dependency, or database write. Durable distributed rate limiting remains future work.

## Thesis screenshots to capture later

- Arabic initial state
- English initial state
- Real Data insufficient-history state
- Demo banner
- Demo forecast results
- Model explanation disclosure
- Backtesting metrics section

## Known limitation

A5 presents the A4 response honestly. The A1 dataset’s current Native history does not meet the approved product/branch/seven-day gates, so Real Data normally returns insufficient history. The Demo mode demonstrates the engine and interface without claiming synthetic data is real.
