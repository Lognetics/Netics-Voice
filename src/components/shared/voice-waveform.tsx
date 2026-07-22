"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  /** Whether the waveform is actively animating. */
  active?: boolean;
  bars?: number;
  color?: string;
  className?: string;
  /** Static heights (0..1) for a non-animated snapshot. */
  seed?: number[];
}

/** Animated bar-style voice waveform used in call cards and the conversation viewer. */
export function VoiceWaveform({
  active = true,
  bars = 28,
  color = "#3A86FF",
  className,
  seed,
}: VoiceWaveformProps) {
  const heights = React.useMemo(
    () =>
      Array.from({ length: bars }, (_, i) =>
        seed ? seed[i % seed.length] : 0.3 + ((i * 37) % 70) / 100
      ),
    [bars, seed]
  );

  return (
    <div
      className={cn("flex items-center gap-[3px] h-8", className)}
      aria-hidden
    >
      {heights.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: color }}
          initial={{ height: `${h * 100}%` }}
          animate={
            active
              ? {
                  height: [
                    `${h * 40}%`,
                    `${Math.min(h * 130, 100)}%`,
                    `${h * 55}%`,
                  ],
                }
              : { height: `${h * 45}%` }
          }
          transition={
            active
              ? {
                  duration: 0.9 + (i % 5) * 0.14,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: (i % 7) * 0.05,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}
