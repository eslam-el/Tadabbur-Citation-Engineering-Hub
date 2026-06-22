import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/stats — تجميع إحصائيات شاملة للوحة القيادة
export async function GET() {
  try {
    const [
      total,
      byType,
      bySeverity,
      byStatus,
      byAuthor,
      bySolver,
      recentReports,
      activity,
    ] = await Promise.all([
      db.errorReport.count(),

      db.errorReport.groupBy({
        by: ["type"],
        _count: true,
      }),

      db.errorReport.groupBy({
        by: ["severity"],
        _count: true,
      }),

      db.errorReport.groupBy({
        by: ["status"],
        _count: true,
      }),

      db.errorReport.groupBy({
        by: ["authorId"],
        _count: true,
      }),

      db.errorReport.groupBy({
        by: ["solutionAuthorId"],
        _count: true,
      }),

      db.errorReport.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { author: true, solutionAuthor: true },
      }),

      db.activityLog.findMany({
        take: 12,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const memberIds = Array.from(
      new Set([
        ...byAuthor.map((r) => r.authorId),
        ...bySolver
          .map((r) => r.solutionAuthorId)
          .filter((x): x is string => !!x),
      ])
    );
    const members = await db.member.findMany({
      where: { id: { in: memberIds } },
    });
    const memberMap = new Map(members.map((m) => [m.id, m]));

    const authorStats = byAuthor
      .map((r) => {
        const m = memberMap.get(r.authorId);
        return m
          ? {
              memberId: m.id,
              name: m.name,
              color: m.color,
              initials: m.initials || m.name.slice(0, 2),
              reportsCount: r._count,
            }
          : null;
      })
      .filter(Boolean);

    const solverStats = bySolver
      .filter((r) => r.solutionAuthorId)
      .map((r) => {
        const m = memberMap.get(r.solutionAuthorId as string);
        return m
          ? {
              memberId: m.id,
              name: m.name,
              color: m.color,
              initials: m.initials || m.name.slice(0, 2),
              solvedCount: r._count,
            }
          : null;
      })
      .filter(Boolean);

    // اتجاه زمني: آخر 14 يومًا
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);
    const recentSince = await db.errorReport.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, type: true, status: true },
    });

    const trendMap = new Map<string, { date: string; count: number; resolved: number }>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      trendMap.set(key, { date: key, count: 0, resolved: 0 });
    }
    for (const r of recentSince) {
      const key = r.createdAt.toISOString().slice(0, 10);
      const entry = trendMap.get(key);
      if (entry) {
        entry.count += 1;
        if (r.status === "resolved" || r.status === "closed") entry.resolved += 1;
      }
    }
    const trend = Array.from(trendMap.values());

    return NextResponse.json({
      total,
      byType: byType.map((b) => ({ type: b.type, count: b._count })),
      bySeverity: bySeverity.map((b) => ({ severity: b.severity, count: b._count })),
      byStatus: byStatus.map((b) => ({ status: b.status, count: b._count })),
      authorStats,
      solverStats,
      recentReports,
      activity,
      trend,
    });
  } catch (e) {
    console.error("GET /api/stats", e);
    return NextResponse.json({ error: "stats_failed" }, { status: 500 });
  }
}
