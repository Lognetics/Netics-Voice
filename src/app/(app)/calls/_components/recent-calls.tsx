"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Bot, User, ChevronRight, PhoneOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SentimentBadge } from "@/components/shared/indicators";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDuration, formatCurrency, timeAgo, avatarUrl, initials, cn } from "@/lib/utils";
import type { Call, CallStatus } from "@/types";

type Filter = "all" | "completed" | "escalated" | "missed" | "voicemail";

const statusBadge: Record<CallStatus, { variant: React.ComponentProps<typeof Badge>["variant"]; label: string }> = {
  live: { variant: "success", label: "Live" },
  completed: { variant: "success", label: "Completed" },
  escalated: { variant: "warning", label: "Escalated" },
  missed: { variant: "danger", label: "Missed" },
  voicemail: { variant: "secondary", label: "Voicemail" },
};

export function RecentCalls({ calls }: { calls: Call[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return calls
      .filter((c) => (filter === "all" ? true : c.status === filter))
      .filter((c) =>
        !q
          ? true
          : c.customerName.toLowerCase().includes(q) ||
            c.intent.toLowerCase().includes(q) ||
            c.customerPhone.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [calls, filter, query]);

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: calls.length };
    for (const call of calls) c[call.status] = (c[call.status] ?? 0) + 1;
    return c;
  }, [calls]);

  return (
    <Card>
      <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Recent calls</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts.all.toLocaleString()} calls handled · click a row for the full transcript
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, intent, phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="flex-wrap">
            {(["all", "completed", "escalated", "missed", "voicemail"] as Filter[]).map((f) => (
              <TabsTrigger key={f} value={f} className="capitalize">
                {f}
                <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 text-[10px] tabular text-muted-foreground">
                  {counts[f] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <EmptyState
            icon={PhoneOff}
            title="No calls found"
            description="Try adjusting your search or switching filters."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/[0.05]">
            {/* Header row (desktop) */}
            <div className="hidden grid-cols-[1.6fr_1fr_1fr_0.7fr_0.7fr_0.7fr_auto] gap-3 border-b border-white/[0.05] bg-white/[0.015] px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:grid">
              <span>Customer</span>
              <span>Intent</span>
              <span>Sentiment</span>
              <span>Duration</span>
              <span>Handling</span>
              <span>Revenue</span>
              <span />
            </div>
            {filtered.map((c, i) => {
              const sb = statusBadge[c.status];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.015, 0.3) }}
                >
                  <Link
                    href={`/calls/${c.id}`}
                    className="grid grid-cols-1 items-center gap-3 border-b border-white/[0.04] px-4 py-3 text-sm transition-colors last:border-0 hover:bg-white/[0.025] md:grid-cols-[1.6fr_1fr_1fr_0.7fr_0.7fr_0.7fr_auto]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={avatarUrl(c.customerName)} alt={c.customerName} />
                        <AvatarFallback>{initials(c.customerName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate font-medium">
                          {c.customerName}
                          <Badge variant={sb.variant} className="shrink-0">{sb.label}</Badge>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.customerPhone} · {timeAgo(c.startedAt)}
                        </p>
                      </div>
                    </div>
                    <span className="truncate text-muted-foreground">{c.intent}</span>
                    <span><SentimentBadge sentiment={c.sentiment} showEmoji={false} /></span>
                    <span className="tabular text-muted-foreground">
                      {c.status === "missed" ? "-" : formatDuration(c.durationSec)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        c.aiHandled ? "text-brand" : "text-gold-soft"
                      )}
                    >
                      {c.aiHandled ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      {c.aiHandled ? "AI" : "Human"}
                    </span>
                    <span className="tabular text-muted-foreground">
                      {c.revenue ? formatCurrency(c.revenue) : "-"}
                    </span>
                    <ChevronRight className="hidden h-4 w-4 text-muted-foreground md:block" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
