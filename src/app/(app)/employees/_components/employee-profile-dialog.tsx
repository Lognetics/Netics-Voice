"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Mail, Phone, Building2, MapPin, PhoneCall, Smile, Clock,
  ShieldCheck, History, TrendingUp,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarSeries } from "@/components/shared/charts";
import { initials, timeAgo, cn } from "@/lib/utils";
import type { Branch, User } from "@/types";
import {
  ROLE_META, STATUS_META, PERMISSION_CATALOG, hasPermission,
  employeeTrend, takeoverHistory, scheduleGrid, productivityScore,
} from "./employee-utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFTS = ["Morning", "Midday", "Evening", "Night"];

export function EmployeeProfileDialog({
  user,
  branchCity,
  open,
  onOpenChange,
}: {
  user: User | null;
  branchCity?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!user) return null;

  const role = ROLE_META[user.role];
  const status = STATUS_META[user.status];
  const trend = employeeTrend(user);
  const takeovers = takeoverHistory(user);
  const grid = scheduleGrid(user);
  const prod = productivityScore(user);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-base-primary"
                style={{ backgroundColor: status.dot }}
              />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {user.name}
                <Badge variant={role.badge}>{role.label}</Badge>
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {user.email}
                </span>
                <Badge variant={status.badge}>{status.label}</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Stat icon={PhoneCall} label="Calls" value={user.callsHandled.toLocaleString()} tone="text-brand" />
          <Stat icon={Smile} label="CSAT" value={user.csat.toFixed(1)} tone="text-success" />
          <Stat icon={TrendingUp} label="Productivity" value={`${prod}%`} tone="text-gold-soft" />
          <Stat icon={Clock} label="Active" value={timeAgo(user.lastActive)} />
        </div>

        <Tabs defaultValue="performance">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="takeovers">Takeovers</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-4 pt-4">
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <Detail icon={Building2} label="Department" value={user.department ?? "-"} />
              <Detail icon={MapPin} label="Branch" value={branchCity ?? "-"} />
              <Detail icon={Phone} label="Phone" value={user.phone ?? "-"} />
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Calls handled · this week
              </p>
              <BarSeries
                data={trend}
                xKey="day"
                series={[{ key: "calls", color: "#3A86FF", name: "Calls" }]}
                height={180}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Productivity score</span>
                <span className="font-medium tabular">{prod}%</span>
              </div>
              <Progress value={prod} />
            </div>
          </TabsContent>

          {/* Takeovers */}
          <TabsContent value="takeovers" className="pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <History className="h-3.5 w-3.5" /> Human takeover history - when this
              agent stepped in for the AI
            </p>
            <div className="space-y-2">
              {takeovers.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand/12 text-brand">
                    <History className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(new Date(Date.now() - t.minsAgo * 60_000))}
                    </p>
                  </div>
                  <Badge variant={t.outcome === "Resolved" ? "success" : "warning"}>
                    {t.outcome}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule" className="pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Weekly availability
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-[420px]">
                <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1.5">
                  <span />
                  {DAYS.map((d) => (
                    <span key={d} className="text-center text-[11px] text-muted-foreground">
                      {d}
                    </span>
                  ))}
                  {SHIFTS.map((shift, r) => (
                    <React.Fragment key={shift}>
                      <span className="flex items-center text-[11px] text-muted-foreground">
                        {shift}
                      </span>
                      {grid[r].map((on, c) => (
                        <div
                          key={c}
                          className={cn(
                            "h-7 rounded-md border",
                            on
                              ? "border-success/40 bg-success/20"
                              : "border-white/[0.05] bg-white/[0.02]"
                          )}
                          title={`${DAYS[c]} · ${shift} · ${on ? "Available" : "Off"}`}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Permissions */}
          <TabsContent value="permissions" className="pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Access controls
              {user.permissions.includes("*") && (
                <Badge variant="gold" className="ml-1">Full access</Badge>
              )}
            </p>
            <ScrollArea className="max-h-64 pr-3">
              <div className="space-y-1">
                {PERMISSION_CATALOG.map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/[0.02]"
                  >
                    <span className="text-sm">{p.label}</span>
                    <Switch
                      defaultChecked={hasPermission(user, p.key)}
                      onCheckedChange={(v) =>
                        toast.info(v ? "Permission granted" : "Permission revoked", {
                          description: `${p.label} · ${user.name}`,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "text-foreground",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={cn("mt-1 text-base font-semibold tabular", tone)}>{value}</p>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
