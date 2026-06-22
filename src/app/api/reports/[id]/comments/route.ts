import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/reports/[id]/comments — إضافة تعليق على البلاغ
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const authorId = body?.authorId;
    const bodyText = (body?.body || "").trim();

    if (!authorId || !bodyText) {
      return NextResponse.json(
        { error: "missing_fields" },
        { status: 400 }
      );
    }

    const comment = await db.reportComment.create({
      data: {
        reportId: id,
        authorId,
        body: bodyText,
      },
      include: { author: true },
    });

    const author = await db.member.findUnique({ where: { id: authorId } });
    await db.activityLog.create({
      data: {
        actorId: authorId,
        actorName: author?.name,
        action: "commented",
        targetType: "report",
        targetId: id,
      },
    });

    return NextResponse.json({ comment });
  } catch (e) {
    console.error("POST /api/reports/[id]/comments", e);
    return NextResponse.json({ error: "comment_failed" }, { status: 500 });
  }
}
