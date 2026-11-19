import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { identifier, password } = parsed.data;
        const cleanIdentifier = identifier.trim();
        const isEmail = cleanIdentifier.includes("@");

        let phoneQuery = cleanIdentifier;
        if (!isEmail) {
          // Normalize 10-digit Indian numbers without +91
          if (!phoneQuery.startsWith("+") && phoneQuery.length === 10) {
            phoneQuery = `+91${phoneQuery}`;
          }
        }

        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: { equals: cleanIdentifier, mode: "insensitive" } }
            : { phone: phoneQuery },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            passwordHash: true,
            phoneVerified: true,
            suspended: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        if (user.suspended) return null;

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          phoneVerified: user.phoneVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = (user as { role: string }).role ?? "USER";
        token.phone = (user as { phone: string }).phone ?? "";
        token.phoneVerified = Boolean((user as { phoneVerified: boolean }).phoneVerified);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        (session.user as { role: string }).role = (token.role as string) || "USER";
        (session.user as { phone: string }).phone = (token.phone as string) || "";
        (session.user as { phoneVerified: boolean }).phoneVerified =
          Boolean(token.phoneVerified);
      }
      return session;
    },
  },
});
