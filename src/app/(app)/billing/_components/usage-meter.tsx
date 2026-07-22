"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { cn, formatNumber } from "@/lib/utils";
import type { UsageMetric } from "@/types";

export function UsageMeter({ metric }: { metric: UsageMetric }) {
  const pct = Math.min(100, Math.round((metric.used / metric.limit) * 100));
  const tone =
    pct >= 90 ? "bg-danger" : pct >= 75 ? "bg-amber-400" : "bg-brand";
  const label =
    pct >= 90 ? "text-danger" : pct >= 75 ? "text-amber-400" : "text-muted-foreground";

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium">{metric.label}</span>
        <span className="text-xs text-muted-foreground tabular">
          {formatNumber(metric.used)}
          <span className="text-muted-foreground/60">
            {" "}
            / {formatNumber(metric.limit)} {metric.unit}
          </span>
        </span>
      </div>
      <Progress value={pct} indicatorClassName={tone} />
      <div className={cn("mt-1 text-[11px] font-medium tabular", label)}>
        {pct}% used
      </div>
    </div>
  );
}
