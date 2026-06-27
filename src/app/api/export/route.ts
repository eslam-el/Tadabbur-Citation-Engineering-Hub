import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { ERROR_TYPES, SEVERITIES, STATUSES } from "@/lib/constants";
import { requireActive } from "@/lib/api-guard";

/* ─────────────────────────────────────────────────────────────
   منظومة ألوان "تراث مهدّأ" — متناسقة مع هوية المنصّة
   (ExcelJS يستعمل ARGB: AA RR GG BB)
   ───────────────────────────────────────────────────────────── */
const C = {
  ink: "FF2E2A24", // حِبر داكن — خلفية الرؤوس
  inkSoft: "FF4A4236", // حِبر أفتح
  gold: "FFC9A24B", // ذهبي تراثي — لافتة العنوان
  goldDeep: "FFA8842F",
  cream: "FFF7F1E3", // كريمي — نص فاتح
  rowEven: "FFFBF8F1", // تظليل صفوف بالتناوب
  rowOdd: "FFFFFFFF",
  border: "FFD8CDB8", // حدود مهدّأة
  borderSoft: "FFE8E0CE",
  textDark: "FF2E2A24",
  muted: "FF7A7163",
};

// ترميز لوني للخطورة (خلفية فاتحة + نص داكن)
const SEV_STYLE: Record<string, { bg: string; fg: string }> = {
  critical: { bg: "FFF3DAD3", fg: "FF8E2D1A" },
  high: { bg: "FFF8E4D2", fg: "FF9A5320" },
  medium: { bg: "FFF5EAC8", fg: "FF7A5E12" },
  low: { bg: "FFE2EFD4", fg: "FF3F5E26" },
};

// ترميز لوني للحالة
const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  open: { bg: "FFF3DAD3", fg: "FF8E2D1A" },
  in_progress: { bg: "FFF5EAC8", fg: "FF7A5E12" },
  resolved: { bg: "FFE2EFD4", fg: "FF3F5E26" },
  closed: { bg: "FFEDE8DE", fg: "FF6B6253" },
};

const FONT = "Segoe UI";

const fmtDate = (d?: Date | null) =>
  d ? d.toISOString().replace("T", " ").slice(0, 16).replace(/-/g, "/") : "";

const sevLabel = (s: string) =>
  SEVERITIES[s as keyof typeof SEVERITIES]?.label || s;
const statusLabel = (s: string) =>
  STATUSES[s as keyof typeof STATUSES]?.label || s;
const typeLabel = (t: string) =>
  ERROR_TYPES[t as keyof typeof ERROR_TYPES]?.label || t;

/* تعريف عمود: عنوان + مفتاح + عرض + محاذاة افقية */
type Col = { header: string; width: number; align?: "right" | "center" | "left"; key?: string };

/* لافتة عنوان عريضة تمتد على كل الأعمدة */
function addBanner(
  ws: ExcelJS.Worksheet,
  title: string,
  subtitle: string,
  colCount: number,
) {
  // الصف 1: العنوان الرئيسي
  ws.mergeCells(1, 1, 1, colCount);
  const t = ws.getCell(1, 1);
  t.value = title;
  t.font = { name: FONT, size: 18, bold: true, color: { argb: C.cream } };
  t.alignment = { horizontal: "right", vertical: "middle", readingOrder: "rtl" };
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.ink } };
  ws.getRow(1).height = 38;

  // الصف 2: عنوان فرعي / وصف
  ws.mergeCells(2, 1, 2, colCount);
  const s = ws.getCell(2, 1);
  s.value = subtitle;
  s.font = { name: FONT, size: 10, bold: true, color: { argb: C.ink } };
  s.alignment = { horizontal: "right", vertical: "middle", readingOrder: "rtl" };
  s.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.gold } };
  ws.getRow(2).height = 22;
}

