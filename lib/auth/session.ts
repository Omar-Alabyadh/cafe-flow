import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the current Auth.js session (or null).
 * This helper keeps session access consistent across the app.
 */
export async function getCurrentSession() {
  return auth();
}

/**
 * Returns the authenticated user id from session, or null.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}

/** Lowercased email from session JWT (used for invite acceptance and platform email gate). */
export async function getCurrentUserEmail(): Promise<string | null> {
  const session = await getCurrentSession();
  const email = session?.user?.email;
  return email ? email.trim().toLowerCase() : null;
}

/**
 * Returns the full current user record from database, or null.
 * We query Prisma so business code can safely use database fields.
 */
export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

