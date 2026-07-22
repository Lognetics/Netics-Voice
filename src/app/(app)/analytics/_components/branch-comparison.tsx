"use client";

import * as React from "react";
import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { branches } from "@/lib/mock/db";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

const statusTone: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  open: "success",
  busy: "warning",
  closed: "secondary",
};

/** Branch comparison table sorted by monthly revenue. */
export function BranchComparison() {
  const ranked = [...branches].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
  const maxRev = ranked[0]?.monthlyRevenue || 1;
  const avgRev = branches.reduce((s, b) => s + b.monthlyRevenue, 0) / branches.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
            <th className="pb-2 font-medium">Branch</th>
            <th className="pb-2 text-right font-medium">Monthly Rev.</th>
            <th className="pb-2 text-right font-medium">Calls Today</th>
            <th className="pb-2 text-right font-medium">Staff</th>
            <th className="pb-2 text-right font-medium">Rating</th>
            <th className="pb-2 text-right font-medium">vs Avg</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((b) => {
            const vsAvg = (b.monthlyRevenue - avgRev) / avgRev;
            const up = vsAvg >= 0;
            return (
              <tr
                key={b.id}
                className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
              >
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.city}</span>
                    <Badge variant={statusTone[b.status] ?? "secondary"} className="capitalize">
                      {b.status}
                    </Badge>
                  </div>
                  <div className="mt-1.5 h-1 w-32 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${(b.monthlyRevenue / maxRev) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="py-2.5 text-right tabular font-medium">
                  {formatCurrency(b.monthlyRevenue, { compact: true })}
                </td>
                <td className="py-2.5 text-right tabular text-muted-foreground">
                  {formatNumber(b.callsToday)}
                </td>
                <td className="py-2.5 text-right tabular text-muted-foreground">{b.staffCount}</td>
                <td className="py-2.5 text-right">
                  <span className="inline-flex items-center gap-1 tabular">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    {b.rating.toFixed(1)}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 tabular text-xs font-medium",
                      up ? "text-success" : "text-danger"
                    )}
                  >
                    {up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(vsAvg * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
