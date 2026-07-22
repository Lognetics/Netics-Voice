"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users, Wifi, Smile, PhoneCall, Building2, Search, Crown,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  employees as seedEmployees, departments, branches, currentOrg,
} from "@/lib/mock/db";
import { initials, timeAgo, avatarUrl } from "@/lib/utils";
import type { User, UserRole } from "@/types";
import {
  ROLE_META, STATUS_META, PERMISSION_CATALOG,
} from "./_components/employee-utils";
import { InviteUserDialog, type NewUserInput } from "./_components/invite-user-dialog";
import { EmployeeProfileDialog } from "./_components/employee-profile-dialog";
import { Leaderboard } from "./_components/leaderboard";

const ROLES = Object.keys(ROLE_META) as UserRole[];
const STATUSES = Object.keys(STATUS_META) as User["status"][];

export default function EmployeesPage() {
  const [people, setPeople] = React.useState<User[]>(seedEmployees);
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [deptFilter, setDeptFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<User | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const branchCity = React.useCallback(
    (branchId?: string) => branches.find((b) => b.id === branchId)?.city ?? "—",
    []
  );

  const openProfile = (u: User) => {
    setSelected(u);
    setProfileOpen(true);
  };

  const handleInvite = (input: NewUserInput) => {
    const nu: User = {
      id: `usr_local_${Date.now()}`,
      orgId: currentOrg.id,
      name: input.name,
      email: input.email,
      avatarUrl: avatarUrl(input.name),
      role: input.role,
      department: input.department,
      branchId: branches[0]?.id,
      status: "offline",
      lastActive: new Date().toISOString(),
      phone: "+1 (212) 555-0100",
      permissions: ["calls.view"],
      callsHandled: 0,
      csat: 0,
      createdAt: new Date().toISOString(),
    };
    setPeople((prev) => [nu, ...prev]);
  };

  /* ---- KPIs ---- */
  const kpis = React.useMemo(() => {
    const online = people.filter((p) => p.status === "online" || p.status === "on_call").length;
    const rated = people.filter((p) => p.csat > 0);
    const avgCsat = rated.length
      ? rated.reduce((s, p) => s + p.csat, 0) / rated.length
      : 0;
    const calls = people.reduce((s, p) => s + p.callsHandled, 0);
    return {
      total: people.length,
      online,
      avgCsat,
      calls,
      departments: departments.length,
    };
  }, [people]);

  /* ---- department headcounts (from live people) ---- */
  const deptCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    people.forEach((p) => {
      if (p.department) map.set(p.department, (map.get(p.department) ?? 0) + 1);
    });
    return map;
  }, [people]);

  /* ---- filtered directory ---- */
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((p) => {
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (deptFilter !== "all" && p.department !== deptFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.email.toLowerCase().includes(q) &&
        !(p.department ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [people, query, roleFilter, deptFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title="Employee Management"
        description="Your team and AI working side by side across every branch."
        actions={<InviteUserDialog departments={departments} onInvite={handleInvite} />}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total employees" value={kpis.total} icon={Users} accent="brand" />
        <StatCard label="Online now" value={kpis.online} icon={Wifi} accent="success" />
        <StatCard label="Avg CSAT" value={kpis.avgCsat} icon={Smile} decimals={1} accent="gold" />
        <StatCard label="Calls handled" value={kpis.calls} icon={PhoneCall} compact accent="brand" />
        <StatCard label="Departments" value={kpis.departments} icon={Building2} accent="gold" />
      </div>

      {/* Department overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {departments.map((d, i) => {
          const count = deptCounts.get(d.name) ?? d.headcount;
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="relative overflow-hidden p-4">
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: d.color }}
                />
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <p className="text-sm font-medium">{d.name}</p>
                </div>
                <p className="mt-3 text-2xl font-semibold tabular">{count}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Lead · {d.lead}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Directory + leaderboard */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand" /> Team directory
            </CardTitle>
            {/* Filters */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, department…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_META[r].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No team members found"
                description="Try adjusting your search or filters."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Member</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                      <th className="px-3 py-2 font-medium">Department</th>
                      <th className="px-3 py-2 font-medium">Branch</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Calls</th>
                      <th className="px-3 py-2 text-right font-medium">CSAT</th>
                      <th className="px-3 py-2 font-medium">Active</th>
                      <th className="px-3 py-2 font-medium">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const role = ROLE_META[p.role];
                      const status = STATUS_META[p.status];
                      const permCount = p.permissions.includes("*")
                        ? PERMISSION_CATALOG.length
                        : p.permissions.filter((x) =>
                            PERMISSION_CATALOG.some((c) => c.key === x)
                          ).length;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => openProfile(p)}
                          className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={p.avatarUrl} alt={p.name} />
                                  <AvatarFallback>{initials(p.name)}</AvatarFallback>
                                </Avatar>
                                <span
                                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-base-primary"
                                  style={{ backgroundColor: status.dot }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{p.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {p.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant={role.badge}>{role.label}</Badge>
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {p.department ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {branchCity(p.branchId)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: status.dot }}
                              />
                              <span className="text-xs">{status.label}</span>
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right tabular">
                            {p.callsHandled.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular">
                            {p.csat > 0 ? p.csat.toFixed(1) : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">
                            {timeAgo(p.lastActive)}
                          </td>
                          <td className="px-3 py-2.5">
                            {p.permissions.includes("*") ? (
                              <Badge variant="gold" className="gap-1">
                                <Crown className="h-3 w-3" /> Full
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground tabular">
                                {permCount}/{PERMISSION_CATALOG.length}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {people.length} team members
            </p>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Leaderboard employees={people} />
      </div>

      <EmployeeProfileDialog
        user={selected}
        branchCity={branchCity(selected?.branchId)}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </div>
  );
}
