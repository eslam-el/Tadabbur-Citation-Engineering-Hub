// دوال صلاحية نقية — بلا شبكة أو قاعدة بيانات، قابلة للاختبار والاستخدام في بيئة Edge.
export type AuthInfo =
  | { memberId?: string | null; accessLevel?: string | null; status?: string | null }
  | null
  | undefined;

export function isActive(u: AuthInfo): boolean {
  return !!u && u.status === "ACTIVE";
}

export function isAdmin(u: AuthInfo): boolean {
  return !!u && u.status === "ACTIVE" && u.accessLevel === "ADMIN";
}
