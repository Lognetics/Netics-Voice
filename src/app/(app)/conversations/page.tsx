"use client";

import * as React from "react";
import {
  MessagesSquare,
  Search,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Inbox as InboxIcon,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { Channel, Conversation, Sentiment } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaTrend, Donut } from "@/components/shared/charts";
import { conversations as seedConversations } from "@/lib/mock";
import { seededRandom } from "@/lib/utils";
import {
  CHANNEL_META,
  INBOX_CHANNELS,
} from "../inbox/_components/channel-meta";
import { ConversationsTable } from "./_components/conversations-table";
import { ThreadDialog } from "./_components/thread-dialog";

const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative", "frustrated"];
const SENTIMENT_COLOR: Record<Sentiment, string> = {
  positive: "#00C896",
  neutral: "#6BA5FF",
  negative: "#FF4D4F",
  frustrated: "#F59E0B",
};

export default function ConversationsPage() {
  const [channel, setChannel] = React.useState<Channel | "all">("all");
  const [status, setStatus] = React.useState<string>("all");
  const [sentiment, setSentiment] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [active, setActive] = React.useState<Conversation | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return seedConversations
      .filter((c) => (channel === "all" ? true : c.channel === channel))
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter((c) => (sentiment === "all" ? true : c.sentiment === sentiment))
      .filter(
        (c) =>
          !q ||
          c.customerName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q) ||
          (c.assignedTo?.toLowerCase().includes(q) ?? false)
      )
      .slice()
      .sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
  }, [channel, status, sentiment, search]);

  // Aggregate KPIs over all conversations.
  const stats = React.useMemo(() => {
    const total = seedConversations.length;
    const resolved = seedConversations.filter((c) => c.status === "resolved").length;
    const escalated = seedConversations.filter((c) => c.status === "escalated").length;
    const aiHandled = seedConversations.filter((c) => c.aiHandled).length;
    return {
      total,
      resolved,
      escalated,
      resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
      aiPct: total ? Math.round((aiHandled / total) * 100) : 0,
    };
  }, []);

  // Channel mix donut (from full dataset).
  const channelMix = React.useMemo(() => {
    const counts = new Map<Channel, number>();
    for (const c of seedConversations)
      counts.set(c.channel, (counts.get(c.channel) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([ch, value]) => ({
        name: CHANNEL_META[ch].label,
        value,
        color: CHANNEL_META[ch].color,
      }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Sentiment breakdown (from full dataset).
  const sentimentMix = React.useMemo(() => {
    const counts = new Map<Sentiment, number>();
    for (const c of seedConversations)
      counts.set(c.sentiment, (counts.get(c.sentiment) ?? 0) + 1);
    return SENTIMENTS.map((s) => ({
      sentiment: s,
      value: counts.get(s) ?? 0,
      color: SENTIMENT_COLOR[s],
    }));
  }, []);

  // Seeded 14-day volume trend so server/client renders match.
  const volume = React.useMemo(() => {
    const rng = seededRandom("conversations-volume-14d");
    return Array.from({ length: 14 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (13 - i));
      const base = 18 + Math.round(Math.sin(i / 2) * 6);
      const inbound = base + Math.floor(rng() * 10);
      return {
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        inbound,
        resolved: Math.max(0, inbound - Math.floor(rng() * 6)),
      };
    });
  }, []);

  const openThread = (c: Conversation) => {
    setActive(c);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversations"
        description="Full history and intelligence across every channel your AI handles."
        icon={<MessagesSquare className="h-5 w-5" />}
        actions={
          <Button variant="outline" asChild>
            <Link href="/inbox">
              <InboxIcon className="h-4 w-4" /> Open inbox
            </Link>
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total conversations"
          value={stats.total}
          icon={MessagesSquare}
          accent="brand"
          delta={0.086}
        />
        <StatCard
          label="AI-handled"
          value={stats.aiPct}
          suffix="%"
          icon={Bot}
          accent="success"
          delta={0.042}
        />
        <StatCard
          label="Resolution rate"
          value={stats.resolutionRate}
          suffix="%"
          icon={CheckCircle2}
          accent="gold"
          delta={0.031}
        />
        <StatCard
          label="Escalated"
          value={stats.escalated}
          icon={AlertTriangle}
          accent="danger"
          delta={-0.018}
        />
      </div>

      {/* Analytics row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Conversation volume</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Inbound vs. resolved · last 14 days
              </p>
            </div>
            <Badge variant="success">
              <TrendingUp className="h-3 w-3" /> +8.6%
            </Badge>
          </CardHeader>
          <CardContent>
            <AreaTrend
              data={volume}
              xKey="date"
              series={[
                { key: "inbound", color: "#3A86FF", name: "Inbound" },
                { key: "resolved", color: "#00C896", name: "Resolved" },
              ]}
              formatter={(v) => v.toLocaleString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel mix</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Conversations by channel</p>
          </CardHeader>
          <CardContent>
            <Donut
              data={channelMix}
              centerValue={String(stats.total)}
              centerLabel="Total"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {channelMix.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: c.color }}
                  />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium tabular">{c.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment breakdown</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            How customers feel across all conversations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sentimentMix.map((s) => {
              const pct = stats.total ? Math.round((s.value / stats.total) * 100) : 0;
              return (
                <div
                  key={s.sentiment}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm capitalize">{s.sentiment}</span>
                    <span className="text-sm font-semibold tabular">{s.value}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: s.color }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters + table */}
      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, message, or agent…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={channel} onValueChange={(v) => setChannel(v as Channel | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                {INBOX_CHANNELS.map((ch) => (
                  <SelectItem key={ch} value={ch}>
                    {CHANNEL_META[ch].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentiment} onValueChange={setSentiment}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sentiment</SelectItem>
                {SENTIMENTS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span>
            {filtered.length} of {seedConversations.length} conversations
          </span>
          <span>Click a row to view the full thread</span>
        </div>

        <ConversationsTable conversations={filtered} onOpen={openThread} />
      </Card>

      <ThreadDialog
        conversation={active}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
