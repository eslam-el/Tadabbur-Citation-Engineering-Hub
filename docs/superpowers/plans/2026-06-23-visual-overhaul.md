# خطة تنفيذ التطوير البصري لمنصة مرسم تدبر

> **للمنفّذ:** استخدم `superpowers:subagent-driven-development` (موصى به) أو `superpowers:executing-plans` لتنفيذ هذه الخطة مهمةً مهمة. الخطوات تستخدم صيغة checkbox للتتبع.

**الهدف:** صقل بصري احترافي للمنصة: وضعان نهاري/ليلي، خطوط أحدث، دقة RTL، ومؤثرات راقية — دون تغيير الوظائف.

**المعمارية:** `next-themes` (صنف `dark` على `<html>`، افتراضي ليلي) + نظام توكنات دلالية في `globals.css` يغذّي الوضعين، مع تحويل كل الألوان المباشرة في المكونات إلى توكنات.

**التقنيات:** Next.js 16 · Tailwind v4 (`@theme inline`) · next-themes · next/font/google.

## قيود عامة (تنطبق على كل مهمة)
- البناء دائماً بـ **`npx next build --webpack`** (Turbopack ينهار على مسار RTL محلياً). للبناء مع DB وهمي: `DATABASE_URL="postgresql://u:p@localhost:5432/db?sslmode=require"`.
- **لا** تغيير في API أو schema أو منطق الأعمال.
- بعد كل مهمة: البناء يجب أن ينجح بـ **0 أخطاء TypeScript**.
- الحفاظ على RTL: استخدم الخصائص المنطقية فقط (`ms/me`, `ps/pe`, `start/end`).
- الذهبي/القرمزي/الأخضر/الأزرق هوية ثابتة في الوضعين.

---

## بنية الملفات

| ملف | المسؤولية |
|---|---|
| `src/components/theme-provider.tsx` | **جديد** — غلاف next-themes |
| `src/components/theme-toggle.tsx` | **جديد** — زر شمس/قمر |
| `src/app/layout.tsx` | الخطوط + لفّ ThemeProvider + `className="dark"` |
| `src/app/globals.css` | توكنات الوضعين + الخط + الحركات + reduced-motion |
| `src/components/app-header.tsx` | توكنات + RTL + زر التبديل + مؤشّر تبويب |
| `src/components/dashboard.tsx` | توكنات + RTL + Recharts + حركات |
| `src/components/reports-list.tsx` | توكنات + RTL |
| `src/components/new-report-form.tsx` | توكنات + RTL |
| `src/components/members-manager.tsx` | توكنات + RTL |
| `src/components/chips.tsx` | توكنات |
| `src/app/page.tsx` | توكنات + RTL (التنبيه/التذييل) |

---

## Task 1: تبديل خط النص العام إلى IBM Plex Sans Arabic

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` (السطر 9، و`html,body`)

- [ ] **Step 1: تحديث الاستيراد والتعريف في layout.tsx**

استبدل استيراد `Tajawal` وتعريفه:
```tsx
import { IBM_Plex_Sans_Arabic, Alexandria, JetBrains_Mono } from "next/font/google";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
```
وفي الـ body بدّل `${tajawal.variable}` بـ `${ibmPlexArabic.variable}`.

- [ ] **Step 2: تحديث globals.css**

السطر 9:
```css
--font-sans: var(--font-plex-arabic), "IBM Plex Sans Arabic", system-ui, sans-serif;
```
وأضف في كتلة `@layer base` ضمن `html, body` بعد `font-family`:
```css
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    line-height: 1.7;
    letter-spacing: 0;
