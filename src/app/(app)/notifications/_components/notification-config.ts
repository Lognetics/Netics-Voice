import {
  PhoneCall,
  ShoppingCart,
  CalendarCheck,
  Settings2,
  CreditCard,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { AppNotification } from "@/types";
import type { Badge } from "@/components/ui/badge";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

export interface TypeMeta {
  label: string;
  icon: LucideIcon;
  /** Tailwind text color class for the icon. */
  color: string;
  /** Tailwind background tint for the icon chip. */
  bg: string;
}

export const TYPE_META: Record<AppNotification["type"], TypeMeta> = {
  call: {
    label: "Calls",
    icon: PhoneCall,
    color: "text-brand",
    bg: "bg-brand/12",
  },
  order: {
    label: "Orders",
    icon: ShoppingCart,
    color: "text-success",
    bg: "bg-success/12",
  },
  booking: {
    label: "Bookings",
    icon: CalendarCheck,
    color: "text-gold-soft",
    bg: "bg-gold/12",
  },
  system: {
    label: "System",
    icon: Settings2,
    color: "text-muted-foreground",
    bg: "bg-white/[0.05]",
  },
  billing: {
    label: "Billing",
    icon: CreditCard,
    color: "text-brand-soft",
    bg: "bg-brand/12",
  },
  escalation: {
    label: "Escalations",
    icon: AlertTriangle,
    color: "text-danger-soft",
    bg: "bg-danger/12",
  },
};

export const PRIORITY_META: Record<
  AppNotification["priority"],
  { label: string; variant: BadgeVariant }
> = {
  high: { label: "High", variant: "danger" },
  normal: { label: "Normal", variant: "secondary" },
  low: { label: "Low", variant: "outline" },
};

/** Bucket an ISO date relative to NOW into a day group. */
export function dayGroup(iso: string): "Today" | "Yesterday" | "Earlier" {
  const then = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const t = then.getTime();
  if (t >= startOfToday) return "Today";
  if (t >= startOfToday - 86_400_000) return "Yesterday";
  return "Earlier";
}

export const DAY_ORDER = ["Today", "Yesterday", "Earlier"] as const;
