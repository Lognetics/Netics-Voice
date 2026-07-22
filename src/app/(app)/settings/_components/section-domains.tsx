"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Globe2, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SettingsSection, Field } from "./settings-primitives";

type DomainStatus = "verified" | "pending" | "failed";

interface DomainRow {
  id: string;
  host: string;
  status: DomainStatus;
}

const STATUS_META: Record<
  DomainStatus,
  { label: string; variant: "success" | "warning" | "danger"; icon: typeof CheckCircle2 }
> = {
  verified: { label: "Verified", variant: "success", icon: CheckCircle2 },
  pending: { label: "Pending", variant: "warning", icon: Clock },
  failed: { label: "Failed", variant: "danger", icon: XCircle },
};

const SEED: DomainRow[] = [
  { id: "d1", host: "voice.bellacucina.com", status: "verified" },
  { id: "d2", host: "support.bellacucina.com", status: "pending" },
];

export function SectionDomains() {
  const [domains, setDomains] = React.useState<DomainRow[]>(SEED);
  const [host, setHost] = React.useState("");

  const add = () => {
    const v = host.trim().toLowerCase();
    if (!v) return;
    setDomains((d) => [...d, { id: `d${Date.now()}`, host: v, status: "pending" }]);
    setHost("");
    toast.success("Domain added", {
      description: "Add the DNS records below to verify ownership.",
    });
  };

  const remove = (id: string) => {
    setDomains((d) => d.filter((x) => x.id !== id));
    toast("Domain removed");
  };

  return (
    <SettingsSection
      title="Custom domains"
      description="Serve your voice widget and portal from your own domain."
    >
      <Field label="Add a domain">
        <div className="flex gap-2">
          <Input
            value={host}
            placeholder="voice.yourbrand.com"
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button variant="outline" onClick={add}>
            <Plus className="h-4 w-4" /> Add domain
          </Button>
        </div>
      </Field>

      <div className="space-y-2">
        {domains.map((d) => {
          const meta = STATUS_META[d.status];
          const Icon = meta.icon;
          return (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-brand">
                <Globe2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.host}</p>
                <p className="truncate text-xs text-muted-foreground">
                  CNAME → cname.netics-voice.app
                </p>
              </div>
              <Badge variant={meta.variant}>
                <Icon className={cn("h-3 w-3")} /> {meta.label}
              </Badge>
              {d.status !== "verified" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDomains((prev) =>
                      prev.map((x) =>
                        x.id === d.id ? { ...x, status: "verified" } : x
                      )
                    );
                    toast.success(`${d.host} verified`);
                  }}
                >
                  Verify
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(d.id)}
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}
