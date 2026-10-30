
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import argon2 from "argon2";
import { isValidEmail, normalizeEmail } from "./lib/account-validation";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = normalizeEmail(credentials.email);
        const password = credentials.password;

        // New registration requires 8+ characters. Do not reject a legacy
        // account before Argon2 can verify its existing stored password.
        if (!isValidEmail(email) || typeof password !== "string" || password.length > 1024) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const passwordValid = await argon2.verify(
          user.passwordHash,
          password
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.userId,
          name: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber ?? "",
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phoneNumber = token.phoneNumber as string;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export { authOptions };
export default authOptions;
