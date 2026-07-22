"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { seededRandom } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

/**
 * Activity heat map — day-of-week × hour grid derived from a seeded PRNG so it
 * stays deterministic across server/client renders. Values model a
 * restaurant-style traffic curve (lunch + dinner peaks, weekend uplift).
 */
function buildMatrix(): number[][] {
  const rand = seededRandom("netics-analytics-heatmap");
  return DAYS.map((_, d) => {
    const weekend = d >= 5;
    return HOURS.map((h) => {
      const lunch = h >= 11 && h <= 14 ? 1.7 : 1;
      const dinner = h >= 18 && h <= 21 ? 2.1 : 1;
      const dead = h < 7 ? 0.12 : 1;
      const wk = weekend ? 1.35 : 1;
      const base = 10 + rand() * 22;
      return Math.round(base * lunch * dinner * dead * wk);
    });
  });
}

const MATRIX = buildMatrix();
const MAX = Math.max(...MATRIX.flat());

function cellColor(v: number) {
  const t = v / MAX; // 0..1
  // brand blue → gold, ramp alpha with intensity
  const alpha = 0.06 + t * 0.9;
  const color = t > 0.66 ? "201,162,39" : t > 0.33 ? "58,134,255" : "58,134,255";
  return `rgba(${color},${alpha.toFixed(3)})`;
}

export function ActivityHeatmap() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Hour axis */}
        <div className="mb-1.5 flex pl-10 text-[10px] text-muted-foreground">
          {HOURS.map((h) => (
            <div key={h} className="flex-1 text-center">
              {h % 3 === 0 ? `${h}` : ""}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {DAYS.map((day, d) => (
            <div key={day} className="flex items-center gap-1">
              <div className="w-9 shrink-0 text-[11px] text-muted-foreground">{day}</div>
              <div className="flex flex-1 gap-1">
                {HOURS.map((h) => (
                  <motion.div
                    key={h}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (d * 24 + h) * 0.0015, duration: 0.25 }}
                    className="group relative h-5 flex-1 rounded-[3px] ring-1 ring-white/[0.04]"
                    style={{ background: cellColor(MATRIX[d][h]) }}
                    title={`${day} ${h}:00 — ${MATRIX[d][h]} calls`}
                  >
                    <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md glass px-2 py-1 text-[10px] shadow-soft group-hover:block">
                      {day} {h}:00 · {MATRIX[d][h]} calls
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 pl-10 text-[11px] text-muted-foreground">
          <span>Less</span>
          {[0.12, 0.35, 0.55, 0.75, 0.95].map((t) => (
            <span
              key={t}
              className="h-3 w-6 rounded-[3px] ring-1 ring-white/[0.04]"
              style={{ background: cellColor(t * MAX) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
