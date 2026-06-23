import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthed, requireAdmin } from "@/lib/api-guard";
import { isAdmin } from "@/lib/permissions";
import { safeDeleteMember } from "@/lib/member-ops";

// PATCH /api/members/[id] — المدير لأي عضو، المستخدم لملفه فقط
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const me = await getAuthed();
    if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const admin = isAdmin(me);
    const isSelf = me.memberId === id;
    // المستخدم العادي لا يعدّل إلا ملفه الشخصي؛ غير المصادَق ACTIVE يُمنع إلا تعديل اسمه (لشاشة الانتظار).
    if (!admin && !isSelf) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body?.name === "string") data.name = body.name.trim();
    if (typeof body?.color === "string") data.color = body.color;
    if (typeof data.name === "string") data.initials = (data.name as string).slice(0, 2);
    // المسمّى الوظيفي والتفعيل: للمدير فقط.
    if (admin) {
      if (typeof body?.role === "string") data.role = body.role.trim();
    }

    const member = await db.member.update({ where: { id }, data });
    return NextResponse.json({ member });
  } catch (e) {
    console.error("PATCH /api/members/[id]", e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

// DELETE /api/members/[id] — مدير + حذف آمن + حماية الجذري
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    const target = await db.member.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // حماية المدير الجذري من الحذف.
    const root = process.env.ADMIN_EMAIL?.toLowerCase();
    if (target.email && root && target.email.toLowerCase() === root) {
      return NextResponse.json({ error: "cannot_delete_root" }, { status: 403 });
    }

    const result = await safeDeleteMember(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("DELETE /api/members/[id]", e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
