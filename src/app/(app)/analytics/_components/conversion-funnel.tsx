"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils";

interface Stage {
  label: string;
  value: number;
  color: string;
}

/**
 * Conversion funnel — custom stacked bars. Widths are proportional to the top
 * stage; drop-off vs. the previous stage is annotated on the right.
 */
export function ConversionFunnel({ stages }: { stages: Stage[] }) {
  const top = stages[0]?.value || 1;
  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => {
        const pctOfTop = (s.value / top) * 100;
        const prev = i === 0 ? s.value : stages[i - 1].value;
        const stepRate = (s.value / prev) * 100;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{s.label}</span>
              <span className="tabular text-muted-foreground">
                {formatNumber(s.value)}
                {i > 0 && (
                  <span className="ml-2 text-xs text-danger-soft">
                    {(100 - stepRate).toFixed(0)}% drop
                  </span>
                )}
              </span>
            </div>
            <div className="h-9 w-full overflow-hidden rounded-lg bg-white/[0.03]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pctOfTop}%` }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                className="flex h-full items-center justify-end rounded-lg pr-3 text-xs font-semibold text-white/90"
                style={{
                  background: `linear-gradient(90deg, ${s.color}33, ${s.color})`,
                }}
              >
                {pctOfTop.toFixed(1)}%
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
