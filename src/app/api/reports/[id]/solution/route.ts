import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/reports/[id]/solution — تسجيل أو تحديث الحل المقترح
// الحقول: solutionText, solutionAuthorId, status?
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const solutionText = (body?.solutionText || "").trim();
    const solutionAuthorId = body?.solutionAuthorId;
    const newStatus = body?.status; // اختياري: resolved / in_progress / closed

    if (!solutionText) {
      return NextResponse.json({ error: "solution_required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {
      solutionText,
      solutionAt: new Date(),
    };
    if (solutionAuthorId) {
      data.solutionAuthorId = solutionAuthorId;
    }
    if (newStatus) {
      data.status = newStatus;
    }
    if (newStatus === "closed") {
      data.closedAt = new Date();
    }

    const report = await db.errorReport.update({
      where: { id },
      data,
      include: {
        author: true,
        solutionAuthor: true,
        comments: { include: { author: true } },
      },
    });

    const solver = solutionAuthorId
      ? await db.member.findUnique({ where: { id: solutionAuthorId } })
      : null;

    await db.activityLog.create({
      data: {
        actorId: solutionAuthorId || null,
        actorName: solver?.name || null,
        action: "solved",
        targetType: "report",
        targetId: id,
        meta: JSON.stringify({ status: newStatus || "resolved" }),
      },
    });

    return NextResponse.json({ report });
  } catch (e) {
    console.error("POST /api/reports/[id]/solution", e);
    return NextResponse.json({ error: "solution_failed" }, { status: 500 });
  }
}
