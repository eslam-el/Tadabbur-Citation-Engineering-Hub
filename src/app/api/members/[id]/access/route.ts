import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-guard";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    const body = await req.json();
    const accessLevel = body?.accessLevel;
    if (accessLevel !== "USER" && accessLevel !== "ADMIN") {
      return NextResponse.json({ error: "invalid_access_level" }, { status: 400 });
    }

    const target = await db.member.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // المدير الجذري لا يُخفَّض.
    const root = process.env.ADMIN_EMAIL?.toLowerCase();
    if (target.email && root && target.email.toLowerCase() === root && accessLevel !== "ADMIN") {
      return NextResponse.json({ error: "cannot_demote_root" }, { status: 403 });
    }

    const member = await db.member.update({ where: { id }, data: { accessLevel } });

    await db.activityLog.create({
      data: {
        actorId: gate.user.memberId,
        actorName: gate.user.name ?? null,
        action: "member_access_changed",
        targetType: "member",
        targetId: id,
        meta: JSON.stringify({ accessLevel }),
      },
    });

    return NextResponse.json({ member });
  } catch (e) {
    console.error("PATCH /api/members/[id]/access", e);
    return NextResponse.json({ error: "access_change_failed" }, { status: 500 });
  }
}
