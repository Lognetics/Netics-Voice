"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  MessageSquare,
  Slack,
  Webhook,
  Save,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ChannelKey = "push" | "email" | "sms" | "slack" | "webhook";

interface ChannelDef {
  key: ChannelKey;
  label: string;
  icon: typeof Bell;
  badge?: string;
}

const CHANNELS: ChannelDef[] = [
  { key: "push", label: "Push", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "slack", label: "Slack", icon: Slack, badge: "Beta" },
  { key: "webhook", label: "Webhook", icon: Webhook, badge: "Pro" },
];

interface EventDef {
  key: string;
  label: string;
  description: string;
}

const EVENTS: EventDef[] = [
  { key: "new_call", label: "New call", description: "A call reaches your line" },
  {
    key: "escalation",
    label: "Escalation",
    description: "AI hands a call to a human",
  },
  { key: "order", label: "New order", description: "An order is placed" },
  {
    key: "booking",
    label: "New booking",
    description: "A reservation is created",
  },
  {
    key: "billing",
    label: "Billing",
    description: "Invoices, payments & plan changes",
  },
  {
    key: "low_confidence",
    label: "Low AI confidence",
    description: "AI confidence drops below threshold",
  },
];

type PrefMatrix = Record<string, Record<ChannelKey, boolean>>;

/** Sensible defaults: push everywhere, email for important, sms only escalations. */
function defaultPrefs(): PrefMatrix {
  const base: PrefMatrix = {};
  for (const ev of EVENTS) {
    base[ev.key] = {
      push: true,
      email: ev.key === "escalation" || ev.key === "billing",
      sms: ev.key === "escalation" || ev.key === "low_confidence",
      slack: ev.key === "escalation",
      webhook: false,
    };
  }
  return base;
}

export function NotificationPreferences() {
  const [prefs, setPrefs] = React.useState<PrefMatrix>(defaultPrefs);
  const [dirty, setDirty] = React.useState(false);

  const toggle = (event: string, channel: ChannelKey) => {
    setPrefs((prev) => ({
      ...prev,
      [event]: { ...prev[event], [channel]: !prev[event][channel] },
    }));
    setDirty(true);
  };

  const save = () => {
    setDirty(false);
    toast.success("Notification preferences saved", {
      description: "Your delivery channels have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand/12 text-brand">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Notification preferences</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose how you get notified per event.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Channel legend */}
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <span
                key={c.key}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {c.label}
                {c.badge && (
                  <Badge variant="outline" className="ml-0.5 px-1.5 py-0 text-[10px]">
                    {c.badge}
                  </Badge>
                )}
              </span>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-1">
          {EVENTS.map((ev, i) => (
            <React.Fragment key={ev.key}>
              {i > 0 && <Separator className="my-1 opacity-60" />}
              <div className="flex flex-col gap-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{ev.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {ev.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {CHANNELS.map((c) => {
                    const Icon = c.icon;
                    const on = prefs[ev.key][c.key];
                    return (
                      <label
                        key={c.key}
                        className="flex cursor-pointer items-center gap-1.5"
                        title={`${c.label} · ${ev.label}`}
                      >
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5 transition-colors sm:hidden",
                            on ? "text-brand" : "text-muted-foreground/60"
                          )}
                        />
                        <span className="hidden text-[11px] text-muted-foreground sm:inline">
                          {c.label}
                        </span>
                        <Switch
                          checked={on}
                          onCheckedChange={() => toggle(ev.key, c.key)}
                          className="scale-90"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <Button size="sm" variant="gold" disabled={!dirty} onClick={save}>
            <Save className="h-4 w-4" /> Save preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
