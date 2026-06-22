---
Task ID: tadabbur-team-platform
Agent: Super Z (main)
Task: تحويل ملف tadabbur-csl-studio222.html إلى منصة ويب تفاعلية لفريق العمل
  لتتبع أخطاء بيانات المصادر والمراجع من مندلي، مع تصدير Excel احترافي ولوحة
  إحصائية ولوحة قيادة حيّة.

Work Log:
- قراءة ملف tadabbur-csl-studio222.html الأصلي واستخراج الهوية البصرية
  (خلفية داكنة، لمسات ذهبية، خطوط Amiri/Cairo).
- تهيئة بيئة fullstack-dev (Next.js 16 + TypeScript + Tailwind 4 + Prisma
  + SQLite + Recharts + xlsx).
- كتابة schema Prisma بثلاثة نماذج: Member / ErrorReport / ReportComment /
  ActivityLog وتشغيل db:push.
- بناء ثوابت الأنواع: data / style / plugin / note / suggestion / other،
  مع مستويات الخطورة والحالات والأولوية بالعربية.
- بناء مسارات API:
  · /api/members (GET, POST)
  · /api/members/[id] (PATCH, DELETE)
  · /api/reports (GET, POST) مع فلاتر نوع/خطورة/حالة/مدوّن/بحث نصّي
  · /api/reports/[id] (GET, PATCH, DELETE)
  · /api/reports/[id]/solution (POST) — حفظ الحل + صاحب الحل + تاريخ تلقائي
  · /api/reports/[id]/comments (POST) — تعليقات الفريق
  · /api/stats — تجميع إحصائيات شاملة للداش بورد (آخر 14 يومًا)
  · /api/activity — سجل النشاط
  · /api/export?scope=all|reports|stats — تصدير XLSX بـ 6 أوراق منظّمة
    (سجل الأخطاء، إحصائيات الأنواع/الخطورة/الحالات/الأعضاء، ملخص تنفيذي)
  · /api/seed — بيانات تجريبية للاستعراض الأول.
- بناء الواجهة (RTL عربية):
  · layout.tsx: خطوط Cairo/Amiri/IBM Plex Mono، dir=rtl، lang=ar.
  · globals.css: ثيم «مرسم تدبر» داكن مع متغيرات ذهبية/محمرة، شريط تمرير
    أنيق، تأثيرات hover/glow، رسوم متحركة fade-up.
  · MemberProvider: سياق React لاختيار العضو الحالي وحفظه في localStorage.
  · Header: شعار مرسم دائري + عنوان + بطاقة العضو الحالي + Sheet لأعضاء الفريق
    + تبويبات (لوحة القيادة / بلاغ جديد / سجل البلاغات / أعضاء الفريق).
  · Dashboard: 4 بطاقات KPI + مخطط دائري للأنواع + مخطط أعمدة أفقي للخطورة
    + مخطط خطّي زمني (14 يومًا) + شريط تقدّم الحالات + قائمتا «الأكثر تدوينًا»
    و«الأكثر حلًّا» + آخر البلاغات + سجل النشاط. تحديث تلقائي كل 15 ثانية.
  · NewReportForm: بطاقات اختيار نوع بصرية + حقول العنوان/الوصف/الموقع/
    الصفحة/الحقل/الوسوم + اختيار الخطورة والأولوية + طابع زمني تلقائي.
  · ReportsList: فلاتر متعددة + بحث + بطاقات منظمة + نافذة تفاصيل Dialog
    تحتوي: تغيير الحالة بسرعة، تسجيل الحل (نص + صاحب + تاريخ تلقائي)،
    تعليقات ومتابعة، حذف البلاغ.
  · MembersManager: بطاقات الأعضاء مع إحصائياتهم + إضافة/تعديل/حذف +
    اختيار لون تمييزي + تعيين العضو الحالي.
- اختبار الذاتي عبر Agent Browser:
  · فتح الصفحة بدون أخطاء.
  · زرع البيانات التجريبية (3 أعضاء + 7 بلاغات).
  · اختيار عضو من Sheet.
  · إنشاء بلاغ جديد وتحقق ظهوره في السجل.
  · فتح نافذة تفاصيل بلاغ + إضافة حل + إضافة تعليق + تغيير الحالة.
  · تصدير Excel بكل الأنواع (all/reports/stats) — جميعها 200 OK و6 أوراق.
  · اختبار viewport موبايل (375×800).
- إصلاح خطأ: SelectItem بقيمة فارغة في ReportDialog تم استبداله بقيمة "none".

Stage Summary:
- منصة جاهزة على http://localhost:3000
- preview link: https://preview-<bot-id>.space-z.ai/
- قاعدة البيانات: /home/z/my-project/db/custom.db (SQLite)
- جميع الجداول تعمل: Member, ErrorReport, ReportComment, ActivityLog.
- تصدير Excel احترافي بـ 6 أوراق منظمة (RTL، أعمدة محسّنة العرض).
- لوحة قيادة حيّة بـ 4 بطاقات KPI + 4 مخططات Recharts + قوائم ترتيب.
- التطبيق يلبي جميع متطلبات المستخدم: تتبع كل أنواع الأخطاء (بيانات/
  نمط/إضافة/ملاحظة/مقترح/أخرى) + طوابع زمنية تلقائية + تصدير Excel +
  لوحة إحصائية + اسم المدوّن + حلول مقترحة + اسم صاحب الحل + تاريخ الحل.
