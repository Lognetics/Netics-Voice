"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { PLANS, CURRENT_PLAN_ID } from "./plans";

export function PlanCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PLANS.map((plan, i) => {
        const isCurrent = plan.id === CURRENT_PLAN_ID;
        const isEnterprise = plan.id === "enterprise";
        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Card
              className={cn(
                "relative flex h-full flex-col p-6",
                plan.highlighted && "ring-1 ring-brand/40 shadow-glow"
              )}
            >
              {plan.highlighted && (
                <Badge variant="default" className="absolute right-5 top-5 gap-1">
                  <Sparkles className="h-3 w-3" /> Popular
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">{plan.name}</h3>
                {isCurrent && <Badge variant="success">Current</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>

              <div className="mt-4 flex items-baseline gap-1">
                {isEnterprise ? (
                  <span className="text-3xl font-semibold tracking-tight">Custom</span>
                ) : (
                  <>
                    <span className="text-3xl font-semibold tracking-tight">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full"
                variant={isCurrent ? "outline" : plan.highlighted ? "gold" : "secondary"}
                disabled={isCurrent}
                onClick={() =>
                  isEnterprise
                    ? toast.success("Sales team notified - we'll reach out shortly")
                    : toast.success(`Upgrade to ${plan.name} requested`)
                }
              >
                {isCurrent
                  ? "Current plan"
                  : isEnterprise
                  ? "Contact sales"
                  : `Upgrade to ${plan.name}`}
              </Button>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
