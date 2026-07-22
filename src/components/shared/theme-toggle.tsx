"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";
const KEY = "netics-theme";

/** Read + control the light/dark theme via a class on <html>, persisted. */
export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const stored =
      (localStorage.getItem(KEY) as Theme | null) ??
      (document.documentElement.classList.contains("light") ? "light" : "dark");
    setThemeState(stored);
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#F4F6F9" : "#080B14");
    setThemeState(t);
  }, []);

  const toggle = React.useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme]
  );

  return { theme, toggle, setTheme };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ y: 12, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -12, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.18 }}
          className="absolute"
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
