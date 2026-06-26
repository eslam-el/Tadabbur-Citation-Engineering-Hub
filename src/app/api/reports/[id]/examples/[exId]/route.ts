import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/api-guard";
import { isAdmin } from "@/lib/permissions";

// PATCH /api/reports/[id]/examples/[exId] — تعديل شاهد (كاتبه أو المدير)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; exId: string }> }
) {
  try {
    const gate = await requireActive();
    if (!gate.ok) return gate.res;

    const { exId } = await params;
    const body = await req.json();
    const text = (body?.body || "").trim();
    if (!text) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const existing = await db.reportExample.findUnique({
      where: { id: exId },
      select: { authorId: true },
    });
    if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const canManage = existing.authorId === gate.user.memberId || isAdmin(gate.user);
    if (!canManage) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const example = await db.reportExample.update({
      where: { id: exId },
      data: { body: text },
      include: { author: true },
    });

    return NextResponse.json({ example });
  } catch (e) {
    console.error("PATCH /api/reports/[id]/examples/[exId]", e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

// DELETE /api/reports/[id]/examples/[exId] — حذف شاهد (كاتبه أو المدير)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; exId: string }> }
) {
  try {
    const gate = await requireActive();
    if (!gate.ok) return gate.res;

    const { exId } = await params;
    const existing = await db.reportExample.findUnique({
      where: { id: exId },
      select: { authorId: true },
    });
    if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const canManage = existing.authorId === gate.user.memberId || isAdmin(gate.user);
    if (!canManage) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    await db.reportExample.delete({ where: { id: exId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/reports/[id]/examples/[exId]", e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
