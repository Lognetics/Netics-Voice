"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  isWithinInterval,
} from "date-fns";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Search,
  Sparkles,
  Repeat,
  Bell,
  CheckCircle2,
  LogIn,
  XCircle,
  CalendarClock,
  ListChecks,
  LayoutGrid,
  Table2,
  Boxes,
  Hash,
  DollarSign,
  Phone,
  Filter,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { AreaTrend, Donut } from "@/components/shared/charts";
import { LiveDot } from "@/components/shared/indicators";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { bookings as seedBookings, customers, currentOrg } from "@/lib/mock";
import { cn, formatCurrency, initials } from "@/lib/utils";
import type { Booking, BookingStatus, Channel, PaymentStatus } from "@/types";

import { STATUS_META, ALL_STATUSES } from "./_components/status";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/** Fixed "today" anchor - evaluated once per mount. */
const TODAY = new Date();

const RESOURCE_OPTIONS = [
  "Table 4",
  "Table 12",
  "Patio 2",
  "Private Room",
  "Suite 301",
  "Dr. Chen",
  "Stylist Maria",
  "Court A",
];

const SERVICE_OPTIONS = [
  "Dinner",
  "Lunch",
  "Consultation",
  "Haircut",
  "Overnight Stay",
  "Checkup",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtTime(iso: string) {
  return format(new Date(iso), "h:mm a");
}

function makeReference() {
  return `RSV-${Math.floor(10000 + Math.random() * 89999)}`;
}

/* ------------------------------------------------------------------ */
/* Page                                                              */
/* ------------------------------------------------------------------ */

export default function BookingsPage() {
  const [items, setItems] = React.useState<Booking[]>(() =>
    [...seedBookings].sort((a, b) => +new Date(a.start) - +new Date(b.start))
  );
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [remindMap, setRemindMap] = React.useState<Record<string, boolean>>({});

  // list filters
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "all">(
    "all"
  );

  /* ------------------------- derived: week ------------------------- */
  const weekStart = React.useMemo(
    () => startOfWeek(addWeeks(TODAY, weekOffset), { weekStartsOn: 1 }),
    [weekOffset]
  );
  const weekDays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekEnd = React.useMemo(
    () => endOfWeek(weekStart, { weekStartsOn: 1 }),
    [weekStart]
  );

  /* ------------------------- KPIs ------------------------- */
  const kpis = React.useMemo(() => {
    const today = items.filter((b) => isSameDay(new Date(b.start), TODAY));
    const upcoming = items.filter(
      (b) =>
        new Date(b.start) > TODAY &&
        !["cancelled", "completed", "no_show"].includes(b.status)
    );
    const scheduled = items.filter(
      (b) => !["waitlist", "cancelled"].includes(b.status)
    );
    const confirmedPct = scheduled.length
      ? (items.filter((b) => b.status === "confirmed").length /
          scheduled.length) *
        100
      : 0;
    const settled = items.filter((b) =>
      ["completed", "no_show", "checked_in"].includes(b.status)
    );
    const noShowRate = settled.length
      ? (items.filter((b) => b.status === "no_show").length / settled.length) *
        100
      : 0;
    const waitlist = items.filter((b) => b.status === "waitlist");
    return {
      todayCount: today.length,
      upcomingCount: upcoming.length,
      confirmedPct: Math.round(confirmedPct),
      noShowRate: Math.round(noShowRate * 10) / 10,
      waitlist,
    };
  }, [items]);

  /* ------------------------- analytics ------------------------- */
  const trendData = React.useMemo(() => {
    // bookings-per-day over a 14-day window centred on today
    const days = Array.from({ length: 14 }, (_, i) => addDays(TODAY, i - 9));
    return days.map((d) => ({
      date: format(d, "MMM d"),
      bookings: items.filter((b) => isSameDay(new Date(b.start), d)).length,
    }));
  }, [items]);

  const statusSplit = React.useMemo(
    () =>
      ALL_STATUSES.map((s) => ({
        name: STATUS_META[s].label,
        value: items.filter((b) => b.status === s).length,
        color: STATUS_META[s].color,
      })).filter((d) => d.value > 0),
    [items]
  );

  /* ------------------------- resources ------------------------- */
  const resourceRows = React.useMemo(() => {
    const map = new Map<
      string,
      { name: string; type: string; total: number; active: number; live: number }
    >();
    for (const b of items) {
      const key = b.resource;
      const row =
        map.get(key) ??
        { name: b.resource, type: b.resourceType, total: 0, active: 0, live: 0 };
      row.total += 1;
      if (!["cancelled", "no_show", "completed"].includes(b.status)) row.active += 1;
      if (
        b.status === "checked_in" ||
        isWithinInterval(TODAY, {
          start: new Date(b.start),
          end: new Date(b.end),
        })
      )
        row.live += 1;
      map.set(key, row);
    }
    const maxActive = Math.max(1, ...[...map.values()].map((r) => r.active));
    return [...map.values()]
      .map((r) => ({ ...r, util: Math.round((r.active / maxActive) * 100) }))
      .sort((a, b) => b.active - a.active);
  }, [items]);

  /* ------------------------- list filtering ------------------------- */
  const filteredList = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.reference.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.resource.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q)
      );
    });
  }, [items, query, statusFilter]);

  /* ------------------------- mutations ------------------------- */
  const patchStatus = React.useCallback(
    (id: string, status: BookingStatus, msg: string) => {
      setItems((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
      toast.success(msg);
    },
    []
  );

  const reschedule = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const start = new Date(new Date(b.start).getTime() + 86_400_000);
        const end = new Date(new Date(b.end).getTime() + 86_400_000);
        return { ...b, start: start.toISOString(), end: end.toISOString() };
      })
    );
    setSelected((prev) => {
      if (!prev || prev.id !== id) return prev;
      return {
        ...prev,
        start: new Date(new Date(prev.start).getTime() + 86_400_000).toISOString(),
        end: new Date(new Date(prev.end).getTime() + 86_400_000).toISOString(),
      };
    });
    toast.success("Rescheduled to next day", {
      description: "Customer will receive an updated confirmation.",
    });
  }, []);

  const toggleReminder = React.useCallback(
    (id: string) => {
      setRemindMap((prev) => {
        const next = !prev[id];
        toast[next ? "success" : "message"](
          next ? "Reminder enabled" : "Reminder disabled"
        );
        return { ...prev, [id]: next };
      });
    },
    []
  );

  const promoteFromWaitlist = React.useCallback(
    (id: string) => patchStatus(id, "confirmed", "Waitlist guest confirmed 🎉"),
    [patchStatus]
  );

  const createBooking = React.useCallback((b: Booking) => {
    setItems((prev) => [b, ...prev]);
    toast.success("Booking created", {
      description: `${b.reference} · ${b.customerName} · ${b.service}`,
    });
  }, []);

  /* ------------------------- render ------------------------- */
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CalendarDays className="h-5 w-5" />}
        title="Booking Engine"
        description={`Reservations, appointments & resources for ${currentOrg.name}.`}
        actions={
          <>
            <Badge variant="secondary" className="hidden sm:flex">
              <Sparkles className="h-3 w-3" /> {items.filter((b) => b.aiCreated).length} AI-booked
            </Badge>
            <Button variant="gold" onClick={() => setCreateOpen(true)}>
              <CalendarPlus className="h-4 w-4" /> New booking
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Bookings today"
          value={kpis.todayCount}
          icon={CalendarDays}
          accent="brand"
        />
        <StatCard
          label="Upcoming"
          value={kpis.upcomingCount}
          icon={CalendarClock}
          accent="gold"
        />
        <StatCard
          label="Confirmed"
          value={kpis.confirmedPct}
          icon={CheckCircle2}
          suffix="%"
          accent="success"
        />
        <StatCard
          label="No-show rate"
          value={kpis.noShowRate}
          icon={XCircle}
          suffix="%"
          decimals={1}
          accent="danger"
        />
        <StatCard
          label="Waitlist"
          value={kpis.waitlist.length}
          icon={ListChecks}
          accent="gold"
        />
      </div>

      {/* Waitlist strip */}
      <WaitlistStrip
        items={kpis.waitlist}
        onPromote={promoteFromWaitlist}
        onOpen={setSelected}
      />

      {/* Main tabs */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <LayoutGrid className="h-4 w-4" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="list">
            <Table2 className="h-4 w-4" /> List
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Boxes className="h-4 w-4" /> Resources
          </TabsTrigger>
        </TabsList>

        {/* --------------------------- CALENDAR --------------------------- */}
        <TabsContent value="calendar">
          <CalendarView
            weekDays={weekDays}
            weekStart={weekStart}
            weekEnd={weekEnd}
            weekOffset={weekOffset}
            onPrev={() => setWeekOffset((w) => w - 1)}
            onNext={() => setWeekOffset((w) => w + 1)}
            onToday={() => setWeekOffset(0)}
            items={items}
            onSelect={setSelected}
          />
        </TabsContent>

        {/* ----------------------------- LIST ----------------------------- */}
        <TabsContent value="list">
          <ListView
            rows={filteredList}
            total={items.length}
            query={query}
            onQuery={setQuery}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onSelect={setSelected}
          />
        </TabsContent>

        {/* --------------------------- RESOURCES -------------------------- */}
        <TabsContent value="resources">
          <ResourcesView rows={resourceRows} />
        </TabsContent>
      </Tabs>

      {/* Analytics row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Bookings over time</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Volume across a 14-day window
              </p>
            </div>
            <Badge variant="secondary">
              <CalendarDays className="h-3 w-3" /> {items.length} total
            </Badge>
          </CardHeader>
          <CardContent>
            <AreaTrend
              data={trendData}
              xKey="date"
              series={[{ key: "bookings", color: "#C9A227", name: "Bookings" }]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status split</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Breakdown by booking state
            </p>
          </CardHeader>
          <CardContent>
            <Donut
              data={statusSplit}
              centerValue={String(items.length)}
              centerLabel="bookings"
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statusSplit.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: d.color }}
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail dialog */}
      <BookingDetailDialog
        booking={selected}
        reminderOn={selected ? !!remindMap[selected.id] : false}
        onClose={() => setSelected(null)}
        onConfirm={(id) => patchStatus(id, "confirmed", "Booking confirmed")}
        onCheckIn={(id) => patchStatus(id, "checked_in", "Guest checked in")}
        onCancel={(id) => patchStatus(id, "cancelled", "Booking cancelled")}
        onReschedule={reschedule}
        onToggleReminder={toggleReminder}
      />

      {/* Create dialog */}
      <NewBookingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createBooking}
      />
    </div>
  );
}

