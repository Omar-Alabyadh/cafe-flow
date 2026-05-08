import { prisma } from "@/lib/prisma";
import { Prisma, StaffInviteStatus } from "@prisma/client";

/**
 * Pending invites are optional for rendering the staff page.
 * If `StaffInvite` migration is not applied yet (or DB is behind), Prisma throws P2021 — that must not take down the whole route.
 * Next/Turbopack may surface an RSC failure as HTTP 404, which is misleading for a data/setup issue.
 */
export async function fetchPendingStaffInvitesSafe(businessId: string) {
  try {
    return await prisma.staffInvite.findMany({
      where: { businessId, status: StaffInviteStatus.PENDING },
      orderBy: { createdAt: "desc" },
      include: { branch: { select: { code: true, nameAr: true } } },
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
