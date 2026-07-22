"use client";

import * as React from "react";
import { toast } from "sonner";
import { Monitor, Smartphone, LogOut, Plus, Trash2, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveDot } from "@/components/shared/indicators";
import { SettingsSection, Field, ToggleRow } from "./settings-primitives";

interface SessionRow {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
  icon: typeof Monitor;
}

const SESSIONS: SessionRow[] = [
  {
    id: "s1",
    device: "MacBook Pro · Chrome",
    location: "New York, US",
    ip: "72.14.201.9",
    lastActive: "Active now",
    current: true,
    icon: Monitor,
  },
  {
    id: "s2",
    device: "iPhone 15 · Safari",
    location: "New York, US",
    ip: "72.14.201.44",
    lastActive: "2 hours ago",
    current: false,
    icon: Smartphone,
  },
  {
    id: "s3",
    device: "Windows · Edge",
    location: "London, UK",
    ip: "185.22.9.130",
    lastActive: "Yesterday",
    current: false,
    icon: Monitor,
  },
];

export function SectionSecurity({ onDirty }: { onDirty: () => void }) {
  const [mfa, setMfa] = React.useState(true);
  const [sso, setSso] = React.useState(false);
  const [sessions, setSessions] = React.useState<SessionRow[]>(SESSIONS);
  const [allowlist, setAllowlist] = React.useState<string[]>([
    "72.14.201.0/24",
  ]);
  const [newIp, setNewIp] = React.useState("");

  const revoke = (id: string) => {
    setSessions((s) => s.filter((x) => x.id !== id));
    toast.success("Session revoked");
  };

  const addIp = () => {
    const v = newIp.trim();
    if (!v) return;
    setAllowlist((a) => [...a, v]);
    setNewIp("");
    onDirty();
    toast.success("IP range added to allowlist");
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Authentication"
        description="Protect accounts with an extra layer of security."
      >
        <ToggleRow
          title="Multi-factor authentication (MFA)"
          description="Require a second factor at sign-in for all members."
          checked={mfa}
          onChange={(v) => {
            setMfa(v);
            onDirty();
            toast(v ? "MFA enabled" : "MFA disabled");
          }}
          badge={<Badge variant="success">Recommended</Badge>}
        />
        <ToggleRow
          title="Single sign-on (SSO)"
          description="SAML / OIDC via your identity provider."
          checked={sso}
          onChange={(v) => {
            setSso(v);
            onDirty();
          }}
          badge={<Badge variant="secondary">Enterprise</Badge>}
        />
      </SettingsSection>

      <SettingsSection
        title="Change password"
        description="Use a strong, unique password."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password" htmlFor="cur-pw" className="sm:col-span-2">
            <Input id="cur-pw" type="password" placeholder="••••••••••" />
          </Field>
          <Field label="New password" htmlFor="new-pw">
            <Input id="new-pw" type="password" placeholder="••••••••••" />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm-pw">
            <Input id="confirm-pw" type="password" placeholder="••••••••••" />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Password updated", {
                description: "You'll stay signed in on this device.",
              })
            }
          >
            <KeyRound className="h-4 w-4" /> Update password
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Active sessions"
        description="Devices currently signed in to your account."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSessions((s) => s.filter((x) => x.current));
              toast.success("Signed out of other sessions");
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out others
          </Button>
        }
      >
        <div className="space-y-2">
          {sessions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-brand">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{s.device}</p>
                    {s.current && (
                      <Badge variant="success">
                        <LiveDot className="h-1.5 w-1.5" /> This device
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.location} · {s.ip} · {s.lastActive}
                  </p>
                </div>
                {!s.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revoke(s.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        title="IP allowlist"
        description="Restrict workspace access to specific IP ranges."
      >
        <div className="space-y-2">
          {allowlist.map((ip, i) => (
            <div
              key={`${ip}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <span className="flex-1 font-mono text-sm">{ip}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setAllowlist((a) => a.filter((_, idx) => idx !== i));
                  onDirty();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newIp}
              placeholder="e.g. 203.0.113.0/24"
              className="font-mono"
              onChange={(e) => setNewIp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIp()}
            />
            <Button variant="outline" onClick={addIp}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
