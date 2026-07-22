"use client";

import * as React from "react";
import { Webhook as WebhookIcon, Plus, Gauge } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { webhooks as seedWebhooks } from "@/lib/mock";
import { timeAgo } from "@/lib/utils";
import type { Webhook } from "@/types";

const RATE_LIMITS = [
  { label: "Requests / min", used: 640, limit: 1000 },
  { label: "Requests / day", used: 184300, limit: 500000 },
  { label: "Concurrent connections", used: 18, limit: 50 },
];

export function WebhooksTab() {
  const [hooks, setHooks] = React.useState<Webhook[]>(seedWebhooks);
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [events, setEvents] = React.useState("");

  function addWebhook() {
    if (!url.trim()) {
      toast.error("Endpoint URL is required");
      return;
    }
    setHooks((prev) => [
      {
        id: `wh_${Date.now()}`,
        url: url.trim(),
        events: events
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean) || ["call.completed"],
        status: "active",
        secret: `whsec_••••${Math.floor(1000 + Math.random() * 8999)}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    toast.success("Webhook added");
    setOpen(false);
    setUrl("");
    setEvents("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Webhook endpoints</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Receive real-time events from NETICS.
            </p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add webhook
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {hooks.map((wh) => (
            <div
              key={wh.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm">{wh.url}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Secret {wh.secret} · added {timeAgo(wh.createdAt)}
                  </p>
                </div>
                <Badge variant={wh.status === "active" ? "success" : "secondary"} className="capitalize">
                  {wh.status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {wh.events.map((e) => (
                  <Badge key={e} variant="secondary" className="text-[10px]">
                    {e}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rate limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-brand" /> Rate limits
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Current usage windows</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {RATE_LIMITS.map((r) => {
            const pct = Math.min(100, Math.round((r.used / r.limit) * 100));
            const tone = pct >= 90 ? "bg-danger" : pct >= 75 ? "bg-amber-400" : "bg-brand";
            return (
              <div key={r.label}>
                <div className="mb-1.5 flex items-baseline justify-between text-xs">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-muted-foreground tabular">
                    {r.used.toLocaleString()} / {r.limit.toLocaleString()}
                  </span>
                </div>
                <Progress value={pct} indicatorClassName={tone} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WebhookIcon className="h-4 w-4" /> Add webhook
            </DialogTitle>
            <DialogDescription>
              We'll POST event payloads to this endpoint.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="wh-url">Endpoint URL</Label>
              <Input
                id="wh-url"
                placeholder="https://api.example.com/hooks/netics"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-events">Events (comma-separated)</Label>
              <Input
                id="wh-events"
                placeholder="call.completed, order.created"
                value={events}
                onChange={(e) => setEvents(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addWebhook}>Add webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
