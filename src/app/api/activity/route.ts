import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/activity — آخر سجل النشاطات
export async function GET() {
  try {
    const items = await db.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ activity: items });
  } catch (e) {
    console.error("GET /api/activity", e);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
