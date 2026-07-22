"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart3,
  Download,
  DollarSign,
  PhoneCall,
  CalendarCheck,
  ShoppingCart,
  Bot,
  Timer,
  Smile,
  Sparkles,
  TrendingUp,
  Repeat,
  Target,
  Gauge,
  Users,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaTrend, BarSeries, LineTrend, Donut } from "@/components/shared/charts";
import { SentimentBadge } from "@/components/shared/indicators";
import {
  timeseries30d,
  hourlyCallVolume,
  channelDistribution,
  topIntents,
  topProducts,
  branches,
  calls,
} from "@/lib/mock/db";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { ActivityHeatmap } from "./_components/activity-heatmap";
import { ConversionFunnel } from "./_components/conversion-funnel";
import { BranchComparison } from "./_components/branch-comparison";

/* --------------------------- Derived aggregates ---------------------------- */

const sum = (key: keyof (typeof timeseries30d)[number]) =>
  timeseries30d.reduce((s, p) => s + Number(p[key]), 0);

const avg = (key: keyof (typeof timeseries30d)[number]) =>
  sum(key) / timeseries30d.length;

const trendOf = (key: keyof (typeof timeseries30d)[number], scale = 1) =>
  timeseries30d.slice(-14).map((p) => Number(p[key]) * scale);

const totalRevenue = sum("revenue");
const totalCalls = sum("calls");
const totalOrders = sum("orders");
const totalBookings = sum("bookings");
const avgResolution = avg("resolution");
const avgCsat = avg("csat");
const avgConfidence = avg("aiConfidence");

/* Conversion funnel (derived from call volume, seeded-consistent ratios). */
const funnelStages = [
  { label: "Calls Received", value: totalCalls, color: "#3A86FF" },
  { label: "Engaged", value: Math.round(totalCalls * 0.82), color: "#6BA5FF" },
  { label: "Qualified", value: Math.round(totalCalls * 0.58), color: "#C9A227" },
  { label: "Converted", value: Math.round(totalCalls * 0.34), color: "#00C896" },
  { label: "Repeat", value: Math.round(totalCalls * 0.19), color: "#00A97D" },
];

/* Sentiment breakdown from the calls dataset. */
const sentimentBreakdown = (() => {
  const counts = { positive: 0, neutral: 0, negative: 0, frustrated: 0 } as Record<
    string,
    number
  >;
  for (const c of calls) counts[c.sentiment] = (counts[c.sentiment] ?? 0) + 1;
  const total = calls.length || 1;
  return (["positive", "neutral", "negative", "frustrated"] as const).map((k) => ({
    sentiment: k,
    count: counts[k],
    pct: Math.round((counts[k] / total) * 100),
  }));
})();

/* Retention cohort-style mini grid (weeks × retention %). */
const cohorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => ({
  month,
  size: 1200 - i * 60,
  weeks: Array.from({ length: 6 }, (_, w) => {
    const base = 100 - w * (11 + (i % 3) * 1.5) - (i % 2) * 3;
    return Math.max(0, Math.round(base));
  }),
}));

interface Kpi {
  label: string;
  value: number;
  icon: LucideIcon;
  delta?: number;
  trend?: number[];
  prefix?: string;
  suffix?: string;
  decimals?: number;
  compact?: boolean;
  accent?: "brand" | "gold" | "success" | "danger";
}

function KpiStrip({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((k) => (
        <StatCard
          key={k.label}
          label={k.label}
          value={k.value}
          icon={k.icon}
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
  );
}

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  };
}

const DATE_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
];

/* ------------------------------- Overview tab ------------------------------ */

