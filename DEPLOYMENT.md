# دليل النشر — منصة تتبع أخطاء مرسم تدبر (Vercel + Neon)

> تم التحقق محلياً من أن أمر البناء `npm run build` ينجح بالكامل مع فحص TypeScript مُفعّلاً.

## نظرة عامة على البنية بعد التعديل

| العنصر | القيمة |
|---|---|
| قاعدة البيانات | PostgreSQL على **Neon** |
| الاستضافة | **Vercel** (يبني تلقائياً عند كل push إلى GitHub) |
| أمر البناء على Vercel | `npm run build` → يشغّل `prisma generate && next build --webpack` |
| السرّ المطلوب | `DATABASE_URL` (يُضاف في Vercel Environment Variables — **لا يوضع في الكود**) |

---

## الخطوة 1 — قاعدة بيانات Neon

1. ادخل لوحة Neon → أنشئ مشروعاً (أو استخدم القائم).
2. انسخ **Connection string** بصيغة:
   ```
   postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require
   ```
3. ضعه محلياً في ملف `.env` (غير مُتتبَّع في git):
   ```
   DATABASE_URL="postgresql://...."
   ```
4. أنشئ الجداول في Neon:
   ```bash
   npx prisma db push
   ```

## الخطوة 2 — رفع الكود إلى GitHub

```bash
# أنشئ مستودعاً جديداً على GitHub أولاً (مثلاً: tadabbur-tracker)
git add -A
git commit -m "تجهيز للنشر: PostgreSQL + إصلاحات بناء + تحسينات واجهة"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

> ⚠️ تأكد أن `.env` **غير** مرفوع (تم ضبط `.gitignore` بالفعل، وملف `.env` أُزيل من تتبّع git).

## الخطوة 3 — الربط بـ Vercel

**عبر لوحة Vercel (الأسهل):**
1. New Project → Import Git Repository → اختر مستودعك.
2. Framework Preset: **Next.js** (يُكتشف تلقائياً).
3. **Environment Variables** → أضف:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | رابط Neon نفسه |
4. Deploy.

**أو عبر Vercel CLI (مثبّت لديك):**
```bash
vercel login
vercel link
vercel env add DATABASE_URL production   # ألصق رابط Neon
vercel --prod
```

## الخطوة 4 — التحقق بعد النشر

1. افتح الرابط `https://<اسم-المشروع>.vercel.app`.
2. من زر «الفريق» أضف عضواً، ثم سجّل بلاغاً تجريبياً.
3. غيّر حالة البلاغ وأضف تعليقاً.
4. جرّب تصدير Excel.

---

## ملاحظات تقنية مهمة

- **`prisma generate` ضمن أمر البناء وكذلك `postinstall`** — ضروري حتى لا يستخدم Vercel نسخة Prisma Client قديمة من الكاش.
- استُخدم `next build --webpack` بدل Turbopack لأن Turbopack ينهار محلياً بسبب رموز RTL المخفية في اسم مجلد المشروع؛ webpack مُختبَر ومستقر على Vercel أيضاً.
- على Vercel لا تظهر مشكلة المسار لأن المستودع يُستنسخ في مسار إنجليزي نظيف.
