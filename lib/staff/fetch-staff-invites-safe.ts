import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Loads invite history for the staff workspace. Isolated try/catch so a missing migration
 * does not collapse the whole staff route (dev/prod DB drift).
 */
export async function fetchStaffInvitesSafe(businessId: string, take = 100) {
  try {
    return await prisma.staffInvite.findMany({
      where: { businessId },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        branch: { select: { code: true, nameAr: true } },
        invitedBy: { select: { fullName: true, email: true } },
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return [];
    }
    const message = e instanceof Error ? e.message : String(e);
    if (/StaffInvite|does not exist|relation/i.test(message)) {
      return [];
    }
    throw e;
  }
}