function OverviewTab() {
  return (
    <div className="space-y-6">
      <KpiStrip
        items={[
          { label: "Total Revenue", value: totalRevenue, icon: DollarSign, delta: 0.086, trend: trendOf("revenue"), prefix: "$", compact: true, accent: "gold" },
          { label: "Total Calls", value: totalCalls, icon: PhoneCall, delta: 0.124, trend: trendOf("calls"), accent: "brand" },
          { label: "Orders", value: totalOrders, icon: ShoppingCart, delta: 0.153, trend: trendOf("orders"), accent: "success" },
          { label: "Bookings", value: totalBookings, icon: CalendarCheck, delta: -0.022, trend: trendOf("bookings"), accent: "brand" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" {...fade(0.05)}>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue & operations trend</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revenue, calls, orders & bookings · last 30 days
                </p>
              </div>
              <Badge variant="success">
                <TrendingUp className="h-3 w-3" /> +8.6%
              </Badge>
            </CardHeader>
            <CardContent>
              <AreaTrend
                data={timeseries30d}
                xKey="date"
                height={300}
                series={[
                  { key: "revenue", color: "#C9A227", name: "Revenue" },
                  { key: "calls", color: "#3A86FF", name: "Calls" },
                  { key: "orders", color: "#00C896", name: "Orders" },
                  { key: "bookings", color: "#6BA5FF", name: "Bookings" },
                ]}
                formatter={(v, name) =>
                  name === "Revenue" ? formatCurrency(v, { compact: true }) : v.toLocaleString()
                }
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fade(0.1)}>
          <Card>
            <CardHeader>
              <CardTitle>Channel distribution</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Where customers reach you</p>
            </CardHeader>
            <CardContent>
              <Donut data={channelDistribution} centerValue="48%" centerLabel="Phone" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {channelDistribution.map((c) => (
                  <div key={c.channel} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-muted-foreground">{c.channel}</span>
                    <span className="ml-auto font-medium tabular">{c.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fade(0.15)}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Activity heat map</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Call volume by day of week × hour of day
              </p>
            </div>
            <Badge variant="gold">
              <Sparkles className="h-3 w-3" /> Peak: Sat 7–9pm
            </Badge>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------------ Calls & AI tab ----------------------------- */

function CallsAiTab() {
  return (
    <div className="space-y-6">
      <KpiStrip
        items={[
          { label: "AI Resolution Rate", value: avgResolution * 100, icon: Bot, delta: 0.031, trend: trendOf("resolution", 100), suffix: "%", decimals: 1, accent: "success" },
          { label: "AI Confidence", value: avgConfidence * 100, icon: Gauge, delta: 0.014, trend: trendOf("aiConfidence", 100), suffix: "%", decimals: 1, accent: "brand" },
          { label: "Avg Handling Time", value: 3.4, icon: Timer, delta: -0.12, trend: [4.2, 4.0, 3.9, 3.8, 3.7, 3.6, 3.6, 3.5, 3.5, 3.4, 3.4, 3.3, 3.4, 3.4], suffix: "m", decimals: 1, accent: "gold" },
          { label: "Conversation Quality", value: 92.4, icon: Sparkles, delta: 0.022, trend: trendOf("aiConfidence", 101), suffix: "%", decimals: 1, accent: "success" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div {...fade(0.05)}>
          <Card>
            <CardHeader>
              <CardTitle>AI resolution & confidence</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Daily % over the last 30 days</p>
            </CardHeader>
            <CardContent>
              <LineTrend
                data={timeseries30d.map((p) => ({
                  date: p.date,
                  resolution: +(Number(p.resolution) * 100).toFixed(1),
                  aiConfidence: +(Number(p.aiConfidence) * 100).toFixed(1),
                }))}
                xKey="date"
                series={[
                  { key: "resolution", color: "#00C896", name: "Resolution" },
                  { key: "aiConfidence", color: "#3A86FF", name: "Confidence" },
                ]}
                formatter={(v) => `${v}%`}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fade(0.1)}>
          <Card>
            <CardHeader>
              <CardTitle>Calls by hour</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Peak call times across the day</p>
            </CardHeader>
            <CardContent>
              <BarSeries
                data={hourlyCallVolume.map((h) => ({ hour: `${h.hour}h`, calls: h.calls }))}
                xKey="hour"
                series={[{ key: "calls", color: "#3A86FF" }]}
                formatter={(v) => `${v} calls`}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fade(0.15)}>
        <Card>
          <CardHeader>
            <CardTitle>Top intents</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Most common requests & their AI success rate
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {topIntents.map((intent) => (
              <div key={intent.intent}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{intent.intent}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant={intent.success >= 0.9 ? "success" : "secondary"}>
                      {Math.round(intent.success * 100)}% success
                    </Badge>
                    <span className="w-16 text-right tabular text-muted-foreground">
                      {formatNumber(intent.count)}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand/60 to-brand"
                    style={{ width: `${(intent.count / topIntents[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* --------------------------- Revenue & Sales tab --------------------------- */

function RevenueTab() {
  return (
    <div className="space-y-6">
      <KpiStrip
        items={[
          { label: "Total Revenue", value: totalRevenue, icon: DollarSign, delta: 0.086, trend: trendOf("revenue"), prefix: "$", compact: true, accent: "gold" },
          { label: "Avg Order Value", value: 42.8, icon: ShoppingCart, delta: 0.041, trend: [38, 39, 40, 41, 40, 42, 41, 43, 42, 44, 43, 42, 43, 43], prefix: "$", decimals: 1, accent: "success" },
          { label: "Conversion Rate", value: 34.2, icon: Target, delta: 0.05, trend: trendOf("resolution", 40), suffix: "%", decimals: 1, accent: "brand" },
          { label: "AI-Attributed Rev.", value: totalRevenue * 0.71, icon: Bot, delta: 0.093, trend: trendOf("revenue", 0.71), prefix: "$", compact: true, accent: "gold" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <motion.div className="lg:col-span-3" {...fade(0.05)}>
          <Card>
            <CardHeader>
              <CardTitle>Revenue trend</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Daily revenue · last 30 days</p>
            </CardHeader>
            <CardContent>
              <AreaTrend
                data={timeseries30d}
                xKey="date"
                height={280}
                series={[{ key: "revenue", color: "#C9A227", name: "Revenue" }]}
                formatter={(v) => formatCurrency(v, { compact: true })}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-2" {...fade(0.1)}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Conversion funnel</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Call → repeat customer</p>
            </CardHeader>
            <CardContent>
              <ConversionFunnel stages={funnelStages} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fade(0.15)}>
        <Card>
          <CardHeader>
            <CardTitle>Top products by units sold</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Best sellers this period</p>
          </CardHeader>
          <CardContent>
            <BarSeries
              data={topProducts.map((p) => ({
                name: p.name.length > 14 ? `${p.name.slice(0, 12)}…` : p.name,
                unitsSold: p.unitsSold,
              }))}
              xKey="name"
              series={[{ key: "unitsSold", color: "#00C896", name: "Units sold" }]}
              formatter={(v) => `${formatNumber(v)} units`}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------------ Customers tab ------------------------------ */

function CustomersTab() {
  const cohortColor = (v: number) => {
    const t = v / 100;
    return `rgba(0,200,150,${(0.08 + t * 0.85).toFixed(3)})`;
  };
  return (
    <div className="space-y-6">
      <KpiStrip
        items={[
          { label: "CSAT Score", value: avgCsat, icon: Smile, delta: 0.02, trend: trendOf("csat"), suffix: "/5", decimals: 2, accent: "brand" },
          { label: "Retention Rate", value: 62.8, icon: Repeat, delta: 0.03, trend: trendOf("csat", 14), suffix: "%", decimals: 1, accent: "gold" },
          { label: "New Customers", value: 486, icon: Users, delta: 0.061, trend: [30, 34, 32, 38, 40, 42, 45, 44, 48, 46, 50, 49, 52, 51], accent: "success" },
          { label: "Repeat Rate", value: 47.5, icon: Target, delta: 0.028, trend: trendOf("resolution", 55), suffix: "%", decimals: 1, accent: "brand" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" {...fade(0.05)}>
          <Card>
            <CardHeader>
              <CardTitle>CSAT trend</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Customer satisfaction · last 30 days
              </p>
            </CardHeader>
            <CardContent>
              <AreaTrend
                data={timeseries30d}
                xKey="date"
                height={260}
                series={[{ key: "csat", color: "#3A86FF", name: "CSAT" }]}
                formatter={(v) => `${v.toFixed(2)}/5`}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fade(0.1)}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Sentiment breakdown</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Across all conversations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {sentimentBreakdown.map((s) => (
                <div key={s.sentiment}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <SentimentBadge sentiment={s.sentiment as never} />
                    <span className="tabular text-sm text-muted-foreground">
                      {s.pct}% · {s.count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        s.sentiment === "positive" && "bg-success",
                        s.sentiment === "neutral" && "bg-white/30",
                        s.sentiment === "negative" && "bg-danger",
                        s.sentiment === "frustrated" && "bg-amber-400"
                      )}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fade(0.15)}>
        <Card>
          <CardHeader>
            <CardTitle>Retention cohorts</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              % of customers retained by weeks since acquisition
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-1 text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left font-medium">Cohort</th>
                  <th className="text-right font-medium">Size</th>
                  {["W0", "W1", "W2", "W3", "W4", "W5"].map((w) => (
                    <th key={w} className="text-center font-medium">
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.month}>
                    <td className="py-1 pr-2 font-medium">{c.month}</td>
                    <td className="py-1 pr-2 text-right tabular text-muted-foreground">
                      {formatNumber(c.size)}
                    </td>
                    {c.weeks.map((v, i) => (
                      <td key={i} className="p-0">
                        <div
                          className="grid h-9 place-items-center rounded-md text-xs font-medium tabular ring-1 ring-white/[0.04]"
                          style={{ background: cohortColor(v) }}
                          title={`${c.month} · W${i} · ${v}%`}
                        >
                          {v}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------------- Branches tab ------------------------------ */

function BranchesTab() {
  const totalBranchRev = branches.reduce((s, b) => s + b.monthlyRevenue, 0);
  const totalStaff = branches.reduce((s, b) => s + b.staffCount, 0);
  const avgRating = branches.reduce((s, b) => s + b.rating, 0) / branches.length;
  const totalCallsToday = branches.reduce((s, b) => s + b.callsToday, 0);

  return (
    <div className="space-y-6">
      <KpiStrip
        items={[
          { label: "Network Revenue", value: totalBranchRev, icon: DollarSign, delta: 0.074, prefix: "$", compact: true, accent: "gold" },
          { label: "Calls Today", value: totalCallsToday, icon: PhoneCall, delta: 0.11, accent: "brand" },
          { label: "Total Staff", value: totalStaff, icon: Users, delta: 0.015, accent: "success" },
          { label: "Avg Rating", value: avgRating, icon: Smile, delta: 0.008, suffix: "/5", decimals: 2, accent: "brand" },
        ]}
      />

      <motion.div {...fade(0.05)}>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by branch</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Monthly revenue comparison</p>
          </CardHeader>
          <CardContent>
            <BarSeries
              data={branches.map((b) => ({
                name: b.city,
                monthlyRevenue: b.monthlyRevenue,
              }))}
              xKey="name"
              series={[{ key: "monthlyRevenue", color: "#C9A227", name: "Monthly revenue" }]}
              formatter={(v) => formatCurrency(v, { compact: true })}
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fade(0.1)}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Branch comparison</CardTitle>
            </div>
            <Badge variant="secondary">{branches.length} locations</Badge>
          </CardHeader>
          <CardContent>
            <BranchComparison />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* --------------------------------- Page ------------------------------------ */

export default function AnalyticsPage() {
  const [range, setRange] = React.useState("30d");

  const handleExport = () => {
    const label = DATE_RANGES.find((r) => r.value === range)?.label ?? range;
    toast.success(`Exporting analytics report (${label})`, {
      description: "Your CSV export will be emailed when ready.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Business intelligence across calls, revenue, customers & branches."
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="gold" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calls">Calls & AI</TabsTrigger>
          <TabsTrigger value="revenue">Revenue & Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="calls">
          <CallsAiTab />
        </TabsContent>
        <TabsContent value="revenue">
          <RevenueTab />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersTab />
        </TabsContent>
        <TabsContent value="branches">
          <BranchesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
