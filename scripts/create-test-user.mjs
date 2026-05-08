import { PrismaClient, LanguageCode } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Creates or updates one local test user for credentials login.
 * This is only for development/demo and keeps Phase 3 testing simple.
 *
 * Platform dashboard access uses env `PLATFORM_OWNER_EMAIL` (must match user email exactly).
 * Tenant owners created here are not platform operators unless that env matches.
 */
async function main() {
  const email = process.env.TEST_USER_EMAIL ?? "owner@cafeflow.local";
  /** Default Arabic display name for local demo (UI locale AR is the product default). */
  const fullName = process.env.TEST_USER_NAME ?? "مالك كافي فلو";
  const plainPassword = process.env.TEST_USER_PASSWORD ?? "Admin12345";

  const passwordHash = await hash(plainPassword, 12);

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      fullName,
      passwordHash,
      archivedAt: null,
      isPlatformOwner: false,
    },
    create: {
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      preferredLanguage: LanguageCode.AR,
      isPlatformOwner: false,
    },
  });

  console.log("Test user is ready:");
  console.log(`- email: ${email.toLowerCase()}`);
  console.log(`- password: ${plainPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

