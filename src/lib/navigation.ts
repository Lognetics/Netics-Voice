import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  PhoneCall,
  MessageSquareText,
  Users,
  ShoppingCart,
  CalendarCheck,
  Building2,
  UserCog,
  BrainCircuit,
  AudioLines,
  Inbox,
  BarChart3,
  BookOpen,
  Bell,
  Plug,
  CreditCard,
  KeyRound,
  Settings,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  live?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Live Calls", href: "/calls", icon: PhoneCall, live: true },
      { label: "Conversations", href: "/conversations", icon: MessageSquareText },
      { label: "Omnichannel Inbox", href: "/inbox", icon: Inbox, badge: "12" },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Orders", href: "/orders", icon: ShoppingCart },
      { label: "Bookings", href: "/bookings", icon: CalendarCheck },
      { label: "Branches", href: "/branches", icon: Building2 },
      { label: "Employees", href: "/employees", icon: UserCog },
    ],
  },
  {
    title: "AI",
    items: [
      { label: "AI Studio", href: "/ai-studio", icon: BrainCircuit },
      { label: "Voice Settings", href: "/voice", icon: AudioLines },
      { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
    ],
  },
  {
    title: "Insights",
    items: [{ label: "Analytics", href: "/analytics", icon: BarChart3 }],
  },
  {
    title: "Platform",
    items: [
      { label: "Integrations", href: "/integrations", icon: Plug },
      { label: "Billing", href: "/billing", icon: CreditCard },
      { label: "API & Webhooks", href: "/api", icon: KeyRound },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export { Sparkles };
