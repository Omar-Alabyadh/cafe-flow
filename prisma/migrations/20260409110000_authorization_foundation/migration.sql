-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('ALL_BRANCHES', 'BRANCH_ONLY', 'OWN_ONLY', 'NONE');

-- Upgrade MembershipRole enum to the production role list.
CREATE TYPE "MembershipRole_new" AS ENUM (
  'SUPER_ADMIN',
  'OWNER',
  'MANAGER',
  'ACCOUNTANT',
  'CASHIER',
  'BARISTA',
  'WAITER',
  'KITCHEN_STAFF',
  'INVENTORY_MANAGER',
  'CLEANER'
);

-- Drop old default before type conversion.
ALTER TABLE "Membership" ALTER COLUMN "role" DROP DEFAULT;

-- Map legacy values to the new role model.
ALTER TABLE "Membership"
ALTER COLUMN "role" TYPE "MembershipRole_new"
USING (
  CASE
    WHEN "role"::text = 'STAFF' THEN 'CASHIER'
    WHEN "role"::text = 'VIEWER' THEN 'CLEANER'
    ELSE "role"::text
  END
)::"MembershipRole_new";

ALTER TYPE "MembershipRole" RENAME TO "MembershipRole_old";
ALTER TYPE "MembershipRole_new" RENAME TO "MembershipRole";
DROP TYPE "MembershipRole_old";

-- AlterTable
ALTER TABLE "Membership"
ADD COLUMN "scope" "PermissionScope" NOT NULL DEFAULT 'BRANCH_ONLY',
ADD COLUMN "grantedPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "revokedPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "role" SET DEFAULT 'CASHIER';
