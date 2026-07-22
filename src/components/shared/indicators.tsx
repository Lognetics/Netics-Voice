import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Sentiment } from "@/types";

const sentimentConfig: Record<
  Sentiment,
  { label: string; className: string; emoji: string }
> = {
  positive: {
    label: "Positive",
    className: "bg-success/15 text-success",
    emoji: "😊",
  },
  neutral: {
    label: "Neutral",
    className: "bg-white/[0.05] text-muted-foreground",
    emoji: "😐",
  },
  negative: {
    label: "Negative",
    className: "bg-danger/15 text-danger-soft",
    emoji: "😞",
  },
  frustrated: {
    label: "Frustrated",
    className: "bg-amber-500/15 text-amber-400",
    emoji: "😤",
  },
};

export function SentimentBadge({
  sentiment,
  showEmoji = true,
  className,
}: {
  sentiment: Sentiment;
  showEmoji?: boolean;
  className?: string;
}) {
  const c = sentimentConfig[sentiment];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.className,
        className
      )}
    >
      {showEmoji && <span className="text-[11px]">{c.emoji}</span>}
      {c.label}
    </span>
  );
}

/** A confidence meter - a bar that shifts color from red → gold → green. */
export function ConfidenceMeter({
  value,
  showLabel = true,
  className,
}: {
  value: number; // 0..1
  showLabel?: boolean;
  className?: string;
}) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.85 ? "#00C896" : value >= 0.6 ? "#C9A227" : "#FF4D4F";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-medium tabular"
          style={{ color }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}

/** A pulsing "live" dot. */
export function LiveDot({
  color = "#00C896",
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span
        className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

export function StatusPill({
  label,
  tone = "secondary",
}: {
  label: string;
  tone?: React.ComponentProps<typeof Badge>["variant"];
}) {
  return <Badge variant={tone}>{label}</Badge>;
}
