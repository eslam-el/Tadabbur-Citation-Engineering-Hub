"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PendingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const memberId = session?.user?.memberId;
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [activating, setActivating] = useState(false);
  const activatedRef = useRef(false);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  // تفعيل الحساب: تحديث الجلسة برمجياً ثم الدخول للمنصة دون تسجيل خروج.
  const activate = useCallback(
    async (status: string, accessLevel: string) => {
      if (activatedRef.current) return;
      activatedRef.current = true;
      setActivating(true);
      try {
        await update({ status, accessLevel });
        toast.success("تم تفعيل حسابك. أهلاً بك في المنصة.");
        router.replace("/");
      } catch {
        activatedRef.current = false;
        setActivating(false);
        toast.error("تعذّر تفعيل الجلسة تلقائيًا. سجّل خروجًا ودخولًا.");
      }
    },
    [update, router]
  );

  // استطلاع حالة الاعتماد دوريًا (كل 8 ثوانٍ) حتى يعتمد المدير الحساب.
  useEffect(() => {
    if (!memberId) return;
    let stopped = false;

    const check = async () => {
      try {
        const res = await fetch("/api/members/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (stopped) return;
        if (data?.member?.status === "ACTIVE") {
          setApproved(true);
          activate("ACTIVE", data.member.accessLevel ?? "USER");
        }
      } catch {
        /* تجاهل أخطاء الشبكة العابرة */
      }
    };

    check();
    const t = setInterval(check, 8000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [memberId, activate]);

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

  if (approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="panel gold-rule max-w-md w-full p-8 text-center fade-up">
          <div
            className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center pulse-gold"
            style={{ background: "color-mix(in srgb, var(--accent-green) 18%, transparent)" }}
          >
            <CheckCircle2 className="w-7 h-7" style={{ color: "var(--accent-green)" }} />
          </div>
          <h1 className="font-display text-2xl mb-3" style={{ color: "var(--accent-gold-bright)" }}>
            تم اعتماد حسابك 🎉
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
            جارٍ تفعيل جلستك والدخول إلى المنصة تلقائيًا…
          </p>
          <Button
            onClick={() => activate("ACTIVE", session?.user?.accessLevel ?? "USER")}
            disabled={activating}
            className="w-full gap-2"
            style={{
              background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
              color: "var(--primary-foreground)",
            }}
          >
            {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            الدخول إلى المنصة الآن
          </Button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-3 text-xs underline"
            style={{ color: "var(--text-dim)" }}
          >
            أو سجّل خروجًا ودخولًا يدويًا
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="panel gold-rule max-w-md w-full p-8 text-center fade-up">
        <h1 className="font-display text-2xl mb-3" style={{ color: "var(--accent-gold-bright)" }}>
          حسابك بانتظار الاعتماد
        </h1>
        <p className="text-sm mb-2" style={{ color: "var(--text-dim)" }}>
          تم تسجيلك بنجاح. لن ترى البيانات حتى يعتمد المدير حسابك. يمكنك ضبط اسمك الآن:
        </p>
        <p className="text-xs mb-6 inline-flex items-center gap-1.5" style={{ color: "var(--text-dim)" }}>
          <Loader2 className="w-3 h-3 animate-spin" />
          نتحقق من اعتمادك تلقائيًا — ستدخل المنصة فور الاعتماد دون تسجيل خروج.
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
