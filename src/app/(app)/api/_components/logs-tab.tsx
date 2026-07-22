"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";
import { auditLogs } from "@/lib/mock";
import { requestLogs, methodTone } from "./data";

function statusColor(code: number) {
  if (code < 300) return "text-success";
  if (code < 400) return "text-brand-soft";
  if (code < 500) return "text-amber-400";
  return "text-danger";
}

export function LogsTab() {
  return (
    <div className="space-y-4">
      {/* API request logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API requests</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Live tail of the last requests to your API.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
                  <th className="px-6 py-2 font-medium">Method</th>
                  <th className="px-4 py-2 font-medium">Endpoint</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Latency</th>
                  <th className="px-6 py-2 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {requestLogs.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-2.5">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold",
                          methodTone[r.method].badge
                        )}
                      >
                        {r.method}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.endpoint}</td>
                    <td className={cn("px-4 py-2.5 font-mono text-xs font-semibold", statusColor(r.status))}>
                      {r.status}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                      {r.latency}ms
                    </td>
                    <td className="px-6 py-2.5 text-right text-muted-foreground">
                      {timeAgo(r.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit trail */}
      <Card>
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Security-relevant account activity.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
                  <th className="px-6 py-2 font-medium">Actor</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Target</th>
                  <th className="px-4 py-2 font-medium">IP</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-6 py-2 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 12).map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-2.5 font-medium">{a.actor}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{a.action}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {a.target}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {a.ip}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={a.status === "success" ? "success" : "danger"} className="capitalize">
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-2.5 text-right text-muted-foreground">
                      {timeAgo(a.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