/* ================================================================== */
/* Waitlist strip                                                     */
/* ================================================================== */

function WaitlistStrip({
  items,
  onPromote,
  onOpen,
}: {
  items: Booking[];
  onPromote: (id: string) => void;
  onOpen: (b: Booking) => void;
}) {
  if (items.length === 0) return null;
  return (
    <Card className="border-gold/20">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold/12 text-gold-soft">
            <ListChecks className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium">Waitlist</p>
            <p className="text-xs text-muted-foreground">
              {items.length} guest{items.length === 1 ? "" : "s"} waiting for a slot
            </p>
          </div>
        </div>
        <ScrollArea className="min-w-0 flex-1">
          <div className="flex gap-2 pb-1">
            {items.slice(0, 12).map((b) => (
              <div
                key={b.id}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-gold/20 bg-gold/[0.06] py-1.5 pl-2 pr-1.5"
              >
                <button
                  onClick={() => onOpen(b)}
                  className="text-left text-xs focus-ring rounded"
                >
                  <span className="font-medium">{b.customerName}</span>
                  <span className="ml-1.5 text-muted-foreground">
                    {b.service}
                  </span>
                </button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="h-6 w-6 text-gold-soft hover:text-gold"
                  onClick={() => onPromote(b.id)}
                  title="Confirm from waitlist"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/* Calendar view                                                      */
/* ================================================================== */

function CalendarView({
  weekDays,
  weekStart,
  weekEnd,
  weekOffset,
  onPrev,
  onNext,
  onToday,
  items,
  onSelect,
}: {
  weekDays: Date[];
  weekStart: Date;
  weekEnd: Date;
  weekOffset: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  items: Booking[];
  onSelect: (b: Booking) => void;
}) {
  const weekItems = React.useMemo(
    () =>
      items.filter((b) =>
        isWithinInterval(new Date(b.start), { start: weekStart, end: weekEnd })
      ),
    [items, weekStart, weekEnd]
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {weekItems.length} booking{weekItems.length === 1 ? "" : "s"} this week
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant={weekOffset === 0 ? "secondary" : "outline"}
            size="sm"
            onClick={onToday}
          >
            Today
          </Button>
          <Button variant="outline" size="icon-sm" onClick={onPrev} title="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={onNext} title="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {weekItems.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No bookings this week"
            description="Navigate to another week or create a new booking to fill this schedule."
          />
        ) : (
          <ScrollArea className="w-full">
            <div className="grid min-w-[840px] grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayItems = weekItems
                  .filter((b) => isSameDay(new Date(b.start), day))
                  .sort((a, b) => +new Date(a.start) - +new Date(b.start));
                const isToday = isSameDay(day, TODAY);
                return (
                  <div key={day.toISOString()} className="flex flex-col">
                    {/* day header */}
                    <div
                      className={cn(
                        "mb-2 rounded-lg border px-2 py-1.5 text-center",
                        isToday
                          ? "border-brand/40 bg-brand/10"
                          : "border-white/[0.06] bg-white/[0.02]"
                      )}
                    >
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {format(day, "EEE")}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-semibold tabular",
                          isToday && "text-brand-soft"
                        )}
                      >
                        {format(day, "d")}
                      </p>
                    </div>
                    {/* chips */}
                    <div className="flex min-h-[120px] flex-col gap-1.5 rounded-lg border border-dashed border-white/[0.05] p-1.5">
                      <AnimatePresence initial={false}>
                        {dayItems.map((b) => {
                          const meta = STATUS_META[b.status];
                          return (
                            <motion.button
                              key={b.id}
                              layout
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              onClick={() => onSelect(b)}
                              className={cn(
                                "w-full rounded-md border px-2 py-1.5 text-left text-xs transition-colors focus-ring",
                                meta.chip
                              )}
                            >
                              <div className="flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3 shrink-0 opacity-70" />
                                <span className="tabular">{fmtTime(b.start)}</span>
                                {b.aiCreated && (
                                  <Sparkles className="ml-auto h-3 w-3 shrink-0 opacity-70" />
                                )}
                              </div>
                              <p className="mt-0.5 truncate font-medium text-foreground/90">
                                {b.customerName}
                              </p>
                              <p className="truncate opacity-80">
                                {b.resource}
                              </p>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                      {dayItems.length === 0 && (
                        <span className="m-auto text-[11px] text-muted-foreground/50">
                          -                         </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {ALL_STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full", STATUS_META[s].dot)} />
              {STATUS_META[s].label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/* List view                                                          */
/* ================================================================== */

function ListView({
  rows,
  total,
  query,
  onQuery,
  statusFilter,
  onStatusFilter,
  onSelect,
}: {
  rows: Booking[];
  total: number;
  query: string;
  onQuery: (v: string) => void;
  statusFilter: BookingStatus | "all";
  onStatusFilter: (v: BookingStatus | "all") => void;
  onSelect: (b: Booking) => void;
}) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All bookings</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {rows.length} of {total}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Search reference, customer, resource…"
                className="pl-9 sm:w-72"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => onStatusFilter(v as BookingStatus | "all")}
            >
              <SelectTrigger className="sm:w-44">
                <span className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 opacity-60" />
                  <SelectValue placeholder="Status" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching bookings"
            description="Try adjusting your search or status filter."
          />
        ) : (
          <ScrollArea className="w-full">
            <div className="min-w-[900px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2.5 font-medium">Reference</th>
                    <th className="px-3 py-2.5 font-medium">Customer</th>
                    <th className="px-3 py-2.5 font-medium">Resource</th>
                    <th className="px-3 py-2.5 font-medium">Service</th>
                    <th className="px-3 py-2.5 font-medium">When</th>
                    <th className="px-3 py-2.5 font-medium">Party</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 text-right font-medium">Price</th>
                    <th className="px-3 py-2.5 font-medium">Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 80).map((b) => {
                    const meta = STATUS_META[b.status];
                    return (
                      <tr
                        key={b.id}
                        onClick={() => onSelect(b)}
                        className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-xs text-muted-foreground">
                            {b.reference}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.05] text-[10px] font-medium">
                              {initials(b.customerName)}
                            </span>
                            <span className="truncate font-medium">
                              {b.customerName}
                            </span>
                            {b.aiCreated && (
                              <Sparkles className="h-3 w-3 shrink-0 text-brand-soft" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {b.resource}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {b.service}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                          {format(new Date(b.start), "MMM d")} ·{" "}
                          <span className="tabular">
                            {fmtTime(b.start)}–{fmtTime(b.end)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 tabular text-muted-foreground">
                          {b.partySize ?? "-"}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular">
                          {formatCurrency(b.price)}
                        </td>
                        <td className="px-3 py-2.5 capitalize text-muted-foreground">
                          {b.channel}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length > 80 && (
                <p className="px-3 py-3 text-center text-xs text-muted-foreground">
                  Showing first 80 of {rows.length} results - refine your search to
                  narrow further.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/* Resources view                                                     */
/* ================================================================== */

function ResourcesView({
  rows,
}: {
  rows: {
    name: string;
    type: string;
    total: number;
    active: number;
    live: number;
    util: number;
  }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const busy = r.live > 0;
        return (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl",
                      busy ? "bg-danger/12 text-danger" : "bg-success/12 text-success"
                    )}
                  >
                    <Boxes className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.type}</p>
                  </div>
                </div>
                {busy ? (
                  <Badge variant="danger">
                    <LiveDot color="#FF4D4F" className="mr-1 h-2 w-2" /> Occupied
                  </Badge>
                ) : (
                  <Badge variant="success">Available</Badge>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Utilization</span>
                <span className="tabular font-medium text-foreground">
                  {r.util}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    r.util >= 75
                      ? "bg-danger"
                      : r.util >= 45
                        ? "bg-gold"
                        : "bg-success"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${r.util}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/[0.02] py-2">
                  <p className="text-sm font-semibold tabular">{r.total}</p>
                  <p className="text-[11px] text-muted-foreground">Total</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] py-2">
                  <p className="text-sm font-semibold tabular">{r.active}</p>
                  <p className="text-[11px] text-muted-foreground">Active</p>
                </div>
                <div className="rounded-lg bg-white/[0.02] py-2">
                  <p className="text-sm font-semibold tabular">{r.live}</p>
                  <p className="text-[11px] text-muted-foreground">Now</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/* Booking detail dialog                                              */
/* ================================================================== */

function BookingDetailDialog({
  booking,
  reminderOn,
  onClose,
  onConfirm,
  onCheckIn,
  onCancel,
  onReschedule,
  onToggleReminder,
}: {
  booking: Booking | null;
  reminderOn: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onCheckIn: (id: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
  onToggleReminder: (id: string) => void;
}) {
  const b = booking;
  const open = !!b;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        {b && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>{b.customerName}</DialogTitle>
                <Badge variant={STATUS_META[b.status].variant}>
                  {STATUS_META[b.status].label}
                </Badge>
                {b.recurring && (
                  <Badge variant="secondary">
                    <Repeat className="h-3 w-3" /> Recurring
                  </Badge>
                )}
              </div>
              <DialogDescription className="flex items-center gap-2 font-mono">
                {b.reference}
                {b.aiCreated && (
                  <span className="inline-flex items-center gap-1 text-brand-soft">
                    <Sparkles className="h-3 w-3" /> AI-booked
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow icon={CalendarClock} label="When">
                {format(new Date(b.start), "EEE, MMM d")} ·{" "}
                <span className="tabular">
                  {fmtTime(b.start)}–{fmtTime(b.end)}
                </span>
              </InfoRow>
              <InfoRow icon={Boxes} label="Resource">
                {b.resource}{" "}
                <span className="text-muted-foreground">({b.resourceType})</span>
              </InfoRow>
              <InfoRow icon={Hash} label="Service">
                {b.service}
              </InfoRow>
              <InfoRow icon={Users} label="Party size">
                {b.partySize ?? "-"}
              </InfoRow>
              <InfoRow icon={DollarSign} label="Price">
                {formatCurrency(b.price)}{" "}
                <span className="capitalize text-muted-foreground">
                  · {b.paymentStatus}
                </span>
              </InfoRow>
              <InfoRow icon={Phone} label="Channel">
                <span className="capitalize">{b.channel}</span>
              </InfoRow>
            </div>

            {b.notes && (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-muted-foreground">
                {b.notes}
              </div>
            )}

            <Separator />

            {/* Reminder toggle */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-gold-soft" />
                <div>
                  <p className="font-medium">Reminder</p>
                  <p className="text-xs text-muted-foreground">
                    Notify the guest before their slot
                  </p>
                </div>
              </div>
              <Switch
                checked={reminderOn}
                onCheckedChange={() => onToggleReminder(b.id)}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReschedule(b.id)}
              >
                <CalendarClock className="h-4 w-4" /> Reschedule
              </Button>
              {b.status !== "cancelled" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(b.id)}
                >
                  <XCircle className="h-4 w-4" /> Cancel
                </Button>
              )}
              {b.status !== "checked_in" && b.status !== "completed" && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onCheckIn(b.id)}
                >
                  <LogIn className="h-4 w-4" /> Check-in
                </Button>
              )}
              {b.status !== "confirmed" && (
                <Button size="sm" onClick={() => onConfirm(b.id)}>
                  <CheckCircle2 className="h-4 w-4" /> Confirm
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

/* ================================================================== */
/* New booking dialog                                                 */
/* ================================================================== */

function NewBookingDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (b: Booking) => void;
}) {
  const [customerName, setCustomerName] = React.useState("");
  const [service, setService] = React.useState<string>(SERVICE_OPTIONS[0]);
  const [resource, setResource] = React.useState<string>(RESOURCE_OPTIONS[0]);
  const [date, setDate] = React.useState<string>(() =>
    format(TODAY, "yyyy-MM-dd")
  );
  const [time, setTime] = React.useState("19:00");
  const [partySize, setPartySize] = React.useState("2");
  const [notes, setNotes] = React.useState("");

  const reset = React.useCallback(() => {
    setCustomerName("");
    setService(SERVICE_OPTIONS[0]);
    setResource(RESOURCE_OPTIONS[0]);
    setDate(format(TODAY, "yyyy-MM-dd"));
    setTime("19:00");
    setPartySize("2");
    setNotes("");
  }, []);

  const canSubmit = customerName.trim().length > 0 && !!date && !!time;

  const submit = React.useCallback(() => {
    if (!canSubmit) {
      toast.error("Add a customer name, date and time to continue.");
      return;
    }
    const start = new Date(`${date}T${time}:00`);
    if (Number.isNaN(start.getTime())) {
      toast.error("Invalid date or time.");
      return;
    }
    const end = new Date(start.getTime() + 90 * 60_000);
    const resourceType =
      resource.includes("Table") || resource.includes("Patio")
        ? "Table"
        : resource.includes("Suite") || resource.includes("Room")
          ? "Room"
          : resource.startsWith("Dr.")
            ? "Doctor"
            : resource.startsWith("Stylist")
              ? "Stylist"
              : resource.includes("Court")
                ? "Court"
                : "Resource";

    const booking: Booking = {
      id: `bkg_new_${Date.now()}`,
      orgId: currentOrg.id,
      branchId: "br_0001",
      customerId: customers[0]?.id ?? "cus_0001",
      customerName: customerName.trim(),
      reference: makeReference(),
      resource,
      resourceType,
      service,
      status: "confirmed",
      start: start.toISOString(),
      end: end.toISOString(),
      partySize: Math.max(1, parseInt(partySize, 10) || 1),
      price: 0,
      paymentStatus: "pending" as PaymentStatus,
      channel: "phone" as Channel,
      aiCreated: false,
      recurring: false,
      notes: notes.trim() || undefined,
    };
    onCreate(booking);
    reset();
    onOpenChange(false);
  }, [
    canSubmit,
    date,
    time,
    resource,
    service,
    customerName,
    partySize,
    notes,
    onCreate,
    onOpenChange,
    reset,
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-gold-soft" /> New booking
          </DialogTitle>
          <DialogDescription>
            Create a reservation. It will be added to the schedule instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nb-name">Customer name</Label>
            <Input
              id="nb-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Jordan Rivera"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Service</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resource</Label>
              <Select value={resource} onValueChange={setResource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nb-date">Date</Label>
              <Input
                id="nb-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nb-time">Time</Label>
              <Input
                id="nb-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nb-party">Party size</Label>
              <Input
                id="nb-party"
                type="number"
                min={1}
                max={40}
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nb-notes">Notes (optional)</Label>
            <Textarea
              id="nb-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, seating preferences…"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={!canSubmit}>
            <CalendarPlus className="h-4 w-4" /> Create booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
