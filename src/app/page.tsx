"use client";

import { useState, useCallback } from "react";
import { MemberProvider, useMember } from "@/lib/member-context";
import { Header } from "@/components/app-header";
import { Dashboard } from "@/components/dashboard";
import { NewReportForm } from "@/components/new-report-form";
import { ReportsList } from "@/components/reports-list";
import { MembersManager } from "@/components/members-manager";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";

function AppInner() {
  const [tab, setTab] = useState("dashboard");
  const { current, members, loading } = useMember();
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(
    async (scope: "all" | "reports" | "stats") => {
      setExporting(true);
      try {
        const res = await fetch(`/api/export?scope=${scope}`);
        if (!res.ok) throw new Error("export failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const cd = res.headers.get("Content-Disposition") || "";
        const match = cd.match(/filename\*=UTF-8''([^;]+)/);
        a.download = match ? decodeURIComponent(match[1]) : `tadabbur-${scope}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("تم تصدير الملف بنجاح.");
      } catch (e) {
        console.error(e);
        toast.error("تعذّر التصدير.");
      } finally {
        setExporting(false);
      }
    },
    []
  );

  const handleSeed = useCallback(async () => {
    if (!confirm("سيتم إضافة بيانات تجريبية (أعضاء + بلاغات نموذجية). متابعة؟")) return;
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.skipped) {
        toast.info("النظام يحتوي بيانات بالفعل، تم تخطي الإضافة.");
      } else {
        toast.success(`تم إضافة ${data.seeded} بلاغ تجريبي بنجاح.`);
      }
    } catch {
      toast.error("تعذّرت إضافة البيانات التجريبية.");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="wrap flex-1">
        <Header
          activeTab={tab}
          onTabChange={setTab}
          onAddMember={() => setTab("members")}
        />

        {/* تنبيه عند عدم اختيار عضو */}
        {!loading && !current && members.length > 0 && tab !== "members" && (
          <div
            className="mb-4 p-3 rounded-lg flex items-center gap-2 fade-up"
            style={{
              background: "rgba(176,74,54,0.10)",
              border: "1px solid rgba(176,74,54,0.35)",
              color: "var(--crimson-bright)",
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm m-0 flex-1">
              اختر عضويتك من زر «الفريق» أعلى الصفحة لتتمكن من تسجيل البلاغات والحلول.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTab("members")}
              className="border-[rgba(176,74,54,0.4)] text-[var(--crimson-bright)] hover:bg-[rgba(176,74,54,0.1)]"
            >
              إدارة الأعضاء
            </Button>
          </div>
        )}

        {/* محتوى التبويب */}
        {tab === "dashboard" && <Dashboard onExport={handleExport} exporting={exporting} />}
        {tab === "new" && (
          <NewReportForm
            onCreated={() => setTab("reports")}
            onGoToReports={() => setTab("reports")}
          />
        )}
        {tab === "reports" && <ReportsList onNew={() => setTab("new")} />}
        {tab === "members" && <MembersManager />}

        {/* زر بيانات تجريبية — يظهر فقط في لوحة القيادة عند عدم وجود بيانات */}
        {tab === "dashboard" && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSeed}
              className="gap-2 text-[var(--parch-dim)] hover:bg-[rgba(201,162,75,0.06)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              إضافة بيانات تجريبية للاستعراض
            </Button>
          </div>
        )}
      </div>

      {/* تذييل */}
      <footer
        className="mt-auto py-4 px-4 text-center text-xs"
        style={{ color: "var(--parch-dim)" }}
      >
        <div className="gold-divider mb-4" />
        <span>
          منصة تتبّع أخطاء فريق مرسم تدبر — بُنيت لمشروع CSL Studio
        </span>
        <span className="mx-2">·</span>
        <span>تصدير Excel احترافي + لوحة إحصائية حيّة</span>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <MemberProvider>
      <AppInner />
    </MemberProvider>
  );
}
