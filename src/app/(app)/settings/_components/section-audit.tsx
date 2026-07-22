"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, CheckCircle2, XCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auditLogs } from "@/lib/mock/db";
import { timeAgo } from "@/lib/utils";
import { SettingsSection } from "./settings-primitives";

export function SectionAudit() {
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const sorted = [...auditLogs].sort(
      (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
    );
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (l) =>
        l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.ip.includes(q)
    );
  }, [query]);

  return (
    <SettingsSection
      title="Audit log"
      description="A record of security-relevant actions in this workspace."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast.success("Audit log exported", {
              description: "CSV download will begin shortly.",
            })
          }
        >
          <Download className="h-4 w-4" /> Export
        </Button>
      }
    >
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actor, action, IP…"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <ScrollArea className="max-h-[420px]">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/[0.06] bg-base-card text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Actor</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Target</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">IP</th>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-2.5 font-medium">{l.actor}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.action}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {l.target}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-2.5 font-mono text-xs text-muted-foreground sm:table-cell">
                    {l.ip}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {timeAgo(l.timestamp)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {l.status === "success" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-danger-soft">
                        <XCircle className="h-3.5 w-3.5" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No entries match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </SettingsSection>
  );
}
