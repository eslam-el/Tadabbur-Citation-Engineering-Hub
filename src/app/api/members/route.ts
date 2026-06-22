import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/members — قائمة الأعضاء
export async function GET() {
  try {
    const members = await db.member.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { reports: true, solvedReports: true },
        },
      },
    });
    return NextResponse.json({ members });
  } catch (e) {
    console.error("GET /api/members", e);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}

// POST /api/members — إنشاء عضو
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body?.name || "").trim();
    const role = (body?.role || "مراجع").trim() || "مراجع";
    const color = body?.color || "#c9a24b";

    if (!name) {
      return NextResponse.json({ error: "name_required" }, { status: 400 });
    }

    const member = await db.member.create({
      data: {
        name,
        role,
        color,
        initials: name.slice(0, 2),
      },
    });

    await db.activityLog.create({
      data: {
        actorId: member.id,
        actorName: member.name,
        action: "member_added",
        targetType: "member",
        targetId: member.id,
        meta: JSON.stringify({ name, role }),
      },
    });

    return NextResponse.json({ member });
  } catch (e) {
    console.error("POST /api/members", e);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
