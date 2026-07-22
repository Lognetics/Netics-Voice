"use client";

import * as React from "react";
import { Inbox as InboxIcon, ArrowLeft, LayoutGrid } from "lucide-react";
import type { Channel, Conversation } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LiveDot } from "@/components/shared/indicators";
import { cn } from "@/lib/utils";
import { conversations as seedConversations, customers } from "@/lib/mock";
import {
  CHANNEL_META,
  INBOX_CHANNELS,
} from "./_components/channel-meta";
import { ConversationList } from "./_components/conversation-list";
import { ConversationThread } from "./_components/conversation-thread";
import { CustomerPanel } from "./_components/customer-panel";

const STATUS_TABS = ["all", "open", "pending", "resolved", "escalated"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function InboxPage() {
  // Local copy so status mutations (resolve/escalate) reflect instantly.
  const [items, setItems] = React.useState<Conversation[]>(() => seedConversations);
  const [channel, setChannel] = React.useState<Channel | "all">("all");
  const [status, setStatus] = React.useState<StatusTab>("all");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(
    () => seedConversations[0]?.id ?? null
  );
  // Mobile: show the thread pane instead of the list when a chat is open.
  const [mobileThread, setMobileThread] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((c) => (channel === "all" ? true : c.channel === channel))
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter(
        (c) =>
          !q ||
          c.customerName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      )
      .slice()
      .sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
  }, [items, channel, status, search]);

  const selected = React.useMemo(
    () => items.find((c) => c.id === selectedId) ?? null,
    [items, selectedId]
  );

  const selectedCustomer = React.useMemo(
    () =>
      selected
        ? customers.find(
            (cu) => cu.id === selected.customerId || cu.name === selected.customerName
          )
        : undefined,
    [selected]
  );

  // KPI strip metrics derived from the full conversation set.
  const kpis = React.useMemo(() => {
    const open = items.filter((c) => c.status === "open").length;
    const unread = items.reduce((s, c) => s + c.unread, 0);
    const escalated = items.filter((c) => c.status === "escalated").length;
    const aiHandled = items.filter((c) => c.aiHandled).length;
    const aiPct = items.length ? Math.round((aiHandled / items.length) * 100) : 0;
    return { open, unread, escalated, aiPct };
  }, [items]);

  const channelCounts = React.useMemo(() => {
    const map = new Map<Channel | "all", number>();
    map.set("all", items.length);
    for (const c of items) map.set(c.channel, (map.get(c.channel) ?? 0) + 1);
    return map;
  }, [items]);

  const onSelect = (id: string) => {
    setSelectedId(id);
    setMobileThread(true);
    // Reading a conversation clears its unread count.
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const onStatusChange = (next: Conversation["status"]) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, status: next } : c))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Omnichannel Inbox"
        description="Every customer conversation — phone, chat, and social — in one unified thread."
        icon={<InboxIcon className="h-5 w-5" />}
        actions={
          <Badge variant="secondary" className="gap-1.5">
            <LiveDot /> Live
          </Badge>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiTile label="Open" value={kpis.open} accent="brand" />
        <KpiTile label="Unread" value={kpis.unread} accent="gold" />
        <KpiTile label="Avg response" value="1m 12s" accent="brand" />
        <KpiTile label="AI-handled" value={`${kpis.aiPct}%`} accent="success" />
        <KpiTile
          label="Escalated"
          value={kpis.escalated}
          accent="danger"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* 3-pane workspace */}
      <TooltipProvider delayDuration={200}>
        <Card className="grid h-[calc(100vh-19rem)] min-h-[560px] grid-cols-1 overflow-hidden p-0 lg:grid-cols-[auto_20rem_1fr_18rem]">
          {/* Channel rail (hidden on mobile) */}
          <div className="hidden flex-col items-center gap-1.5 border-r border-white/[0.06] bg-white/[0.015] py-3 lg:flex">
            <RailButton
              label="All channels"
              active={channel === "all"}
              count={channelCounts.get("all") ?? 0}
              onClick={() => setChannel("all")}
            >
              <LayoutGrid className="h-4 w-4" />
            </RailButton>
            {INBOX_CHANNELS.map((ch) => {
              const meta = CHANNEL_META[ch];
              const Icon = meta.icon;
              return (
                <RailButton
                  key={ch}
                  label={meta.label}
                  active={channel === ch}
                  count={channelCounts.get(ch) ?? 0}
                  color={meta.color}
                  onClick={() => setChannel(ch)}
                >
                  <Icon className="h-4 w-4" />
                </RailButton>
              );
            })}
          </div>

          {/* List pane */}
          <div
            className={cn(
              "min-h-0 border-r border-white/[0.06]",
              mobileThread ? "hidden lg:block" : "block"
            )}
          >
            <ConversationList
              conversations={filtered}
              selectedId={selectedId}
              onSelect={onSelect}
              search={search}
              onSearch={setSearch}
              status={status}
              onStatus={setStatus}
            />
          </div>

          {/* Thread pane */}
          <div
            className={cn(
              "min-h-0 border-r border-white/[0.06]",
              mobileThread ? "block" : "hidden lg:block"
            )}
          >
            {/* Mobile back button */}
            <div className="border-b border-white/[0.06] p-2 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileThread(false)}
              >
                <ArrowLeft className="h-4 w-4" /> All conversations
              </Button>
            </div>
            <div className="h-[calc(100%-3rem)] lg:h-full">
              <ConversationThread conversation={selected} />
            </div>
          </div>

          {/* Context pane (hidden below xl) */}
          <div className="hidden min-h-0 xl:block">
            <CustomerPanel
              conversation={selected}
              customer={selectedCustomer}
              onStatusChange={onStatusChange}
            />
          </div>
        </Card>
      </TooltipProvider>
    </div>
  );
}

function KpiTile({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: string | number;
  accent: "brand" | "gold" | "success" | "danger";
  className?: string;
}) {
  const accentText: Record<string, string> = {
    brand: "text-brand",
    gold: "text-gold-soft",
    success: "text-success",
    danger: "text-danger",
  };
  return (
    <Card className={cn("p-4", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular", accentText[accent])}>
        {value}
      </p>
    </Card>
  );
}

function RailButton({
  label,
  active,
  count,
  color,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  count: number;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "relative grid h-11 w-11 place-items-center rounded-xl border transition-colors",
            active
              ? "border-brand/40 bg-brand/[0.12] text-brand-soft"
              : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-foreground"
          )}
          style={active && color ? { color } : undefined}
        >
          {children}
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-white/10 px-1 text-[9px] font-medium text-foreground">
              {count}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {label} · {count}
      </TooltipContent>
    </Tooltip>
  );
}
