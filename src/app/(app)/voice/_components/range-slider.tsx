"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  /** Renders the live value; defaults to the raw number. */
  format?: (v: number) => string;
  hint?: string;
  accent?: string;
  className?: string;
}

/** A styled range input with a live value chip and a filled track. */
export function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
  accent = "#3A86FF",
  className,
}: RangeSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {hint && (
            <span className="text-xs text-muted-foreground/70">{hint}</span>
          )}
        </div>
        <span
          className="rounded-md px-2 py-0.5 text-xs font-semibold tabular"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          {format ? format(value) : value}
        </span>
      </div>
      <div className="relative flex h-5 items-center">
        <div className="absolute h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{ width: `${pct}%`, backgroundColor: accent }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={label}
          className="range-slider relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent"
          style={{ accentColor: accent }}
        />
      </div>
    </div>
  );
}
