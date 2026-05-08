import { PrismaClient } from "@prisma/client";

/**
 * Bump this when Prisma schema changes in a way that requires a **new** `PrismaClient`
 * (for example a new column). In dev, Next.js keeps `globalThis.prismaGlobal` across HMR;
 * an old client would still validate selects against the previous schema and throw
 * "Unknown field …" even after `prisma generate` until the process restarts.
 */
const PRISMA_CLIENT_BUNDLE_REVISION = 2;

declare global {
  var prismaGlobal: PrismaClient | undefined;
  var prismaClientBundleRevision: number | undefined;
}

const g = globalThis as typeof globalThis & {
  prismaGlobal?: PrismaClient;
  prismaClientBundleRevision?: number;
};

function makeClient(): PrismaClient {
  const client = new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    g.prismaGlobal = client;
    g.prismaClientBundleRevision = PRISMA_CLIENT_BUNDLE_REVISION;
  } else {
    g.prismaGlobal = client;
  }
  return client;
}

/**
 * Shared Prisma client instance.
 * In development, we reuse one instance across hot reloads to prevent
 * creating many open database connections — unless the bundle revision changed.
 */
export const prisma: PrismaClient = (() => {
  if (process.env.NODE_ENV !== "production") {
    const existing = g.prismaGlobal;
    const stale = existing != null && g.prismaClientBundleRevision !== PRISMA_CLIENT_BUNDLE_REVISION;
    if (stale) {
      void existing.$disconnect();
      g.prismaGlobal = undefined;
      g.prismaClientBundleRevision = undefined;
    }
    return g.prismaGlobal ?? makeClient();
  }
  return g.prismaGlobal ?? makeClient();
})();
