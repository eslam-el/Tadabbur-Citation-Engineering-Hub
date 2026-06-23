import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-guard";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    const member = await db.member.update({ where: { id }, data: { status: "ACTIVE" } });

    await db.activityLog.create({
      data: {
        actorId: gate.user.memberId,
        actorName: gate.user.name ?? null,
        action: "member_approved",
        targetType: "member",
        targetId: id,
      },
    });

    return NextResponse.json({ member });
  } catch (e) {
    console.error("PATCH /api/members/[id]/approve", e);
    return NextResponse.json({ error: "approve_failed" }, { status: 500 });
  }
}
