"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

// مستويات حجم الخط — نِسَب من حجم المتصفح الافتراضي (يحترم تفضيل المستخدم).
export const FONT_LEVELS = [
  { label: "صغير", pct: 90 },
  { label: "عادي", pct: 100 },
  { label: "مريح", pct: 110 },
  { label: "كبير", pct: 120 },
  { label: "الأكبر", pct: 132 },
] as const;

export const FONT_STORAGE_KEY = "tadabbur-font-scale";
const DEFAULT_INDEX = 1;

type Ctx = {
  index: number;
  setIndex: (i: number) => void;
  inc: () => void;
  dec: () => void;
  reset: () => void;
};

const FontScaleCtx = createContext<Ctx | null>(null);

const clamp = (i: number) => Math.max(0, Math.min(FONT_LEVELS.length - 1, i));

function applyPct(pct: number) {
  document.documentElement.style.fontSize = pct + "%";
}

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndexState] = useState<number>(DEFAULT_INDEX);
  const indexRef = useRef<number>(DEFAULT_INDEX);

  const apply = useCallback((i: number) => {
    const c = clamp(i);
    indexRef.current = c;
    setIndexState(c);
    applyPct(FONT_LEVELS[c].pct);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, String(c));
    } catch {
      /* تخزين غير متاح — نتجاهل */
    }
  }, []);

  // استرجاع القيمة المحفوظة عند التحميل (مطابِق للسكربت المبكر في layout).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FONT_STORAGE_KEY);
      const i = raw === null ? DEFAULT_INDEX : Number(raw);
      const c = clamp(Number.isFinite(i) ? i : DEFAULT_INDEX);
      indexRef.current = c;
      setIndexState(c);
      applyPct(FONT_LEVELS[c].pct);
    } catch {
      /* تجاهل */
    }
  }, []);

  const setIndex = useCallback((i: number) => apply(i), [apply]);
  const inc = useCallback(() => apply(indexRef.current + 1), [apply]);
  const dec = useCallback(() => apply(indexRef.current - 1), [apply]);
  const reset = useCallback(() => apply(DEFAULT_INDEX), [apply]);

  return (
    <FontScaleCtx.Provider value={{ index, setIndex, inc, dec, reset }}>
      {children}
    </FontScaleCtx.Provider>
  );
}

export function useFontScale() {
  const ctx = useContext(FontScaleCtx);
  if (!ctx) throw new Error("useFontScale must be used within FontScaleProvider");
  return ctx;
}
