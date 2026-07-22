import { seededRandom } from "@/lib/utils";
import type { Branch } from "@/types";

export const STATUS_META: Record<
  Branch["status"],
  { label: string; dot: string; badge: "success" | "warning" | "secondary" }
> = {
  open: { label: "Open", dot: "#00C896", badge: "success" },
  busy: { label: "Busy", dot: "#C9A227", badge: "warning" },
  closed: { label: "Closed", dot: "#6b7280", badge: "secondary" },
};

/** Deterministic 12-point performance trend for a branch, scaled around its calls today. */
export function branchTrend(branch: Branch): number[] {
  const rng = seededRandom(`trend-${branch.id}`);
  const base = branch.callsToday;
  return Array.from({ length: 12 }, (_, i) => {
    const wobble = Math.sin(i / 2) * 0.15 + (rng() - 0.5) * 0.3;
    return Math.max(1, Math.round(base * (0.7 + wobble + i * 0.02)));
  });
}

/** Derived AI resolution rate (0..1) — deterministic per branch. */
export function aiResolution(branch: Branch): number {
  const rng = seededRandom(`res-${branch.id}`);
  return parseFloat((0.78 + rng() * 0.18).toFixed(3));
}

/** Revenue per staff member — a productivity signal. */
export function revenuePerStaff(branch: Branch): number {
  return Math.round(branch.monthlyRevenue / Math.max(1, branch.staffCount));
}
