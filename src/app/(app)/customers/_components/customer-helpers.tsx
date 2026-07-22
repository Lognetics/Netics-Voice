"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn, seededRandom } from "@/lib/utils";
import type { Customer } from "@/types";

/* ----------------------------- Tier config ---------------------------- */

export const TIER_ORDER: Customer["loyaltyTier"][] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
];

/** Loyalty points required to reach each tier. Used for the progress bar. */
export const TIER_THRESHOLDS: Record<Customer["loyaltyTier"], number> = {
  bronze: 0,
  silver: 2_500,
  gold: 6_000,
  platinum: 12_000,
};

export const tierConfig: Record<
  Customer["loyaltyTier"],
  { label: string; badge: string; dot: string }
> = {
  bronze: {
    label: "Bronze",
    badge: "border-transparent bg-amber-700/20 text-amber-500",
    dot: "#B45309",
  },
  silver: {
    label: "Silver",
    badge: "border-transparent bg-slate-400/15 text-slate-300",
    dot: "#94A3B8",
  },
  gold: {
    label: "Gold",
    badge: "border-transparent bg-gold/15 text-gold-soft",
    dot: "#C9A227",
  },
  platinum: {
    label: "Platinum",
    badge: "border-transparent bg-brand/15 text-brand-soft",
    dot: "#3A86FF",
  },
};

export function TierBadge({
  tier,
  className,
}: {
  tier: Customer["loyaltyTier"];
  className?: string;
}) {
  const c = tierConfig[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        c.badge,
        className
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c.dot }}
      />
      {c.label}
    </span>
  );
}

/* ----------------------------- Risk config ---------------------------- */

export const riskConfig: Record<
  Customer["riskLevel"],
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  low: { label: "Low risk", variant: "success" },
  medium: { label: "Medium risk", variant: "warning" },
  high: { label: "High risk", variant: "danger" },
};

export function RiskBadge({ level }: { level: Customer["riskLevel"] }) {
  const c = riskConfig[level];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

/* --------------------------- Lead score bar --------------------------- */

export function LeadScoreBar({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const color = score >= 70 ? "#00C896" : score >= 45 ? "#C9A227" : "#FF4D4F";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-full min-w-10 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="w-7 shrink-0 text-right text-xs font-medium tabular"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

/* ------------------------- Loyalty tier progress ---------------------- */

/** Returns the next tier + progress ratio toward it (0..1). */
export function tierProgress(customer: Customer) {
  const idx = TIER_ORDER.indexOf(customer.loyaltyTier);
  const nextTier = TIER_ORDER[idx + 1];
  if (!nextTier) {
    return { nextTier: null, ratio: 1, remaining: 0 };
  }
  const floor = TIER_THRESHOLDS[customer.loyaltyTier];
  const ceil = TIER_THRESHOLDS[nextTier];
  const span = ceil - floor || 1;
  const ratio = Math.min(
    1,
    Math.max(0, (customer.loyaltyPoints - floor) / span)
  );
  return {
    nextTier,
    ratio,
    remaining: Math.max(0, ceil - customer.loyaltyPoints),
  };
}

/* ---------------------- Deterministic LTV history --------------------- */

/**
 * Build a stable 12-month lifetime-value accumulation curve for a customer,
 * ending at their current lifetimeValue. Deterministic per-customer.
 */
export function ltvHistory(customer: Customer) {
  const rng = seededRandom(customer.id + "-ltv");
  // Random monthly weights that sum-normalise to the total LTV.
  const weights = Array.from({ length: 12 }, () => 0.4 + rng());
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  let running = 0;
  const now = new Date();
  return weights.map((w, i) => {
    running += (w / totalWeight) * customer.lifetimeValue;
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      value: Math.round(running),
    };
  });
}
