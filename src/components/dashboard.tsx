"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Database,
  Palette,
  Puzzle,
  StickyNote,
  Lightbulb,
  MoreHorizontal,
  Circle,
  Timer,
  CheckCircle2,
  Lock,
  TrendingUp,
  AlertTriangle,
  Users,
  FileSpreadsheet,
  Activity as ActivityIcon,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar, TypeChip, SeverityChip, StatusChip } from "@/components/chips";
import { fmtRelative, fmtDateTime } from "@/lib/format";
import {
  ERROR_TYPES,
  SEVERITIES,
  STATUSES,
} from "@/lib/constants";

type Stats = {
  total: number;
  byType: { type: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
  byStatus: { status: string; count: number }[];
  authorStats: {
    memberId: string;
    name: string;
    color: string;
    initials: string;
    reportsCount: number;
  }[];
  solverStats: {
    memberId: string;
    name: string;
    color: string;
    initials: string;
    solvedCount: number;
  }[];
  recentReports: any[];
  activity: any[];
  trend: { date: string; count: number; resolved: number }[];
};

const TYPE_ICON: Record<string, any> = {
  Database,
  Palette,
  Puzzle,
  StickyNote,
  Lightbulb,
  MoreHorizontal,
};

const STATUS_ICON: Record<string, any> = {
  Circle,
  Timer,
  CheckCircle2,
  Lock,
};

export function Dashboard({
  onExport,
  exporting,
}: {
  onExport: (scope: "all" | "reports" | "stats") => void;
  exporting: boolean;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000); // تحديث دوري كل 15 ثانية
    return () => clearInterval(t);
  }, [refresh]);

  if (loading || !stats) {
    return (
      <div className="panel p-8 fade-up">
        <div className="shimmer-bg h-40 rounded-lg" />
      </div>
    );
  }

  const total = stats.total || 0;

  const typeData = (Object.keys(ERROR_TYPES) as (keyof typeof ERROR_TYPES)[]).map(
    (k) => ({
      name: ERROR_TYPES[k].label,
      key: k,
      value: stats.byType.find((b) => b.type === k)?.count || 0,
      color: ERROR_TYPES[k].color,
    })
  );

  const severityData = (Object.keys(SEVERITIES) as (keyof typeof SEVERITIES)[]).map(
    (k) => ({
      name: SEVERITIES[k].label,
      key: k,
      value: stats.bySeverity.find((b) => b.severity === k)?.count || 0,
      color: SEVERITIES[k].color,
    })
  );

  const statusData = (Object.keys(STATUSES) as (keyof typeof STATUSES)[]).map((k) => ({
    name: STATUSES[k].label,
    key: k,
    value: stats.byStatus.find((b) => b.status === k)?.count || 0,
    color: STATUSES[k].color,
  }));

  const resolvedCount =
    (stats.byStatus.find((b) => b.status === "resolved")?.count || 0) +
    (stats.byStatus.find((b) => b.status === "closed")?.count || 0);
  const openCount = stats.byStatus.find((b) => b.status === "open")?.count || 0;
  const inProgressCount =
    stats.byStatus.find((b) => b.status === "in_progress")?.count || 0;
  const criticalCount =
    stats.bySeverity.find((b) => b.severity === "critical")?.count || 0;

  const resolveRate =
    total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const trendData = stats.trend.map((t) => ({
    ...t,
    label: t.date.slice(5), // MM-DD
  }));

  const tooltipStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-soft)",
    borderRadius: 8,
    color: "var(--text-strong)",
    fontSize: 12,
  } as const;

  return (
    <div className="space-y-5">
      {/* شريط الإجراءات العلوي */}
      <div className="panel p-4 md:p-5 fade-up flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              background: "var(--soft-gold-bg)",
              color: "var(--accent-gold-bright)",
            }}
          >
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold m-0" style={{ color: "var(--text-strong)" }}>
              لوحة القيادة
            </h2>
            <p className="text-xs m-0" style={{ color: "var(--text-dim)" }}>
              تحديث تلقائي كل 15 ثانية — آخر تحديث: {fmtRelative(new Date())}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={refresh}
            className="gap-2 border-[var(--border-soft)] text-[var(--text-strong)] hover:bg-[var(--soft-gold-bg)]"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Button
            onClick={() => onExport("stats")}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="gap-2 border-[var(--border-soft)] text-[var(--text-strong)] hover:bg-[var(--soft-gold-bg)]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير الإحصائيات
          </Button>
          <Button
            onClick={() => onExport("all")}
            disabled={exporting}
            size="sm"
            className="gap-2"
            style={{
              background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
              color: "var(--primary-foreground)",
            }}
          >
            <Download className="w-4 h-4" />
            تصدير شامل Excel
          </Button>
        </div>
      </div>

      {/* بطاقات KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<ActivityIcon className="w-5 h-5" />}
          label="إجمالي البلاغات"
          value={total}
          color="var(--accent-gold-bright)"
          bg="var(--soft-gold-bg)"
        />
        <KpiCard
          icon={<Circle className="w-5 h-5" />}
          label="مفتوح"
          value={openCount}
          color="var(--accent-crimson)"
          bg="var(--soft-crimson-bg)"
          sub={total > 0 ? `${Math.round((openCount / total) * 100)}%` : "0%"}
        />
        <KpiCard
          icon={<Timer className="w-5 h-5" />}
          label="قيد المعالجة"
          value={inProgressCount}
          color="var(--accent-gold-bright)"
          bg="var(--soft-gold-bg)"
          sub={total > 0 ? `${Math.round((inProgressCount / total) * 100)}%` : "0%"}
        />
        <KpiCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="تم الحل"
          value={resolvedCount}
          color="var(--accent-green)"
          bg="color-mix(in srgb, var(--accent-green) 16%, transparent)"
          sub={`${resolveRate}%`}
        />
      </div>

      {/* صف الرسوم: الأنواع + الخطورة */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel p-5 fade-up">
          <h3 className="text-sm font-bold mb-1 m-0" style={{ color: "var(--accent-gold-bright)" }}>
            توزيع البلاغات حسب النوع
          </h3>
          <p className="text-xs mb-4 m-0" style={{ color: "var(--text-dim)" }}>
            نسبة كل نوع من إجمالي البلاغات
          </p>
          {total === 0 ? (
            <EmptyChart />
          ) : (
            <div className="grid grid-cols-2 gap-3 items-center">
              <div style={{ height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={typeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={85}
                      paddingAngle={2}
                      stroke="var(--surface-1)"
                    >
                      {typeData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {typeData.map((d) => (
                  <div
                    key={d.key}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-1.5" style={{ color: "var(--text-strong)" }}>
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-sm"
                        style={{ background: d.color }}
                      />
                      {d.name}
                    </span>
                    <span className="tnum font-bold" style={{ color: "var(--accent-gold-bright)" }}>
                      {d.value}
                      <span className="text-xs text-[var(--text-dim)] ms-1">
                        ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="panel p-5 fade-up">
          <h3 className="text-sm font-bold mb-1 m-0" style={{ color: "var(--accent-gold-bright)" }}>
            توزيع البلاغات حسب الخطورة
          </h3>
          <p className="text-xs mb-4 m-0" style={{ color: "var(--text-dim)" }}>
            عدد البلاغات لكل مستوى خطورة
          </p>
          {total === 0 ? (
            <EmptyChart />
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={severityData} layout="vertical" margin={{ right: 8, left: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-dim)" fontSize={11} reversed />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="var(--text-dim)"
                    fontSize={11}
                    width={70}
                    orientation="right"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--soft-gold-bg)" }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="value" radius={[6, 0, 0, 6]}>
                    {severityData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* اتجاه زمني + الحالات */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="panel p-5 md:col-span-2 fade-up">
          <h3 className="text-sm font-bold mb-1 m-0" style={{ color: "var(--accent-gold-bright)" }}>
            اتجاه البلاغات — آخر 14 يومًا
          </h3>
          <p className="text-xs mb-4 m-0" style={{ color: "var(--text-dim)" }}>
            البلاغات الجديدة مقابل المحلولة يوميًا
          </p>
          {total === 0 ? (
            <EmptyChart />
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ right: 0, left: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis dataKey="label" stroke="var(--text-dim)" fontSize={10} reversed />
                  <YAxis stroke="var(--text-dim)" fontSize={10} allowDecimals={false} orientation="right" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="بلاغات جديدة"
                    stroke="var(--accent-gold-bright)"
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: "var(--accent-gold-bright)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    name="محلولة"
                    stroke="var(--accent-green)"
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: "var(--accent-green)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="panel p-5 fade-up">
          <h3 className="text-sm font-bold mb-1 m-0" style={{ color: "var(--accent-gold-bright)" }}>
            حالات البلاغات
          </h3>
          <p className="text-xs mb-4 m-0" style={{ color: "var(--text-dim)" }}>
            التوزيع الحالي للحالات
          </p>
          {total === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-3">
              {statusData.map((s) => {
                const pct = total > 0 ? (s.value / total) * 100 : 0;
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5" style={{ color: s.color }}>
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        {s.name}
                      </span>
                      <span className="tnum font-bold" style={{ color: "var(--text-strong)" }}>
                        {s.value} · {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: s.color }}
                      />
                    </div>
                  </div>
                );
              })}

              {criticalCount > 0 && (
                <div
                  className="mt-3 p-3 rounded-lg flex items-start gap-2"
                  style={{
                    background: "var(--soft-crimson-bg)",
                    border: "1px solid rgba(176,74,54,0.35)",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--accent-crimson)" }} />
                  <p className="text-xs m-0" style={{ color: "var(--accent-crimson)" }}>
                    يوجد <strong>{criticalCount}</strong> بلاغ حرج يتطلب اهتمامًا فوريًا.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* أداء الأعضاء */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel p-5 fade-up">
          <h3 className="text-sm font-bold mb-1 m-0" style={{ color: "var(--accent-gold-bright)" }}>
            الأكثر تدوينًا
          </h3>
          <p className="text-xs mb-4 m-0" style={{ color: "var(--text-dim)" }}>
            ترتيب أعضاء الفريق حسب عدد البلاغات
          </p>
          {stats.authorStats.length === 0 ? (
            <EmptyList text="لا يوجد بلاغات بعد." />
          ) : (
            <div className="space-y-2">
              {[...stats.authorStats]
                .sort((a, b) => b.reportsCount - a.reportsCount)
                .slice(0, 6)
                .map((a, i) => {
                  const max = Math.max(...stats.authorStats.map((x) => x.reportsCount), 1);
                  const pct = (a.reportsCount / max) * 100;
                  return (
                    <div key={a.memberId} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-4" style={{ color: "var(--text-dim)" }}>
                        {i + 1}
                      </span>
                      <MemberAvatar name={a.name} color={a.color} initials={a.initials} size={28} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold truncate" style={{ color: "var(--text-strong)" }}>
                            {a.name}
                          </span>
                          <span className="tnum text-xs font-bold" style={{ color: "var(--accent-gold-bright)" }}>
                            {a.reportsCount}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: a.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="panel p-5 fade-up">
          <h3 className="text-sm font-bold mb-1 m-0" style={{ color: "var(--accent-gold-bright)" }}>
            الأكثر حلًّا
          </h3>
          <p className="text-xs mb-4 m-0" style={{ color: "var(--text-dim)" }}>
            ترتيب أعضاء الفريق حسب عدد الحلول المقدّمة
          </p>
          {stats.solverStats.length === 0 ? (
            <EmptyList text="لا توجد حلول بعد." />
          ) : (
            <div className="space-y-2">
              {[...stats.solverStats]
                .sort((a, b) => b.solvedCount - a.solvedCount)
                .slice(0, 6)
                .map((s, i) => {
                  const max = Math.max(...stats.solverStats.map((x) => x.solvedCount), 1);
                  const pct = (s.solvedCount / max) * 100;
                  return (
                    <div key={s.memberId} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-4" style={{ color: "var(--text-dim)" }}>
                        {i + 1}
                      </span>
                      <MemberAvatar name={s.name} color={s.color} initials={s.initials} size={28} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold truncate" style={{ color: "var(--text-strong)" }}>
                            {s.name}
                          </span>
                          <span className="tnum text-xs font-bold" style={{ color: "var(--accent-green)" }}>
                            {s.solvedCount}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: "var(--accent-green)" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* آخر البلاغات + النشاط */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="panel p-5 md:col-span-2 fade-up">
          <h3 className="text-sm font-bold mb-1 m-0" style={{ color: "var(--accent-gold-bright)" }}>
            آخر البلاغات
          </h3>
          <p className="text-xs mb-4 m-0" style={{ color: "var(--text-dim)" }}>
            أحدث 8 بلاغات في النظام
          </p>
          {stats.recentReports.length === 0 ? (
            <EmptyList text="لا توجد بلاغات بعد." />
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pe-1">
              {stats.recentReports.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-lg flex items-start gap-3"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <MemberAvatar
                      name={r.author?.name || "؟"}
                      color={r.author?.color}
                      initials={r.author?.initials}
                      size={28}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <TypeChip type={r.type} withLabel={false} />
                      <SeverityChip severity={r.severity} />
                      <StatusChip status={r.status} />
                    </div>
                    <p className="text-sm font-semibold m-0 truncate" style={{ color: "var(--text-strong)" }}>
                      {r.title}
                    </p>
                    <p className="text-xs mt-0.5 m-0 line-clamp-2" style={{ color: "var(--text-dim)" }}>
                      {r.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs" style={{ color: "var(--text-dim)" }}>
                      <span>{r.author?.name}</span>
                      <span>{fmtRelative(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel p-5 fade-up">
          <h3 className="text-sm font-bold mb-1 m-0" style={{ color: "var(--accent-gold-bright)" }}>
            سجل النشاط
          </h3>
          <p className="text-xs mb-4 m-0" style={{ color: "var(--text-dim)" }}>
            آخر تحركات الفريق
          </p>
          {stats.activity.length === 0 ? (
            <EmptyList text="لا يوجد نشاط بعد." />
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pe-1">
              {stats.activity.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 text-xs">
                  <span
                    className="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                    style={{
                      width: 24,
                      height: 24,
                      background: `color-mix(in srgb, ${actionColor(a.action)} 14%, transparent)`,
                      color: actionColor(a.action),
                      fontSize: 11,
                    }}
                  >
                    {actionIcon(a.action)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="m-0" style={{ color: "var(--text-strong)" }}>
                      <span className="font-bold">{a.actorName || "النظام"}</span>{" "}
                      {actionLabel(a.action)}
                    </p>
                    <p className="m-0 mt-0.5 text-xs" style={{ color: "var(--text-dim)" }}>
                      {fmtRelative(a.createdAt)} · {fmtDateTime(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
  bg,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
  sub?: string;
}) {
  return (
    <div className="panel p-4 md:p-5 fade-up glow-hover">
      <div className="flex items-start justify-between mb-3">
        <span
          className="flex items-center justify-center rounded-lg"
          style={{ width: 36, height: 36, background: bg, color }}
        >
          {icon}
        </span>
        {sub && (
          <span className="tnum text-xs font-bold" style={{ color: "var(--text-dim)" }}>
            {sub}
          </span>
        )}
      </div>
      <p className="text-xs m-0 mb-1" style={{ color: "var(--text-dim)" }}>
        {label}
      </p>
      <p className="text-3xl font-bold m-0 tnum" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{
        height: 220,
        background: "var(--surface-2)",
        border: "1px dashed var(--border-soft)",
        color: "var(--text-dim)",
        fontSize: 13,
      }}
    >
      لا توجد بيانات بعد
    </div>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <div
      className="flex items-center justify-center p-6 rounded-lg text-center text-xs"
      style={{
        background: "var(--surface-2)",
        border: "1px dashed var(--border-soft)",
        color: "var(--text-dim)",
      }}
    >
      {text}
    </div>
  );
}

function actionLabel(a: string): string {
  switch (a) {
    case "created":
      return "أنشأ بلاغًا";
    case "updated":
      return "حدّث بلاغًا";
    case "solved":
      return "سجّل حلًّا لبلاغ";
    case "closed":
      return "أغلق بلاغًا";
    case "commented":
      return "علّق على بلاغ";
    case "member_added":
      return "أُضيف كعضو";
    default:
      return a;
  }
}

function actionColor(a: string): string {
  switch (a) {
    case "created":
      return "var(--accent-crimson)";
    case "solved":
    case "closed":
      return "var(--accent-green)";
    case "updated":
    case "commented":
      return "var(--accent-gold-bright)";
    case "member_added":
      return "var(--accent-blue)";
    default:
      return "var(--text-dim)";
  }
}

function actionIcon(a: string): string {
  switch (a) {
    case "created":
      return "＋";
    case "solved":
      return "✓";
    case "closed":
      return "🔒";
    case "updated":
      return "✎";
    case "commented":
      return "💬";
    case "member_added":
      return "👤";
    default:
      return "•";
  }
}
