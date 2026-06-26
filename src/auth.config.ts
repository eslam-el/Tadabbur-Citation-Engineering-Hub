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
    // وعند trigger=update تُحدَّث الحالة/الصلاحية في التوكن (مثلاً بعد اعتماد المدير) دون إعادة دخول.
    jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as { memberId?: string; accessLevel?: string; status?: string };
        if (u.memberId) token.memberId = u.memberId;
        if (u.accessLevel) token.accessLevel = u.accessLevel;
        if (u.status) token.status = u.status;
      }
      if (trigger === "update" && session) {
        const s = session as { status?: string; accessLevel?: string };
        if (s.status) token.status = s.status;
        if (s.accessLevel) token.accessLevel = s.accessLevel;
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
