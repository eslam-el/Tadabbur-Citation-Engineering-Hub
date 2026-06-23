import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guard";
import { cleanupSeededData } from "@/lib/member-ops";

export async function DELETE() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    const result = await cleanupSeededData();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("DELETE /api/members/demo", e);
    return NextResponse.json({ error: "cleanup_failed" }, { status: 500 });
  }
}
