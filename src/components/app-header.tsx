"use client";

import { MemberAvatar } from "@/components/chips";
import { useMember } from "@/lib/member-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Users, LogOut } from "lucide-react";

export function Header({
  onAddMember,
  activeTab,
  onTabChange,
}: {
  onAddMember: () => void;
  activeTab: string;
  onTabChange: (t: string) => void;
}) {
  const { current, members, isAdmin } = useMember();

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

        {/* أدوات: تبديل الثيم + هوية المستخدم */}
        <div className="flex items-center gap-3 flex-wrap">
          <ThemeToggle />

          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => onTabChange("members")}
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
          )}

          {current && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg" style={{ background: "var(--soft-gold-bg)", border: "1px solid var(--border-soft)" }}>
              <MemberAvatar name={current.name} color={current.color} initials={current.initials} size={32} />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-[var(--text-strong)]">{current.name}</p>
                {current.role && <p className="text-xs text-[var(--text-dim)]">{current.role}</p>}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label="تسجيل الخروج"
            title="تسجيل الخروج"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[var(--text-dim)] hover:text-[var(--accent-crimson)] hover:bg-[var(--soft-crimson-bg)]"
          >
            <LogOut className="w-4 h-4" />
          </Button>
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
