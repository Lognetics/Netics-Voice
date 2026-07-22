"use client";

import * as React from "react";
import { Code2, KeyRound, Webhook, ScrollText, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiKeys, webhooks } from "@/lib/mock";
import { requestLogs } from "./_components/data";
import { ApiKeysTab } from "./_components/api-keys-tab";
import { WebhooksTab } from "./_components/webhooks-tab";
import { LogsTab } from "./_components/logs-tab";
import { DocsTab } from "./_components/docs-tab";

export default function ApiManagementPage() {
  const activeKeys = apiKeys.filter((k) => k.status === "active").length;
  const activeHooks = webhooks.filter((w) => w.status === "active").length;
  const errorRate = Math.round(
    (requestLogs.filter((r) => r.status >= 400).length / requestLogs.length) * 100
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Code2 className="h-5 w-5" />}
        title="API Management"
        description="Keys, webhooks, request logs, and developer docs."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active keys" value={activeKeys} icon={KeyRound} accent="brand" />
        <StatCard label="Webhooks" value={activeHooks} icon={Webhook} accent="success" />
        <StatCard
          label="Requests (24h)"
          value={184300}
          icon={ScrollText}
          accent="gold"
          compact
        />
        <StatCard
          label="Error rate"
          value={errorRate}
          icon={BookOpen}
          suffix="%"
          accent={errorRate > 5 ? "danger" : "success"}
        />
      </div>

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">
            <KeyRound className="h-4 w-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="logs">
            <ScrollText className="h-4 w-4" /> Logs
          </TabsTrigger>
          <TabsTrigger value="docs">
            <BookOpen className="h-4 w-4" /> Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <ApiKeysTab />
        </TabsContent>
        <TabsContent value="webhooks">
          <WebhooksTab />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
        <TabsContent value="docs">
          <DocsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
