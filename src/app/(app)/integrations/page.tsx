"use client";

import * as React from "react";
import { Plug, PlugZap, HeartPulse, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { integrations as seedIntegrations } from "@/lib/mock";
import type { Integration } from "@/types";
import { IntegrationCard } from "./_components/integration-card";
import { ConfigureDialog } from "./_components/configure-dialog";

const NOW_ISO = new Date().toISOString();

export default function IntegrationsPage() {
  const [items, setItems] = React.useState<Integration[]>(seedIntegrations);
  const [category, setCategory] = React.useState("All");
  const [configuring, setConfiguring] = React.useState<Integration | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(seedIntegrations.map((i) => i.category)))],
    []
  );

  const connectedCount = items.filter((i) => i.connected).length;
  const healthy = items.filter((i) => i.connected && i.status === "healthy").length;
  const syncing = items.filter((i) => i.connected && i.status === "syncing").length;
  const errors = items.filter((i) => i.connected && i.status === "error").length;

  const visible =
    category === "All" ? items : items.filter((i) => i.category === category);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const nowConnected = !i.connected;
        toast[nowConnected ? "success" : "message"](
          nowConnected ? `${i.name} connected` : `${i.name} disconnected`
        );
        return nowConnected
          ? { ...i, connected: true, status: "healthy", lastSync: NOW_ISO }
          : { ...i, connected: false, status: undefined, lastSync: undefined };
      })
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<PlugZap className="h-5 w-5" />}
        title="Integrations"
        description="Connect NETICS Voice to the tools that run your business."
      />

      {/* Health summary strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Connected" value={connectedCount} icon={Plug} accent="brand" />
        <StatCard label="Healthy" value={healthy} icon={HeartPulse} accent="success" />
        <StatCard label="Syncing" value={syncing} icon={RefreshCw} accent="gold" />
        <StatCard label="Errors" value={errors} icon={AlertTriangle} accent="danger" />
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <div className="overflow-x-auto pb-1">
          <TabsList>
            {categories.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={category}>
          {visible.length === 0 ? (
            <EmptyState
              icon={Plug}
              title="No integrations here"
              description="Try a different category to find more connections."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((i) => (
                <IntegrationCard
                  key={i.id}
                  integration={i}
                  connected={i.connected}
                  status={i.status}
                  lastSync={i.lastSync}
                  onToggle={() => toggle(i.id)}
                  onConfigure={() => {
                    setConfiguring(i);
                    setDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ConfigureDialog
        integration={configuring}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
