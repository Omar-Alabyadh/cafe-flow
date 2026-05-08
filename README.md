# CafeFlow

Multi-tenant SaaS web app for cafe operations, built with Next.js App Router, NextAuth, and Prisma.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma ORM + PostgreSQL
- NextAuth v5 (credentials flow)
- next-intl (AR/EN localization)

## Requirements

- Node.js 20+ (recommended)
- npm 10+
- PostgreSQL 14+ (or compatible)

## Quick Start (Local Development)

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values (at minimum `DATABASE_URL` and `PLATFORM_OWNER_EMAIL`).

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Apply database migrations:

```bash
npx prisma migrate dev
```

6. Optional but recommended: create a local credentials test user:

```bash
npm run auth:create-test-user
```

7. Run development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables (Example)

Use `.env.example` as reference. Core variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DBNAME"
PLATFORM_OWNER_EMAIL="operator@your-domain.example"
```

Optional platform step-up variables are documented in `.env.example`:

- `PLATFORM_STEP_UP_TTL_MINUTES`
- `PLATFORM_TOTP_SECRET`
- `PLATFORM_TOTP_STEPS`
- `PLATFORM_TOTP_DEBUG`
- `PLATFORM_EXTRA_SECRET`

## Prisma Workflow

- Validate schema:

```bash
npx prisma validate
```

- Generate client after schema changes:

```bash
npx prisma generate
```

- Create/apply new migration:

```bash
npx prisma migrate dev --name <migration_name>
```

### Seed Notes

There is currently no dedicated `prisma/seed` script configured in `package.json`.
For demo bootstrap, use:

```bash
npm run auth:create-test-user
```

## Useful Scripts

- `npm run dev` - run app in development mode
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint
- `npm run auth:create-test-user` - create/update local test credentials user
- `npm run platform:totp-secret` - generate TOTP secret for platform step-up
- `npm run platform:totp-now` - print current TOTP value for verification

## Notes

- The project uses `patch-package` during install and dev startup.
- If Prisma VS Code extension shows datasource URL warnings while `prisma validate` and `prisma generate` pass, treat that as editor false positive for this phase.
