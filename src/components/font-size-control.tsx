"use client";

import { ALargeSmall, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFontScale, FONT_LEVELS } from "@/components/font-scale-provider";

export function FontSizeControl() {
  const { index, setIndex, inc, dec, reset } = useFontScale();
  const atMin = index === 0;
  const atMax = index === FONT_LEVELS.length - 1;
  const isDefault = index === 1;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="حجم الخط"
          title="حجم الخط"
          className="text-[var(--text-dim)] hover:text-[var(--accent-gold-bright)] hover:bg-[var(--soft-gold-bg)]"
        >
          <ALargeSmall className="w-[18px] h-[18px]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-4 bg-[var(--surface-1)] border-[var(--border-soft)] text-[var(--text-strong)]"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold" style={{ color: "var(--accent-gold-bright)" }}>
            حجم الخط
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "var(--soft-gold-bg)", color: "var(--accent-gold-bright)" }}
          >
            {FONT_LEVELS[index].label}
          </span>
        </div>

        {/* ستبر: − [ مؤشّر المستويات ] + */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={dec}
            disabled={atMin}
            aria-label="تصغير الخط"
            className="shrink-0 h-9 w-9 border-[var(--border-soft)] text-[var(--text-strong)] hover:bg-[var(--soft-gold-bg)] disabled:opacity-40"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <div className="flex-1 flex items-center gap-1" role="group" aria-label="مستوى الحجم">
            {FONT_LEVELS.map((lvl, i) => (
              <button
                key={lvl.label}
                onClick={() => setIndex(i)}
                aria-label={lvl.label}
                aria-pressed={i === index}
                className="h-2.5 flex-1 rounded-full transition-all duration-200"
                style={{
                  background: i <= index ? "var(--accent-gold)" : "var(--surface-3)",
                  outline: i === index ? "2px solid var(--accent-gold-bright)" : "none",
                  outlineOffset: 1,
                }}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={inc}
            disabled={atMax}
            aria-label="تكبير الخط"
            className="shrink-0 h-9 w-9 border-[var(--border-soft)] text-[var(--text-strong)] hover:bg-[var(--soft-gold-bg)] disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* تدرّج بصري للأحجام */}
        <div className="flex justify-between items-end mt-2 px-10" style={{ color: "var(--text-dim)" }}>
          <span style={{ fontSize: "0.7rem" }}>أ</span>
          <span style={{ fontSize: "0.85rem" }}>أ</span>
          <span style={{ fontSize: "1rem" }}>أ</span>
          <span style={{ fontSize: "1.15rem" }}>أ</span>
          <span style={{ fontSize: "1.35rem" }}>أ</span>
        </div>

        {/* معاينة حيّة — تتغيّر فورًا مع المقياس */}
        <div
          className="mt-3 p-3 rounded-lg"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-soft)" }}
        >
          <p className="m-0 leading-relaxed text-sm" style={{ color: "var(--text-strong)" }}>
            مرسم تدبر — منصة تتبّع أخطاء الفريق ١٢٣
          </p>
        </div>

        <div className="flex justify-end mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={isDefault}
            className="gap-1.5 text-[var(--text-dim)] hover:text-[var(--accent-gold-bright)] hover:bg-[var(--soft-gold-bg)] disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            استعادة الافتراضي
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
