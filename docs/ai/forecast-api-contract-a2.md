# CafeFlow AI Forecast A2 — API and Result Contract

## Boundary

The A3 implementation should expose a server-only `getForecastForActiveContext` domain service and a refresh server action. Neither accepts a business ID. The page obtains authentication and active business context before calling the service; the refresh action accepts only a validated mode, scope selector, horizon, and opaque catalog/branch selection token.

There is no public REST endpoint in the MVP. If one is ever needed, it must call the same service, derive context from the session, apply the same rate limit, and return the same safe errors.

## Illustrative TypeScript contract

```ts
type ForecastMode = "REAL_PILOT" | "ACADEMIC_DEMO";
type ForecastScopeType = "BUSINESS" | "BRANCH";
type ForecastDataSource = "NATIVE_ONLY" | "DEMO_ONLY";
type ForecastQuality = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT_HISTORY";
type ForecastModelFamily = "SEASONAL_NAIVE" | "MOVING_AVERAGE" | "CROSTON" | "NONE";

type ForecastScope = {
  business: "ACTIVE_CONTEXT" | "ACADEMIC_DEMO";
  scopeType: ForecastScopeType;
  branch?: { displayLabel: string; opaqueReference: string };
};

type ForecastProduct = {
  displayLabel: string;
  opaqueReference: string;
};

type ForecastResult = {
  forecastMode: ForecastMode;
  scope: ForecastScope;
  product: ForecastProduct;
  forecastDate: string; // operational YYYY-MM-DD
  predictedQuantity: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  quality: ForecastQuality;
  modelFamily: ForecastModelFamily;
  trainingDateRange: { start: string | null; end: string | null };
  observationCount: number;
  activeSalesDays: number;
  generatedAt: string;
  explanatoryReason: string;
  dataSource: ForecastDataSource;
};

type ForecastRequest = {
  forecastMode: ForecastMode;
  scopeType: ForecastScopeType;
  horizonDays: 1 | 7;
  branchReference?: string;
  productReferences?: string[];
};

type ForecastServiceResponse =
  | { ok: true; results: ForecastResult[]; generatedAt: string }
  | { ok: false; code: "NOT_AUTHORIZED" | "INVALID_SCOPE" | "RATE_LIMITED" | "FORECAST_UNAVAILABLE"; message: string };
```

`predictedQuantity`, `lowerBound`, and `upperBound` are all `null` for `INSUFFICIENT_HISTORY`; this prevents a consumer from accidentally treating zero as a forecast. Bounds are quantities, never financial values. A result must have `lowerBound >= 0` and `upperBound >= lowerBound` when present.

## Eligibility and authorization mapping

| Request element | Server rule |
| --- | --- |
| Business | Always derive from active authenticated membership; ignore/reject supplied business identifiers |
| `REAL_PILOT` | Active membership and Native-only extractor; demo fixture is unreachable |
| `ACADEMIC_DEMO` | Active Owner or Manager only; service returns only the synthetic fixture |
| Business scope | Member must have authorized business context |
| Branch scope | Branch must belong to active business and be permitted by membership branch/scope |
| Product selection | Resolve opaque reference after business/branch authorization; reject unknown references generically |
| Refresh | Same authorization, then rate-limit before demand extraction |

The service does not expose raw database IDs in an external response. Opaque references are scoped to the authorized page session and must not be reusable as a cross-tenant lookup key.

## Safe failures

The client receives localized generic text. Detailed causes stay in structured server logs using only diagnostic codes and aggregate counts. `INSUFFICIENT_HISTORY` is a successful domain result because it tells the UI how to render safely; authorization and operational failures are error responses.

No request field may select a model family. Model selection is server-deterministic under A2 policy, so a caller cannot force an unbacktested model.
