"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Trash2, Pencil, Check, X, Users, Loader2, ShieldCheck, ShieldAlert, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MemberAvatar } from "@/components/chips";
import { MEMBER_COLORS, getInitials } from "@/lib/constants";
import { useMember } from "@/lib/member-context";
import { fmtDateTime } from "@/lib/format";
import { toast } from "sonner";

type Member = {
  id: string;
  name: string;
  role: string;
  color: string;
  initials: string;
  active: boolean;
  email: string | null;
  accessLevel: string;
  status: string;
  createdAt: string;
  _count?: { reports: number; solvedReports: number };
};

const INPUT_CLASS =
  "bg-[var(--surface-2)] border-[var(--border-soft)] text-[var(--text-strong)] placeholder:text-[var(--text-dim)]";

export function MembersManager() {
  const { current, isAdmin, refresh: refreshCtx } = useMember();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      setMembers(data?.members || []);
    } catch (e) {
      console.error(e);
      toast.error("تعذّر جلب الأعضاء.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDelete = async (id: string) => {
    if (id === current?.id) {
      toast.error("لا يمكنك حذف حسابك أثناء استخدامه.");
      return;
    }
    if (!confirm("هل تريد حذف هذا العضو؟ ستُحذف بلاغاته وتعليقاته معه نهائيًا.")) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("تم حذف العضو.");
      refresh();
      refreshCtx();
    } catch {
      toast.error("تعذّر الحذف.");
    }
  };

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}/approve`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast.success("تم اعتماد العضو.");
      refresh();
      refreshCtx();
    } catch {
      toast.error("تعذّر الاعتماد.");
    }
  };

  const setAccess = async (id: string, accessLevel: "USER" | "ADMIN") => {
    try {
      const res = await fetch(`/api/members/${id}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessLevel }),
      });
      if (!res.ok) throw new Error();
      toast.success(accessLevel === "ADMIN" ? "تمت الترقية إلى مدير." : "تم الخفض إلى مستخدم.");
      refresh();
      refreshCtx();
    } catch {
      toast.error("تعذّر تغيير الصلاحية.");
    }
  };

  const deleteDemo = async () => {
    if (!confirm("سيتم حذف جميع الأعضاء التجريبيين (بلا بريد) وبلاغاتهم نهائيًا. متابعة؟")) return;
    try {
      const res = await fetch("/api/members/demo", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      toast.success(`تم حذف ${data.members} عضوًا تجريبيًا و${data.reports} بلاغًا.`);
      refresh();
      refreshCtx();
    } catch {
      toast.error("تعذّر حذف البيانات التجريبية.");
    }
  };

  const pending = members.filter((m) => m.status === "PENDING");
  const activeMembers = members.filter((m) => m.status !== "PENDING");
  const hasDemo = members.some((m) => !m.email);

  return (
    <div className="space-y-4">
      <div className="panel p-5 fade-up flex flex-wrap items-center justify-between gap-3">
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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold m-0" style={{ color: "var(--text-strong)" }}>
              أعضاء الفريق
            </h2>
            <p className="text-xs m-0" style={{ color: "var(--text-dim)" }}>
              إدارة الأعضاء وأدوارهم. لون كل عضو يظهر في كل أنحاء المنصة.
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setAdding(true)}
            className="gap-2"
            style={{
              background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
              color: "var(--primary-foreground)",
            }}
          >
            <UserPlus className="w-4 h-4" />
            إضافة عضو
          </Button>
        )}
      </div>

      {isAdmin && hasDemo && (
        <div className="panel p-4 fade-up flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-dim)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "var(--accent-gold-bright)" }} />
            يوجد أعضاء/بيانات تجريبية. يمكنك حذفها لتفادي الالتباس بالبيانات الحقيقية.
          </div>
          <Button
            onClick={deleteDemo}
            variant="outline"
            className="gap-2 border-[var(--accent-crimson)] text-[var(--accent-crimson)] hover:bg-[var(--soft-crimson-bg)]"
          >
            <Trash2 className="w-4 h-4" />
            حذف البيانات التجريبية
          </Button>
        </div>
      )}

      {isAdmin && pending.length > 0 && (
        <div className="panel p-4 fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" style={{ color: "var(--accent-gold-bright)" }} />
            <h3 className="text-sm font-bold m-0" style={{ color: "var(--text-strong)" }}>
              بانتظار الموافقة ({pending.length})
            </h3>
          </div>
          <div className="space-y-2">
            {pending.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border-soft)" }}>
                <MemberAvatar name={m.name} color={m.color} initials={m.initials} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold m-0 truncate" style={{ color: "var(--text-strong)" }}>{m.name}</p>
                  <p className="text-xs m-0 truncate" style={{ color: "var(--text-dim)" }}>{m.email}</p>
                </div>
                <Button size="sm" onClick={() => approve(m.id)} className="gap-1.5" style={{ background: "var(--accent-green)", color: "var(--primary-foreground)" }}>
                  <Check className="w-3.5 h-3.5" /> اعتماد
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(m.id)} className="text-[var(--accent-crimson)] hover:bg-[var(--soft-crimson-bg)]">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="panel p-8">
          <div className="shimmer-bg h-24 rounded-lg" />
        </div>
      ) : members.length === 0 ? (
        <div className="panel p-8 text-center fade-up">
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            لا يوجد أعضاء بعد. أضف أول عضو للبدء.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeMembers.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                isCurrent={m.id === current?.id}
                isAdmin={isAdmin}
                isEditing={editingId === m.id}
                onEdit={() => setEditingId(m.id)}
                onStopEdit={() => setEditingId(null)}
                onDelete={() => onDelete(m.id)}
                onPromote={() => setAccess(m.id, "ADMIN")}
                onDemote={() => setAccess(m.id, "USER")}
                onUpdated={() => {
                  setEditingId(null);
                  refresh();
                  refreshCtx();
                }}
              />
          ))}
        </div>
      )}

      <AddMemberDialog
        open={adding}
        onClose={() => setAdding(false)}
        onCreated={() => {
          setAdding(false);
          refresh();
          refreshCtx();
        }}
      />
    </div>
  );
}