/* صف الرؤوس المنسّق */
function styleHeader(ws: ExcelJS.Worksheet, rowIdx: number, cols: Col[]) {
  const row = ws.getRow(rowIdx);
  cols.forEach((c, i) => {
    const cell = row.getCell(i + 1);
    cell.value = c.header;
    cell.font = { name: FONT, size: 11, bold: true, color: { argb: C.cream } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.inkSoft } };
    cell.alignment = {
      horizontal: c.align || "right",
      vertical: "middle",
      wrapText: true,
      readingOrder: "rtl",
    };
    cell.border = {
      top: { style: "thin", color: { argb: C.gold } },
      bottom: { style: "medium", color: { argb: C.goldDeep } },
      left: { style: "thin", color: { argb: C.borderSoft } },
      right: { style: "thin", color: { argb: C.borderSoft } },
    };
  });
  row.height = 30;
}

/* تطبيق العرض والاتجاه على الأعمدة */
function applyCols(ws: ExcelJS.Worksheet, cols: Col[]) {
  cols.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.width;
  });
  ws.views = [{ rightToLeft: true }];
}

/* تنسيق صف بيانات عادي (تظليل بالتناوب + حدود + محاذاة) */
function styleDataRow(
  ws: ExcelJS.Worksheet,
  rowIdx: number,
  cols: Col[],
  dataIdx: number,
) {
  const row = ws.getRow(rowIdx);
  const bg = dataIdx % 2 === 0 ? C.rowEven : C.rowOdd;
  cols.forEach((c, i) => {
    const cell = row.getCell(i + 1);
    cell.font = { name: FONT, size: 10, color: { argb: C.textDark } };
    cell.alignment = {
      horizontal: c.align || "right",
      vertical: "top",
      wrapText: true,
      readingOrder: "rtl",
    };
    if (!cell.fill || cell.fill.type !== "pattern") {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
    }
    cell.border = {
      top: { style: "hair", color: { argb: C.border } },
      bottom: { style: "hair", color: { argb: C.border } },
      left: { style: "hair", color: { argb: C.borderSoft } },
      right: { style: "hair", color: { argb: C.borderSoft } },
    };
  });
}

/* تلوين خلية وسم (خطورة/حالة) */
function paintTag(cell: ExcelJS.Cell, style: { bg: string; fg: string }) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: style.bg } };
  cell.font = { name: FONT, size: 10, bold: true, color: { argb: style.fg } };
  cell.alignment = { horizontal: "center", vertical: "middle", readingOrder: "rtl" };
}

/* تقدير ارتفاع الصف بحسب أطول نص ملتف */
function estimateHeight(texts: { text: string; width: number }[]) {
  let maxLines = 1;
  for (const t of texts) {
    if (!t.text) continue;
    const perLine = Math.max(8, Math.floor(t.width * 1.7));
    const hardLines = t.text.split("\n").length;
    const lines = Math.max(
      hardLines,
      Math.ceil(t.text.length / perLine),
    );
    if (lines > maxLines) maxLines = lines;
  }
  return Math.min(180, Math.max(22, maxLines * 15 + 6));
}

/* شريط نسبي نصّي للتمثيل البصري داخل الخلية */
function bar(pct: number) {
  const blocks = Math.round(pct / 5); // 0..20
  return "█".repeat(blocks) + "░".repeat(Math.max(0, 20 - blocks));
}

