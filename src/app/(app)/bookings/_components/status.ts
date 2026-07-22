import type * as React from "react";
import type { BookingStatus } from "@/types";
import type { Badge } from "@/components/ui/badge";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

export interface StatusMeta {
  label: string;
  /** Badge variant */
  variant: BadgeVariant;
  /** Hex accent for calendar chips / dots */
  color: string;
  /** Chip background/border/text classes for the calendar view */
  chip: string;
  /** Small dot color class */
  dot: string;
}

export const STATUS_META: Record<BookingStatus, StatusMeta> = {
  confirmed: {
    label: "Confirmed",
    variant: "default",
    color: "#3A86FF",
    chip: "border-brand/30 bg-brand/12 text-brand-soft hover:bg-brand/20",
    dot: "bg-brand",
  },
  pending: {
    label: "Pending",
    variant: "warning",
    color: "#F59E0B",
    chip: "border-amber-500/30 bg-amber-500/12 text-amber-300 hover:bg-amber-500/20",
    dot: "bg-amber-400",
  },
  checked_in: {
    label: "Checked in",
    variant: "success",
    color: "#00C896",
    chip: "border-success/30 bg-success/12 text-success hover:bg-success/20",
    dot: "bg-success",
  },
  completed: {
    label: "Completed",
    variant: "secondary",
    color: "#6B7280",
    chip: "border-white/10 bg-white/[0.05] text-muted-foreground hover:bg-white/[0.08]",
    dot: "bg-white/40",
  },
  cancelled: {
    label: "Cancelled",
    variant: "danger",
    color: "#FF4D4F",
    chip: "border-danger/30 bg-danger/12 text-danger-soft line-through hover:bg-danger/20",
    dot: "bg-danger",
  },
  no_show: {
    label: "No-show",
    variant: "danger",
    color: "#B91C1C",
    chip: "border-danger/25 bg-danger/[0.08] text-danger-soft/80 hover:bg-danger/15",
    dot: "bg-danger/70",
  },
  waitlist: {
    label: "Waitlist",
    variant: "gold",
    color: "#C9A227",
    chip: "border-gold/30 bg-gold/12 text-gold-soft hover:bg-gold/20",
    dot: "bg-gold",
  },
};

export const ALL_STATUSES: BookingStatus[] = [
  "confirmed",
  "pending",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
  "waitlist",
];
