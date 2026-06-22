import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/seed — يزرع بيانات تجريبية لتسهيل التجربة الأولى
export async function POST() {
  try {
    const existing = await db.member.count();
    if (existing > 0) {
      return NextResponse.json({ ok: true, skipped: true, message: "already_seeded" });
    }

    const m1 = await db.member.create({
      data: { name: "أ. عبدالله", role: "محقق", color: "#c9a24b", initials: "ع" },
    });
    const m2 = await db.member.create({
      data: { name: "أ. مريم", role: "مراجعة لغوية", color: "#b04a36", initials: "م" },
    });
    const m3 = await db.member.create({
      data: { name: "أ. يوسف", role: "مطوّر CSL", color: "#7faa5a", initials: "ي" },
    });

    const samples: Array<{
      type: string;
      severity: string;
      status: string;
      title: string;
      description: string;
      location?: string;
      pageNumber?: string;
      fieldTag?: string;
      authorId: string;
      solutionText?: string;
      solutionAuthorId?: string;
      tags?: string;
    }> = [
      {
        type: "data",
        severity: "high",
        status: "open",
        title: "خطأ في اسم المؤلف لمصدر «تفسير الطبري»",
        description:
          "الاسم المستورد من المكتبة الشاملة يحتوي على «محمد بن جرير الطبري» بينما الصواب «محمد بن جرير بن يزيد الطبري» كما في المخطوطة الأم.",
        location: "تفسير الطبري — الجزء 3",
        pageNumber: "12",
        fieldTag: "author",
        authorId: m1.id,
        tags: "مؤلف,تضرر اسم",
      },
      {
        type: "style",
        severity: "medium",
        status: "in_progress",
        title: "فاصلة زائدة بعد العنوان في قائمة المراجع",
        description:
          "في نمط APA المُولّد، تظهر فاصلة منقوطة بعد العنوان مباشرة قبل اسم المؤلف، وهذا لا يطابق المواصفة.",
        location: "ملف tadabbur-apa.csl",
        fieldTag: "bibliography > layout",
        authorId: m3.id,
        tags: "APA,ترقيم",
      },
      {
        type: "plugin",
        severity: "critical",
        status: "open",
        title: "تجمّد إضافة مندلي عند تحديث الاستشهادات",
        description:
          "عند الضغط على «Update Citations and Bibliography» تتجمد الإضافة لمدة 30 ثانية ثم تستجيب دون تطبيق التحديث على أكثر من 50 استشهادًا.",
        location: "Word 2021 — Windows 11",
        authorId: m2.id,
        tags: "تجميد,وورد",
      },
      {
        type: "note",
        severity: "low",
        status: "open",
        title: "ملاحظة: تعديل ترتيب حقول مندلي",
        description:
          "يُفضّل ترتيب الحقول في بطاقة مندلي بحيث يظهر حقل «Pages» قبل «Volume» لتسهيل المراجعة البصرية.",
        authorId: m2.id,
      },
      {
        type: "suggestion",
        severity: "medium",
        status: "resolved",
        title: "مقترح: إضافة دعم لأنماط مختلطة عربي/إنجليزي",
        description:
          "يُقترح إضافة خيار في المرسم يسمح بتوليد استشهاد مختلط: الجزء العربي بخط Amiri والإنجليزي بخط Times.",
        authorId: m3.id,
        solutionText:
          "تم تقييم المقترح وسيتم تنفيذه في الإصدار 2.1 عبر متغير newStyle في مولّد CSL.",
        solutionAuthorId: m3.id,
      },
      {
        type: "data",
        severity: "low",
        status: "resolved",
        title: "سنة النشر مفقودة لمصدر «الإتقان للسيوطي»",
        description: "حقل السنة فارغ في الاستيراد، والصواب 1978م (طبرة دار الفكر).",
        location: "الإتقان في علوم القرآن",
        fieldTag: "issued",
        authorId: m1.id,
        solutionText: "تم تعديل الحقل يدويًا في مندلي وإعادة المزامنة.",
        solutionAuthorId: m1.id,
      },
      {
        type: "other",
        severity: "low",
        status: "open",
        title: "اقتراح تحسين واجهة المرسم",
        description: "إضافة زر «معاينة مباشرة» قبل تصدير ملف CSL.",
        authorId: m2.id,
      },
    ];

    for (const s of samples) {
      const created = await db.errorReport.create({
        data: {
          type: s.type,
          severity: s.severity,
          status: s.status,
          title: s.title,
          description: s.description,
          location: s.location || null,
          pageNumber: s.pageNumber || null,
          fieldTag: s.fieldTag || null,
          authorId: s.authorId,
          tags: s.tags || null,
          solutionText: s.solutionText || null,
          solutionAuthorId: s.solutionAuthorId || null,
          solutionAt: s.solutionText ? new Date() : null,
          closedAt: s.status === "closed" ? new Date() : null,
        },
      });
      await db.activityLog.create({
        data: {
          actorId: s.authorId,
          action: "created",
          targetType: "report",
          targetId: created.id,
        },
      });
    }

    return NextResponse.json({ ok: true, seeded: samples.length });
  } catch (e) {
    console.error("POST /api/seed", e);
    return NextResponse.json({ error: "seed_failed" }, { status: 500 });
  }
}
