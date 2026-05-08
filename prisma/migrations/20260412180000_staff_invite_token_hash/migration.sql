-- Store invite token as hash only; add metadata columns for audit/UI.

ALTER TABLE "StaffInvite" ADD COLUMN "templateKey" TEXT;
ALTER TABLE "StaffInvite" ADD COLUMN "note" TEXT;
ALTER TABLE "StaffInvite" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "StaffInvite" ADD COLUMN "tokenHash" TEXT;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE "StaffInvite" SET "tokenHash" = encode(digest("token", 'sha256'), 'hex');

DROP INDEX IF EXISTS "StaffInvite_token_key";

ALTER TABLE "StaffInvite" DROP COLUMN "token";

ALTER TABLE "StaffInvite" ALTER COLUMN "tokenHash" SET NOT NULL;

CREATE UNIQUE INDEX "StaffInvite_tokenHash_key" ON "StaffInvite"("tokenHash");
