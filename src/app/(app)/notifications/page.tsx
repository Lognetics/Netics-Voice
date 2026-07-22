"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  Settings2,
  Inbox,
  Filter,
} from "lucide-react";
import type { AppNotification } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notifications as seedNotifications } from "@/lib/mock/db";
import { NotificationItem } from "./_components/notification-item";
import { NotificationPreferences } from "./_components/notification-preferences";
import {
  TYPE_META,
  DAY_ORDER,
  dayGroup,
} from "./_components/notification-config";

type FilterKey = "all" | AppNotification["type"];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "call", label: "Calls" },
  { key: "order", label: "Orders" },
  { key: "booking", label: "Bookings" },
  { key: "system", label: "System" },
  { key: "billing", label: "Billing" },
  { key: "escalation", label: "Escalations" },
];

export default function NotificationsPage() {
  const [items, setItems] = React.useState<AppNotification[]>(() =>
    [...seedNotifications].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    )
  );
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [unreadOnly, setUnreadOnly] = React.useState(false);

  const unreadCount = items.filter((n) => !n.read).length;

  const countByType = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const n of items) if (!n.read) map[n.type] = (map[n.type] ?? 0) + 1;
    return map;
  }, [items]);

  const visible = items.filter((n) => {
    if (filter !== "all" && n.type !== filter) return false;
    if (unreadOnly && n.read) return false;
    return true;
  });

  const grouped = React.useMemo(() => {
    const g: Record<string, AppNotification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const n of visible) g[dayGroup(n.createdAt)].push(n);
    return g;
  }, [visible]);

  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    toast("Notification dismissed", { icon: "🗑️" });
  };

  const markAllRead = () => {
    if (unreadCount === 0) {
      toast.info("You're all caught up - no unread notifications.");
      return;
    }
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(`Marked ${unreadCount} notification${unreadCount > 1 ? "s" : ""} as read`);
  };

  const open = (n: AppNotification) => {
    setItems((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
    );
    toast(n.title, {
      description: n.actionUrl
        ? `Opening ${n.actionUrl}…`
        : n.body,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Bell className="h-5 w-5" />}
        title="Notifications"
        description={
          unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
            : "You're all caught up."
        }
        actions={
          <>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <Switch
                id="unread-only"
                checked={unreadOnly}
                onCheckedChange={setUnreadOnly}
              />
              <Label htmlFor="unread-only" className="cursor-pointer text-xs">
                Unread only
              </Label>
            </div>
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Notification settings"
              onClick={() =>
                toast("Notification settings", {
                  description: "Configure channels in the panel below.",
                })
              }
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <Filter className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as FilterKey)}
            >
              <TabsList className="h-auto flex-wrap justify-start">
                {FILTERS.map((f) => {
                  const c =
                    f.key === "all" ? unreadCount : countByType[f.key] ?? 0;
                  return (
                    <TabsTrigger key={f.key} value={f.key}>
                      {f.label}
                      {c > 0 && (
                        <Badge
                          variant={f.key === "all" ? "default" : "secondary"}
                          className="ml-1 px-1.5 py-0 text-[10px]"
                        >
                          {c}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          <Card>
            <CardContent className="p-3 sm:p-4">
              {visible.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title={
                    unreadOnly
                      ? "No unread notifications"
                      : "Nothing here yet"
                  }
                  description={
                    filter === "all"
                      ? "New activity from your AI employee will appear here."
                      : `No ${TYPE_META[filter as AppNotification["type"]].label.toLowerCase()} notifications to show.`
                  }
                  className="border-0 py-12"
                />
              ) : (
                <ScrollArea className="max-h-[calc(100vh-18rem)]">
                  <div className="space-y-5 pr-2">
                    {DAY_ORDER.map((day) => {
                      const group = grouped[day];
                      if (group.length === 0) return null;
                      return (
                        <div key={day}>
                          <div className="mb-2 flex items-center gap-2 px-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {day}
                            </span>
                            <span className="text-[11px] text-muted-foreground/60">
                              {group.length}
                            </span>
                            <div className="ml-1 h-px flex-1 bg-white/[0.05]" />
                          </div>
                          <div className="space-y-2">
                            <AnimatePresence initial={false} mode="popLayout">
                              {group.map((n) => (
                                <NotificationItem
                                  key={n.id}
                                  notification={n}
                                  onToggleRead={toggleRead}
                                  onDismiss={dismiss}
                                  onOpen={open}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {[
                { label: "Total", value: items.length, tone: "text-foreground" },
                { label: "Unread", value: unreadCount, tone: "text-brand" },
                {
                  label: "High",
                  value: items.filter(
                    (n) => n.priority === "high" && !n.read
                  ).length,
                  tone: "text-danger-soft",
                },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"
                >
                  <p className={`text-2xl font-semibold tabular ${s.tone}`}>
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <NotificationPreferences />
        </div>
      </div>
    </div>
  );
}
