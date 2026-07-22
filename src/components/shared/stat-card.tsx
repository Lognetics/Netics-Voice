"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "./animated-counter";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** e.g. "$", "" */
  prefix?: string;
  suffix?: string;
  decimals?: number;
  compact?: boolean;
  /** Percentage change vs. previous period, e.g. 0.12 = +12% */
  delta?: number;
  /** Small trend series for the sparkline. */
  trend?: number[];
  accent?: "brand" | "gold" | "success" | "danger";
  className?: string;
}

const accentMap = {
  brand: {
    text: "text-brand",
    bg: "bg-brand/12",
    glow: "group-hover:shadow-glow",
    stroke: "#3A86FF",
  },
  gold: {
    text: "text-gold-soft",
    bg: "bg-gold/12",
    glow: "group-hover:shadow-glow-gold",
    stroke: "#C9A227",
  },
  success: {
    text: "text-success",
    bg: "bg-success/12",
    glow: "group-hover:shadow-glow-green",
    stroke: "#00C896",
  },
  danger: {
    text: "text-danger",
    bg: "bg-danger/12",
    glow: "",
    stroke: "#FF4D4F",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  prefix = "",
  suffix = "",
  decimals = 0,
  compact = false,
  delta,
  trend,
  accent = "brand",
  className,
}: StatCardProps) {
  const a = accentMap[accent];
  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Card
        className={cn(
          "relative overflow-hidden p-5 transition-shadow duration-300",
          a.glow,
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className={cn("rounded-xl p-2.5", a.bg)}>
            <Icon className={cn("h-5 w-5", a.text)} />
          </div>
          {delta !== undefined && (
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                positive
                  ? "bg-success/12 text-success"
                  : "bg-danger/12 text-danger"
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular tracking-tight">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              compact={compact}
            />
          </p>
        </div>

        {trend && trend.length > 1 && (
          <div className="mt-3 h-9">
            <Sparkline data={trend} stroke={a.stroke} />
          </div>
        )}
      </Card>
    </motion.div>
  );
}
