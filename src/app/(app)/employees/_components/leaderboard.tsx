"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Trophy, PhoneCall, Smile } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials, cn } from "@/lib/utils";
import type { User } from "@/types";
import { ROLE_META } from "./employee-utils";

const MEDALS = ["#C9A227", "#B8C1CC", "#CD7F32"];

function Row({
  user,
  rank,
  metric,
}: {
  user: User;
  rank: number;
  metric: string;
}) {
  const medal = MEDALS[rank];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5"
    >
      <div
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold"
        style={
          medal
            ? { backgroundColor: `${medal}22`, color: medal }
            : { backgroundColor: "rgba(255,255,255,0.04)", color: "#8b93a1" }
        }
      >
        {rank < 3 ? <Trophy className="h-3.5 w-3.5" /> : rank + 1}
      </div>
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback>{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {ROLE_META[user.role].label} · {user.department}
        </p>
      </div>
      <span className={cn("shrink-0 text-sm font-semibold tabular", medal ? "" : "text-muted-foreground")} style={medal ? { color: medal } : undefined}>
        {metric}
      </span>
    </motion.div>
  );
}

export function Leaderboard({ employees }: { employees: User[] }) {
  const agents = React.useMemo(
    () => employees.filter((e) => e.role === "agent" || e.role === "manager"),
    [employees]
  );
  const byCalls = React.useMemo(
    () => [...agents].sort((a, b) => b.callsHandled - a.callsHandled).slice(0, 6),
    [agents]
  );
  const byCsat = React.useMemo(
    () => [...agents].sort((a, b) => b.csat - a.csat).slice(0, 6),
    [agents]
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold" /> Leaderboard
        </CardTitle>
        <Badge variant="gold">Top performers</Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calls">
          <TabsList>
            <TabsTrigger value="calls">
              <PhoneCall className="h-3.5 w-3.5" /> Calls
            </TabsTrigger>
            <TabsTrigger value="csat">
              <Smile className="h-3.5 w-3.5" /> CSAT
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calls" className="space-y-2 pt-4">
            {byCalls.map((u, i) => (
              <Row key={u.id} user={u} rank={i} metric={u.callsHandled.toLocaleString()} />
            ))}
          </TabsContent>
          <TabsContent value="csat" className="space-y-2 pt-4">
            {byCsat.map((u, i) => (
              <Row key={u.id} user={u} rank={i} metric={`★ ${u.csat.toFixed(1)}`} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
