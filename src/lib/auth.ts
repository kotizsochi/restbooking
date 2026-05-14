import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// bcryptjs - безопасное хэширование (10 rounds)
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Адаптер подключается только при наличии БД
  ...(prisma ? { adapter: PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter> } : {}),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const demoEmail = process.env.DEMO_EMAIL || "admin@restobooking.ru";
        const demoPass = process.env.DEMO_PASSWORD || "demo2026";

        // Demo-режим: работает всегда когда DEMO_MODE=true
        if (process.env.DEMO_MODE === "true") {
          if (
            credentials.email === demoEmail &&
            credentials.password === demoPass
          ) {
            console.log(`[SECURITY] AUTH_LOGIN_SUCCESS | demo | Email: ${demoEmail}`);
            return {
              id: "demo-admin",
              name: "Demo Admin",
              email: demoEmail,
              role: "RESTAURANT_ADMIN",
            };
          }
        }

        // БД-авторизация
        if (!prisma) {
          console.log(`[SECURITY] AUTH_LOGIN_FAILED | no-db | Email: ${credentials.email}`);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.passwordHash) {
          // Fallback: если user нет в БД, но это demo credentials
          if (
            process.env.DEMO_MODE === "true" &&
            credentials.email === demoEmail &&
            credentials.password === demoPass
          ) {
            console.log(`[SECURITY] AUTH_LOGIN_SUCCESS | demo-fallback | Email: ${demoEmail}`);
            return {
              id: "demo-admin",
              name: "Demo Admin",
              email: demoEmail,
              role: "RESTAURANT_ADMIN",
            };
          }
          console.log(`[SECURITY] AUTH_LOGIN_FAILED | Email: ${credentials.email} | Reason: user_not_found`);
          return null;
        }
        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) {
          console.log(`[SECURITY] AUTH_LOGIN_FAILED | Email: ${credentials.email} | Reason: invalid_password`);
          return null;
        }
        console.log(`[SECURITY] AUTH_LOGIN_SUCCESS | Email: ${user.email} | ID: ${user.id}`);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || "GUEST";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});

export { hashPassword, verifyPassword };
