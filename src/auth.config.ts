import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// إعداد آمن لبيئة Edge: لا يستورد Prisma. يستخدمه middleware والنسخة الكاملة في auth.ts.
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    // يُنسخ الـ claims من user (الذي ملأه signIn في auth.ts) إلى التوكن مرة واحدة عند الدخول.
    jwt({ token, user }) {
      if (user) {
        const u = user as { memberId?: string; accessLevel?: string; status?: string };
        if (u.memberId) token.memberId = u.memberId;
        if (u.accessLevel) token.accessLevel = u.accessLevel;
        if (u.status) token.status = u.status;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.memberId = token.memberId;
        session.user.accessLevel = token.accessLevel;
        session.user.status = token.status;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
