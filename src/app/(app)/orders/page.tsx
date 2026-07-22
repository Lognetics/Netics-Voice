"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  DollarSign,
  Bot,
  Receipt,
  Clock,
  LayoutGrid,
  Table2,
  Search,
  Eye,
  Sparkles,
  TrendingUp,
  Package,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { AreaTrend, BarSeries, Donut } from "@/components/shared/charts";
import {
  orders as seedOrders,
  products,
  timeseries30d,
  currentOrg,
  branches,
} from "@/lib/mock";
import { formatCurrency, formatNumber, timeAgo, initials, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import {
  PIPELINE,
  STATUS_META,
  PAYMENT_META,
  TYPE_META,
  nextStatus,
} from "./_components/order-config";
import { OrderCard } from "./_components/order-card";
import { OrderDetailDialog } from "./_components/order-detail-dialog";
import { NewOrderDialog } from "./_components/new-order-dialog";

/** "Today" relative to the fixed mock NOW (2026-07-21). */
const TODAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-07-21T14:30:00.000Z").getTime();

const STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  ...PIPELINE,
  "cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>(() => seedOrders);
  const [view, setView] = React.useState("board");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">(
    "all"
  );
  const [typeFilter, setTypeFilter] = React.useState<Order["type"] | "all">(
    "all"
  );
  const [active, setActive] = React.useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  /* ------------------------------ KPIs ------------------------------- */
  const kpis = React.useMemo(() => {
    const today = orders.filter((o) => NOW - +new Date(o.createdAt) < TODAY_MS);
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);
    const aiCount = orders.filter((o) => o.aiCreated).length;
    const aiPct = orders.length ? (aiCount / orders.length) * 100 : 0;
    const nonCancelled = orders.filter((o) => o.status !== "cancelled");
    const avg = nonCancelled.length
      ? nonCancelled.reduce((s, o) => s + o.total, 0) / nonCancelled.length
      : 0;
    const pending = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed"
    ).length;
    return {
      today: today.length,
      revenue,
      aiPct,
      avg,
      pending,
    };
  }, [orders]);

  /* --------------------------- Analytics ----------------------------- */
  const topProductsData = React.useMemo(() => {
    // Units sold derived from current orders, falling back to catalog figures.
    const sold = new Map<string, number>();
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      for (const it of o.items)
        sold.set(it.name, (sold.get(it.name) ?? 0) + it.quantity);
    }
    return products
      .map((p) => ({
        name: p.name.length > 14 ? p.name.slice(0, 13) + "…" : p.name,
        units: sold.get(p.name) ?? 0,
      }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 6);
  }, [orders]);

  const typeSplit = React.useMemo(() => {
    const counts: Record<Order["type"], number> = {
      delivery: 0,
      pickup: 0,
      dine_in: 0,
    };
    for (const o of orders)
      if (o.status !== "cancelled") counts[o.type] += 1;
    return [
      { name: "Delivery", value: counts.delivery, color: "#3A86FF" },
      { name: "Pickup", value: counts.pickup, color: "#00C896" },
      { name: "Dine-in", value: counts.dine_in, color: "#C9A227" },
    ];
  }, [orders]);

  const revenueByDay = React.useMemo(
    () =>
      timeseries30d.map((d) => ({
        date: d.date.slice(5),
        revenue: d.revenue as number,
        orders: d.orders as number,
      })),
    []
  );

  /* ------------------------- Board grouping -------------------------- */
  const board = React.useMemo(() => {
    const map = new Map<OrderStatus, Order[]>();
    for (const s of PIPELINE) map.set(s, []);
    for (const o of orders) {
      if (map.has(o.status)) map.get(o.status)!.push(o);
    }
    // Cap each column so the board stays performant/readable.
    for (const [k, v] of map) map.set(k, v.slice(0, 12));
    return map;
  }, [orders]);

  /* --------------------------- Table rows ---------------------------- */
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => {
        if (statusFilter !== "all" && o.status !== statusFilter) return false;
        if (typeFilter !== "all" && o.type !== typeFilter) return false;
        if (!q) return true;
        return (
          o.reference.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((it) => it.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 60);
  }, [orders, query, statusFilter, typeFilter]);

  /* ---------------------------- Actions ------------------------------ */
  const patch = React.useCallback((id: string, next: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...next } : o)));
    setActive((prev) => (prev && prev.id === id ? { ...prev, ...next } : prev));
  }, []);

  const advance = React.useCallback(
    (order: Order) => {
      const next = nextStatus(order.status);
      if (!next) return;
      patch(order.id, { status: next });
      toast.success(`${order.reference} → ${STATUS_META[next].label}`, {
        description: `${order.customerName}'s order moved forward.`,
      });
    },
    [patch]
  );

  const cancel = React.useCallback(
    (order: Order) => {
      patch(order.id, { status: "cancelled" });
      toast.error(`${order.reference} cancelled`, {
        description: "The order has been removed from the pipeline.",
      });
      setDetailOpen(false);
    },
    [patch]
  );

  const refund = React.useCallback(
    (order: Order) => {
      patch(order.id, { paymentStatus: "refunded" });
      toast(`${order.reference} refunded`, {
        description: `${formatCurrency(order.total)} returned to ${order.paymentMethod}.`,
      });
    },
    [patch]
  );

  const create = React.useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const openDetail = React.useCallback((order: Order) => {
    setActive(order);
    setDetailOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Management"
        description="Live kitchen pipeline, AI-created orders, and revenue in one place."
        icon={<ShoppingCart className="h-5 w-5" />}
        actions={
          <NewOrderDialog
            products={products}
            onCreate={create}
            orgId={currentOrg.id}
            branchId={branches[0].id}
          />
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Orders today"
          value={kpis.today}
          icon={ShoppingCart}
          accent="brand"
          delta={0.086}
        />
        <StatCard
          label="Revenue"
          value={kpis.revenue}
          icon={DollarSign}
          prefix="$"
          compact
          accent="success"
          delta={0.124}
        />
        <StatCard
          label="AI-created"
          value={kpis.aiPct}
          icon={Bot}
          suffix="%"
          decimals={0}
          accent="gold"
          delta={0.052}
        />
        <StatCard
          label="Avg order value"
          value={kpis.avg}
          icon={Receipt}
          prefix="$"
          decimals={2}
          accent="brand"
          delta={0.031}
        />
        <StatCard
          label="Awaiting kitchen"
          value={kpis.pending}
          icon={Clock}
          accent="danger"
          delta={-0.04}
        />
      </div>

      {/* View switcher + Board/Table */}
      <Tabs value={view} onValueChange={setView}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="board">
              <LayoutGrid className="h-4 w-4" /> Board
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table2 className="h-4 w-4" /> Table
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-52 pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 opacity-60" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All statuses" : STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as Order["type"] | "all")}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="dine_in">Dine-in</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* --------------------------- BOARD --------------------------- */}
        <TabsContent value="board">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {PIPELINE.map((status) => {
                const meta = STATUS_META[status];
                const list = board.get(status) ?? [];
                return (
                  <div
                    key={status}
                    className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-white/[0.06] bg-white/[0.015]"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-t-2xl border-b border-white/[0.06] bg-gradient-to-b to-transparent p-3",
                        meta.tint
                      )}
                    >
                      <span
                        className="grid h-7 w-7 place-items-center rounded-lg"
                        style={{
                          backgroundColor: `${meta.accent}22`,
                          color: meta.accent,
                        }}
                      >
                        <meta.icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">{meta.label}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {list.length}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-2.5 p-2.5">
                      <AnimatePresence mode="popLayout">
                        {list.length === 0 ? (
                          <p className="py-8 text-center text-xs text-muted-foreground">
                            No orders
                          </p>
                        ) : (
                          list.map((o) => (
                            <OrderCard
                              key={o.id}
                              order={o}
                              onAdvance={advance}
                              onOpen={openDetail}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>

        {/* --------------------------- TABLE --------------------------- */}
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No orders found"
                  description="Try adjusting your search or filters."
                  className="border-0"
                />
              ) : (
                <ScrollArea className="w-full">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <Th>Reference</Th>
                        <Th>Customer</Th>
                        <Th className="text-center">Items</Th>
                        <Th className="text-right">Total</Th>
                        <Th>Status</Th>
                        <Th>Payment</Th>
                        <Th>Channel</Th>
                        <Th>Type</Th>
                        <Th>Created</Th>
                        <Th className="text-right">Action</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((o, i) => {
                        const meta = STATUS_META[o.status];
                        const pay = PAYMENT_META[o.paymentStatus];
                        const type = TYPE_META[o.type];
                        const itemCount = o.items.reduce(
                          (s, it) => s + it.quantity,
                          0
                        );
                        return (
                          <motion.tr
                            key={o.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: Math.min(i * 0.01, 0.3) }}
                            className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                          >
                            <Td>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs">
                                  {o.reference}
                                </span>
                                {o.aiCreated && (
                                  <Sparkles className="h-3 w-3 text-gold-soft" />
                                )}
                              </div>
                            </Td>
                            <Td>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-[9px]">
                                    {initials(o.customerName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {o.customerName}
                                </span>
                              </div>
                            </Td>
                            <Td className="text-center tabular text-muted-foreground">
                              {itemCount}
                            </Td>
                            <Td className="text-right font-medium tabular">
                              {formatCurrency(o.total)}
                            </Td>
                            <Td>
                              <Badge variant={meta.variant} className="gap-1">
                                <meta.icon className="h-3 w-3" />
                                {meta.label}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge variant={pay.variant}>{pay.label}</Badge>
                            </Td>
                            <Td className="capitalize text-muted-foreground">
                              {o.channel}
                            </Td>
                            <Td>
                              <Badge variant={type.variant} className="gap-1">
                                <type.icon className="h-3 w-3" />
                                {type.label}
                              </Badge>
                            </Td>
                            <Td className="whitespace-nowrap text-muted-foreground">
                              {timeAgo(o.createdAt)}
                            </Td>
                            <Td className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetail(o)}
                              >
                                <Eye className="h-4 w-4" /> View
                              </Button>
                            </Td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --------------------------- Analytics --------------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue by day</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Order revenue · last 30 days
              </p>
            </div>
            <Badge variant="success">
              <TrendingUp className="h-3 w-3" /> +12.4%
            </Badge>
          </CardHeader>
          <CardContent>
            <AreaTrend
              data={revenueByDay}
              xKey="date"
              series={[
                { key: "revenue", color: "#00C896", name: "Revenue" },
                { key: "orders", color: "#3A86FF", name: "Orders" },
              ]}
              formatter={(v, name) =>
                name === "Revenue"
                  ? formatCurrency(v, { compact: true })
                  : formatNumber(v)
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order type split</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              How customers order
            </p>
          </CardHeader>
          <CardContent>
            <Donut
              data={typeSplit}
              centerValue={formatNumber(
                typeSplit.reduce((s, t) => s + t.value, 0),
                true
              )}
              centerLabel="Orders"
            />
            <div className="mt-4 space-y-2">
              {typeSplit.map((t) => (
                <div key={t.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: t.color }}
                  />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="ml-auto font-medium tabular">
                    {formatNumber(t.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top products</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Units sold across current orders
          </p>
        </CardHeader>
        <CardContent>
          <BarSeries
            data={topProductsData}
            xKey="name"
            series={[{ key: "units", color: "#C9A227", name: "Units" }]}
            formatter={(v) => formatNumber(v)}
            height={240}
          />
        </CardContent>
      </Card>

      <OrderDetailDialog
        order={active}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAdvance={advance}
        onCancel={cancel}
        onRefund={refund}
      />
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}
