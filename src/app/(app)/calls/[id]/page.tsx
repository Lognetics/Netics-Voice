"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, PhoneOff, Bot, User, Clock, MessageSquareText, Reply,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AreaTrend } from "@/components/shared/charts";
import { LiveDot } from "@/components/shared/indicators";
import { calls, customers } from "@/lib/mock";
import { formatDuration, timeAgo, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Sentiment } from "@/types";
import { TranscriptPlayback } from "./_components/transcript-playback";
import { CallSidePanel } from "./_components/call-side-panel";

// Map sentiment → numeric score for the timeline chart.
const sentimentScore: Record<Sentiment, number> = {
  frustrated: 20,
  negative: 40,
  neutral: 65,
  positive: 90,
};

const SUGGESTED_REPLIES = [
  "Offer a loyalty discount",
  "Confirm the delivery address",
  "Escalate to a manager",
  "Send an SMS confirmation",
  "Ask if there's anything else",
];

export default function CallDetailPage({ params }: { params: { id: string } }) {
  const call = calls.find((c) => c.id === params.id);

  if (!call) {
    return (
      <div className="space-y-6">
        <PageHeader title="Call not found" icon={<PhoneOff className="h-5 w-5" />} />
        <EmptyState
          icon={PhoneOff}
          title="We couldn't find that call"
          description="It may have been removed, or the link is incorrect."
          action={
            <Button asChild>
              <Link href="/calls"><ArrowLeft className="h-4 w-4" /> Back to call center</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const customer = customers.find((c) => c.id === call.customerId);
  const isLive = call.status === "live";

  // Build a per-turn sentiment timeline; carry the last known sentiment forward.
  let last: Sentiment = "neutral";
  const timeline = call.transcript.map((t) => {
    if (t.sentiment) last = t.sentiment;
    return { t: formatDuration(t.timestamp), score: sentimentScore[last] };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={call.customerName}
        description={`${call.intent} · ${call.language} · ${call.customerPhone}`}
        icon={<MessageSquareText className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/calls"><ArrowLeft className="h-4 w-4" /> Back</Link>
            </Button>
            {isLive ? (
              <Badge variant="success" className="gap-1.5"><LiveDot /> Live</Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-3 w-3" /> {timeAgo(call.startedAt)}
              </Badge>
            )}
          </>
        }
      />

      {/* Meta strip */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant={call.status === "escalated" ? "warning" : call.status === "missed" ? "danger" : "success"} className="capitalize">
          {call.status}
        </Badge>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            call.aiHandled ? "border-brand/25 bg-brand/10 text-brand" : "border-gold/25 bg-gold/10 text-gold-soft"
          )}
        >
          {call.aiHandled ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
          {call.aiHandled ? "AI handled" : `Human · ${call.escalatedTo ?? "agent"}`}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {formatDuration(call.durationSec)}
        </span>
        {call.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="capitalize">{tag}</Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Conversation</CardTitle>
                <Badge variant="secondary">{call.transcript.length} turns</Badge>
              </CardHeader>
              <CardContent>
                <TranscriptPlayback transcript={call.transcript} duration={call.durationSec} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Sentiment timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sentiment over time</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                How the caller's mood shifted through the call
              </p>
            </CardHeader>
            <CardContent>
              <AreaTrend
                data={timeline}
                xKey="t"
                series={[{ key: "score", color: "#00C896", name: "Sentiment" }]}
                height={180}
                showGrid={false}
                formatter={(v) => `${v}/100`}
              />
            </CardContent>
          </Card>

          {/* Suggested replies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Reply className="h-4 w-4 text-brand" /> AI suggested replies
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {SUGGESTED_REPLIES.map((s) => (
                <button
                  key={s}
                  onClick={() => toast.success(`Sent: "${s}"`)}
                  className="rounded-full border border-brand/20 bg-brand/[0.06] px-3.5 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand/15 focus-ring"
                >
                  {s}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <CallSidePanel call={call} customer={customer} />
      </div>
    </div>
  );
}
