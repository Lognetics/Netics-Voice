"use client";

import * as React from "react";
import {
  MapPin, Phone, Users, PhoneCall, Star, DollarSign, Bot, TrendingUp,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AreaTrend } from "@/components/shared/charts";
import { ConfidenceMeter } from "@/components/shared/indicators";
import { formatCurrency, cn } from "@/lib/utils";
import type { Branch } from "@/types";
import { STATUS_META, branchTrend, aiResolution, revenuePerStaff } from "./branch-utils";

function Metric({
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
      <p className={cn("mt-1 text-lg font-semibold tabular", tone)}>{value}</p>
    </div>
  );
}

export function BranchDetailDialog({
  branch,
  open,
  onOpenChange,
}: {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!branch) return null;
  const meta = STATUS_META[branch.status];
  const trend = branchTrend(branch);
  const res = aiResolution(branch);
  const chartData = trend.map((v, i) => ({ day: `D${i + 1}`, calls: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{branch.name}</DialogTitle>
            <Badge variant={meta.badge}>{meta.label}</Badge>
          </div>
          <DialogDescription className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {branch.address} · {branch.city}, {branch.country}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            icon={DollarSign}
            label="Revenue / mo"
            value={formatCurrency(branch.monthlyRevenue, { compact: true })}
            tone="text-gold-soft"
          />
          <Metric icon={PhoneCall} label="Calls today" value={String(branch.callsToday)} tone="text-success" />
          <Metric icon={Users} label="Staff" value={String(branch.staffCount)} />
          <Metric
            icon={Star}
            label="Rating"
            value={branch.rating.toFixed(1)}
            tone="text-gold-soft"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Manager</span>
              <span className="font-medium">{branch.managerName}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> Phone
              </span>
              <span className="font-medium">{branch.phone}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Revenue / staff</span>
              <span className="font-medium tabular">
                {formatCurrency(revenuePerStaff(branch), { compact: true })}
              </span>
            </div>
            <Separator />
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                <Bot className="h-3.5 w-3.5" /> AI resolution rate
              </div>
              <ConfidenceMeter value={res} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Call volume · last 12 periods
            </div>
            <AreaTrend
              data={chartData}
              xKey="day"
              series={[{ key: "calls", color: meta.dot, name: "Calls" }]}
              height={180}
              showGrid={false}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm">
          <span className="text-muted-foreground">AI personality: </span>
          <span className="italic">“{branch.aiPersonality}”</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
