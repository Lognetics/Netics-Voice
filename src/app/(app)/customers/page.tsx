"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Crown,
  Gauge,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { customers } from "@/lib/mock";
import { formatCurrency, initials } from "@/lib/utils";
import { CustomersTable } from "./_components/customers-table";
import { RiskBadge, TierBadge } from "./_components/customer-helpers";

export default function CustomersPage() {
  const stats = React.useMemo(() => {
    const total = customers.length;
    const vips = customers.filter((c) => c.isVip).length;
    const atRisk = customers.filter((c) => c.riskLevel === "high").length;
    const avgLtv =
      customers.reduce((s, c) => s + c.lifetimeValue, 0) / (total || 1);
    const avgLead =
      customers.reduce((s, c) => s + c.leadScore, 0) / (total || 1);
    return { total, vips, atRisk, avgLtv, avgLead };
  }, []);

  const topSpenders = React.useMemo(
    () =>
      [...customers]
        .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
        .slice(0, 3),
    []
  );

  const atRiskCustomers = React.useMemo(
    () =>
      [...customers]
        .filter((c) => c.riskLevel === "high")
        .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
        .slice(0, 3),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Your AI-enriched customer relationship hub."
        icon={<Users className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/analytics">
                <TrendingUp className="h-4 w-4" /> Insights
              </Link>
            </Button>
            <Button onClick={() => toast("Customer creation is coming soon.")}>
              <UserPlus className="h-4 w-4" /> Add customer
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Total customers"
          value={stats.total}
          icon={Users}
          accent="brand"
        />
        <StatCard
          label="VIP customers"
          value={stats.vips}
          icon={Crown}
          accent="gold"
        />
        <StatCard
          label="Avg lifetime value"
          value={Math.round(stats.avgLtv)}
          icon={Wallet}
          prefix="$"
          compact
          accent="success"
        />
        <StatCard
          label="Avg lead score"
          value={Math.round(stats.avgLead)}
          icon={Gauge}
          accent="brand"
        />
        <StatCard
          label="At-risk customers"
          value={stats.atRisk}
          icon={AlertTriangle}
          accent="danger"
        />
      </div>

      {/* AI insights highlight cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <InsightCard
          title="At-risk customers"
          accent="danger"
          icon={<AlertTriangle className="h-4 w-4" />}
          people={atRiskCustomers}
          empty="No high-risk customers right now."
        />
        <InsightCard
          title="Top spenders"
          accent="gold"
          icon={<Crown className="h-4 w-4" />}
          people={topSpenders}
          empty="No customers yet."
        />
      </div>

      {/* Table */}
      <CustomersTable data={customers} />
    </div>
  );
}

function InsightCard({
  title,
  icon,
  accent,
  people,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  accent: "danger" | "gold";
  people: typeof customers;
  empty: string;
}) {
  const accentClasses =
    accent === "danger"
      ? "bg-danger/12 text-danger"
      : "bg-gold/12 text-gold-soft";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`grid h-8 w-8 place-items-center rounded-lg ${accentClasses}`}
          >
            {icon}
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> AI insight
        </span>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {people.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {empty}
          </p>
        )}
        {people.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              href={`/customers/${c.id}`}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={c.avatarUrl} alt={c.name} />
                <AvatarFallback>{initials(c.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  {accent === "danger" ? (
                    <RiskBadge level={c.riskLevel} />
                  ) : (
                    <TierBadge tier={c.loyaltyTier} />
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {c.aiInsight}
                </p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-sm font-semibold tabular">
                  {formatCurrency(c.lifetimeValue)}
                </p>
                <p className="text-[11px] text-muted-foreground">lifetime</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
