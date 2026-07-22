import { seededRandom } from "@/lib/utils";
import type { User, UserRole } from "@/types";

export const ROLE_META: Record<
  UserRole,
  { label: string; badge: "gold" | "default" | "success" | "secondary" | "warning" }
> = {
  owner: { label: "Owner", badge: "gold" },
  admin: { label: "Admin", badge: "default" },
  manager: { label: "Manager", badge: "success" },
  agent: { label: "Agent", badge: "secondary" },
  analyst: { label: "Analyst", badge: "warning" },
  viewer: { label: "Viewer", badge: "secondary" },
};

export const STATUS_META: Record<
  User["status"],
  { label: string; dot: string; badge: "success" | "warning" | "secondary" | "default" }
> = {
  online: { label: "Online", dot: "#00C896", badge: "success" },
  on_call: { label: "On call", dot: "#3A86FF", badge: "default" },
  away: { label: "Away", dot: "#C9A227", badge: "warning" },
  offline: { label: "Offline", dot: "#6b7280", badge: "secondary" },
};

/** Full permission catalog for the profile switches. */
export const PERMISSION_CATALOG: { key: string; label: string }[] = [
  { key: "calls.view", label: "View calls" },
  { key: "calls.manage", label: "Manage & take over calls" },
  { key: "orders.edit", label: "Edit orders" },
  { key: "bookings.edit", label: "Edit bookings" },
  { key: "customers.view", label: "View customers" },
  { key: "analytics.view", label: "View analytics" },
  { key: "ai.configure", label: "Configure AI agents" },
  { key: "billing.manage", label: "Manage billing" },
  { key: "users.manage", label: "Manage team" },
];

export function hasPermission(user: User, key: string): boolean {
  return user.permissions.includes("*") || user.permissions.includes(key);
}

/** Deterministic 7-day CSAT/calls mini-series for a user. */
export function employeeTrend(user: User): { day: string; calls: number; csat: number }[] {
  const rng = seededRandom(`emp-${user.id}`);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyBase = Math.round(user.callsHandled / 90);
  return days.map((day) => ({
    day,
    calls: Math.max(0, Math.round(dailyBase * (0.6 + rng() * 0.9))),
    csat: parseFloat((3.8 + rng() * 1.1).toFixed(1)),
  }));
}

/** Mock human-takeover history (AI → agent handoffs). */
export function takeoverHistory(user: User) {
  const rng = seededRandom(`takeover-${user.id}`);
  const intents = [
    "Refund request > $50",
    "Frustrated customer",
    "Complex booking change",
    "Low AI confidence",
    "VIP escalation",
  ];
  const outcomes = ["Resolved", "Resolved", "Escalated", "Follow-up scheduled"];
  const count = 3 + Math.floor(rng() * 3);
  return Array.from({ length: count }, (_, i) => ({
    id: `${user.id}-th-${i}`,
    reason: intents[Math.floor(rng() * intents.length)],
    outcome: outcomes[Math.floor(rng() * outcomes.length)],
    minsAgo: Math.round(30 + rng() * 60 * 40),
  }));
}

/** Deterministic weekly availability grid (7 days x 4 shifts). */
export function scheduleGrid(user: User): boolean[][] {
  const rng = seededRandom(`sched-${user.id}`);
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 7 }, () => rng() > 0.35)
  );
}

/** Productivity score 0..100 derived from calls + csat. */
export function productivityScore(user: User): number {
  const callFactor = Math.min(1, user.callsHandled / 2400);
  const csatFactor = user.csat / 5;
  return Math.round((callFactor * 0.55 + csatFactor * 0.45) * 100);
}
