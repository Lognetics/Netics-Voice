"use client";

import * as React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Settings2, Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";
import type { Integration } from "@/types";

const statusMeta: Record<
  NonNullable<Integration["status"]>,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"]; dot: string }
> = {
  healthy: { label: "Healthy", variant: "success", dot: "bg-success" },
  syncing: { label: "Syncing", variant: "warning", dot: "bg-amber-400 animate-pulse" },
  error: { label: "Error", variant: "danger", dot: "bg-danger" },
};

export function IntegrationCard({
  integration,
  connected,
  status,
  lastSync,
  onToggle,
  onConfigure,
}: {
  integration: Integration;
  connected: boolean;
  status?: Integration["status"];
  lastSync?: string;
  onToggle: () => void;
  onConfigure: () => void;
}) {
  const Icon = (Icons[integration.logo as keyof typeof Icons] ??
    Icons.Plug) as React.ComponentType<{ className?: string }>;
  const sm = status ? statusMeta[status] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="group flex h-full flex-col p-5 transition-shadow duration-300 hover:shadow-glow">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "grid h-11 w-11 place-items-center rounded-xl border border-white/[0.06]",
              connected ? "bg-brand/12 text-brand" : "bg-white/[0.04] text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {connected ? (
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3 text-success" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline">Available</Badge>
          )}
        </div>

        <div className="mt-4 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{integration.name}</h3>
            <Badge variant="secondary" className="text-[10px]">
              {integration.category}
            </Badge>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {integration.description}
          </p>
        </div>

        {connected && sm && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
            <span className="flex items-center gap-2 text-xs">
              <span className={cn("h-2 w-2 rounded-full", sm.dot)} />
              <span className="text-muted-foreground">{sm.label}</span>
            </span>
            {lastSync && (
              <span className="text-xs text-muted-foreground">
                Synced {timeAgo(lastSync)}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {connected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onConfigure}
              >
                <Settings2 className="h-4 w-4" /> Configure
              </Button>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" className="flex-1" onClick={onToggle}>
              <Plus className="h-4 w-4" /> Connect
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
