import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// نقطة تشخيص مؤقتة — تكشف سبب فشل الاتصال بقاعدة البيانات على الإنتاج
// دون تسريب بيانات الاعتماد (تُعرض المضيف فقط لا كلمة المرور).
export async function GET() {
  const raw = process.env.DATABASE_URL || "";
  let host = "(none)";
  let scheme = "(none)";
  try {
    if (raw) {
      const u = new URL(raw);
      host = u.host;
      scheme = u.protocol;
    }
  } catch {
    host = "(unparsable)";
  }

  const diag: Record<string, unknown> = {
    hasDatabaseUrl: Boolean(raw),
    urlScheme: scheme,
    urlHost: host,
    nodeEnv: process.env.NODE_ENV,
    vercel: Boolean(process.env.VERCEL),
    region: process.env.VERCEL_REGION ?? null,
  };

  try {
    const count = await db.member.count();
    diag.dbOk = true;
    diag.memberCount = count;
    return NextResponse.json(diag);
  } catch (e) {
    diag.dbOk = false;
    diag.errorName = (e as Error)?.name ?? null;
    diag.errorMessage = (e as Error)?.message ?? String(e);
    // كود خطأ Prisma إن وُجد
    diag.prismaCode = (e as { code?: string })?.code ?? null;
    return NextResponse.json(diag, { status: 500 });
  }
}
