import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      memberId?: string;
      accessLevel?: string;
      status?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    memberId?: string;
    accessLevel?: string;
    status?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    memberId?: string;
    accessLevel?: string;
    status?: string;
  }
}

declare module "@auth/core/types" {
  interface Session {
    user: {
      memberId?: string;
      accessLevel?: string;
      status?: string;
    } & DefaultSession["user"];
  }
}
