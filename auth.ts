import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

/**
 * Auth.js (v5) foundation for CafeFlow Phase 3.
 *
 * We export `handlers`, `auth`, `signIn`, and `signOut` from this single file on purpose:
 * every import uses the same configured instance (one place to read and explain the setup).
 * Route handlers use `handlers`; layouts and server actions use `auth` / `signIn` / `signOut`.
 *
 * Requires `next-auth@5` (beta): v4's `NextAuth()` does not return these helpers, which is why
 * `signIn` was undefined when the project was on v4.
 *
 * Credentials only — no OAuth in this phase.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/ar/sign-in",
  },
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * authorize() decides whether credentials are valid.
       * - returns user object -> login success
       * - returns null -> login rejected
       */
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Archived users or users without password hash cannot sign in.
        if (!user || user.archivedAt || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Store user id in JWT so we can access it in session later.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    /**
     * Expose user id in session for server-side helpers and route protection.
     */
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

