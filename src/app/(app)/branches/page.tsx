"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Building2, DoorOpen, Users, DollarSign, Star, TrendingUp,
  BarChart3, Globe2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { BarSeries, Donut } from "@/components/shared/charts";
import { ConfidenceMeter, LiveDot } from "@/components/shared/indicators";
import { branches as seedBranches } from "@/lib/mock/db";
import { currentOrg } from "@/lib/mock/db";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import type { Branch } from "@/types";
import { BranchCard } from "./_components/branch-card";
import { BranchMap } from "./_components/branch-map";
import { AddBranchDialog, type NewBranchInput } from "./_components/add-branch-dialog";
import { BranchDetailDialog } from "./_components/branch-detail-dialog";
import { STATUS_META, aiResolution } from "./_components/branch-utils";

const REGION_COLORS = ["#3A86FF", "#00C896", "#C9A227", "#FF4D4F", "#6BA5FF", "#E0C158"];

export default function BranchesPage() {
  const [branches, setBranches] = React.useState<Branch[]>(seedBranches);
  const [selected, setSelected] = React.useState<Branch | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const openDetail = React.useCallback((b: Branch) => {
    setSelected(b);
    setDetailOpen(true);
  }, []);

  const handleAdd = (input: NewBranchInput) => {
    const nb: Branch = {
      id: `br_local_${Date.now()}`,
      orgId: currentOrg.id,
      name: input.name || `${currentOrg.name} - ${input.city}`,
      city: input.city,
      country: "USA",
      address: "New location",
      phone: input.phone || "+1 (212) 555-0100",
      timezone: currentOrg.timezone,
      status: "open",
      managerName: input.managerName || "Unassigned",
      staffCount: 8,
      monthlyRevenue: 80_000,
      callsToday: 0,
      rating: 4.5,
      aiPersonality: currentOrg.aiPersonality,
      lat: 40.71,
      lng: -74.0,
    };
    setBranches((prev) => [nb, ...prev]);
  };

  /* ---- KPIs ---- */
  const kpis = React.useMemo(() => {
    const openNow = branches.filter((b) => b.status !== "closed").length;
    const staff = branches.reduce((s, b) => s + b.staffCount, 0);
    const revenue = branches.reduce((s, b) => s + b.monthlyRevenue, 0);
    const rating = branches.length
      ? branches.reduce((s, b) => s + b.rating, 0) / branches.length
      : 0;
    return { total: branches.length, openNow, staff, revenue, rating };
  }, [branches]);

  /* ---- comparison chart data ---- */
  const compareData = React.useMemo(
    () =>
      branches.map((b) => ({
        city: b.city,
        revenue: Math.round(b.monthlyRevenue / 1000),
        calls: b.callsToday,
      })),
    [branches]
  );

  /* ---- region donut ---- */
  const regionData = React.useMemo(() => {
    const byCountry = new Map<string, number>();
    branches.forEach((b) =>
      byCountry.set(b.country, (byCountry.get(b.country) ?? 0) + b.monthlyRevenue)
    );
    const total = [...byCountry.values()].reduce((a, b) => a + b, 0) || 1;
    return [...byCountry.entries()].map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: REGION_COLORS[i % REGION_COLORS.length],
    }));
  }, [branches]);

  const topRegion = regionData.slice().sort((a, b) => b.value - a.value)[0];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Building2 className="h-5 w-5" />}
        title="Branch Management"
        description="Monitor performance, compare locations, and grow your footprint."
        actions={<AddBranchDialog onAdd={handleAdd} />}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total branches" value={kpis.total} icon={Building2} accent="brand" />
        <StatCard label="Open now" value={kpis.openNow} icon={DoorOpen} accent="success" />
        <StatCard label="Total staff" value={kpis.staff} icon={Users} accent="brand" />
        <StatCard
          label="Monthly revenue"
          value={kpis.revenue}
          icon={DollarSign}
          prefix="$"
          compact
          accent="gold"
        />
        <StatCard
          label="Avg rating"
          value={kpis.rating}
          icon={Star}
          decimals={1}
          accent="gold"
        />
      </div>

      {/* Branch cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {branches.map((b, i) => (
          <BranchCard key={b.id} branch={b} index={i} onView={openDetail} />
        ))}
      </div>

      {/* Performance comparison */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand" /> Performance comparison
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Benchmark every location side by side.
            </p>
          </div>
          <Badge variant="success">
            <TrendingUp className="h-3 w-3" /> {branches.length} branches
          </Badge>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="calls">Calls</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="revenue" className="pt-4">
              <BarSeries
                data={compareData}
                xKey="city"
                series={[{ key: "revenue", color: "#C9A227", name: "Revenue ($k)" }]}
                formatter={(v) => `$${formatNumber(v)}k`}
                height={280}
              />
            </TabsContent>
            <TabsContent value="calls" className="pt-4">
              <BarSeries
                data={compareData}
                xKey="city"
                series={[{ key: "calls", color: "#3A86FF", name: "Calls today" }]}
                height={280}
              />
            </TabsContent>
            <TabsContent value="map" className="pt-4">
              <BranchMap branches={branches} onSelect={openDetail} />
            </TabsContent>
          </Tabs>

          {/* Comparison table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Branch</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Revenue</th>
                  <th className="px-3 py-2 text-right font-medium">Calls</th>
                  <th className="px-3 py-2 text-right font-medium">Staff</th>
                  <th className="px-3 py-2 text-right font-medium">Rating</th>
                  <th className="px-3 py-2 font-medium">AI resolution</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => {
                  const meta = STATUS_META[b.status];
                  return (
                    <tr
                      key={b.id}
                      onClick={() => openDetail(b)}
                      className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <LiveDot color={meta.dot} />
                          <span className="font-medium">{b.city}</span>
                          <span className="text-xs text-muted-foreground">
                            {b.country}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={meta.badge}>{meta.label}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular text-gold-soft">
                        {formatCurrency(b.monthlyRevenue, { compact: true })}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular">{b.callsToday}</td>
                      <td className="px-3 py-2.5 text-right tabular">{b.staffCount}</td>
                      <td className="px-3 py-2.5 text-right tabular">
                        {b.rating.toFixed(1)}
                      </td>
                      <td className="w-40 px-3 py-2.5">
                        <ConfidenceMeter value={aiResolution(b)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Regional analytics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-success" /> Revenue by region
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Share of combined monthly revenue
            </p>
          </CardHeader>
          <CardContent>
            <Donut
              data={regionData}
              centerValue={topRegion ? `${topRegion.value}%` : "-"}
              centerLabel={topRegion?.name}
            />
            <div className="mt-4 space-y-2">
              {regionData.map((r) => (
                <div key={r.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: r.color }}
                  />
                  <span className="text-muted-foreground">{r.name}</span>
                  <span className="ml-auto font-medium">{r.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Network highlights</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Standout locations across your footprint
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Highlight
              label="Top earner"
              branch={[...branches].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)[0]}
              metric={(b) => formatCurrency(b.monthlyRevenue, { compact: true })}
              accent="text-gold-soft"
            />
            <Highlight
              label="Busiest today"
              branch={[...branches].sort((a, b) => b.callsToday - a.callsToday)[0]}
              metric={(b) => `${b.callsToday} calls`}
              accent="text-success"
            />
            <Highlight
              label="Highest rated"
              branch={[...branches].sort((a, b) => b.rating - a.rating)[0]}
              metric={(b) => `★ ${b.rating.toFixed(1)}`}
              accent="text-gold-soft"
            />
            <Highlight
              label="Largest team"
              branch={[...branches].sort((a, b) => b.staffCount - a.staffCount)[0]}
              metric={(b) => `${b.staffCount} staff`}
              accent="text-brand"
            />
          </CardContent>
        </Card>
      </div>

      <BranchDetailDialog
        branch={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

function Highlight({
  label,
  branch,
  metric,
  accent,
}: {
  label: string;
  branch: Branch | undefined;
  metric: (b: Branch) => string;
  accent: string;
}) {
  if (!branch) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
    >
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate font-medium">{branch.city}</p>
      </div>
      <span className={cn("shrink-0 text-sm font-semibold tabular", accent)}>
        {metric(branch)}
      </span>
    </motion.div>
  );
}
