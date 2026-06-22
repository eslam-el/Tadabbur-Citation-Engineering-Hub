"use client";

import { useState } from "react";
import { MemberAvatar } from "@/components/chips";
import { useMember } from "@/lib/member-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
              border: "1px solid rgba(201,162,75,0.5)",
              background: "rgba(201,162,75,0.04)",
              color: "var(--gold)",
            }}
          >
            <span className="font-display text-2xl leading-none" style={{ color: "var(--gold-bright)" }}>
              مرسم
            </span>
            <span className="text-xs tracking-[3px] mt-1" style={{ color: "var(--parch-dim)" }}>
              TADABBUR
            </span>
          </div>

          <div className="min-w-0">
            <p
              className="text-xs tracking-widest font-semibold uppercase mb-1.5"
              style={{ color: "var(--crimson)" }}
            >
              TADABBUR · CSL STUDIO
            </p>
            <h1 className="font-display text-2xl md:text-4xl leading-tight m-0">
              منصة تتبّع أخطاء <span style={{ color: "var(--gold-bright)" }}>الفريق</span>
            </h1>
            <p className="text-sm mt-2 max-w-xl" style={{ color: "var(--parch-dim)" }}>
              تسجيل منظّم لأخطاء بيانات المصادر والمراجع من مندلي، وأخطاء النمط CSL،
              وأخطاء إضافة الوورد، والملاحظات والمقترحات — مع لوحة إحصائية وتصدير Excel.
            </p>
          </div>
        </div>

        {/* تبديل العضو الحالي */}
        <div className="flex items-center gap-3 flex-wrap">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-[rgba(201,162,75,0.4)] text-[var(--parch)] hover:bg-[rgba(201,162,75,0.1)]"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">الفريق</span>
                <span
                  className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    minWidth: 22,
                    height: 22,
                    padding: "0 6px",
                    background: "rgba(201,162,75,0.18)",
                    color: "var(--gold-bright)",
                  }}
                >
                  {members.length}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[340px] sm:w-[400px] bg-[var(--ink-2)] text-[var(--parch)] border-[rgba(201,162,75,0.22)]"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-xl text-[var(--gold-bright)]">
                  أعضاء الفريق
                </SheetTitle>
                <SheetDescription className="text-[var(--parch-dim)]">
                  اختر نفسك للبدء في التدوين. يمكن إضافة عضو جديد أيضًا.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-2">
                {members.length === 0 && (
                  <div className="text-sm text-[var(--parch-dim)] p-4 rounded-lg border border-dashed border-[rgba(201,162,75,0.22)]">
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
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-right transition glow-hover"
                    style={{
                      background:
                        current?.id === m.id
                          ? "rgba(201,162,75,0.12)"
                          : "rgba(255,255,255,0.02)",
                      border:
                        current?.id === m.id
                          ? "1px solid rgba(201,162,75,0.5)"
                          : "1px solid rgba(201,162,75,0.12)",
                    }}
                  >
                    <MemberAvatar
                      name={m.name}
                      color={m.color}
                      initials={m.initials}
                      size={40}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--parch)] truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-[var(--parch-dim)] truncate">
                        {m.role}
                      </p>
                    </div>
                    {current?.id === m.id && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: "var(--gold)", color: "#1a1408" }}
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
                    background: "linear-gradient(180deg, var(--gold-bright), var(--gold))",
                    color: "#1a1408",
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
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(201,162,75,0.08)", border: "1px solid rgba(201,162,75,0.25)" }}>
              <MemberAvatar
                name={current.name}
                color={current.color}
                initials={current.initials}
                size={32}
              />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-[var(--parch)]">{current.name}</p>
                <p className="text-xs text-[var(--parch-dim)]">{current.role}</p>
              </div>
            </div>
          ) : (
            <Button
              onClick={onAddMember}
              className="gap-2"
              style={{
                background: "linear-gradient(180deg, var(--gold-bright), var(--gold))",
                color: "#1a1408",
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
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap relative`}
            style={{
              background:
                activeTab === t.id ? "rgba(201,162,75,0.14)" : "transparent",
              color: activeTab === t.id ? "var(--gold-bright)" : "var(--parch-dim)",
              border:
                activeTab === t.id
                  ? "1px solid rgba(201,162,75,0.38)"
                  : "1px solid transparent",
              boxShadow: activeTab === t.id
                ? "0 2px 12px rgba(201,162,75,0.08)"
                : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
