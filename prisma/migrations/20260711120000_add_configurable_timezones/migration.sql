-- Add configurable operational time zones.
-- Existing businesses receive the launch-market default; branches inherit from their business while NULL.
ALTER TABLE "Business" ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'Africa/Tripoli';
ALTER TABLE "Branch" ADD COLUMN "timeZone" TEXT;
