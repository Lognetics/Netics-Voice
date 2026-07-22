"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StudioSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  /** Formats the value shown on the right (e.g. "1.0×", "220 ms"). */
  format?: (v: number) => string;
  /** Small helper legend below the track (e.g. "Precise ⟷ Creative"). */
  legend?: [string, string];
  accent?: string;
}

/**
 * A branded range slider built on <input type="range"> - no new deps.
 * The filled portion is painted via a CSS gradient background.
 */
export function StudioSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  legend,
  accent = "#3A86FF",
}: StudioSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span
          className="rounded-md bg-white/[0.05] px-2 py-0.5 text-xs font-semibold tabular"
          style={{ color: accent }}
        >
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          "h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none",
          "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white",
          "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform",
          "[&::-webkit-slider-thumb]:hover:scale-110",
          "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[var(--accent)]"
        )}
        style={
          {
            background: `linear-gradient(to right, ${accent} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
            ["--accent" as string]: accent,
          } as React.CSSProperties
        }
      />
      {legend && (
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{legend[0]}</span>
          <span>{legend[1]}</span>
        </div>
      )}
    </div>
  );
}
