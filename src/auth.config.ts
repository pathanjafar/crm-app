import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
        name: "Credentials",
        credentials: {
          phone: { label: "Phone Number", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            // AUTHORIZE WILL ONLY RUN ON THE SERVER IN src/auth.ts
            // But we keep the skeleton out as recommended in V5 beta docs for splitting.
            return null;
        }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