```

- [ ] **Step 3: بناء وتحقق**

Run: `DATABASE_URL="postgresql://u:p@localhost:5432/db?sslmode=require" npx next build --webpack`
Expected: `✓ Compiled successfully` + 0 أخطاء.

- [ ] **Step 4: التزام**
```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "خطوط: تبديل النص العام إلى IBM Plex Sans Arabic + ضبط الانسيابية"
```

---

## Task 2: نظام التوكنات الدلالية للوضعين في globals.css

**Files:**
- Modify: `src/app/globals.css`

**Interfaces — Produces:** توكنات تستهلكها كل المكونات لاحقاً:
`--surface-1/2/3`, `--text-strong`, `--text-dim`, `--accent-gold`, `--accent-gold-bright`, `--accent-crimson`, `--accent-green`, `--accent-blue`, `--border-soft`, `--soft-gold-bg`, `--soft-crimson-bg`, `--shadow-md`.

- [ ] **Step 1: إعادة هيكلة `:root` لتكون الوضع الفاتح، وإضافة `.dark` للوضع الداكن**

في `globals.css`: المتغيرات الحالية تحت `:root` (التي هي داكنة الآن) تُنقل إلى `.dark`. ويُعرّف `:root` كوضع فاتح. أضف التوكنات الدلالية في كلا الكتلتين:

```css
:root {
  --radius: 0.75rem;
  /* الوضع الفاتح — ورقي فاتح */
  --surface-1: #fbf7ee;
  --surface-2: #f3ecdc;
  --surface-3: #ece2cc;
  --text-strong: #2a2113;
  --text-dim: #6b5d3f;
  --accent-gold: #9a7b2e;
  --accent-gold-bright: #b8923a;
  --accent-crimson: #b04a36;
  --accent-green: #5f8a3e;
  --accent-blue: #4a6d95;
  --border-soft: rgba(139,115,48,0.28);
  --soft-gold-bg: rgba(154,123,46,0.10);
  --soft-crimson-bg: rgba(176,74,54,0.10);
  --shadow-md: 0 8px 30px rgba(80,60,20,0.10);

  /* تعيين shadcn للوضع الفاتح */
  --background: #f7f1e3;
  --foreground: #2a2113;
  --card: #fbf7ee;
  --card-foreground: #2a2113;
  --popover: #fbf7ee;
  --popover-foreground: #2a2113;
  --primary: #9a7b2e;
  --primary-foreground: #fbf7ee;
  --secondary: #ece2cc;
  --secondary-foreground: #2a2113;
  --muted: #ece2cc;
  --muted-foreground: #6b5d3f;
  --accent: #f3ecdc;
  --accent-foreground: #7a5f1f;
  --destructive: #b04a36;
  --destructive-foreground: #fbe9d8;
  --border: rgba(139,115,48,0.28);
  --input: rgba(139,115,48,0.24);
  --ring: #9a7b2e;
  --chart-1: #9a7b2e; --chart-2: #b04a36; --chart-3: #5f8a3e; --chart-4: #4a6d95; --chart-5: #b8923a;
  --sidebar: #fbf7ee; --sidebar-foreground: #2a2113; --sidebar-primary: #9a7b2e;
  --sidebar-primary-foreground: #fbf7ee; --sidebar-accent: #f3ecdc;
  --sidebar-accent-foreground: #7a5f1f; --sidebar-border: rgba(139,115,48,0.28); --sidebar-ring: #9a7b2e;
}

.dark {
  /* الوضع الداكن — القيم الحالية + التوكنات الدلالية */
  --ink: #100d09; --ink-2: #19140d; --ink-3: #241d12; --ink-4: #2c2417;
  --gold: #c9a24b; --gold-bright: #e3c168; --gold-dim: #8b7330;
  --parch: #e9e0cd; --parch-dim: #b0a489;
  --crimson: #b04a36; --crimson-bright: #d96a4f;
  --green: #7faa5a; --green-bright: #9bc872; --blue-soft: #6b8db5;

  --surface-1: #19140d;
  --surface-2: #241d12;
  --surface-3: #2c2417;
  --text-strong: #e9e0cd;
  --text-dim: #b0a489;
  --accent-gold: #c9a24b;
  --accent-gold-bright: #e3c168;
  --accent-crimson: #d96a4f;
  --accent-green: #9bc872;
  --accent-blue: #6b8db5;
  --border-soft: rgba(201,162,75,0.22);
  --soft-gold-bg: rgba(201,162,75,0.06);
  --soft-crimson-bg: rgba(176,74,54,0.10);
  --shadow-md: 0 18px 50px rgba(0,0,0,0.55);

  --background: #100d09; --foreground: #e9e0cd;
  --card: #19140d; --card-foreground: #e9e0cd;
  --popover: #19140d; --popover-foreground: #e9e0cd;
  --primary: #c9a24b; --primary-foreground: #1a1408;
  --secondary: #241d12; --secondary-foreground: #e9e0cd;
  --muted: #241d12; --muted-foreground: #b0a489;
  --accent: #2c2417; --accent-foreground: #e3c168;
  --destructive: #b04a36; --destructive-foreground: #fbe9d8;
  --border: rgba(201,162,75,0.22); --input: rgba(201,162,75,0.18); --ring: #c9a24b;
  --chart-1: #c9a24b; --chart-2: #b04a36; --chart-3: #7faa5a; --chart-4: #6b8db5; --chart-5: #e3c168;
  --sidebar: #19140d; --sidebar-foreground: #e9e0cd; --sidebar-primary: #c9a24b;
  --sidebar-primary-foreground: #1a1408; --sidebar-accent: #241d12;
  --sidebar-accent-foreground: #e3c168; --sidebar-border: rgba(201,162,75,0.22); --sidebar-ring: #c9a24b;
}
```

- [ ] **Step 2: خلفية الجسم حسب الوضع**

عدّل `html, body` لاستخدام متغيرات الإشعاع التي تختلف بالوضع، أو أبقِ التدرّج الذهبي/القرمزي خفيفاً يعمل على الخلفيتين. تأكد أن `background` يستخدم `var(--background)`.

- [ ] **Step 3: غلاف reduced-motion (نهاية الملف)**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: بناء وتحقق**

Run: `DATABASE_URL="postgresql://u:p@localhost:5432/db?sslmode=require" npx next build --webpack`
Expected: نجاح. (المكونات ما زالت بألوانها المباشرة — لا تغيّر بصري بعد.)

- [ ] **Step 5: التزام**
```bash
git add src/app/globals.css
git commit -m "ثيم: نظام توكنات دلالية للوضعين الفاتح والداكن + reduced-motion"
```

---

## Task 3: تفعيل ThemeProvider وزر التبديل

**Files:**
- Create: `src/components/theme-provider.tsx`
- Create: `src/components/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces — Produces:** `<ThemeProvider>`, `<ThemeToggle />`.

