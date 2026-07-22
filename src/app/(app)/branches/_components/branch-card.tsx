"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Users, PhoneCall, Star, MoreVertical,
  Eye, Bot, GitCompare,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LiveDot } from "@/components/shared/indicators";
import { Sparkline } from "@/components/shared/sparkline";
import { formatCurrency, cn } from "@/lib/utils";
import type { Branch } from "@/types";
import { STATUS_META, branchTrend } from "./branch-utils";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating)
              ? "fill-gold text-gold"
              : "text-white/15"
          )}
        />
      ))}
      <span className="ml-1 text-xs font-medium tabular text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function BranchCard({
  branch,
  index,
  onView,
}: {
  branch: Branch;
  index: number;
  onView: (b: Branch) => void;
}) {
  const status = STATUS_META[branch.status];
  const trend = React.useMemo(() => branchTrend(branch), [branch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="group glass flex h-full flex-col p-5 transition-shadow duration-300 hover:shadow-glow">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <LiveDot color={status.dot} />
              <h3 className="truncate text-base font-semibold">{branch.name}</h3>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {branch.city}, {branch.country}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Badge variant={status.badge}>{status.label}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{branch.city}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(branch)}>
                  <Eye className="h-4 w-4" /> View details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.info("AI personality", {
                      description: `${branch.name}: “${branch.aiPersonality}”`,
                    })
                  }
                >
                  <Bot className="h-4 w-4" /> Edit AI
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.success("Added to comparison", {
                      description: `${branch.name} queued in the performance comparison.`,
                    })
                  }
                >
                  <GitCompare className="h-4 w-4" /> Compare
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Manager</p>
            <p className="mt-0.5 truncate font-medium">{branch.managerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="mt-0.5 flex items-center gap-1 truncate font-medium">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {branch.phone}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Staff</p>
            <p className="mt-0.5 flex items-center gap-1 font-medium">
              <Users className="h-3.5 w-3.5 text-brand" />
              {branch.staffCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Calls today</p>
            <p className="mt-0.5 flex items-center gap-1 font-medium">
              <PhoneCall className="h-3.5 w-3.5 text-success" />
              {branch.callsToday}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Monthly revenue</p>
            <p className="mt-0.5 text-lg font-semibold tabular text-gold-soft">
              {formatCurrency(branch.monthlyRevenue, { compact: true })}
            </p>
          </div>
          <Stars rating={branch.rating} />
        </div>

        <div className="mt-3 h-9 border-t border-white/[0.05] pt-2">
          <Sparkline data={trend} stroke={status.dot} />
        </div>

        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onView(branch)}
          >
            <Eye className="h-4 w-4" /> View branch
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
