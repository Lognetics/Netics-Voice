"use client";

import {
  MessageCircle,
  Phone,
  Instagram,
  Send,
  Mail,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import type { Channel } from "@/types";

export interface ChannelMeta {
  label: string;
  icon: LucideIcon;
  /** Accent color used for icon chips + rails. */
  color: string;
  /** Tailwind classes for a soft chip background/foreground. */
  chip: string;
}

/**
 * Presentation metadata for every omnichannel surface. Central so the inbox
 * rail, conversation list, thread header, and the conversations table all
 * render channels identically.
 */
export const CHANNEL_META: Record<Channel, ChannelMeta> = {
  phone: {
    label: "Phone",
    icon: Phone,
    color: "#3A86FF",
    chip: "bg-brand/12 text-brand-soft",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    color: "#00C896",
    chip: "bg-success/12 text-success",
  },
  instagram: {
    label: "Instagram",
    icon: Instagram,
    color: "#FF4D4F",
    chip: "bg-danger/12 text-danger-soft",
  },
  messenger: {
    label: "Messenger",
    icon: MessageSquare,
    color: "#6BA5FF",
    chip: "bg-brand/12 text-brand-soft",
  },
  telegram: {
    label: "Telegram",
    icon: Send,
    color: "#6BA5FF",
    chip: "bg-brand/12 text-brand-soft",
  },
  webchat: {
    label: "Web Chat",
    icon: MessageSquare,
    color: "#C9A227",
    chip: "bg-gold/12 text-gold-soft",
  },
  sms: {
    label: "SMS",
    icon: MessageSquare,
    color: "#6BA5FF",
    chip: "bg-brand/12 text-brand-soft",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "#C9A227",
    chip: "bg-gold/12 text-gold-soft",
  },
};

/** The channels that actually appear in the mock inbox (phone excluded). */
export const INBOX_CHANNELS: Channel[] = [
  "whatsapp",
  "instagram",
  "messenger",
  "webchat",
  "sms",
];

const statusBadge: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" }
> = {
  open: { label: "Open", variant: "default" },
  pending: { label: "Pending", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
  escalated: { label: "Escalated", variant: "danger" },
};

export function statusMeta(status: string) {
  return statusBadge[status] ?? { label: status, variant: "secondary" as const };
}

/** Small colored dot mapped to sentiment - used for compact list rows. */
export function sentimentDotColor(sentiment: string): string {
  switch (sentiment) {
    case "positive":
      return "#00C896";
    case "negative":
      return "#FF4D4F";
    case "frustrated":
      return "#F59E0B";
    default:
      return "#5b6478";
  }
}
