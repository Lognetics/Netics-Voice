"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  DatabaseBackup,
  History,
  CloudDownload,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";
import { NOW } from "@/lib/constants";
import { SettingsSection, Field, ToggleRow } from "./settings-primitives";

const FREQUENCIES = [
  { value: "hourly", label: "Every hour" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

/** Deterministic recent backups relative to NOW. */
const RESTORE_POINTS = [
  { id: "b1", when: new Date(NOW.getTime() - 6 * 3600_000).toISOString(), size: "1.8 GB" },
  { id: "b2", when: new Date(NOW.getTime() - 30 * 3600_000).toISOString(), size: "1.7 GB" },
  { id: "b3", when: new Date(NOW.getTime() - 54 * 3600_000).toISOString(), size: "1.7 GB" },
];

export function SectionBackup({ onDirty }: { onDirty: () => void }) {
  const [auto, setAuto] = React.useState(true);
  const [frequency, setFrequency] = React.useState("daily");
  const [busy, setBusy] = React.useState(false);

  const backupNow = () => {
    setBusy(true);
    toast.loading("Creating backup…", { id: "backup" });
    window.setTimeout(() => {
      setBusy(false);
      toast.success("Backup complete", {
        id: "backup",
        description: "1.8 GB snapshot stored securely.",
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Automatic backups"
        description="Keep a rolling snapshot of your workspace data."
        actions={
          <Button size="sm" onClick={backupNow} disabled={busy}>
            <DatabaseBackup className="h-4 w-4" />
            {busy ? "Backing up…" : "Backup now"}
          </Button>
        }
      >
        <ToggleRow
          title="Enable auto-backup"
          description="Automatically snapshot on the schedule below."
          checked={auto}
          onChange={(v) => {
            setAuto(v);
            onDirty();
          }}
          badge={
            auto ? <Badge variant="success">On</Badge> : <Badge variant="secondary">Off</Badge>
          }
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Frequency">
            <Select
              value={frequency}
              onValueChange={(v) => {
                setFrequency(v);
                onDirty();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Last backup">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              {timeAgo(RESTORE_POINTS[0].when)}
              <span className="text-muted-foreground">· {RESTORE_POINTS[0].size}</span>
            </div>
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Restore points"
        description="Roll back to a previous snapshot."
        actions={
          <Badge variant="secondary">
            <History className="h-3 w-3" /> {RESTORE_POINTS.length} available
          </Badge>
        }
      >
        <div className="space-y-2">
          {RESTORE_POINTS.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/12 text-brand">
                <CloudDownload className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {new Date(r.when).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(r.when)} · {r.size}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast("Restore requested", {
                    description: "You'll be asked to confirm before we proceed.",
                  })
                }
              >
                Restore
              </Button>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}
