import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/members/[id] — تعديل عضو
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body?.name === "string") data.name = body.name.trim();
    if (typeof body?.role === "string") data.role = body.role.trim();
    if (typeof body?.color === "string") data.color = body.color;
    if (typeof body?.active === "boolean") data.active = body.active;
    if (typeof data.name === "string") data.initials = (data.name as string).slice(0, 2);

    const member = await db.member.update({
      where: { id },
      data,
    });
    return NextResponse.json({ member });
  } catch (e) {
    console.error("PATCH /api/members/[id]", e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

// DELETE /api/members/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.member.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/members/[id]", e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
