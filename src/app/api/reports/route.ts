import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/reports — قائمة البلاغات مع فلاتر اختيارية
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const severity = url.searchParams.get("severity");
    const authorId = url.searchParams.get("authorId");
    const q = url.searchParams.get("q")?.trim();

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (authorId) where.authorId = authorId;
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
      ];
    }

    const reports = await db.errorReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        solutionAuthor: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (e) {
    console.error("GET /api/reports", e);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}

// POST /api/reports — إنشاء بلاغ جديد
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const type = body?.type;
    const severity = body?.severity || "medium";
    const title = (body?.title || "").trim();
    const description = (body?.description || "").trim();
    const location = (body?.location || "").trim() || null;
    const pageNumber = (body?.pageNumber || "").trim() || null;
    const fieldTag = (body?.fieldTag || "").trim() || null;
    const authorId = body?.authorId;
    const tags = body?.tags ? String(body.tags).trim() : null;
    const priority = Number.isFinite(body?.priority) ? Number(body.priority) : 3;

    if (!type || !title || !description || !authorId) {
      return NextResponse.json(
        { error: "missing_fields", fields: { type, title, description, authorId } },
        { status: 400 }
      );
    }

    const report = await db.errorReport.create({
      data: {
        type,
        severity,
        title,
        description,
        location,
        pageNumber,
        fieldTag,
        authorId,
        tags,
        priority,
      },
      include: {
        author: true,
        solutionAuthor: true,
        comments: { include: { author: true } },
      },
    });

    const author = await db.member.findUnique({ where: { id: authorId } });
    await db.activityLog.create({
      data: {
        actorId: authorId,
        actorName: author?.name,
        action: "created",
        targetType: "report",
        targetId: report.id,
        meta: JSON.stringify({ title, type, severity }),
      },
    });

    return NextResponse.json({ report });
  } catch (e) {
    console.error("POST /api/reports", e);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
