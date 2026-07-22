"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PhoneCall, DollarSign, Bot, Smile, ShoppingCart, CalendarCheck,
  PhoneMissed, Timer, ArrowRight, Sparkles, TrendingUp, Zap, Plus,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AreaTrend, BarSeries, Donut } from "@/components/shared/charts";
import { LiveDot, SentimentBadge, ConfidenceMeter } from "@/components/shared/indicators";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { dashboardKPIs, secondaryKPIs } from "@/lib/mock/kpis";
import {
  timeseries30d, hourlyCallVolume, channelDistribution, topIntents,
  topProducts, liveCalls, bookings, notifications, currentUser,
} from "@/lib/mock/db";
import { formatCurrency, timeAgo, initials } from "@/lib/utils";

const iconMap: Record<string, any> = {
  calls_today: PhoneCall, revenue_today: DollarSign, ai_resolution: Bot,
  csat: Smile, orders_today: ShoppingCart, bookings_today: CalendarCheck,
  missed_calls: PhoneMissed, avg_response: Timer,
};

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const upcoming = bookings
    .filter((b) => new Date(b.start) > new Date() && b.status === "confirmed")
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${currentUser.name.split(" ")[0]} 👋`}
        description="Here's what your AI employee has been up to today."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/analytics"><TrendingUp className="h-4 w-4" /> Analytics</Link>
            </Button>
            <Button asChild>
              <Link href="/ai-studio"><Sparkles className="h-4 w-4" /> AI Studio</Link>
            </Button>
          </>
        }
      />

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dashboardKPIs.map((k) => (
          <StatCard
            key={k.key}
            label={k.label}
            value={k.value}
            icon={iconMap[k.key] ?? Zap}
            delta={k.delta}
            trend={k.trend}
            prefix={k.prefix}
            suffix={k.suffix}
            decimals={k.decimals}
            compact={k.compact}
            accent={k.accent}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Operations overview</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Calls, orders & bookings · last 30 days</p>
            </div>
            <Badge variant="success"><TrendingUp className="h-3 w-3" /> +12.4%</Badge>
          </CardHeader>
          <CardContent>
            <AreaTrend
              data={timeseries30d}
              xKey="date"
              series={[
                { key: "calls", color: "#3A86FF", name: "Calls" },
                { key: "orders", color: "#00C896", name: "Orders" },
                { key: "bookings", color: "#C9A227", name: "Bookings" },
              ]}
              formatter={(v) => v.toLocaleString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel mix</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Where customers reach you</p>
          </CardHeader>
          <CardContent>
            <Donut data={channelDistribution} centerValue="48%" centerLabel="Phone" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {channelDistribution.map((c) => (
                <div key={c.channel} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-muted-foreground">{c.channel}</span>
                  <span className="ml-auto font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live calls + secondary */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Live calls */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <LiveDot />
              <CardTitle>Live calls</CardTitle>
              <Badge variant="secondary">{liveCalls.length} active</Badge>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calls">Open call center <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveCalls.slice(0, 3).map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials(c.customerName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{c.customerName}</p>
                    <Badge variant="default" className="shrink-0">{c.intent}</Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.customerPhone} · {c.language}
                  </p>
                </div>
                <VoiceWaveform active bars={16} className="hidden h-7 w-24 sm:flex" />
                <div className="hidden w-24 sm:block">
                  <ConfidenceMeter value={c.confidence} />
                </div>
                <SentimentBadge sentiment={c.sentiment} showEmoji={false} />
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Secondary KPI stack */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {secondaryKPIs.map((k) => (
            <Card key={k.key} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <Badge variant={k.delta >= 0 ? "success" : "danger"}>
                  {k.delta >= 0 ? "+" : ""}{(k.delta * 100).toFixed(1)}%
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-semibold tabular">
                <AnimatedCounter value={k.value} suffix={k.suffix} decimals={k.decimals} />
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Peak call times */}
        <Card>
          <CardHeader>
            <CardTitle>Peak call times</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Calls by hour of day</p>
          </CardHeader>
          <CardContent>
            <BarSeries
              data={hourlyCallVolume.map((h) => ({ hour: `${h.hour}h`, calls: h.calls }))}
              xKey="hour"
              series={[{ key: "calls", color: "#3A86FF" }]}
              height={200}
            />
          </CardContent>
        </Card>

        {/* Top intents */}
        <Card>
          <CardHeader>
            <CardTitle>Top intents</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Most common requests</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topIntents.map((intent) => (
              <div key={intent.intent}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{intent.intent}</span>
                  <span className="text-muted-foreground tabular">{intent.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(intent.count / topIntents[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming + activity */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming bookings</CardTitle>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/bookings"><Plus className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border border-white/[0.05] p-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold/12 text-gold-soft">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.service} · {b.resource}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(b.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {notifications.slice(0, 6).map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.02]">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-brand">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="truncate text-xs text-muted-foreground">{n.body}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
