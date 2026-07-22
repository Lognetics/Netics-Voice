"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  PhoneCall, PhoneMissed, Timer, Bot, Radio, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveDot } from "@/components/shared/indicators";
import { EmptyState } from "@/components/shared/empty-state";
import { calls, liveCalls } from "@/lib/mock";
import { toast } from "sonner";
import { LiveCallCard } from "./_components/live-call-card";
import { RecentCalls } from "./_components/recent-calls";

// Derive KPIs from the calls dataset (fixed dataset, computed once).
const completed = calls.filter((c) => c.status === "completed");
const missed = calls.filter((c) => c.status === "missed");
const aiHandled = calls.filter((c) => c.aiHandled);
const answered = calls.filter((c) => c.status !== "missed" && c.durationSec > 0);
const avgDuration = answered.length
  ? Math.round(answered.reduce((s, c) => s + c.durationSec, 0) / answered.length)
  : 0;
const aiResolutionRate = calls.length ? aiHandled.length / calls.length : 0;

// A ministack sparkline series for texture.
const trend = (base: number, n = 12) =>
  Array.from({ length: n }, (_, i) => base + Math.round(Math.sin(i / 1.7) * base * 0.14) + (i % 3));

// Show every "live" call, and reuse the front of the completed list as extra
// live-styled cards so the command center feels busy.
const liveDeck = [
  ...liveCalls,
  ...completed.filter((c) => c.transcript.length > 2).slice(0, 3),
];

export default function CallsPage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Call Center"
        description="Monitor every AI-handled conversation in real time and jump in when it matters."
        icon={<Radio className="h-5 w-5" />}
        actions={
          <>
            <Badge variant="success" className="gap-1.5">
              <LiveDot /> {liveDeck.length} live now
            </Badge>
            <Button
              variant="gold"
              onClick={() => toast.success("Barge mode enabled - you'll be notified on low-confidence calls")}
            >
              <Sparkles className="h-4 w-4" /> Barge mode
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Live calls"
          value={liveDeck.length}
          icon={Radio}
          accent="success"
          trend={trend(liveDeck.length)}
        />
        <StatCard
          label="Handled today"
          value={completed.length}
          icon={PhoneCall}
          accent="brand"
          delta={0.084}
          trend={trend(completed.length)}
        />
        <StatCard
          label="Avg duration"
          value={avgDuration}
          icon={Timer}
          accent="gold"
          suffix="s"
          trend={trend(avgDuration)}
        />
        <StatCard
          label="AI resolution"
          value={aiResolutionRate * 100}
          icon={Bot}
          accent="brand"
          suffix="%"
          decimals={0}
          delta={0.031}
          trend={trend(Math.round(aiResolutionRate * 100))}
        />
        <StatCard
          label="Missed"
          value={missed.length}
          icon={PhoneMissed}
          accent="danger"
          delta={-0.052}
          trend={trend(missed.length)}
        />
      </div>

      {/* Live calls grid */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <LiveDot />
          <h2 className="text-sm font-semibold">Active conversations</h2>
          <Badge variant="secondary">{liveDeck.length}</Badge>
        </div>

        {!mounted ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-white/[0.02]" />
            ))}
          </div>
        ) : liveDeck.length === 0 ? (
          <EmptyState
            icon={PhoneCall}
            title="No live calls right now"
            description="When customers call, their AI-handled conversations will appear here in real time."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {liveDeck.map((c, i) => (
              <LiveCallCard key={c.id} call={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Recent calls */}
      {mounted ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <RecentCalls calls={calls.filter((c) => c.status !== "live")} />
        </motion.div>
      ) : (
        <Card className="h-64 animate-pulse bg-white/[0.02]" />
      )}
    </div>
  );
}
