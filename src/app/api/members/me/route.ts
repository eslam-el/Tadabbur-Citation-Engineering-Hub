import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthed } from "@/lib/api-guard";

// GET /api/members/me — الحالة الحالية للعضو من قاعدة البيانات (تعمل حتى للحساب قيد الاعتماد)
// تُستخدم في شاشة الانتظار لاكتشاف الاعتماد دون انتظار إعادة الدخول.
export async function GET() {
  try {
    const me = await getAuthed();
    if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const member = await db.member.findUnique({
      where: { id: me.memberId },
      select: { id: true, status: true, accessLevel: true, name: true },
    });
    if (!member) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ member });
  } catch (e) {
    console.error("GET /api/members/me", e);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