function MemberCard({
  member,
  isCurrent,
  isAdmin,
  isEditing,
  onEdit,
  onStopEdit,
  onDelete,
  onPromote,
  onDemote,
  onUpdated,
}: {
  member: Member;
  isCurrent: boolean;
  isAdmin: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onStopEdit: () => void;
  onDelete: () => void;
  onPromote: () => void;
  onDemote: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [color, setColor] = useState(member.color);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role: role.trim(), color }),
      });
      if (!res.ok) throw new Error();
      toast.success("تم تحديث بيانات العضو.");
      onUpdated();
    } catch {
      toast.error("تعذّر التحديث.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="panel p-4 fade-up glow-hover"
      style={{ borderColor: isCurrent ? "var(--accent-gold)" : undefined }}
    >
      <div className="flex items-start gap-3">
        <MemberAvatar name={member.name} color={member.color} initials={member.initials} size={48} />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${INPUT_CLASS} text-sm h-8 mb-2`}
            />
          ) : (
            <p className="text-sm font-bold m-0 truncate" style={{ color: "var(--text-strong)" }}>
              {member.name}
            </p>
          )}
          {isEditing ? (
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="الدور"
              className={`${INPUT_CLASS} text-xs h-7`}
            />
          ) : (
            <p className="text-xs m-0" style={{ color: "var(--text-dim)" }}>
              {member.role}
            </p>
          )}
          <p className="text-xs mt-1 m-0" style={{ color: "var(--text-dim)" }}>
            انضم في {fmtDateTime(member.createdAt)}
          </p>
        </div>
        {isCurrent && (
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent-gold)", color: "var(--primary-foreground)" }}
          >
            أنت
          </span>
        )}
        {member.accessLevel === "ADMIN" && (
          <span className="text-xs px-1.5 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "var(--soft-gold-bg)", color: "var(--accent-gold-bright)" }}>
            <ShieldCheck className="w-3 h-3" /> مدير
          </span>
        )}
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div
          className="p-2 rounded text-center"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-soft)" }}
        >
          <p className="text-xs m-0" style={{ color: "var(--text-dim)" }}>
            بلاغات مدوّنة
          </p>
          <p className="text-lg font-bold m-0 tnum" style={{ color: "var(--accent-gold-bright)" }}>
            {member._count?.reports || 0}
          </p>
        </div>
        <div
          className="p-2 rounded text-center"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-soft)" }}
        >
          <p className="text-xs m-0" style={{ color: "var(--text-dim)" }}>
            حلول مقدّمة
          </p>
          <p className="text-lg font-bold m-0 tnum" style={{ color: "var(--accent-green)" }}>
            {member._count?.solvedReports || 0}
          </p>
        </div>
      </div>

      {/* اللون */}
      {isEditing && (
        <div className="mt-3">
          <Label className="text-xs mb-1.5 block" style={{ color: "var(--text-dim)" }}>
            لون التمييز
          </Label>
          <div className="flex flex-wrap gap-2">
            {MEMBER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="rounded-full transition"
                style={{
                  width: 28,
                  height: 28,
                  background: c,
                  border: color === c ? "2px solid var(--text-strong)" : "2px solid transparent",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* الأزرار */}
      <div className="flex items-center gap-2 mt-3">
        {isEditing ? (
          <>
            <Button
              size="sm"
              onClick={save}
              disabled={saving}
              className="gap-1.5 flex-1"
              style={{ background: "var(--accent-green)", color: "var(--primary-foreground)" }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              حفظ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onStopEdit}
              className="border-[var(--border-soft)] text-[var(--text-strong)]"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="gap-1.5 flex-1 border-[var(--border-soft)] text-[var(--text-strong)] hover:bg-[var(--soft-gold-bg)]"
            >
              <Pencil className="w-3.5 h-3.5" /> تعديل
            </Button>
            {isAdmin && !isCurrent && (
              <>
                {member.accessLevel === "ADMIN" ? (
                  <Button size="sm" variant="ghost" onClick={onDemote} title="خفض إلى مستخدم" className="text-[var(--text-dim)] hover:bg-[var(--soft-gold-bg)]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={onPromote} title="ترقية إلى مدير" className="text-[var(--text-dim)] hover:bg-[var(--soft-gold-bg)]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={onDelete} className="text-[var(--accent-crimson)] hover:bg-[var(--soft-crimson-bg)]">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AddMemberDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("مراجع");
  const [color, setColor] = useState(MEMBER_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setRole("مراجع");
    setColor(MEMBER_COLORS[0]);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("اكتب اسم العضو.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role: role.trim(), color }),
      });
      if (!res.ok) throw new Error();
      toast.success("تمت إضافة العضو.");
      reset();
      onCreated();
    } catch {
      toast.error("تعذّرت الإضافة.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[var(--surface-1)] border-[var(--border-soft)] text-[var(--text-strong)]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl" style={{ color: "var(--accent-gold-bright)" }}>
            إضافة عضو جديد
          </DialogTitle>
          <DialogDescription style={{ color: "var(--text-dim)" }}>
            سيظهر العضو في قائمة الفريق ويمكنه تسجيل البلاغات والحلول.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-3">
            <MemberAvatar name={name || "؟"} color={color} initials={getInitials(name || "؟")} size={48} />
            <div className="flex-1">
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--accent-gold-bright)" }}>
                اسم العضو
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أ. عبدالله"
                className={INPUT_CLASS}
                autoFocus
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block" style={{ color: "var(--accent-gold-bright)" }}>
              الدور
            </Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="مثال: محقق / مراجع / مطوّر CSL"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block" style={{ color: "var(--accent-gold-bright)" }}>
              لون التمييز
            </Label>
            <div className="flex flex-wrap gap-2">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="rounded-full transition"
                  style={{
                    width: 28,
                    height: 28,
                    background: c,
                    border: color === c ? "2px solid var(--text-strong)" : "2px solid transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-3 gap-2">
          <Button variant="outline" onClick={onClose} className="border-[var(--border-soft)] text-[var(--text-strong)]">
            إلغاء
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            className="gap-2"
            style={{
              background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
              color: "var(--primary-foreground)",
            }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            إضافة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
