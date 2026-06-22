"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UserPlus,
  Trash2,
  Pencil,
  Check,
  X,
  Users,
  Loader2,
} from "lucide-react";
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
  createdAt: string;
  _count?: { reports: number; solvedReports: number };
};

export function MembersManager() {
  const { current, setCurrent, refresh: refreshCtx } = useMember();
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
      toast.error("لا يمكنك حذف نفسك أثناء استخدامك للحساب.");
      return;
    }
    if (!confirm("هل تريد حذف هذا العضو؟ سيتم الاحتفاظ ببلاغاته.")) return;
    try {
      await fetch(`/api/members/${id}`, { method: "DELETE" });
      toast.success("تم حذف العضو.");
      refresh();
      refreshCtx();
    } catch {
      toast.error("تعذّر الحذف.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="panel p-5 fade-up flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              background: "rgba(201,162,75,0.12)",
              color: "var(--gold-bright)",
            }}
          >
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold m-0" style={{ color: "var(--parch)" }}>
              أعضاء الفريق
            </h2>
            <p className="text-xs m-0" style={{ color: "var(--parch-dim)" }}>
              إدارة الأعضاء وأدوارهم. لون كل عضو يظهر في كل أنحاء المنصة.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setAdding(true)}
          className="gap-2"
          style={{
            background: "linear-gradient(180deg, var(--gold-bright), var(--gold))",
            color: "#1a1408",
          }}
        >
          <UserPlus className="w-4 h-4" />
          إضافة عضو
        </Button>
      </div>

      {loading ? (
        <div className="panel p-8">
          <div className="shimmer-bg h-24 rounded-lg" />
        </div>
      ) : members.length === 0 ? (
        <div className="panel p-8 text-center fade-up">
          <p className="text-sm" style={{ color: "var(--parch-dim)" }}>
            لا يوجد أعضاء بعد. أضف أول عضو للبدء.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {members.map((m) => {
            const isCurrent = m.id === current?.id;
            const isEditing = editingId === m.id;
            return (
              <MemberCard
                key={m.id}
                member={m}
                isCurrent={isCurrent}
                isEditing={isEditing}
                onEdit={() => setEditingId(m.id)}
                onStopEdit={() => setEditingId(null)}
                onDelete={() => onDelete(m.id)}
                onSetCurrent={() => setCurrent({ id: m.id, name: m.name, role: m.role, color: m.color, initials: m.initials })}
                onUpdated={() => {
                  setEditingId(null);
                  refresh();
                  refreshCtx();
                }}
              />
            );
          })}
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
  isEditing,
  onEdit,
  onStopEdit,
  onDelete,
  onSetCurrent,
  onUpdated,
}: {
  member: Member;
  isCurrent: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onStopEdit: () => void;
  onDelete: () => void;
  onSetCurrent: () => void;
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
      style={{ borderColor: isCurrent ? "rgba(201,162,75,0.5)" : undefined }}
    >
      <div className="flex items-start gap-3">
        <MemberAvatar name={member.name} color={member.color} initials={member.initials} size={48} />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)] text-sm h-8 mb-2"
            />
          ) : (
            <p className="text-sm font-bold m-0 truncate" style={{ color: "var(--parch)" }}>
              {member.name}
            </p>
          )}
          {isEditing ? (
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="الدور"
              className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)] text-xs h-7"
            />
          ) : (
            <p className="text-xs m-0" style={{ color: "var(--parch-dim)" }}>
              {member.role}
            </p>
          )}
          <p className="text-[10px] mt-1 m-0" style={{ color: "var(--parch-dim)" }}>
            انضم في {fmtDateTime(member.createdAt)}
          </p>
        </div>
        {isCurrent && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "var(--gold)", color: "#1a1408" }}
          >
            أنت
          </span>
        )}
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div
          className="p-2 rounded text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,162,75,0.12)" }}
        >
          <p className="text-[10px] m-0" style={{ color: "var(--parch-dim)" }}>
            بلاغات مدوّنة
          </p>
          <p className="text-lg font-bold m-0 tnum" style={{ color: "var(--gold-bright)" }}>
            {member._count?.reports || 0}
          </p>
        </div>
        <div
          className="p-2 rounded text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,162,75,0.12)" }}
        >
          <p className="text-[10px] m-0" style={{ color: "var(--parch-dim)" }}>
            حلول مقدّمة
          </p>
          <p className="text-lg font-bold m-0 tnum" style={{ color: "var(--green-bright)" }}>
            {member._count?.solvedReports || 0}
          </p>
        </div>
      </div>

      {/* اللون */}
      {isEditing && (
        <div className="mt-3">
          <Label className="text-[10px] mb-1.5 block" style={{ color: "var(--parch-dim)" }}>
            لون التمييز
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {MEMBER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="rounded-full transition"
                style={{
                  width: 22,
                  height: 22,
                  background: c,
                  border: color === c ? "2px solid #fff" : "2px solid transparent",
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
              style={{ background: "var(--green)", color: "#0a1408" }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              حفظ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onStopEdit}
              className="border-[rgba(201,162,75,0.3)] text-[var(--parch)]"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            {!isCurrent && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSetCurrent}
                className="gap-1.5 flex-1 border-[rgba(201,162,75,0.3)] text-[var(--parch)] hover:bg-[rgba(201,162,75,0.1)]"
              >
                تعيين كعضوي
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="text-[var(--parch-dim)] hover:bg-[rgba(201,162,75,0.08)]"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-[var(--crimson-bright)] hover:bg-[rgba(176,74,54,0.1)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
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
      <DialogContent className="bg-[var(--ink-2)] border-[rgba(201,162,75,0.3)] text-[var(--parch)]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl" style={{ color: "var(--gold-bright)" }}>
            إضافة عضو جديد
          </DialogTitle>
          <DialogDescription style={{ color: "var(--parch-dim)" }}>
            سيظهر العضو في قائمة الفريق ويمكنه تسجيل البلاغات والحلول.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-3">
            <MemberAvatar name={name || "؟"} color={color} initials={getInitials(name || "؟")} size={48} />
            <div className="flex-1">
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--gold-bright)" }}>
                اسم العضو
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أ. عبدالله"
                className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)]"
                autoFocus
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block" style={{ color: "var(--gold-bright)" }}>
              الدور
            </Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="مثال: محقق / مراجع / مطوّر CSL"
              className="bg-[var(--ink-3)] border-[rgba(201,162,75,0.22)] text-[var(--parch)]"
            />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block" style={{ color: "var(--gold-bright)" }}>
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
                    border: color === c ? "2px solid #fff" : "2px solid transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-3 gap-2">
          <Button variant="outline" onClick={onClose} className="border-[rgba(201,162,75,0.3)] text-[var(--parch)]">
            إلغاء
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            className="gap-2"
            style={{
              background: "linear-gradient(180deg, var(--gold-bright), var(--gold))",
              color: "#1a1408",
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
