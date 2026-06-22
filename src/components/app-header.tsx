"use client";

import { useState } from "react";
import { MemberAvatar } from "@/components/chips";
import { useMember } from "@/lib/member-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, UserPlus, Users } from "lucide-react";

export function Header({
  onAddMember,
  activeTab,
  onTabChange,
}: {
  onAddMember: () => void;
  activeTab: string;
  onTabChange: (t: string) => void;
}) {
  const { current, members, setCurrent } = useMember();
  const [open, setOpen] = useState(false);

  return (
    <header className="panel gold-rule mb-6 fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4 p-5 md:p-6">
        <div className="flex items-center gap-4 min-w-0">
          {/* طابع دائري */}
          <div
            className="hidden sm:flex flex-col items-center justify-center rounded-full"
            style={{
              width: 88,
              height: 88,
              border: "1px solid var(--border-soft)",
              background: "var(--soft-gold-bg)",
              color: "var(--accent-gold)",
            }}
          >
            <span className="font-display text-2xl leading-none" style={{ color: "var(--accent-gold-bright)" }}>
              مرسم
            </span>
            <span className="text-xs tracking-[3px] mt-1" style={{ color: "var(--text-dim)" }}>
              TADABBUR
            </span>
          </div>

          <div className="min-w-0">
            <p
              className="text-xs tracking-widest font-semibold uppercase mb-1.5"
              style={{ color: "var(--accent-crimson)" }}
            >
              TADABBUR · CSL STUDIO
            </p>
            <h1 className="font-display text-2xl md:text-4xl leading-tight m-0">
              منصة تتبّع أخطاء <span style={{ color: "var(--accent-gold-bright)" }}>الفريق</span>
            </h1>
            <p className="text-sm mt-2 max-w-xl" style={{ color: "var(--text-dim)" }}>
              تسجيل منظّم لأخطاء بيانات المصادر والمراجع من مندلي، وأخطاء النمط CSL،
              وأخطاء إضافة الوورد، والملاحظات والمقترحات — مع لوحة إحصائية وتصدير Excel.
            </p>
          </div>
        </div>

        {/* أدوات: تبديل الثيم + العضو الحالي */}
        <div className="flex items-center gap-3 flex-wrap">
          <ThemeToggle />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-[var(--border-soft)] text-[var(--text-strong)] hover:bg-[var(--soft-gold-bg)]"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">الفريق</span>
                <span
                  className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    minWidth: 22,
                    height: 22,
                    padding: "0 6px",
                    background: "var(--soft-gold-bg)",
                    color: "var(--accent-gold-bright)",
                  }}
                >
                  {members.length}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[340px] sm:w-[400px] bg-[var(--surface-1)] text-[var(--text-strong)] border-[var(--border-soft)]"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-xl text-[var(--accent-gold-bright)]">
                  أعضاء الفريق
                </SheetTitle>
                <SheetDescription className="text-[var(--text-dim)]">
                  اختر نفسك للبدء في التدوين. يمكن إضافة عضو جديد أيضًا.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-2">
                {members.length === 0 && (
                  <div className="text-sm text-[var(--text-dim)] p-4 rounded-lg border border-dashed border-[var(--border-soft)]">
                    لا يوجد أعضاء بعد. أضف أول عضو للبدء.
                  </div>
                )}
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCurrent(m);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-start transition glow-hover"
                    style={{
                      background:
                        current?.id === m.id ? "var(--soft-gold-bg)" : "transparent",
                      border:
                        current?.id === m.id
                          ? "1px solid var(--accent-gold)"
                          : "1px solid var(--border-soft)",
                    }}
                  >
                    <MemberAvatar
                      name={m.name}
                      color={m.color}
                      initials={m.initials}
                      size={40}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-strong)] truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-[var(--text-dim)] truncate">
                        {m.role}
                      </p>
                    </div>
                    {current?.id === m.id && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: "var(--accent-gold)", color: "var(--primary-foreground)" }}
                      >
                        أنت
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <Button
                  onClick={() => {
                    setOpen(false);
                    onAddMember();
                  }}
                  className="w-full gap-2"
                  style={{
                    background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
                    color: "var(--primary-foreground)",
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  إضافة عضو جديد
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* بطاقة العضو الحالي */}
          {current ? (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg" style={{ background: "var(--soft-gold-bg)", border: "1px solid var(--border-soft)" }}>
              <MemberAvatar
                name={current.name}
                color={current.color}
                initials={current.initials}
                size={32}
              />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-[var(--text-strong)]">{current.name}</p>
                <p className="text-xs text-[var(--text-dim)]">{current.role}</p>
              </div>
            </div>
          ) : (
            <Button
              onClick={onAddMember}
              className="gap-2"
              style={{
                background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
                color: "var(--primary-foreground)",
              }}
            >
              <Plus className="w-4 h-4" />
              اختر عضويتك
            </Button>
          )}
        </div>
      </div>

      {/* شريط التبويبات */}
      <nav className="flex flex-wrap gap-1 px-3 md:px-5 pb-3 -mt-1">
        {[
          { id: "dashboard", label: "لوحة القيادة" },
          { id: "new", label: "بلاغ جديد" },
          { id: "reports", label: "سجل البلاغات" },
          { id: "members", label: "أعضاء الفريق" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className="px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap relative"
            style={{
              background:
                activeTab === t.id ? "var(--soft-gold-bg)" : "transparent",
              color: activeTab === t.id ? "var(--accent-gold-bright)" : "var(--text-dim)",
              border:
                activeTab === t.id
                  ? "1px solid var(--border-soft)"
                  : "1px solid transparent",
            }}
          >
            {t.label}
            <span
              className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full transition-all duration-300"
              style={{
                background: "var(--accent-gold-bright)",
                opacity: activeTab === t.id ? 1 : 0,
                transform: activeTab === t.id ? "scaleX(1)" : "scaleX(0)",
              }}
            />
          </button>
        ))}
      </nav>
    </header>
  );
}
