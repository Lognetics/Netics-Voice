"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import type { Branch } from "@/types";
import { STATUS_META } from "./branch-utils";

/**
 * A no-dependency "world map" - plots branches by lat/lng as absolutely
 * positioned dots over a subtle grid, normalized from the branch lat/lng range.
 */
export function BranchMap({
  branches,
  onSelect,
}: {
  branches: Branch[];
  onSelect: (b: Branch) => void;
}) {
  const bounds = React.useMemo(() => {
    const lats = branches.map((b) => b.lat);
    const lngs = branches.map((b) => b.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [branches]);

  const pos = (b: Branch) => {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    const padX = 8;
    const padY = 10;
    const x =
      maxLng === minLng
        ? 50
        : padX + ((b.lng - minLng) / (maxLng - minLng)) * (100 - padX * 2);
    // invert lat so north is up
    const y =
      maxLat === minLat
        ? 50
        : padY + ((maxLat - b.lat) / (maxLat - minLat)) * (100 - padY * 2);
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div
      className="relative h-[320px] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[radial-gradient(circle_at_30%_20%,rgba(58,134,255,0.10),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(0,200,150,0.08),transparent_55%)]"
      style={{
        backgroundColor: "rgba(255,255,255,0.015)",
      }}
    >
      {/* grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <span className="absolute left-3 top-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        Global footprint
      </span>

      <TooltipProvider delayDuration={80}>
        {branches.map((b, i) => {
          const meta = STATUS_META[b.status];
          const p = pos(b);
          // scale dot by revenue for a heat effect
          const size = 10 + (b.staffCount / 32) * 10;
          return (
            <Tooltip key={b.id}>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={() => onSelect(b)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={p}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 200 }}
                >
                  <span className="relative flex items-center justify-center">
                    <span
                      className="absolute animate-ping rounded-full opacity-40"
                      style={{
                        backgroundColor: meta.dot,
                        width: size,
                        height: size,
                      }}
                    />
                    <span
                      className="rounded-full ring-2 ring-white/20"
                      style={{
                        backgroundColor: meta.dot,
                        width: size,
                        height: size,
                      }}
                    />
                  </span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-0.5">
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.city}, {b.country} · {meta.label}
                  </p>
                  <p className="text-xs">
                    {b.callsToday} calls ·{" "}
                    {formatCurrency(b.monthlyRevenue, { compact: true })}/mo
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