- [ ] **Step 1: theme-provider.tsx**
```tsx
"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 2: theme-toggle.tsx**
```tsx
"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = theme !== "light";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="تبديل الوضع النهاري/الليلي"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-[var(--text-dim)] hover:text-[var(--accent-gold-bright)]"
    >
      {mounted && isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}
```

- [ ] **Step 3: لفّ layout.tsx**

أضف `className="dark"` على `<html>`، ولفّ المحتوى:
```tsx
import { ThemeProvider } from "@/components/theme-provider";
// ...
<html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
  <body className={`... `}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
      <Toaster />
      <SonnerToaster position="top-center" richColors />
    </ThemeProvider>
  </body>
</html>
```

- [ ] **Step 4: بناء وتحقق**

Run: `DATABASE_URL="postgresql://u:p@localhost:5432/db?sslmode=require" npx next build --webpack`
Expected: نجاح. (الزر سيوضع في الهيدر في Task 4.)

- [ ] **Step 5: التزام**
```bash
git add src/components/theme-provider.tsx src/components/theme-toggle.tsx src/app/layout.tsx
git commit -m "ثيم: تفعيل ThemeProvider (افتراضي ليلي) + زر تبديل شمس/قمر"
```

---

## Tasks 4–9: تحويل الألوان إلى توكنات + RTL (مكوّناً مكوّناً)

> **منهجية موحّدة لكل مكوّن:** اقرأ الملف، وطبّق جدول التعيين أدناه على كل `rgba()/#hex`، واستبدل أي خاصية اتجاهية (`left/right`, `ml/mr`, `pl/pr`, `text-left/right`, `rounded-l/r`) بالمنطقية. ثم ابنِ وافحص بصرياً في الوضعين.

**جدول تعيين الألوان (مرجع موحّد):**
| لون مباشر (داكن) | التوكن |
|---|---|
| `#19140d` / `var(--ink-2)` | `var(--surface-1)` |
| `#241d12` / `var(--ink-3)` | `var(--surface-2)` |
| `#2c2417` / `var(--ink-4)` | `var(--surface-3)` |
| `#e9e0cd` / `var(--parch)` | `var(--text-strong)` |
| `#b0a489` / `var(--parch-dim)` | `var(--text-dim)` |
| `#c9a24b` / `var(--gold)` | `var(--accent-gold)` |
| `#e3c168` / `var(--gold-bright)` | `var(--accent-gold-bright)` |
| `var(--crimson-bright)` | `var(--accent-crimson)` |
| `var(--green-bright)` | `var(--accent-green)` |
| `var(--blue-soft)` | `var(--accent-blue)` |
| `rgba(201,162,75,0.06)` | `var(--soft-gold-bg)` |
| `rgba(201,162,75,0.18–0.22)` (حدود) | `var(--border-soft)` |
| `rgba(176,74,54,0.10)` | `var(--soft-crimson-bg)` |

> الألوان داخل بيانات Recharts أو ألوان الأعضاء المخزّنة في DB **لا تُغيَّر** (بيانات، ليست ثيم).

