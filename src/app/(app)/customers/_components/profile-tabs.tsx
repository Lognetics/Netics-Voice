"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  MessageSquare,
  Phone,
  Receipt,
  Send,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AreaTrend } from "@/components/shared/charts";
import { SentimentBadge } from "@/components/shared/indicators";
import { EmptyState } from "@/components/shared/empty-state";
import {
  formatCurrency,
  formatDuration,
  timeAgo,
} from "@/lib/utils";
import type { Booking, Call, Customer, Order } from "@/types";
import { ltvHistory } from "./customer-helpers";

const orderStatusVariant: Record<
  Order["status"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  pending: "warning",
  confirmed: "default",
  preparing: "default",
  ready: "gold",
  out_for_delivery: "gold",
  delivered: "success",
  cancelled: "danger",
};

const bookingStatusVariant: Record<
  Booking["status"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  confirmed: "success",
  pending: "warning",
  checked_in: "default",
  completed: "success",
  cancelled: "danger",
  no_show: "danger",
  waitlist: "secondary",
};

function humanize(s: string) {
  return s.replace(/_/g, " ");
}

export function ProfileTabs({
  customer,
  calls,
  orders,
  bookings,
}: {
  customer: Customer;
  calls: Call[];
  orders: Order[];
  bookings: Booking[];
}) {
  const history = React.useMemo(() => ltvHistory(customer), [customer]);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="conversations">
          Conversations
          <Badge variant="secondary">{calls.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="orders">
          Orders
          <Badge variant="secondary">{orders.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="bookings">
          Bookings
          <Badge variant="secondary">{bookings.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>

      {/* -------------------------- Overview -------------------------- */}
      <TabsContent value="overview" className="space-y-4">
        <Card className="border-brand/20 bg-brand/[0.04]">
          <CardContent className="flex items-start gap-3 p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">AI insight</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {customer.aiInsight}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Lifetime value</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Cumulative spend · last 12 months
              </p>
            </div>
            <Badge variant="success">
              {formatCurrency(customer.lifetimeValue)}
            </Badge>
          </CardHeader>
          <CardContent>
            <AreaTrend
              data={history}
              xKey="month"
              series={[{ key: "value", color: "#00C896", name: "LTV" }]}
              formatter={(v) => formatCurrency(v)}
              height={240}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat label="Total orders" value={String(customer.totalOrders)} />
          <MiniStat
            label="Total bookings"
            value={String(customer.totalBookings)}
          />
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Current sentiment</p>
            <div className="mt-2">
              <SentimentBadge sentiment={customer.sentiment} />
            </div>
          </Card>
        </div>
      </TabsContent>

      {/* ------------------------ Conversations ----------------------- */}
      <TabsContent value="conversations" className="space-y-3">
        {calls.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Calls and messages with this customer will appear here."
          />
        ) : (
          calls.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link
                href={`/calls/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:bg-white/[0.05]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/12 text-brand">
                  <Phone className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{c.intent}</p>
                    <Badge variant="secondary" className="capitalize">
                      {c.channel}
                    </Badge>
                    {c.aiHandled && (
                      <Badge variant="default">
                        <Sparkles className="h-3 w-3" /> AI
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.summary}
                  </p>
                </div>
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                  <SentimentBadge sentiment={c.sentiment} showEmoji={false} />
                  {c.durationSec > 0 && (
                    <span className="text-xs tabular text-muted-foreground">
                      {formatDuration(c.durationSec)}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(c.startedAt)}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </motion.div>
          ))
        )}
      </TabsContent>

      {/* --------------------------- Orders --------------------------- */}
      <TabsContent value="orders" className="space-y-3">
        {orders.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No orders yet"
            description="Orders placed by this customer will appear here."
          />
        ) : (
          orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-success/12 text-success">
                <Receipt className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{o.reference}</p>
                  <Badge
                    variant={orderStatusVariant[o.status]}
                    className="capitalize"
                  >
                    {humanize(o.status)}
                  </Badge>
                  {o.aiCreated && (
                    <Badge variant="default">
                      <Sparkles className="h-3 w-3" /> AI
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular">
                  {formatCurrency(o.total)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {timeAgo(o.createdAt)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </TabsContent>

      {/* -------------------------- Bookings -------------------------- */}
      <TabsContent value="bookings" className="space-y-3">
        {bookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No bookings yet"
            description="Reservations and appointments will appear here."
          />
        ) : (
          bookings.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold/12 text-gold-soft">
                <CalendarCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{b.service}</p>
                  <Badge
                    variant={bookingStatusVariant[b.status]}
                    className="capitalize"
                  >
                    {humanize(b.status)}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {b.resource} · {b.reference}
                  {b.partySize ? ` · party of ${b.partySize}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium">
                  {new Date(b.start).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(b.start).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </TabsContent>

      {/* --------------------------- Notes ---------------------------- */}
      <TabsContent value="notes">
        <NotesTab customer={customer} />
      </TabsContent>
    </Tabs>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular tracking-tight">
        {value}
      </p>
    </Card>
  );
}

interface NoteEntry {
  id: string;
  text: string;
  at: string;
}

function NotesTab({ customer }: { customer: Customer }) {
  const [notes, setNotes] = React.useState<NoteEntry[]>(() =>
    customer.notes
      ? [
          {
            id: "seed",
            text: customer.notes,
            at: customer.lastContact,
          },
        ]
      : []
  );
  const [draft, setDraft] = React.useState("");

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [
      { id: `n_${Date.now()}`, text, at: new Date().toISOString() },
      ...prev,
    ]);
    setDraft("");
    toast.success("Note added");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a note about this customer…"
            className="min-h-24 resize-none"
          />
          <div className="flex justify-end">
            <Button onClick={addNote} disabled={!draft.trim()}>
              <Send className="h-4 w-4" /> Add note
            </Button>
          </div>
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Add context, preferences or reminders about this customer."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/12 text-gold-soft">
                <StickyNote className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{n.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {timeAgo(n.at)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
