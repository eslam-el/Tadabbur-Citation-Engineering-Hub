"use client";

import { MemberAvatar } from "@/components/chips";
import { useMember } from "@/lib/member-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { FontSizeControl } from "@/components/font-size-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  Users,
  LogOut,
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "لوحة القيادة", icon: LayoutDashboard },
  { id: "new", label: "بلاغ جديد", icon: FilePlus2 },
  { id: "reports", label: "سجل البلاغات", icon: ClipboardList },
  { id: "members", label: "أعضاء الفريق", icon: Users },
];

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
          {/* طابع دائري — بوحدة rem ليتناسب ويتمدد مع حجم الخط */}
          <div
            className="hidden sm:flex flex-col items-center justify-center rounded-full shrink-0"
            style={{
              width: "5.75rem",
              height: "5.75rem",
              border: "1px solid var(--border-soft)",
              background: "var(--soft-gold-bg)",
            }}
          >
            <span
              className="font-display leading-none"
              style={{ fontSize: "1.5rem", color: "var(--accent-gold-bright)" }}
            >
              مرسم
            </span>
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textIndent: "0.2em",
                marginTop: "0.4rem",
                color: "var(--text-dim)",
              }}
            >
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
          <FontSizeControl />
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

      {/* شريط التبويبات — تحكّم مقسّم احترافي */}
      <nav
        className="px-4 md:px-6 pt-3 pb-5"
        style={{ borderTop: "1px solid var(--border-soft)" }}
      >
        <div
          role="tablist"
          aria-label="أقسام المنصة"
          className="inline-flex items-center gap-1 p-1.5 rounded-2xl max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-soft)",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.28)",
          }}
        >
          {TABS.map((t) => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 md:px-4 py-2 rounded-xl text-[13px] md:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]/50",
                  !active &&
                    "text-[var(--text-dim)] hover:text-[var(--accent-gold-bright)] hover:bg-[var(--soft-gold-bg)]"
                )}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
                        color: "var(--primary-foreground)",
                        boxShadow:
                          "0 2px 12px rgba(201,162,75,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
                      }
                    : undefined
                }
              >
                <Icon
                  className="w-[17px] h-[17px] md:w-[18px] md:h-[18px] shrink-0"
                  style={{ opacity: active ? 1 : 0.8 }}
                />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
