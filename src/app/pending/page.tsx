"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PendingPage() {
  const { data: session } = useSession();
  const memberId = session?.user?.memberId;
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  const saveName = async () => {
    if (!memberId || !name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("تم حفظ اسمك. بانتظار اعتماد المدير.");
    } catch {
      toast.error("تعذّر حفظ الاسم.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="panel gold-rule max-w-md w-full p-8 text-center fade-up">
        <h1 className="font-display text-2xl mb-3" style={{ color: "var(--accent-gold-bright)" }}>
          حسابك بانتظار الاعتماد
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
          تم تسجيلك بنجاح. لن ترى البيانات حتى يعتمد المدير حسابك. يمكنك ضبط اسمك الآن:
        </p>
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك كما يظهر للفريق"
            className="bg-[var(--surface-2)] border-[var(--border-soft)] text-[var(--text-strong)]"
          />
          <Button
            onClick={saveName}
            disabled={saving}
            className="w-full"
            style={{
              background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
              color: "var(--primary-foreground)",
            }}
          >
            حفظ الاسم
          </Button>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full border-[var(--border-soft)] text-[var(--text-strong)]"
          >
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}
