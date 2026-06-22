// ثوابت المنصة: تصنيفات الأخطاء، الخطورة، الحالات، الأولويات

export type ErrorType =
  | "data"
  | "style"
  | "plugin"
  | "note"
  | "suggestion"
  | "other";

export type Severity = "low" | "medium" | "high" | "critical";

export type ReportStatus = "open" | "in_progress" | "resolved" | "closed";

export const ERROR_TYPES: Record<
  ErrorType,
  { label: string; short: string; color: string; bg: string; icon: string; desc: string }
> = {
  data: {
    label: "خطأ في البيانات",
    short: "بيانات",
    color: "#d96a4f",
    bg: "rgba(176, 74, 54, 0.14)",
    icon: "Database",
    desc: "أخطاء في أصل البيانات المستوردة من قاعدة المكتبة الشاملة أو من مندلي نفسه (إملائية، حقل ناقص، مؤلف خاطئ، سنة، عنوان…).",
  },
  style: {
    label: "خطأ في النمط / الاستايل",
    short: "نمط",
    color: "#e3c168",
    bg: "rgba(201, 162, 75, 0.16)",
    icon: "Palette",
    desc: "أخطاء في النمط CSL الذي ولّده المرسم (ترقيم، ترتيب، فواصل، حروف ميتة، علامات ترقيم، نمط الإحالات…).",
  },
  plugin: {
    label: "خطأ في إضافة مندلي للوورد",
    short: "إضافة",
    color: "#9bc872",
    bg: "rgba(127, 170, 90, 0.16)",
    icon: "Puzzle",
    desc: "مشكلات في تفاعل إضافة مندلي داخل الوورد: تحديث المراجع، تزامن الاستشهادات، تضمين الأقواس، تجمّد الإضافة…",
  },
  note: {
    label: "ملاحظة مخصوصة",
    short: "ملاحظة",
    color: "#8db8de",
    bg: "rgba(107, 141, 181, 0.16)",
    icon: "StickyNote",
    desc: "ملاحظات شخصية من المراجع حول سير العمل أو حالة معينة لا تندرج ضمن الأخطاء.",
  },
  suggestion: {
    label: "مقترح طلب",
    short: "مقترح",
    color: "#d6a8e8",
    bg: "rgba(167, 110, 200, 0.16)",
    icon: "Lightbulb",
    desc: "اقتراحات لتحسين المرسم أو إضافة ميزة أو تعديل سلوك النمط أو طلب دعم حقل جديد.",
  },
  other: {
    label: "أخرى",
    short: "أخرى",
    color: "#b0a489",
    bg: "rgba(176, 164, 137, 0.16)",
    icon: "MoreHorizontal",
    desc: "أي أمر آخر يستحق التدوين ولا يصنّف ضمن الأنواع السابقة.",
  },
};

export const ERROR_TYPE_LIST = Object.entries(ERROR_TYPES).map(([key, v]) => ({
  value: key as ErrorType,
  ...v,
}));

export const SEVERITIES: Record<
  Severity,
  { label: string; color: string; bg: string; weight: number }
> = {
  low: { label: "منخفضة", color: "#9bc872", bg: "rgba(127, 170, 90, 0.16)", weight: 1 },
  medium: { label: "متوسطة", color: "#e3c168", bg: "rgba(201, 162, 75, 0.16)", weight: 2 },
  high: { label: "عالية", color: "#e89456", bg: "rgba(232, 148, 86, 0.16)", weight: 3 },
  critical: { label: "حرجة", color: "#d96a4f", bg: "rgba(176, 74, 54, 0.18)", weight: 4 },
};

export const SEVERITY_LIST = Object.entries(SEVERITIES).map(([key, v]) => ({
  value: key as Severity,
  ...v,
}));

export const STATUSES: Record<
  ReportStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  open: { label: "مفتوح", color: "#d96a4f", bg: "rgba(176, 74, 54, 0.16)", icon: "Circle" },
  in_progress: {
    label: "قيد المعالجة",
    color: "#e3c168",
    bg: "rgba(201, 162, 75, 0.16)",
    icon: "Timer",
  },
  resolved: {
    label: "تم الحل",
    color: "#9bc872",
    bg: "rgba(127, 170, 90, 0.16)",
    icon: "CheckCircle2",
  },
  closed: {
    label: "مغلق",
    color: "#b0a489",
    bg: "rgba(176, 164, 137, 0.16)",
    icon: "Lock",
  },
};

export const STATUS_LIST = Object.entries(STATUSES).map(([key, v]) => ({
  value: key as ReportStatus,
  ...v,
}));

export const PRIORITY_LIST = [
  { value: 1, label: "1 — أعلى", color: "#d96a4f" },
  { value: 2, label: "2 — عالية", color: "#e89456" },
  { value: 3, label: "3 — متوسطة", color: "#e3c168" },
  { value: 4, label: "4 — منخفضة", color: "#9bc872" },
  { value: 5, label: "5 — الأقل", color: "#8db8de" },
];

// ألوان مميزة مقترحة لأعضاء الفريق
export const MEMBER_COLORS = [
  "#c9a24b",
  "#b04a36",
  "#7faa5a",
  "#6b8db5",
  "#a76ec8",
  "#d6a8e8",
  "#e89456",
  "#8db8de",
  "#e3c168",
  "#9bc872",
];

export function getInitials(name: string): string {
  if (!name) return "؟";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] || "") + (parts[1][0] || "");
}
