"use client";

import * as React from "react";
import { toast } from "sonner";
import { UserPlus, ShieldCheck } from "lucide-react";
import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employees } from "@/lib/mock/db";
import { initials } from "@/lib/utils";
import { SettingsSection } from "./settings-primitives";

const ROLE_VARIANT: Record<
  User["role"],
  "gold" | "default" | "success" | "secondary" | "outline"
> = {
  owner: "gold",
  admin: "default",
  manager: "success",
  agent: "secondary",
  analyst: "secondary",
  viewer: "outline",
};

const ROLES: User["role"][] = ["admin", "manager", "agent", "analyst", "viewer"];

/** Permission matrix: categories × roles. */
const PERMISSION_CATEGORIES = [
  "Calls & Conversations",
  "Orders & Bookings",
  "Customers",
  "AI Studio",
  "Billing",
  "Settings & Users",
];

const MATRIX_ROLES: User["role"][] = ["admin", "manager", "agent", "viewer"];

/** Seed default access so the matrix isn't empty. */
function defaultMatrix(): Record<string, Record<string, boolean>> {
  const m: Record<string, Record<string, boolean>> = {};
  for (const cat of PERMISSION_CATEGORIES) {
    m[cat] = {};
    for (const role of MATRIX_ROLES) {
      const full = role === "admin";
      const manager = role === "manager" && cat !== "Billing";
      const agent =
        role === "agent" &&
        ["Calls & Conversations", "Orders & Bookings", "Customers"].includes(cat);
      const viewer =
        role === "viewer" &&
        ["Calls & Conversations", "Customers"].includes(cat);
      m[cat][role] = full || manager || agent || viewer;
    }
  }
  return m;
}

export function SectionUsers({ onDirty }: { onDirty: () => void }) {
  const [matrix, setMatrix] = React.useState(defaultMatrix);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<User["role"]>("agent");
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const roster = employees.slice(0, 8);

  const toggleCell = (cat: string, role: string) => {
    setMatrix((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [role]: !prev[cat][role] },
    }));
    onDirty();
  };

  const invite = () => {
    if (!inviteEmail.trim()) {
      toast.error("Enter an email to invite.");
      return;
    }
    toast.success("Invitation sent", {
      description: `${inviteEmail} invited as ${inviteRole}.`,
    });
    setInviteEmail("");
    setInviteOpen(false);
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Team members"
        description={`${employees.length} people have access to this workspace.`}
        actions={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4" /> Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a team member</DialogTitle>
                <DialogDescription>
                  They&apos;ll receive an email to join {`{workspace}`} with the
                  role you choose.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as User["role"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={invite}>Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Member</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                  Department
                </th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {roster.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatarUrl} alt={u.name} />
                        <AvatarFallback>{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">
                    {u.department ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={ROLE_VARIANT[u.role]} className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-2.5 text-right md:table-cell">
                    <span className="text-xs capitalize text-muted-foreground">
                      {u.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Roles & permissions"
        description="Fine-tune what each role can access."
        actions={
          <Badge variant="secondary">
            <ShieldCheck className="h-3 w-3" /> {MATRIX_ROLES.length} roles
          </Badge>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Capability</th>
                {MATRIX_ROLES.map((r) => (
                  <th
                    key={r}
                    className="px-4 py-3 text-center font-medium capitalize"
                  >
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_CATEGORIES.map((cat) => (
                <tr
                  key={cat}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="px-4 py-2.5 font-medium">{cat}</td>
                  {MATRIX_ROLES.map((r) => (
                    <td key={r} className="px-4 py-2.5 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={matrix[cat][r]}
                          onCheckedChange={() => toggleCell(cat, r)}
                          className="scale-90"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  );
}
