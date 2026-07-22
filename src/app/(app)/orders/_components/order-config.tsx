"use client";

import {
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Truck,
  Home,
  XCircle,
  Bike,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus, Order } from "@/types";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

export interface StatusMeta {
  label: string;
  icon: LucideIcon;
  variant: BadgeVariant;
  /** hex accent for glow / dot */
  accent: string;
  /** column background tint */
  tint: string;
}

/** The pipeline columns (delivered/cancelled handled separately). */
export const PIPELINE: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "warning",
    accent: "#C9A227",
    tint: "from-amber-500/[0.08]",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "default",
    accent: "#3A86FF",
    tint: "from-brand/[0.08]",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    variant: "default",
    accent: "#6BA5FF",
    tint: "from-brand/[0.06]",
  },
  ready: {
    label: "Ready",
    icon: PackageCheck,
    variant: "gold",
    accent: "#E0C158",
    tint: "from-gold/[0.08]",
  },
  out_for_delivery: {
    label: "Out for delivery",
    icon: Truck,
    variant: "default",
    accent: "#3A86FF",
    tint: "from-brand/[0.08]",
  },
  delivered: {
    label: "Delivered",
    icon: Home,
    variant: "success",
    accent: "#00C896",
    tint: "from-success/[0.08]",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "danger",
    accent: "#FF4D4F",
    tint: "from-danger/[0.08]",
  },
};

export const PAYMENT_META: Record<
  PaymentStatus,
  { label: string; variant: BadgeVariant }
> = {
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Payment due", variant: "warning" },
  failed: { label: "Failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "secondary" },
};

export const TYPE_META: Record<
  Order["type"],
  { label: string; icon: LucideIcon; variant: BadgeVariant }
> = {
  delivery: { label: "Delivery", icon: Bike, variant: "default" },
  pickup: { label: "Pickup", icon: ShoppingBag, variant: "secondary" },
  dine_in: { label: "Dine-in", icon: UtensilsCrossed, variant: "gold" },
};

/** The next status in the pipeline, or null if terminal. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = PIPELINE.indexOf(status);
  if (i === -1 || i >= PIPELINE.length - 1) return null;
  return PIPELINE[i + 1];
}
