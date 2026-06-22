"use client";

import { cn } from "@/lib/utils";
import { ERROR_TYPES, SEVERITIES, STATUSES, type ErrorType, type Severity, type ReportStatus } from "@/lib/constants";

export function MemberAvatar({
  name,
  color,
  initials,
  size = 36,
  className,
}: {
  name: string;
  color?: string;
  initials?: string;
  size?: number;
  className?: string;
}) {
  const text =
    initials ||
    (name
      ? name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((p) => p[0])
          .join("")
      : "؟");
  return (
    <span
      className={cn("avatar-circle", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: color || "var(--accent-gold)",
      }}
      title={name}
    >
      {text}
    </span>
  );
}

export function TypeChip({ type, withLabel = true }: { type: ErrorType; withLabel?: boolean }) {
  const t = ERROR_TYPES[type];
  if (!t) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ color: t.color, background: t.bg, border: `1px solid ${t.color}33` }}
      title={t.desc}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: t.color }}
      />
      {withLabel ? t.label : t.short}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: Severity }) {
  const s = SEVERITIES[severity];
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}33` }}
    >
      {s.label}
    </span>
  );
}

export function StatusChip({ status }: { status: ReportStatus }) {
  const s = STATUSES[status];
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}33` }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}
