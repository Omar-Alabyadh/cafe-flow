-- Add IN_PROGRESS to the Postgres enum.
-- This must run alone: PostgreSQL does not allow using a new enum literal in the same
-- transaction that adds it (error 55P04). The data backfill lives in the next migration.
ALTER TYPE "OrderStatus" ADD VALUE 'IN_PROGRESS' AFTER 'DRAFT';