// GET /api/export?scope=all|reports|stats|evidence  — يُصدّر مصنّف Excel احترافيًا منسّقًا (RTL)
export async function GET(req: NextRequest) {
  try {
    const gate = await requireActive();
    if (!gate.ok) return gate.res;

    const url = new URL(req.url);
    const scope = url.searchParams.get("scope") || "all";

    const reports = await db.errorReport.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      include: {
        author: true,
        solutionAuthor: true,
        examples: { include: { author: true }, orderBy: { createdAt: "asc" } },
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "منصّة تتبّع أخطاء ستايل مندلي — تدبُّر";
    wb.created = new Date();
    wb.company = "TADABBUR";

    const exportedAt = fmtDate(new Date());

    /* ════════════════ الإحصائيات الأساسية (مشتركة) ════════════════ */
    const typeCounts: Record<string, number> = {};
    const sevCounts: Record<string, number> = {};
    const stCounts: Record<string, number> = {};
    let totalExamples = 0;
    let totalComments = 0;
    for (const r of reports) {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
      sevCounts[r.severity] = (sevCounts[r.severity] || 0) + 1;
      stCounts[r.status] = (stCounts[r.status] || 0) + 1;
      totalExamples += r.examples.length;
      totalComments += r.comments.length;
    }
    const total = reports.length;
    const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

    /* ════════════════ غلاف / ملخّص تنفيذي ════════════════ */
    const buildCover = () => {
      const ws = wb.addWorksheet("الملخّص التنفيذي", {
        views: [{ rightToLeft: true, showGridLines: false }],
        pageSetup: { orientation: "portrait", margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } },
      });
      const cols: Col[] = [
        { header: "البند", key: "k", width: 34 },
        { header: "القيمة", key: "v", width: 26, align: "center" },
      ];
      applyCols(ws, cols);
      addBanner(
        ws,
        "منصّة تتبّع أخطاء ستايل مندلي — التقرير الشامل",
        `ملخّص تنفيذي • تاريخ التصدير: ${exportedAt} • إجمالي البلاغات: ${total}`,
        cols.length,
      );

      const kpis: { k: string; v: string | number; tone?: "good" | "warn" | "bad" | "neutral" }[] = [
        { k: "إجمالي البلاغات", v: total, tone: "neutral" },
        { k: "بلاغات مفتوحة", v: stCounts["open"] || 0, tone: "bad" },
        { k: "قيد المعالجة", v: stCounts["in_progress"] || 0, tone: "warn" },
        { k: "تم حلّها", v: stCounts["resolved"] || 0, tone: "good" },
        { k: "مغلقة", v: stCounts["closed"] || 0, tone: "neutral" },
        { k: "نسبة الإنجاز (محلولة + مغلقة)", v: `${pct((stCounts["resolved"] || 0) + (stCounts["closed"] || 0)).toFixed(1)}%`, tone: "good" },
        { k: "أخطاء حرجة", v: sevCounts["critical"] || 0, tone: "bad" },
        { k: "أخطاء عالية الخطورة", v: sevCounts["high"] || 0, tone: "warn" },
        { k: "إجمالي الشواهد المرفقة", v: totalExamples, tone: "neutral" },
        { k: "إجمالي التعليقات", v: totalComments, tone: "neutral" },
      ];

      const headerRow = 3;
      styleHeader(ws, headerRow, cols);
      kpis.forEach((kpi, i) => {
        const r = headerRow + 1 + i;
        styleDataRow(ws, r, cols, i);
        const kc = ws.getCell(r, 1);
        const vc = ws.getCell(r, 2);
        kc.value = kpi.k;
        kc.font = { name: FONT, size: 11, bold: true, color: { argb: C.textDark } };
        vc.value = kpi.v;
        const toneMap = {
          good: SEV_STYLE.low,
          warn: SEV_STYLE.medium,
          bad: SEV_STYLE.critical,
          neutral: { bg: "FFEDE8DE", fg: C.ink },
        } as const;
        paintTag(vc, toneMap[kpi.tone || "neutral"]);
        ws.getRow(r).height = 26;
      });
      ws.views = [{ rightToLeft: true, showGridLines: false, state: "frozen", ySplit: headerRow }];
    };

    /* ════════════════ سجل البلاغات (التفصيلي) ════════════════ */
    const buildReports = () => {
      const cols: Col[] = [
        { header: "م", width: 5, align: "center" },
        { header: "المعرّف", width: 9, align: "center" },
        { header: "النوع", width: 20 },
        { header: "الخطورة", width: 11, align: "center" },
        { header: "الحالة", width: 13, align: "center" },
        { header: "الأولوية", width: 8, align: "center" },
        { header: "العنوان", width: 34 },
        { header: "الوصف", width: 48 },
        { header: "الموقع / المرجع", width: 24 },
        { header: "رقم الصفحة", width: 9, align: "center" },
        { header: "الحقل (CSL/مندلي)", width: 16 },
        { header: "الوسوم", width: 18 },
        { header: "الشواهد", width: 8, align: "center" },
        { header: "التعليقات", width: 8, align: "center" },
        { header: "المدوّن", width: 16 },
        { header: "دور المدوّن", width: 14 },
        { header: "تاريخ التدوين", width: 17, align: "center" },
        { header: "الحل المقترح", width: 46 },
        { header: "صاحب الحل", width: 16 },
        { header: "تاريخ الحل", width: 17, align: "center" },
        { header: "تاريخ الإغلاق", width: 17, align: "center" },
        { header: "آخر تحديث", width: 17, align: "center" },
      ];
      const ws = wb.addWorksheet("سجل البلاغات", {
        views: [{ rightToLeft: true }],
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      });
      applyCols(ws, cols);
      addBanner(
        ws,
        "سجل البلاغات التفصيلي",
        `${total} بلاغًا • مرتّبة حسب الأولوية ثم الأحدث • تُصدَّر كاملةً بكل تفاصيلها`,
        cols.length,
      );
      const headerRow = 3;
      styleHeader(ws, headerRow, cols);

      reports.forEach((r, idx) => {
        const rIdx = headerRow + 1 + idx;
        const vals = [
          idx + 1,
          r.id.slice(-6).toUpperCase(),
          typeLabel(r.type),
          sevLabel(r.severity),
          statusLabel(r.status),
          r.priority,
          r.title,
          r.description,
          r.location || "",
          r.pageNumber || "",
          r.fieldTag || "",
          r.tags || "",
          r.examples.length,
          r.comments.length,
          r.author?.name || "",
          r.author?.role || "",
          fmtDate(r.createdAt),
          r.solutionText || "",
          r.solutionAuthor?.name || "",
          fmtDate(r.solutionAt),
          fmtDate(r.closedAt),
          fmtDate(r.updatedAt),
        ];
        const row = ws.getRow(rIdx);
        vals.forEach((v, i) => (row.getCell(i + 1).value = v as ExcelJS.CellValue));
        styleDataRow(ws, rIdx, cols, idx);
        // ترميز لوني للخطورة (عمود 4) والحالة (عمود 5)
        paintTag(row.getCell(4), SEV_STYLE[r.severity] || SEV_STYLE.medium);
        paintTag(row.getCell(5), STATUS_STYLE[r.status] || STATUS_STYLE.open);
        // إبراز المعرّف
        row.getCell(2).font = { name: FONT, size: 9, bold: true, color: { argb: C.muted } };
        row.getCell(2).alignment = { horizontal: "center", vertical: "top" };
        // العنوان بخط أثقل
        row.getCell(7).font = { name: FONT, size: 10, bold: true, color: { argb: C.textDark } };
        row.height = estimateHeight([
          { text: r.title, width: 34 },
          { text: r.description, width: 48 },
          { text: r.solutionText || "", width: 46 },
          { text: r.location || "", width: 24 },
        ]);
      });

      ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: headerRow, column: cols.length } };
      ws.views = [{ rightToLeft: true, state: "frozen", ySplit: headerRow, xSplit: 2 }];
    };

    /* ════════════════ شواهد البلاغات ════════════════ */
    const buildEvidence = () => {
      const cols: Col[] = [
        { header: "م", width: 5, align: "center" },
        { header: "معرّف البلاغ", width: 10, align: "center" },
        { header: "عنوان البلاغ", width: 36 },
        { header: "نوع البلاغ", width: 18 },
        { header: "خطورة البلاغ", width: 12, align: "center" },
        { header: "نص الشاهد", width: 70 },
        { header: "أضافه", width: 16 },
        { header: "الدور", width: 14 },
        { header: "تاريخ الإضافة", width: 17, align: "center" },
      ];
      const ws = wb.addWorksheet("شواهد البلاغات", {
        views: [{ rightToLeft: true }],
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      });
      applyCols(ws, cols);
      addBanner(
        ws,
        "شواهد البلاغات (الأمثلة التطبيقية)",
        `${totalExamples} شاهدًا مرفقًا • كل شاهد منسوب إلى بلاغه الأصلي`,
        cols.length,
      );
      const headerRow = 3;
      styleHeader(ws, headerRow, cols);

      let n = 0;
      for (const r of reports) {
        for (const ex of r.examples) {
          const rIdx = headerRow + 1 + n;
          const vals = [
            n + 1,
            r.id.slice(-6).toUpperCase(),
            r.title,
            typeLabel(r.type),
            sevLabel(r.severity),
            ex.body,
            ex.author?.name || "",
            ex.author?.role || "",
            fmtDate(ex.createdAt),
          ];
          const row = ws.getRow(rIdx);
          vals.forEach((v, i) => (row.getCell(i + 1).value = v as ExcelJS.CellValue));
          styleDataRow(ws, rIdx, cols, n);
          paintTag(row.getCell(5), SEV_STYLE[r.severity] || SEV_STYLE.medium);
          row.getCell(2).font = { name: FONT, size: 9, bold: true, color: { argb: C.muted } };
          row.getCell(2).alignment = { horizontal: "center", vertical: "top" };
          // نص الشاهد بخط ثابت العرض لإبراز التفاصيل النصّية
          row.getCell(6).font = { name: "Consolas", size: 10, color: { argb: C.textDark } };
          row.height = estimateHeight([
            { text: ex.body, width: 70 },
            { text: r.title, width: 36 },
          ]);
          n++;
        }
      }
      if (n === 0) {
        const rIdx = headerRow + 1;
        ws.mergeCells(rIdx, 1, rIdx, cols.length);
        const c = ws.getCell(rIdx, 1);
        c.value = "لا توجد شواهد مرفقة بعد.";
        c.font = { name: FONT, size: 11, italic: true, color: { argb: C.muted } };
        c.alignment = { horizontal: "center", vertical: "middle", readingOrder: "rtl" };
      }
      ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: headerRow, column: cols.length } };
      ws.views = [{ rightToLeft: true, state: "frozen", ySplit: headerRow }];
    };

    /* ════════════════ تعليقات / متابعات البلاغات ════════════════ */
    const buildComments = () => {
      const cols: Col[] = [
        { header: "م", width: 5, align: "center" },
        { header: "معرّف البلاغ", width: 10, align: "center" },
        { header: "عنوان البلاغ", width: 36 },
        { header: "نص التعليق", width: 70 },
        { header: "الكاتب", width: 16 },
        { header: "الدور", width: 14 },
        { header: "التاريخ", width: 17, align: "center" },
      ];
      const ws = wb.addWorksheet("متابعات البلاغات", {
        views: [{ rightToLeft: true }],
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      });
      applyCols(ws, cols);
      addBanner(
        ws,
        "متابعات البلاغات (التعليقات)",
        `${totalComments} تعليقًا • نقاش الفريق منسوبًا إلى كل بلاغ`,
        cols.length,
      );
      const headerRow = 3;
      styleHeader(ws, headerRow, cols);

      let n = 0;
      for (const r of reports) {
        for (const cm of r.comments) {
          const rIdx = headerRow + 1 + n;
          const vals = [
            n + 1,
            r.id.slice(-6).toUpperCase(),
            r.title,
            cm.body,
            cm.author?.name || "",
            cm.author?.role || "",
            fmtDate(cm.createdAt),
          ];
          const row = ws.getRow(rIdx);
          vals.forEach((v, i) => (row.getCell(i + 1).value = v as ExcelJS.CellValue));
          styleDataRow(ws, rIdx, cols, n);
          row.getCell(2).font = { name: FONT, size: 9, bold: true, color: { argb: C.muted } };
          row.getCell(2).alignment = { horizontal: "center", vertical: "top" };
          row.height = estimateHeight([
            { text: cm.body, width: 70 },
            { text: r.title, width: 36 },
          ]);
          n++;
        }
      }
      if (n === 0) {
        const rIdx = headerRow + 1;
        ws.mergeCells(rIdx, 1, rIdx, cols.length);
        const c = ws.getCell(rIdx, 1);
        c.value = "لا توجد تعليقات بعد.";
        c.font = { name: FONT, size: 11, italic: true, color: { argb: C.muted } };
        c.alignment = { horizontal: "center", vertical: "middle", readingOrder: "rtl" };
      }
      ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: headerRow, column: cols.length } };
      ws.views = [{ rightToLeft: true, state: "frozen", ySplit: headerRow }];
    };

    /* ════════════════ ورقة إحصائية عامة (قابلة لإعادة الاستخدام) ════════════════ */
    const buildStatSheet = (
      sheetName: string,
      title: string,
      catHeader: string,
      rowsData: { label: string; code: string; count: number }[],
      colorOf?: (code: string) => { bg: string; fg: string } | undefined,
    ) => {
      const cols: Col[] = [
        { header: catHeader, width: 26 },
        { header: "الكود", width: 14, align: "center" },
        { header: "العدد", width: 9, align: "center" },
        { header: "النسبة", width: 11, align: "center" },
        { header: "التمثيل", width: 26, align: "right" },
      ];
      const ws = wb.addWorksheet(sheetName, {
        views: [{ rightToLeft: true }],
        pageSetup: { orientation: "portrait" },
      });
      applyCols(ws, cols);
      addBanner(ws, title, `إجمالي البلاغات: ${total} • تاريخ التصدير: ${exportedAt}`, cols.length);
      const headerRow = 3;
      styleHeader(ws, headerRow, cols);

      rowsData.forEach((d, i) => {
        const rIdx = headerRow + 1 + i;
        const p = pct(d.count);
        const row = ws.getRow(rIdx);
        row.getCell(1).value = d.label;
        row.getCell(2).value = d.code;
        row.getCell(3).value = d.count;
        row.getCell(4).value = `${p.toFixed(1)}%`;
        row.getCell(5).value = bar(p);
        styleDataRow(ws, rIdx, cols, i);
        row.getCell(1).font = { name: FONT, size: 11, bold: true, color: { argb: C.textDark } };
        row.getCell(2).font = { name: FONT, size: 9, color: { argb: C.muted } };
        row.getCell(3).font = { name: FONT, size: 11, bold: true, color: { argb: C.ink } };
        row.getCell(5).font = { name: FONT, size: 11, color: { argb: C.goldDeep } };
        const tag = colorOf?.(d.code);
        if (tag) paintTag(row.getCell(1), tag);
        row.height = 24;
      });

      // صف الإجمالي
      const totalRow = headerRow + 1 + rowsData.length;
      const tr = ws.getRow(totalRow);
      tr.getCell(1).value = "الإجمالي";
      tr.getCell(3).value = rowsData.reduce((a, b) => a + b.count, 0);
      tr.getCell(4).value = "100%";
      [1, 2, 3, 4, 5].forEach((ci) => {
        const c = tr.getCell(ci);
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.ink } };
        c.font = { name: FONT, size: 11, bold: true, color: { argb: C.cream } };
        c.alignment = { horizontal: ci === 1 ? "right" : "center", vertical: "middle", readingOrder: "rtl" };
      });
      tr.height = 26;
      ws.views = [{ rightToLeft: true, state: "frozen", ySplit: headerRow }];
    };

    const buildTypeStats = () =>
      buildStatSheet(
        "إحصائيات الأنواع",
        "توزيع البلاغات حسب النوع",
        "النوع",
        (Object.keys(ERROR_TYPES) as (keyof typeof ERROR_TYPES)[]).map((k) => ({
          label: ERROR_TYPES[k].label,
          code: k,
          count: typeCounts[k] || 0,
        })),
      );

    const buildSevStats = () =>
      buildStatSheet(
        "إحصائيات الخطورة",
        "توزيع البلاغات حسب الخطورة",
        "الخطورة",
        (Object.keys(SEVERITIES) as (keyof typeof SEVERITIES)[]).map((k) => ({
          label: SEVERITIES[k].label,
          code: k,
          count: sevCounts[k] || 0,
        })),
        (code) => SEV_STYLE[code],
      );

    const buildStatusStats = () =>
      buildStatSheet(
        "إحصائيات الحالات",
        "توزيع البلاغات حسب الحالة",
        "الحالة",
        (Object.keys(STATUSES) as (keyof typeof STATUSES)[]).map((k) => ({
          label: STATUSES[k].label,
          code: k,
          count: stCounts[k] || 0,
        })),
        (code) => STATUS_STYLE[code],
      );

    const buildMemberStats = () => {
      const cols: Col[] = [
        { header: "العضو", width: 22 },
        { header: "الدور", width: 16 },
        { header: "بلاغات مدوّنة", width: 14, align: "center" },
        { header: "حلول مقدّمة", width: 14, align: "center" },
        { header: "شواهد مضافة", width: 14, align: "center" },
        { header: "تعليقات", width: 12, align: "center" },
      ];
      const ws = wb.addWorksheet("إحصائيات الأعضاء", {
        views: [{ rightToLeft: true }],
        pageSetup: { orientation: "landscape" },
      });
      applyCols(ws, cols);
      addBanner(ws, "مساهمات الأعضاء", `تاريخ التصدير: ${exportedAt}`, cols.length);
      const headerRow = 3;
      styleHeader(ws, headerRow, cols);

      const map = new Map<string, { name: string; role: string; reported: number; solved: number; examples: number; comments: number }>();
      const ensure = (id: string, name: string, role: string) => {
        if (!map.has(id)) map.set(id, { name, role, reported: 0, solved: 0, examples: 0, comments: 0 });
        return map.get(id)!;
      };
      for (const r of reports) {
        const a = ensure(r.author?.id || "unknown", r.author?.name || "غير معروف", r.author?.role || "");
        a.reported++;
        if (r.solutionAuthorId && r.solutionText) {
          ensure(r.solutionAuthorId, r.solutionAuthor?.name || "", r.solutionAuthor?.role || "").solved++;
        }
        for (const ex of r.examples) ensure(ex.author?.id || "unknown", ex.author?.name || "غير معروف", ex.author?.role || "").examples++;
        for (const cm of r.comments) ensure(cm.author?.id || "unknown", cm.author?.name || "غير معروف", cm.author?.role || "").comments++;
      }
      const rowsData = Array.from(map.values()).sort((a, b) => b.reported - a.reported);
      rowsData.forEach((m, i) => {
        const rIdx = headerRow + 1 + i;
        const row = ws.getRow(rIdx);
        [m.name, m.role, m.reported, m.solved, m.examples, m.comments].forEach(
          (v, ci) => (row.getCell(ci + 1).value = v as ExcelJS.CellValue),
        );
        styleDataRow(ws, rIdx, cols, i);
        row.getCell(1).font = { name: FONT, size: 11, bold: true, color: { argb: C.textDark } };
        row.height = 24;
      });
      ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: headerRow, column: cols.length } };
      ws.views = [{ rightToLeft: true, state: "frozen", ySplit: headerRow }];
    };

    /* ════════════════ بناء الأوراق حسب النطاق ════════════════ */
    if (scope === "reports") {
      buildReports();
      buildEvidence();
    } else if (scope === "evidence") {
      buildEvidence();
    } else if (scope === "stats") {
      buildCover();
      buildTypeStats();
      buildSevStats();
      buildStatusStats();
      buildMemberStats();
    } else {
      // all
      buildCover();
      buildReports();
      buildEvidence();
      buildComments();
      buildTypeStats();
      buildSevStats();
      buildStatusStats();
      buildMemberStats();
    }

    const arrayBuffer = await wb.xlsx.writeBuffer();
    const body = new Uint8Array(arrayBuffer);

    const filename = `tadabbur-errors-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new NextResponse(body, {
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
