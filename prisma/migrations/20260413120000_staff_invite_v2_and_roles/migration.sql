-- New assignable staff roles (tenant-scoped).
ALTER TYPE "MembershipRole" ADD VALUE 'JUICE_STAFF';
ALTER TYPE "MembershipRole" ADD VALUE 'PURCHASING_MANAGER';

-- StaffInvite v2: employee login is created only at acceptance; optional owner contact fields.
ALTER TABLE "StaffInvite" ADD COLUMN "publicInviteLabel" TEXT;
ALTER TABLE "StaffInvite" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "StaffInvite" ADD COLUMN "contactPhone" TEXT;

UPDATE "StaffInvite" SET "publicInviteLabel" = 'invite-' || LOWER("id") WHERE "publicInviteLabel" IS NULL;

CREATE UNIQUE INDEX "StaffInvite_publicInviteLabel_key" ON "StaffInvite"("publicInviteLabel");

ALTER TABLE "StaffInvite" ALTER COLUMN "publicInviteLabel" SET NOT NULL;

ALTER TABLE "StaffInvite" ALTER COLUMN "email" DROP NOT NULL;

UPDATE "StaffInvite" SET "contactEmail" = "email" WHERE "contactEmail" IS NULL AND "email" IS NOT NULL;
