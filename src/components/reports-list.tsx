"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  MessageSquare,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MemberAvatar, TypeChip, SeverityChip, StatusChip } from "@/components/chips";
import {
  ERROR_TYPE_LIST,
  SEVERITY_LIST,
  STATUS_LIST,
  PRIORITY_LIST,
  type ErrorType,
  type Severity,
  type ReportStatus,
} from "@/lib/constants";
import { useMember } from "@/lib/member-context";
import { fmtDateTime, fmtRelative } from "@/lib/format";
import { toast } from "sonner";

type Report = {
  id: string;
  type: ErrorType;
  severity: Severity;
  status: ReportStatus;
  priority: number;
  title: string;
  description: string;
  location: string | null;
  pageNumber: string | null;
  fieldTag: string | null;
  tags: string | null;
  authorId: string;
  author: { id: string; name: string; role: string; color: string; initials: string };
  solutionText: string | null;
  solutionAuthorId: string | null;
  solutionAuthor: { id: string; name: string; color: string; initials: string } | null;
  solutionAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  comments: {
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; name: string; color: string; initials: string };
  }[];
};

export function ReportsList({ onNew }: { onNew: () => void }) {
  const { current, members } = useMember();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: "",
    type: "all",
    severity: "all",
    status: "all",
    authorId: "all",
  });
  const [selected, setSelected] = useState<Report | null>(null);

  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type !== "all") params.set("type", filters.type);
      if (filters.severity !== "all") params.set("severity", filters.severity);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.authorId !== "all") params.set("authorId", filters.authorId);
      if (filters.q.trim()) params.set("q", filters.q.trim());

      const res = await fetch("/api/reports?" + params.toString());
      const data = await res.json();
      setReports(data?.reports || []);
    } catch (e) {
      console.error(e);
      toast.error("تعذّر جلب البلاغات.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البلاغ؟ لا يمكن التراجع.")) return;
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: current?.id, actorName: current?.name }),
      });
      if (!res.ok) throw new Error();
      toast.success("تم حذف البلاغ.");
      setReports((rs) => rs.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      toast.error("تعذّر الحذف.");
    }
  };

  return (
    <div className="space-y-4">
      {/* شريط الفلاتر */}
      <div className="panel p-4 md:p-5 fade-up">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Filter className="w-4 h-4" style={{ color: "var(--accent-gold-bright)" }} />
          <h3 className="text-sm font-bold m-0" style={{ color: "var(--accent-gold-bright)" }}>
            فلترة السجل
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--soft-gold-bg)", color: "var(--accent-gold-bright)" }}
          >
            {reports.length} بلاغ
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="gap-2 border-[var(--border-soft)] text-[var(--text-strong)] hover:bg-[var(--soft-gold-bg)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            تحديث
          </Button>
          <Button
            size="sm"
            onClick={onNew}
            className="gap-2"
            style={{
              background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
              color: "var(--primary-foreground)",
            }}
          >
            <Plus className="w-4 h-4" />
            بلاغ جديد
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <div className="col-span-2 md:col-span-1 relative">
            <Search
              className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-dim)" }}
            />
            <Input
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="بحث في العنوان والوصف…"
              className="ps-9 bg-[var(--surface-2)] border-[var(--border-soft)] text-[var(--text-strong)] placeholder:text-[var(--text-dim)]"
            />
          </div>

          <FilterSelect
            value={filters.type}
            onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
            options={[{ value: "all", label: "كل الأنواع" }, ...ERROR_TYPE_LIST.map((t) => ({ value: t.value, label: t.label }))]}
          />
          <FilterSelect
            value={filters.severity}
            onChange={(v) => setFilters((f) => ({ ...f, severity: v }))}
            options={[{ value: "all", label: "كل الخطورات" }, ...SEVERITY_LIST.map((s) => ({ value: s.value, label: s.label }))]}
          />
          <FilterSelect
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={[{ value: "all", label: "كل الحالات" }, ...STATUS_LIST.map((s) => ({ value: s.value, label: s.label }))]}
          />
          <FilterSelect
            value={filters.authorId}
            onChange={(v) => setFilters((f) => ({ ...f, authorId: v }))}
            options={[{ value: "all", label: "كل المدوّنين" }, ...members.map((m) => ({ value: m.id, label: m.name }))]}
          />
        </div>
      </div>

      {/* قائمة البلاغات */}
      {loading ? (
        <div className="panel p-8">
          <div className="shimmer-bg h-32 rounded-lg" />
        </div>
      ) : reports.length === 0 ? (
        <div className="panel p-8 text-center fade-up">
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            لا توجد بلاغات مطابقة. جرّب تعديل الفلاتر أو أنشئ بلاغًا جديدًا.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="panel p-4 text-start fade-up glow-hover"
              style={{ opacity: r.status === "closed" ? 0.7 : 1 }}
            >
              <div className="flex items-start gap-3">
                <MemberAvatar
                  name={r.author.name}
                  color={r.author.color}
                  initials={r.author.initials}
                  size={38}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <TypeChip type={r.type} withLabel={false} />
                    <SeverityChip severity={r.severity} />
                    <StatusChip status={r.status} />
                    {r.solutionText && (
                      <span
                        className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: "color-mix(in srgb, var(--accent-green) 14%, transparent)", color: "var(--accent-green)" }}
                      >
                        <CheckCircle2 className="w-3 h-3" /> له حل
                      </span>
                    )}
                    {r.comments.length > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: "color-mix(in srgb, var(--accent-blue) 14%, transparent)", color: "var(--accent-blue)" }}
                      >
                        <MessageSquare className="w-3 h-3" /> {r.comments.length}
                      </span>
                    )}
                    <span className="text-xs ms-auto" style={{ color: "var(--text-dim)" }}>
                      #{r.id.slice(-6).toUpperCase()} · {fmtRelative(r.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold m-0 mb-1 truncate" style={{ color: "var(--text-strong)" }}>
                    {r.title}
                  </h4>
                  <p className="text-xs m-0 line-clamp-2" style={{ color: "var(--text-dim)" }}>
                    {r.description}
                  </p>
                  {(r.location || r.fieldTag || r.pageNumber) && (
                    <div className="flex flex-wrap gap-2 mt-2 text-xs" style={{ color: "var(--text-dim)" }}>
                      {r.location && <span>📍 {r.location}</span>}
                      {r.fieldTag && <span>🏷 {r.fieldTag}</span>}
                      {r.pageNumber && <span>📄 {r.pageNumber}</span>}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* نافذة التفاصيل */}
      <ReportDialog
        report={selected}
        onClose={() => setSelected(null)}
        onUpdate={(updated) => {
          setReports((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
          setSelected(updated);
        }}
        onDelete={onDelete}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-soft)] text-[var(--text-strong)] text-xs h-10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[var(--surface-1)] border-[var(--border-soft)] text-[var(--text-strong)]">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="focus:bg-[var(--soft-gold-bg)] text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ReportDialog({
  report,
  onClose,
  onUpdate,
  onDelete,
}: {
  report: Report | null;
  onClose: () => void;
  onUpdate: (r: Report) => void;
  onDelete: (id: string) => void;
}) {
  const { current, members } = useMember();
  const [solutionText, setSolutionText] = useState("");
  const [solutionAuthorId, setSolutionAuthorId] = useState<string>("");
  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState<ReportStatus | "none">("none");
  const [savingSolution, setSavingSolution] = useState(false);
  const [savingComment, setSavingComment] = useState(false);

  useEffect(() => {
    if (report) {
      setSolutionText(report.solutionText || "");
      setSolutionAuthorId(report.solutionAuthorId || current?.id || "");
      setNewStatus("none");
    }
  }, [report, current]);

  if (!report) return null;

  const saveSolution = async () => {
    if (!solutionText.trim()) {
      toast.error("اكتب نص الحل أولًا.");
      return;
    }
    setSavingSolution(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/solution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solutionText: solutionText.trim(),
          solutionAuthorId: solutionAuthorId || current?.id,
          status: newStatus !== "none" ? newStatus : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onUpdate(data.report);
      toast.success("تم حفظ الحل بنجاح.");
    } catch {
      toast.error("تعذّر حفظ الحل.");
    } finally {
      setSavingSolution(false);
    }
  };

  const updateStatus = async (status: ReportStatus) => {
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          actorId: current?.id,
          actorName: current?.name,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onUpdate(data.report);
      toast.success("تم تحديث الحالة.");
    } catch {
      toast.error("تعذّر تحديث الحالة.");
    }
  };

  const addComment = async () => {
    if (!comment.trim() || !current) {
      toast.error("اكتب تعليقًا وتأكد من اختيار عضويتك.");
      return;
    }
    setSavingComment(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: current.id, body: comment.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const updated = { ...report, comments: [...report.comments, data.comment] };
      onUpdate(updated);
      setComment("");
      toast.success("تمت إضافة التعليق.");
    } catch {
      toast.error("تعذّر إضافة التعليق.");
    } finally {
      setSavingComment(false);
    }
  };

  return (
    <Dialog open={!!report} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--surface-1)] border-[var(--border-soft)] text-[var(--text-strong)]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <MemberAvatar
              name={report.author.name}
              color={report.author.color}
              initials={report.author.initials}
              size={44}
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="font-display text-xl" style={{ color: "var(--text-strong)" }}>
                {report.title}
              </DialogTitle>
              <DialogDescription className="text-xs" style={{ color: "var(--text-dim)" }}>
                <span>#{report.id.slice(-6).toUpperCase()}</span>
                <span className="mx-2">·</span>
                <span>بواسطة {report.author.name} ({report.author.role})</span>
                <span className="mx-2">·</span>
                <span>{fmtDateTime(report.createdAt)}</span>
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(report.id)}
              className="text-[var(--accent-crimson)] hover:bg-[var(--soft-crimson-bg)]"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-3">
          {/* الشارات */}
          <div className="flex flex-wrap items-center gap-2">
            <TypeChip type={report.type} />
            <SeverityChip severity={report.severity} />
            <StatusChip status={report.status} />
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: "var(--soft-gold-bg)", color: "var(--accent-gold-bright)" }}
            >
              الأولوية: {PRIORITY_LIST.find((p) => p.value === report.priority)?.label || report.priority}
            </span>
          </div>

          {/* الوصف */}
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: "var(--accent-gold-bright)" }}>
              الوصف
            </p>
            <div
              className="p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
                color: "var(--text-strong)",
              }}
            >
              {report.description}
            </div>
          </div>

          {/* تفاصيل تقنية */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {report.location && (
              <Detail label="الموقع / المرجع" value={report.location} />
            )}
            {report.pageNumber && (
              <Detail label="رقم الصفحة" value={report.pageNumber} />
            )}
            {report.fieldTag && (
              <Detail label="الحقل" value={report.fieldTag} mono />
            )}
            {report.tags && (
              <Detail label="الوسوم" value={report.tags} />
            )}
            <Detail label="آخر تحديث" value={fmtDateTime(report.updatedAt)} />
            {report.closedAt && (
              <Detail label="تاريخ الإغلاق" value={fmtDateTime(report.closedAt)} />
            )}
          </div>

          {/* تغيير الحالة */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: "var(--accent-gold-bright)" }}>
              تغيير الحالة بسرعة
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_LIST.map((s) => {
                const active = report.status === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => updateStatus(s.value)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold transition"
                    style={{
                      background: active ? s.bg : "var(--surface-2)",
                      color: active ? s.color : "var(--text-dim)",
                      border: active
                        ? `1px solid ${s.color}`
                        : "1px solid var(--border-soft)",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* الحل المقترح */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold m-0" style={{ color: "var(--accent-gold-bright)" }}>
                الحل المقترح / الإجراء المتخذ
              </p>
              {report.solutionAt && (
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                  آخر تحديث: {fmtDateTime(report.solutionAt)}
                </span>
              )}
            </div>
            <Textarea
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              placeholder="اكتب الحل أو الإجراء المتخذ لحل البلاغ…"
              className="bg-[var(--surface-2)] border-[var(--border-soft)] text-[var(--text-strong)] placeholder:text-[var(--text-dim)] focus-visible:border-[var(--accent-gold)] focus-visible:ring-[var(--accent-gold)]/40 min-h-[100px]"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              <Select value={solutionAuthorId} onValueChange={setSolutionAuthorId}>
                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-soft)] text-[var(--text-strong)] text-xs">
                  <SelectValue placeholder="صاحب الحل" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--surface-1)] border-[var(--border-soft)] text-[var(--text-strong)]">
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="focus:bg-[var(--soft-gold-bg)]">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as ReportStatus | "none")}
              >
                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-soft)] text-[var(--text-strong)] text-xs">
                  <SelectValue placeholder="تغيير الحالة (اختياري)" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--surface-1)] border-[var(--border-soft)] text-[var(--text-strong)]">
                  <SelectItem value="none" className="focus:bg-[var(--soft-gold-bg)]">
                    بدون تغيير
                  </SelectItem>
                  {STATUS_LIST.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="focus:bg-[var(--soft-gold-bg)]">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={saveSolution}
                disabled={savingSolution}
                className="gap-2"
                style={{
                  background: "linear-gradient(180deg, var(--accent-green), var(--accent-green))",
                  color: "var(--primary-foreground)",
                }}
              >
                {savingSolution ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                حفظ الحل
              </Button>
            </div>
          </div>

          {/* التعليقات */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: "var(--accent-gold-bright)" }}>
              التعليقات والمتابعة ({report.comments.length})
            </p>
            {report.comments.length > 0 && (
              <div className="space-y-2 mb-3 max-h-60 overflow-y-auto pe-1">
                {report.comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border-soft)" }}
                  >
                    <MemberAvatar
                      name={c.author.name}
                      color={c.author.color}
                      initials={c.author.initials}
                      size={28}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold" style={{ color: "var(--text-strong)" }}>
                          {c.author.name}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                          {fmtRelative(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs m-0 whitespace-pre-wrap" style={{ color: "var(--text-strong)" }}>
                        {c.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={current ? "أضف تعليقًا…" : "اختر عضويتك أولًا"}
                disabled={!current}
                className="bg-[var(--surface-2)] border-[var(--border-soft)] text-[var(--text-strong)] placeholder:text-[var(--text-dim)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addComment();
                  }
                }}
              />
              <Button
                onClick={addComment}
                disabled={savingComment || !current}
                variant="outline"
                className="gap-2 border-[var(--border-soft)] text-[var(--text-strong)] hover:bg-[var(--soft-gold-bg)]"
              >
                {savingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                إرسال
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border-soft)" }}
    >
      <p className="text-xs mb-0.5" style={{ color: "var(--text-dim)" }}>
        {label}
      </p>
      <p
        className={`text-xs m-0 font-semibold ${mono ? "tnum" : ""}`}
        style={{ color: "var(--text-strong)", wordBreak: "break-word" }}
      >
        {value}
      </p>
    </div>
  );
}
