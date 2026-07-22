"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Settings,
  Building2,
  Palette,
  Users,
  ShieldCheck,
  Lock,
  Globe,
  DatabaseBackup,
  Globe2,
  ScrollText,
  Save,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionOrganization } from "./_components/section-organization";
import { SectionBranding } from "./_components/section-branding";
import { SectionUsers } from "./_components/section-users";
import { SectionSecurity } from "./_components/section-security";
import { SectionPrivacy } from "./_components/section-privacy";
import { SectionLocalization } from "./_components/section-localization";
import { SectionBackup } from "./_components/section-backup";
import { SectionDomains } from "./_components/section-domains";
import { SectionAudit } from "./_components/section-audit";

type SectionKey =
  | "organization"
  | "branding"
  | "users"
  | "security"
  | "privacy"
  | "localization"
  | "backup"
  | "domains"
  | "audit";

interface NavItem {
  key: SectionKey;
  label: string;
  description: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { key: "organization", label: "Organization", description: "Identity & contact", icon: Building2 },
  { key: "branding", label: "Branding", description: "Logo, colors & voice", icon: Palette },
  { key: "users", label: "Users & Roles", description: "Team & permissions", icon: Users },
  { key: "security", label: "Security", description: "MFA, SSO & sessions", icon: Lock },
  { key: "privacy", label: "Privacy & Compliance", description: "GDPR & retention", icon: ShieldCheck },
  { key: "localization", label: "Languages", description: "Locale & formats", icon: Globe },
  { key: "backup", label: "Backup", description: "Snapshots & restore", icon: DatabaseBackup },
  { key: "domains", label: "Custom Domains", description: "Bring your own domain", icon: Globe2 },
  { key: "audit", label: "Audit Log", description: "Activity history", icon: ScrollText },
];

export default function SettingsPage() {
  const [active, setActive] = React.useState<SectionKey>("organization");
  const [dirty, setDirty] = React.useState(false);
  const markDirty = React.useCallback(() => setDirty(true), []);

  const saveAll = () => {
    setDirty(false);
    toast.success("Settings saved", {
      description: "Your changes are live across the workspace.",
    });
  };

  const discard = () => {
    setDirty(false);
    toast("Changes discarded");
  };

  const activeItem = NAV.find((n) => n.key === active)!;

  const renderSection = () => {
    switch (active) {
      case "organization":
        return <SectionOrganization onDirty={markDirty} />;
      case "branding":
        return <SectionBranding onDirty={markDirty} />;
      case "users":
        return <SectionUsers onDirty={markDirty} />;
      case "security":
        return <SectionSecurity onDirty={markDirty} />;
      case "privacy":
        return <SectionPrivacy onDirty={markDirty} />;
      case "localization":
        return <SectionLocalization onDirty={markDirty} />;
      case "backup":
        return <SectionBackup onDirty={markDirty} />;
      case "domains":
        return <SectionDomains />;
      case "audit":
        return <SectionAudit />;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        icon={<Settings className="h-5 w-5" />}
        title="Settings"
        description="Manage your workspace, team, security and compliance."
        actions={
          <>
            <Button variant="ghost" onClick={discard} disabled={!dirty}>
              <RotateCcw className="h-4 w-4" /> Discard
            </Button>
            <Button variant="gold" onClick={saveAll} disabled={!dirty}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sub-nav */}
        <nav className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={cn(
                    "group flex w-full shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "border-white/[0.08] bg-white/[0.05]"
                      : "border-transparent hover:bg-white/[0.03]"
                  )}
                >
                  <div
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                      isActive
                        ? "bg-brand/15 text-brand"
                        : "bg-white/[0.04] text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="hidden min-w-0 lg:block">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground/70">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-sm font-medium lg:hidden">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Active section */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <activeItem.icon className="h-4 w-4 text-brand" />
                <h2 className="text-lg font-semibold tracking-tight">
                  {activeItem.label}
                </h2>
              </div>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent save bar */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
          >
            <div className="flex items-center gap-3 rounded-full glass px-4 py-2.5 shadow-soft">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground">
                You have unsaved changes
              </span>
              <Button variant="ghost" size="sm" onClick={discard}>
                Discard
              </Button>
              <Button variant="gold" size="sm" onClick={saveAll}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
