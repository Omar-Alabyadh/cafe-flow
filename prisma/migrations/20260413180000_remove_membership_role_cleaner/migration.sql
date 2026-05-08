-- CafeFlow: remove CLEANER from MembershipRole enum (reassign legacy rows to BARISTA).

UPDATE "Membership" SET "role" = 'BARISTA' WHERE "role"::text = 'CLEANER';
UPDATE "StaffInvite" SET "role" = 'BARISTA' WHERE "role"::text = 'CLEANER';

ALTER TYPE "MembershipRole" RENAME TO "MembershipRole_old";

CREATE TYPE "MembershipRole" AS ENUM (
  'SUPER_ADMIN',
  'OWNER',
  'MANAGER',
  'ACCOUNTANT',
  'CASHIER',
  'BARISTA',
  'WAITER',
  'KITCHEN_STAFF',
  'INVENTORY_MANAGER',
  'PURCHASING_MANAGER',
  'JUICE_STAFF'
);

ALTER TABLE "Membership" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "StaffInvite" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "Membership"
  ALTER COLUMN "role" TYPE "MembershipRole" USING ("role"::text::"MembershipRole");

ALTER TABLE "StaffInvite"
  ALTER COLUMN "role" TYPE "MembershipRole" USING ("role"::text::"MembershipRole");

ALTER TABLE "Membership" ALTER COLUMN "role" SET DEFAULT 'CASHIER'::"MembershipRole";

DROP TYPE "MembershipRole_old";
