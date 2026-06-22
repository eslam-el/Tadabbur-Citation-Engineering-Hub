import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { ERROR_TYPES, SEVERITIES, STATUSES } from "@/lib/constants";

// GET /api/export?scope=all|reports|stats  — يصدّر ملف Excel منظّم
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const scope = url.searchParams.get("scope") || "all";

    const reports = await db.errorReport.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true, solutionAuthor: true },
    });

    const wb = XLSX.utils.book_new();

    // ───────────── ورقة 1: سجل الأخطاء الكامل ─────────────
    const rows = reports.map((r, idx) => ({
      "#": idx + 1,
      "المعرف": r.id.slice(-6).toUpperCase(),
      "النوع": ERROR_TYPES[r.type as keyof typeof ERROR_TYPES]?.label || r.type,
      "النوع (كود)": r.type,
      "الخطورة": SEVERITIES[r.severity as keyof typeof SEVERITIES]?.label || r.severity,
      "الحالة": STATUSES[r.status as keyof typeof STATUSES]?.label || r.status,
      "الأولوية": r.priority,
      "العنوان": r.title,
      "الوصف": r.description,
      "الموقع / المرجع": r.location || "",
      "رقم الصفحة": r.pageNumber || "",
      "الحقل (CSL/مندلي)": r.fieldTag || "",
      "الوسوم": r.tags || "",
      "المدوّن": r.author?.name || "",
      "دور المدوّن": r.author?.role || "",
      "تاريخ التدوين": r.createdAt.toISOString().replace("T", " ").slice(0, 19),
      "الحل المقترح": r.solutionText || "",
      "صاحب الحل": r.solutionAuthor?.name || "",
      "تاريخ الحل": r.solutionAt
        ? r.solutionAt.toISOString().replace("T", " ").slice(0, 19)
        : "",
      "تاريخ الإغلاق": r.closedAt
        ? r.closedAt.toISOString().replace("T", " ").slice(0, 19)
        : "",
      "آخر تحديث": r.updatedAt.toISOString().replace("T", " ").slice(0, 19),
    }));

    const wsReports = XLSX.utils.json_to_sheet(rows);
    wsReports["!cols"] = [
      { wch: 5 }, { wch: 8 }, { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 14 },
      { wch: 8 }, { wch: 38 }, { wch: 50 }, { wch: 28 }, { wch: 10 }, { wch: 16 },
      { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 22 }, { wch: 50 }, { wch: 18 },
      { wch: 22 }, { wch: 22 }, { wch: 22 },
    ];
    wsReports["!dir"] = "rtl";
    wsReports["!views"] = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, wsReports, "سجل الأخطاء");

    // ───────────── ورقة 2: إحصائيات حسب النوع ─────────────
    const typeCounts: Record<string, number> = {};
    for (const r of reports) typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    const typeRows = (Object.keys(ERROR_TYPES) as (keyof typeof ERROR_TYPES)[]).map(
      (k) => ({
        "النوع": ERROR_TYPES[k].label,
        "كود النوع": k,
        "العدد": typeCounts[k] || 0,
        "النسبة المئوية":
          reports.length > 0
            ? `${(((typeCounts[k] || 0) / reports.length) * 100).toFixed(1)}%`
            : "0%",
      })
    );
    const wsType = XLSX.utils.json_to_sheet(typeRows);
    wsType["!cols"] = [{ wch: 26 }, { wch: 14 }, { wch: 10 }, { wch: 14 }];
    wsType["!views"] = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, wsType, "إحصائيات الأنواع");

    // ───────────── ورقة 3: إحصائيات حسب الخطورة ─────────────
    const sevCounts: Record<string, number> = {};
    for (const r of reports) sevCounts[r.severity] = (sevCounts[r.severity] || 0) + 1;
    const sevRows = (Object.keys(SEVERITIES) as (keyof typeof SEVERITIES)[]).map((k) => ({
      "الخطورة": SEVERITIES[k].label,
      "كود الخطورة": k,
      "العدد": sevCounts[k] || 0,
      "النسبة المئوية":
        reports.length > 0
          ? `${(((sevCounts[k] || 0) / reports.length) * 100).toFixed(1)}%`
          : "0%",
    }));
    const wsSev = XLSX.utils.json_to_sheet(sevRows);
    wsSev["!cols"] = [{ wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 14 }];
    wsSev["!views"] = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, wsSev, "إحصائيات الخطورة");

    // ───────────── ورقة 4: إحصائيات حسب الحالة ─────────────
    const stCounts: Record<string, number> = {};
    for (const r of reports) stCounts[r.status] = (stCounts[r.status] || 0) + 1;
    const stRows = (Object.keys(STATUSES) as (keyof typeof STATUSES)[]).map((k) => ({
      "الحالة": STATUSES[k].label,
      "كود الحالة": k,
      "العدد": stCounts[k] || 0,
      "النسبة المئوية":
        reports.length > 0
          ? `${(((stCounts[k] || 0) / reports.length) * 100).toFixed(1)}%`
          : "0%",
    }));
    const wsSt = XLSX.utils.json_to_sheet(stRows);
    wsSt["!cols"] = [{ wch: 18 }, { wch: 16 }, { wch: 10 }, { wch: 14 }];
    wsSt["!views"] = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, wsSt, "إحصائيات الحالات");

    // ───────────── ورقة 5: إحصائيات حسب المدوّن ─────────────
    const authorMap = new Map<string, { name: string; role: string; count: number; solved: number }>();
    for (const r of reports) {
      const key = r.author?.id || "unknown";
      const name = r.author?.name || "غير معروف";
      const role = r.author?.role || "";
      if (!authorMap.has(key)) authorMap.set(key, { name, role, count: 0, solved: 0 });
      authorMap.get(key)!.count += 1;
    }
    for (const r of reports) {
      if (r.solutionAuthorId && r.solutionText) {
        const key = r.solutionAuthorId;
        const name = r.solutionAuthor?.name || "";
        if (!authorMap.has(key)) authorMap.set(key, { name, role: r.solutionAuthor?.role || "", count: 0, solved: 0 });
        authorMap.get(key)!.solved += 1;
      }
    }
    const authorRows = Array.from(authorMap.entries()).map(([id, v]) => ({
      "العضو": v.name,
      "الدور": v.role,
      "عدد البلاغات المدوّنة": v.count,
      "عدد الحلول المقدّمة": v.solved,
    }));
    const wsAuthor = XLSX.utils.json_to_sheet(authorRows);
    wsAuthor["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 22 }];
    wsAuthor["!views"] = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, wsAuthor, "إحصائيات الأعضاء");

    // ───────────── ورقة 6: ملخص تنفيذي ─────────────
    const summaryRows = [
      { "البند": "إجمالي البلاغات", "القيمة": reports.length },
      {
        "البند": "نسبة المحلولة",
        "القيمة":
          reports.length > 0
            ? `${(((stCounts["resolved"] || 0) + (stCounts["closed"] || 0)) / reports.length * 100).toFixed(1)}%`
            : "0%",
      },
      {
        "البند": "نسبة المفتوحة",
        "القيمة":
          reports.length > 0
            ? `${(((stCounts["open"] || 0)) / reports.length * 100).toFixed(1)}%`
            : "0%",
      },
      {
        "البند": "نسبة قيد المعالجة",
        "القيمة":
          reports.length > 0
            ? `${(((stCounts["in_progress"] || 0)) / reports.length * 100).toFixed(1)}%`
            : "0%",
      },
      { "البند": "الأخطاء الحرجة", "القيمة": sevCounts["critical"] || 0 },
      { "البند": "الأخطاء العالية", "القيمة": sevCounts["high"] || 0 },
      {
        "البند": "تاريخ التصدير",
        "القيمة": new Date().toISOString().replace("T", " ").slice(0, 19),
      },
    ];
    const wsSum = XLSX.utils.json_to_sheet(summaryRows);
    wsSum["!cols"] = [{ wch: 26 }, { wch: 28 }];
    wsSum["!views"] = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, wsSum, "ملخص تنفيذي");

    // إذا طلب المستخدم ورقة محددة فقط نُلغي بقية الأوراق
    if (scope === "reports") {
      // إبقاء ورقة "سجل الأخطاء" فقط
      const sheetsToKeep = ["سجل الأخطاء"];
      for (const name of wb.SheetNames) {
        if (!sheetsToKeep.includes(name)) delete wb.Sheets[name];
      }
      wb.SheetNames = wb.SheetNames.filter((n) => sheetsToKeep.includes(n));
    } else if (scope === "stats") {
      const sheetsToKeep = ["ملخص تنفيذي", "إحصائيات الأنواع", "إحصائيات الخطورة", "إحصائيات الحالات", "إحصائيات الأعضاء"];
      for (const name of wb.SheetNames) {
        if (!sheetsToKeep.includes(name)) delete wb.Sheets[name];
      }
      wb.SheetNames = wb.SheetNames.filter((n) => sheetsToKeep.includes(n));
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const filename = `tadabbur-errors-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("GET /api/export", e);
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