### Task 4: app-header.tsx (17 موضعاً) + زر التبديل + مؤشّر تبويب
- [ ] طبّق جدول التعيين على كل الألوان المباشرة.
- [ ] استبدل الخصائص الاتجاهية بالمنطقية.
- [ ] ضع `<ThemeToggle />` في الهيدر (بجوار زر الفريق).
- [ ] حسّن مؤشّر التبويب النشط (خط سفلي متحرك بـ transition).
- [ ] بناء: `... npx next build --webpack` → نجاح.
- [ ] التزام: `git commit -m "هيدر: توكنات + RTL + زر تبديل + مؤشّر تبويب"`

### Task 5: dashboard.tsx (25 موضعاً) + Recharts RTL + حركات
- [ ] طبّق جدول التعيين (عدا ألوان بيانات الرسوم).
- [ ] خصائص منطقية + ضبط محاور Recharts للـRTL.
- [ ] تتابع ظهور البطاقات (`fade-up` + تأخير متدرّج) + `radius` لأعمدة BarChart.
- [ ] بناء → نجاح. التزام: `git commit -m "لوحة: توكنات + RTL للرسوم + حركات"`

### Task 6: reports-list.tsx (29 موضعاً)
- [ ] جدول التعيين + خصائص منطقية.
- [ ] بناء → نجاح. التزام: `git commit -m "البلاغات: توكنات + RTL"`

### Task 7: new-report-form.tsx (19 موضعاً)
- [ ] جدول التعيين + خصائص منطقية + حلقة تركيز ذهبية على الحقول.
- [ ] بناء → نجاح. التزام: `git commit -m "نموذج البلاغ: توكنات + RTL + focus ring"`

### Task 8: members-manager.tsx (18 موضعاً)
- [ ] جدول التعيين + خصائص منطقية (ألوان الأعضاء المخزّنة تبقى).
- [ ] بناء → نجاح. التزام: `git commit -m "الأعضاء: توكنات + RTL"`

### Task 9: chips.tsx (1) + page.tsx (4) — التنبيه/التذييل
- [ ] جدول التعيين + خصائص منطقية.
- [ ] بناء → نجاح. التزام: `git commit -m "الشارات والصفحة: توكنات + RTL"`

---

## Task 10: صقل المؤثرات والاتساق النهائي

**Files:** `src/app/globals.css` (+ أي مكوّن يحتاج لمسة)

- [ ] وحّد الظلال عبر `var(--shadow-md)` حيثما كان ظل مباشر.
- [ ] تأكد أن انتقال الألوان بين الوضعين سلس على البطاقات (`transition: background-color/color/border-color .25s`) دون كسر `disableTransitionOnChange`.
- [ ] دقّق أن كل `@keyframes`/`animation` مغطّاة بـ reduced-motion.
- [ ] بناء → نجاح. التزام: `git commit -m "مؤثرات: توحيد الظلال والانتقالات + تدقيق reduced-motion"`

---

## Task 11: التحقق اليقيني الشامل والنشر

- [ ] **بناء نهائي:** `DATABASE_URL="postgresql://u:p@localhost:5432/db?sslmode=require" npx next build --webpack` → 0 أخطاء.
- [ ] **Lint:** `npx eslint .` → لا أخطاء جديدة عن خط الأساس (7 تحذيرات react-hooks سابقة مقبولة).
- [ ] **اختبار حي محلي:** `.env` يحوي رابط Neon، شغّل `npm run dev`، وافحص بصرياً كل تبويب في الوضعين (داكن ثم تبديل لفاتح):
  - لوحة القيادة (بطاقات + رسوم)، نموذج جديد، قائمة البلاغات، إدارة الأعضاء، التنبيه، التذييل.
  - تأكد: لا لون مكسور، تباين كافٍ، RTL سليم، التبديل يحفظ الاختيار بعد إعادة التحميل، لا وميض أبيض.
  - تأكد سريعاً أن CRUD + التصدير ما زالت تعمل.
- [ ] **reduced-motion:** فعّل الإعداد في النظام/المتصفح وتأكد من تعطّل الحركات.
- [ ] **النشر:** `git push origin main` → انتظر بناء Vercel.
- [ ] **تحقق حي على Vercel:** افتح الرابط، افحص الوضعين والتبديل والوظائف.

---

## المراجعة الذاتية (مكتملة)
- **تغطية الـspec:** كل بنود الوثيقة ممثّلة بمهام (ثيم=2,3 · خطوط=1 · توكنات/RTL=4–9 · مؤثرات=2,5,10 · تحقق=11). ✅
- **لا عناصر ناقصة:** كود كامل للبنية والتوكنات؛ تحويلات المكونات محكومة بجدول تعيين صريح + منهجية موحّدة. ✅
- **اتساق الأنواع/الأسماء:** أسماء التوكنات موحّدة بين Task 2 (التعريف) وTasks 4–9 (الاستهلاك). ✅
