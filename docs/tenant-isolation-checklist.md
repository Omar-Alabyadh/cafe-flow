# CafeFlow Tenant Isolation Checklist

CafeFlow is a multi-tenant SaaS. Every request must stay inside one verified business context.

## Isolation rules

1. Never trust client-provided `businessId` without verifying membership/ownership server-side.
2. Scope all business data reads/writes by trusted `businessId` from auth context.
3. Scope branch-level operations by both `businessId` and `branchId` together.
4. Keep platform operator routes separate from tenant business routes.
5. UI hiding is not security; route guards and server action checks are mandatory.

## Where enforcement happens

- Membership/tenant context resolver: `lib/authorization/context.ts`
- Owner ownership checks: `lib/business/current-business.ts`
- Platform boundary gate: `app/[locale]/(dashboard)/dashboard/platform/layout.tsx`
- Platform identity check: `lib/platform/require-platform-operator.ts`
- Staff invite acceptance tenant-binding: `app/[locale]/invite/[token]/actions.ts`
- Staff management server-side tenant checks: `app/[locale]/(dashboard)/dashboard/business/staff/actions.ts`

## Why this is critical

- Tenant leakage breaks confidentiality between businesses.
- Cross-tenant access invalidates trust in SaaS billing, staff permissions, and audit logs.
- A secure tenant boundary is required before any demo or production rollout.
# CafeFlow — Tenant isolation verification (internal)

Multi-tenant SaaS security depends on **server-side `businessId` scoping**, not on hiding links in the UI. This checklist is for manual regression before system testing and demo.

## Principles

1. Every business-scoped query must filter by the **current tenant** (`context.business.id` or equivalent), never by user id alone.
2. Mutations must re-resolve the resource with `where: { id, businessId }` (or join) so URL tampering cannot cross tenants.
3. Platform routes remain gated by `isPlatformOperator` (or env rules); business users must not see platform data.

## Scenarios to verify

| Check | Expected |
|-------|----------|
| Owner A opens Owner B staff URL with guessed id | Denied or empty; no data from B |
| Owner A POST forges `businessId` / `inviteId` / `membershipId` of B | Server rejects; no row updated |
| Owner A searches invites/staff | Only A’s business rows |
| Invite token for business B used while logged in as A | Registration blocked or scoped to B invite only; A’s business unchanged |
| Sidebar / reports | Only current business; no counts from other tenants |
| Branch filter | Never returns branches outside current `businessId` |

## Modules reviewed in architecture pass

- Dashboard (owner business loader), business CRUD, categories, units, suppliers, raw materials, products, recipes, POS, orders, inventory, stock movements, consumption, reports, staff, invites, branches, checkout (public).

## Residual risk

- **Orders / stock** are modeled at `businessId` only (no `branchId` on `Order` or `StockMovement`). Per-branch *sales/inventory* breakdown requires a future schema extension; until then, branch visibility is accurate for **staff assignments and invites**, not for order lines.
