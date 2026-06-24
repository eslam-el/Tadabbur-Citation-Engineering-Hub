import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // يعمل في بيئة Node (معالج المسار) فقط — لا يُستدعى في middleware.
    async signIn({ user, profile }) {
      const email = (user?.email ?? profile?.email)?.toLowerCase();
      if (!email) return false;

      const name = user?.name ?? (profile?.name as string | undefined) ?? email;
      const image = user?.image ?? (profile?.picture as string | undefined) ?? null;
      const isRoot = !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase();

      const existing = await db.member.findUnique({ where: { email } });
      let member;
      if (existing) {
        // المدير الجذري يُفرض دائمًا حتى لو عُدِّل سجله يدويًا.
        member = isRoot
          ? await db.member.update({
              where: { email },
              data: { accessLevel: "ADMIN", status: "ACTIVE", image },
            })
          : existing;
      } else {
        member = await db.member.create({
          data: {
            email,
            name,
            image,
            initials: name.slice(0, 2),
            accessLevel: isRoot ? "ADMIN" : "USER",
            status: isRoot ? "ACTIVE" : "PENDING",
            seeded: false,
          },
        });
      }

      // تمرير الـ claims إلى رد نداء jwt عبر كائن user.
      const u = user as { memberId?: string; accessLevel?: string; status?: string };
      u.memberId = member.id;
      u.accessLevel = member.accessLevel;
      u.status = member.status;
      return true;
    },
  },
});
