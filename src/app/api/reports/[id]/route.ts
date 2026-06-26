import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/api-guard";
import { isAdmin } from "@/lib/permissions";

// GET /api/reports/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireActive();
    if (!gate.ok) return gate.res;

    const { id } = await params;
    const report = await db.errorReport.findUnique({
      where: { id },
      include: {
        author: true,
        solutionAuthor: true,
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
        examples: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
    });
    if (!report) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ report });
  } catch (e) {
    console.error("GET /api/reports/[id]", e);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}

// PATCH /api/reports/[id] — تعديل البلاغ (الحالة، الخطورة، الأولوية، الحقول الأخرى)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireActive();
    if (!gate.ok) return gate.res;

    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    // الحالة قابلة للتغيير من أي عضو مُعتمَد (تعاون الفريق).
    // أما تعديل البلاغ الأساسي فمقصور على صاحب البلاغ أو المدير.
    const statusOnly = ["status"] as const;
    const coreFields = [
      "type",
      "severity",
      "title",
      "description",
      "location",
      "pageNumber",
      "fieldTag",
      "priority",
      "tags",
    ] as const;

    const wantsCoreEdit = coreFields.some((k) => k in body);
    if (wantsCoreEdit) {
      const existing = await db.errorReport.findUnique({
        where: { id },
        select: { authorId: true },
      });
      if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const canManage = existing.authorId === gate.user.memberId || isAdmin(gate.user);
      if (!canManage) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    for (const k of [...statusOnly, ...coreFields]) {
      if (k in body) data[k] = body[k];
    }

    if (data.status === "closed" && !body?.closedAt) {
      data.closedAt = new Date();
    }
    if (data.status && data.status !== "closed") {
      data.closedAt = null;
    }

    const report = await db.errorReport.update({
      where: { id },
      data,
      include: {
        author: true,
        solutionAuthor: true,
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
        examples: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
    });

    await db.activityLog.create({
      data: {
        actorId: gate.user.memberId,
        actorName: gate.user.name ?? null,
        action: "updated",
        targetType: "report",
        targetId: id,
        meta: JSON.stringify({ fields: Object.keys(data) }),
      },
    });

    return NextResponse.json({ report });
  } catch (e) {
    console.error("PATCH /api/reports/[id]", e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

// DELETE /api/reports/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireActive();
    if (!gate.ok) return gate.res;

    const { id } = await params;

    const existing = await db.errorReport.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const canManage = existing.authorId === gate.user.memberId || isAdmin(gate.user);
    if (!canManage) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    await db.errorReport.delete({ where: { id } });
    await db.activityLog.create({
      data: {
        actorId: gate.user.memberId,
        actorName: gate.user.name ?? null,
        action: "deleted",
        targetType: "report",
        targetId: id,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/reports/[id]", e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
