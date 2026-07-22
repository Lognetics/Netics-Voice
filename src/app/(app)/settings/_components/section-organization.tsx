"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Phone, Building2 } from "lucide-react";
import type { Organization } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currentOrg } from "@/lib/mock/db";
import { INDUSTRY_LABELS } from "@/lib/constants";
import type { Industry } from "@/types";
import { SettingsSection, Field } from "./settings-primitives";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Singapore",
  "Africa/Lagos",
];

const PLAN_VARIANT: Record<Organization["plan"], "secondary" | "success" | "gold"> = {
  starter: "secondary",
  growth: "success",
  enterprise: "gold",
};

export function SectionOrganization({ onDirty }: { onDirty: () => void }) {
  const [name, setName] = React.useState(currentOrg.name);
  const [website, setWebsite] = React.useState(currentOrg.website ?? "");
  const [industry, setIndustry] = React.useState<Industry>(currentOrg.industry);
  const [timezone, setTimezone] = React.useState(currentOrg.timezone);
  const [phones, setPhones] = React.useState<string[]>(currentOrg.phoneNumbers);
  const [newPhone, setNewPhone] = React.useState("");

  const touch = () => onDirty();

  const addPhone = () => {
    const v = newPhone.trim();
    if (!v) return;
    setPhones((p) => [...p, v]);
    setNewPhone("");
    touch();
    toast.success("Phone number added");
  };

  const removePhone = (idx: number) => {
    setPhones((p) => p.filter((_, i) => i !== idx));
    touch();
    toast("Phone number removed");
  };

  return (
    <SettingsSection
      title="Organization"
      description="Your workspace identity and contact details."
      actions={
        <Badge variant={PLAN_VARIANT[currentOrg.plan]} className="capitalize">
          <Building2 className="h-3 w-3" /> {currentOrg.plan} plan
        </Badge>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organization name" htmlFor="org-name">
          <Input
            id="org-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              touch();
            }}
          />
        </Field>
        <Field label="Website" htmlFor="org-website">
          <Input
            id="org-website"
            value={website}
            placeholder="example.com"
            onChange={(e) => {
              setWebsite(e.target.value);
              touch();
            }}
          />
        </Field>
        <Field label="Industry">
          <Select
            value={industry}
            onValueChange={(v) => {
              setIndustry(v as Industry);
              touch();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(INDUSTRY_LABELS) as Industry[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {INDUSTRY_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Timezone">
          <Select
            value={timezone}
            onValueChange={(v) => {
              setTimezone(v);
              touch();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Phone numbers" hint="Numbers your AI employee answers on.">
        <div className="space-y-2">
          {phones.map((p, i) => (
            <div
              key={`${p}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <Phone className="h-4 w-4 text-brand" />
              <span className="flex-1 text-sm tabular">{p}</span>
              <Badge variant="success">Active</Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removePhone(i)}
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newPhone}
              placeholder="+1 (555) 000-0000"
              onChange={(e) => setNewPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPhone()}
            />
            <Button variant="outline" onClick={addPhone}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </Field>
    </SettingsSection>
  );
}
