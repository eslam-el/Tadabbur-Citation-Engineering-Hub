"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMember } from "@/lib/member-context";
import {
  ERROR_TYPE_LIST,
  SEVERITY_LIST,
  PRIORITY_LIST,
  type ErrorType,
  type Severity,
} from "@/lib/constants";
import {
  Database,
  Palette,
  Puzzle,
  StickyNote,
  Lightbulb,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  Palette,
  Puzzle,
  StickyNote,
  Lightbulb,
  MoreHorizontal,
};

export function NewReportForm({
  onCreated,
  onGoToReports,
}: {
  onCreated: () => void;
  onGoToReports: () => void;
}) {
  const { current } = useMember();

  const [type, setType] = useState<ErrorType>("data");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [priority, setPriority] = useState(3);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [fieldTag, setFieldTag] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) {
      toast.error("اختر عضويتك أولًا من زر «الفريق».");
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error("يرجى تعبئة العنوان والوصف.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          severity,
          priority,
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          pageNumber: pageNumber.trim(),
          fieldTag: fieldTag.trim(),
          tags: tags.trim(),
          authorId: current.id,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      toast.success("تم تسجيل البلاغ بنجاح ✦", {
        description: `رقم البلاغ: ${data.report.id.slice(-6).toUpperCase()}`,
      });
      // إعادة الضبط
      setTitle("");
      setDescription("");
      setLocation("");
      setPageNumber("");
      setFieldTag("");
      setTags("");
      setSeverity("medium");
      setPriority(3);
      setType("data");
      onCreated();
    } catch (e) {
      console.error(e);
      toast.error("تعذّر تسجيل البلاغ. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel fade-up">
      <div className="p-5 md:p-6 border-b border-[rgba(201,162,75,0.18)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5" style={{ color: "var(--gold-bright)" }} />
          <div>
            <h2 className="text-lg font-bold m-0" style={{ color: "var(--parch)" }}>
              تدوين بلاغ / ملاحظة / مقترح
            </h2>
            <p className="text-xs mt-1 m-0" style={{ color: "var(--parch-dim)" }}>
              اختر النوع بدقة ليسهل تصنيفه لاحقًا في الإحصائيات وملف Excel.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onGoToReports}
          className="border-[rgba(201,162,75,0.3)] text-[var(--parch-dim)] hover:bg-[rgba(201,162,75,0.08)]"
        >
          عودة للسجل
        </Button>
      </div>

      {!current && (
        <div className="m-5 p-4 rounded-lg border border-dashed border-[var(--crimson)] bg-[rgba(176,74,54,0.08)] text-sm" style={{ color: "var(--crimson-bright)" }}>
          ⚠ يجب اختيار عضويتك من زر «الفريق» أعلى الصفحة قبل التدوين.
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
        {/* نوع البلاغ: بطاقات اختيار */}
        <div>
          <Label className="text-[var(--gold)] font-semibold mb-3 block">
            نوع البلاغ
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {ERROR_TYPE_LIST.map((t) => {
              const Icon = ICONS[t.icon] || MoreHorizontal;
              const active = type === t.value;
              return (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className="flex items-start gap-2.5 p-3 rounded-lg text-right transition glow-hover"
                  style={{
                    background: active ? t.bg : "rgba(255,255,255,0.02)",
                    border: active
                      ? `1px solid ${t.color}`
                      : "1px solid rgba(201,162,75,0.15)",
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-md flex-shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      background: t.color,
                      color: "#1a1408",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold m-0"
                      style={{ color: active ? t.color : "var(--parch)" }}
                    >
                      {t.label}
                    </p>
                    <p className="text-[11px] mt-0.5 leading-snug m-0" style={{ color: "var(--parch-dim)" }}>
                      {t.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* العنوان */}
        <div>
          <Label htmlFor="title" className="text-[var(--gold)] font-semibold mb-2 block">
            عنوان البلاغ <span style={{ color: "var(--crimson-bright)" }}>*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: خطأ في اسم المؤلف لمصدر «تفسير الطبري»"
            className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)] placeholder:text-[var(--parch-dim)] focus-visible:border-[var(--gold)]"
            maxLength={200}
          />
        </div>

        {/* الوصف */}
        <div>
          <Label htmlFor="description" className="text-[var(--gold)] font-semibold mb-2 block">
            الوصف التفصيلي <span style={{ color: "var(--crimson-bright)" }}>*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اشرح الخطأ بالتفصيل: ما الذي حدث؟ ما الذي كان متوقعًا؟ أي خطوات لإعادة إنتاج المشكلة؟"
            className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)] placeholder:text-[var(--parch-dim)] focus-visible:border-[var(--gold)] min-h-[120px]"
          />
        </div>

        {/* الموقع + الصفحة */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location" className="text-[var(--gold)] font-semibold mb-2 block">
              الموقع / المرجع
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: تفسير الطبري — الجزء 3 / ملف tadabbur-apa.csl"
              className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)] placeholder:text-[var(--parch-dim)] focus-visible:border-[var(--gold)]"
            />
          </div>
          <div>
            <Label htmlFor="pageNumber" className="text-[var(--gold)] font-semibold mb-2 block">
              رقم الصفحة / الموقع
            </Label>
            <Input
              id="pageNumber"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder="مثال: 12 / bibliography > layout"
              className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)] placeholder:text-[var(--parch-dim)] focus-visible:border-[var(--gold)]"
            />
          </div>
        </div>

        {/* حقل CSL / مندلي + الوسوم */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fieldTag" className="text-[var(--gold)] font-semibold mb-2 block">
              الحقل المتأثر (CSL / مندلي)
            </Label>
            <Input
              id="fieldTag"
              value={fieldTag}
              onChange={(e) => setFieldTag(e.target.value)}
              placeholder="مثال: author / issued / bibliography layout"
              className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)] placeholder:text-[var(--parch-dim)] focus-visible:border-[var(--gold)]"
            />
          </div>
          <div>
            <Label htmlFor="tags" className="text-[var(--gold)] font-semibold mb-2 block">
              وسوم (مفصولة بفواصل)
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="مثال: APA, ترقيم, وورد"
              className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)] placeholder:text-[var(--parch-dim)] focus-visible:border-[var(--gold)]"
            />
          </div>
        </div>

        {/* الخطورة والأولوية */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[var(--gold)] font-semibold mb-2 block">
              مستوى الخطورة
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITY_LIST.map((s) => {
                const active = severity === s.value;
                return (
                  <button
                    type="button"
                    key={s.value}
                    onClick={() => setSeverity(s.value)}
                    className="px-2 py-2.5 rounded-md text-sm font-semibold transition"
                    style={{
                      background: active ? s.bg : "rgba(255,255,255,0.02)",
                      color: active ? s.color : "var(--parch-dim)",
                      border: active
                        ? `1px solid ${s.color}`
                        : "1px solid rgba(201,162,75,0.15)",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="text-[var(--gold)] font-semibold mb-2 block">
              الأولوية
            </Label>
            <Select value={String(priority)} onValueChange={(v) => setPriority(Number(v))}>
              <SelectTrigger className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--ink-2)] border-[rgba(201,162,75,0.3)] text-[var(--parch)]">
                {PRIORITY_LIST.map((p) => (
                  <SelectItem key={p.value} value={String(p.value)} className="focus:bg-[rgba(201,162,75,0.15)]">
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(201,162,75,0.18)]">
          <p className="text-xs" style={{ color: "var(--parch-dim)" }}>
            {current ? (
              <>
                سيُسجَّل البلاغ باسم{" "}
                <span className="font-bold" style={{ color: "var(--gold-bright)" }}>
                  {current.name}
                </span>{" "}
                مع طابع زمني تلقائي.
              </>
            ) : (
              <>لم يتم اختيار عضو بعد.</>
            )}
          </p>
          <Button
            type="submit"
            disabled={submitting || !current}
            className="gap-2 px-6"
            style={{
              background: "linear-gradient(180deg, var(--gold-bright), var(--gold))",
              color: "#1a1408",
            }}
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? "جارٍ التسجيل…" : "تسجيل البلاغ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
