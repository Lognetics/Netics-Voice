"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SettingsSection, Field, ToggleRow } from "./settings-primitives";

const RETENTION = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "forever", label: "Keep forever" },
];

export function SectionPrivacy({ onDirty }: { onDirty: () => void }) {
  const [gdpr, setGdpr] = React.useState(true);
  const [anonymize, setAnonymize] = React.useState(false);
  const [recording, setRecording] = React.useState(true);
  const [consentBanner, setConsentBanner] = React.useState(true);
  const [retention, setRetention] = React.useState("365");
  const [confirmText, setConfirmText] = React.useState("");

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Compliance"
        description="Regulatory controls for data handling."
      >
        <ToggleRow
          title="GDPR mode"
          description="Enforce EU data-processing rules and right-to-erasure."
          checked={gdpr}
          onChange={(v) => {
            setGdpr(v);
            onDirty();
          }}
        />
        <ToggleRow
          title="Anonymize customer PII"
          description="Mask names and numbers in transcripts and analytics."
          checked={anonymize}
          onChange={(v) => {
            setAnonymize(v);
            onDirty();
          }}
        />
        <ToggleRow
          title="Call recording"
          description="Record and store call audio for quality review."
          checked={recording}
          onChange={(v) => {
            setRecording(v);
            onDirty();
          }}
        />
        <ToggleRow
          title="Consent banner"
          description="Play a recorded consent notice at call start."
          checked={consentBanner}
          onChange={(v) => {
            setConsentBanner(v);
            onDirty();
          }}
        />
      </SettingsSection>

      <SettingsSection
        title="Data retention"
        description="How long we keep call, order and booking records."
      >
        <Field label="Retention period" className="max-w-xs">
          <Select
            value={retention}
            onValueChange={(v) => {
              setRetention(v);
              onDirty();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RETENTION.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </SettingsSection>

      <SettingsSection
        title="Your data"
        description="Export a copy of your workspace data at any time."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Export started", {
                description: "We'll email a download link when it's ready.",
              })
            }
          >
            <Download className="h-4 w-4" /> Export all data
          </Button>
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <div className="rounded-2xl border border-danger/30 bg-danger/[0.04] p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-danger-soft" />
          <h3 className="text-base font-semibold text-danger-soft">
            Danger zone
          </h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete this workspace and all associated data. This cannot
          be undone.
        </p>
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" /> Delete workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete workspace?</DialogTitle>
                <DialogDescription>
                  This will permanently remove all calls, orders, bookings and
                  team members. Type <b>DELETE</b> to confirm.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
              />
              <DialogFooter>
                <Button
                  variant="destructive"
                  disabled={confirmText !== "DELETE"}
                  onClick={() => {
                    setConfirmText("");
                    toast.error("Workspace scheduled for deletion (demo).");
                  }}
                >
                  I understand, delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
