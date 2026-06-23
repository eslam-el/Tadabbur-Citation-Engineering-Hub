import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isActive, isAdmin } from "@/lib/permissions";

export type Authed = {
  memberId: string;
  accessLevel: string;
  status: string;
  name?: string | null;
  email?: string | null;
};

export async function getAuthed(): Promise<Authed | null> {
  const session = await auth();
  const u = session?.user;
  if (!u?.memberId) return null;
  return {
    memberId: u.memberId,
    accessLevel: u.accessLevel ?? "USER",
    status: u.status ?? "PENDING",
    name: u.name,
    email: u.email,
  };
}

export async function requireActive() {
  const user = await getAuthed();
  if (!user) return { ok: false as const, res: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  if (!isActive(user)) return { ok: false as const, res: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { ok: true as const, user };
}

export async function requireAdmin() {
  const user = await getAuthed();
  if (!user) return { ok: false as const, res: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  if (!isAdmin(user)) return { ok: false as const, res: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { ok: true as const, user };
}
