import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/api-guard";

// POST /api/reports/[id]/examples — إضافة شاهد / مثال على البلاغ
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireActive();
    if (!gate.ok) return gate.res;

    const { id } = await params;
    const body = await req.json();
    const text = (body?.body || "").trim();

    if (!text) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const report = await db.errorReport.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!report) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const example = await db.reportExample.create({
      data: { reportId: id, authorId: gate.user.memberId, body: text },
      include: { author: true },
    });

    await db.activityLog.create({
      data: {
        actorId: gate.user.memberId,
        actorName: gate.user.name ?? null,
        action: "example_added",
        targetType: "report",
        targetId: id,
      },
    });

    return NextResponse.json({ example });
  } catch (e) {
    console.error("POST /api/reports/[id]/examples", e);
    return NextResponse.json({ error: "example_failed" }, { status: 500 });
  }
}
