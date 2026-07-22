"use client";

import * as React from "react";
import { CreditCard, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AreaTrend } from "@/components/shared/charts";
import { invoices } from "@/lib/mock";
import { formatCurrency } from "@/lib/utils";
import type { UsageMetric } from "@/types";
import { PLANS, CURRENT_PLAN_ID } from "./_components/plans";
import { UsageMeter } from "./_components/usage-meter";
import { PlanCards } from "./_components/plan-cards";
import { InvoicesTable } from "./_components/invoices-table";
import { PaymentMethodCard } from "./_components/payment-method";

const usage: UsageMetric[] = [
  { label: "AI minutes", used: 8420, limit: 12000, unit: "min" },
  { label: "Storage", used: 46, limit: 100, unit: "GB" },
  { label: "API calls", used: 184300, limit: 250000, unit: "calls" },
  { label: "Seats", used: 11, limit: 15, unit: "seats" },
];

// Seeded monthly spend for the trend chart.
const spendTrend = [
  { month: "Feb", spend: 449 },
  { month: "Mar", spend: 449 },
  { month: "Apr", spend: 512 },
  { month: "May", spend: 604 },
  { month: "Jun", spend: 588 },
  { month: "Jul", spend: 641 },
];

export default function BillingPage() {
  const current = PLANS.find((p) => p.id === CURRENT_PLAN_ID)!;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CreditCard className="h-5 w-5" />}
        title="Billing & Usage"
        description="Manage your plan, monitor consumption, and review invoices."
        actions={
          <Button variant="gold" onClick={() => toast.success("Upgrade flow opened")}>
            <Sparkles className="h-4 w-4" /> Upgrade plan
          </Button>
        }
      />

      {/* Current plan + usage */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {current.name} plan <Badge variant="default">Active</Badge>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(current.price)}/mo · renews Aug 1, 2026
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-2xl font-semibold tabular">{formatCurrency(641)}</p>
              <p className="text-xs text-muted-foreground">estimated this cycle</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {usage.map((m) => (
                <UsageMeter key={m.label} metric={m} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spend over time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gold-soft" /> Spend over time
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <AreaTrend
              data={spendTrend}
              xKey="month"
              series={[{ key: "spend", color: "#C9A227", name: "Spend" }]}
              height={200}
              formatter={(v) => formatCurrency(v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Plan comparison */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Plans</h2>
          <p className="text-sm text-muted-foreground">
            Upgrade any time — changes are prorated automatically.
          </p>
        </div>
        <PlanCards />
      </div>

      <Separator />

      {/* Payment + invoices */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PaymentMethodCard />
        <div className="lg:col-span-2">
          <InvoicesTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
}
