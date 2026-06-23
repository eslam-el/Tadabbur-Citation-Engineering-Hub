"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="panel gold-rule max-w-md w-full p-8 text-center fade-up">
        <p className="text-xs tracking-widest font-semibold uppercase mb-2" style={{ color: "var(--accent-crimson)" }}>
          TADABBUR · CSL STUDIO
        </p>
        <h1 className="font-display text-3xl mb-3" style={{ color: "var(--accent-gold-bright)" }}>
          منصة تتبّع أخطاء الفريق
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-dim)" }}>
          سجّل الدخول بحساب Google للمتابعة. الحسابات الجديدة تنتظر اعتماد المدير قبل الوصول للبيانات.
        </p>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full gap-2"
          style={{
            background: "linear-gradient(180deg, var(--accent-gold-bright), var(--accent-gold))",
            color: "var(--primary-foreground)",
          }}
        >
          الدخول بحساب Google
        </Button>
      </div>
    </div>
  );
}
