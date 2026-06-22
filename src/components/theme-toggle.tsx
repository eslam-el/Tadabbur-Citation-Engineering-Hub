"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = theme !== "light";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
      title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-[var(--text-dim)] hover:text-[var(--accent-gold-bright)] hover:bg-[var(--soft-gold-bg)]"
    >
      {mounted && isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
}
