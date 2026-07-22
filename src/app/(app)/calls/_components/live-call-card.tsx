"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Headphones, MicOff, Mic, PhoneForwarded, PhoneOff, Globe,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  LiveDot, SentimentBadge, ConfidenceMeter,
} from "@/components/shared/indicators";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { formatDuration, avatarUrl, initials, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Call } from "@/types";

const speakerColor: Record<string, string> = {
  ai: "#3A86FF",
  customer: "#C9A227",
  agent: "#00C896",
};

const speakerLabel: Record<string, string> = {
  ai: "AI",
  customer: "Caller",
  agent: "Agent",
};

/** A single simulated live-call card with a ticking timer + revealing transcript. */
export function LiveCallCard({ call, index }: { call: Call; index: number }) {
  // Live-updating duration timer.
  const [elapsed, setElapsed] = React.useState(call.durationSec);
  const [muted, setMuted] = React.useState(false);
  const [ended, setEnded] = React.useState(false);

  // Reveal transcript turns over time to simulate a live conversation.
  const turns = call.transcript;
  const [visibleTurns, setVisibleTurns] = React.useState(1);
  const [aiTyping, setAiTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [ended]);

  React.useEffect(() => {
    if (ended) return;
    // Stagger reveal per-card so they don't all update in lockstep.
    const period = 2600 + index * 350;
    const t = setInterval(() => {
      setVisibleTurns((v) => {
        if (v >= turns.length) return 1; // loop the demo transcript
        return v + 1;
      });
    }, period);
    return () => clearInterval(t);
  }, [ended, turns.length, index]);

  // Show an "AI typing" indicator briefly before the next AI turn appears.
  React.useEffect(() => {
    if (ended) return;
    const next = turns[visibleTurns];
    if (next?.speaker === "ai") {
      setAiTyping(true);
      const t = setTimeout(() => setAiTyping(false), 900);
      return () => clearTimeout(t);
    }
    setAiTyping(false);
  }, [visibleTurns, turns, ended]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleTurns, aiTyping]);

  const shown = turns.slice(0, visibleTurns);

  if (ended) {
    return (
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0.6 }} className="h-full">
        <Card className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
          <PhoneOff className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">Call ended</p>
          <p className="text-xs text-muted-foreground">
            {call.customerName} · {formatDuration(elapsed)}
          </p>
          <Button variant="ghost" size="sm" onClick={() => { setEnded(false); setElapsed(call.durationSec); }}>
            Restore
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="relative flex h-full flex-col overflow-hidden p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-brand/30">
            <AvatarImage src={avatarUrl(call.customerName)} alt={call.customerName} />
            <AvatarFallback>{initials(call.customerName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{call.customerName}</p>
              <Badge variant="gold" className="shrink-0">{call.intent}</Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <span>{call.customerPhone}</span>
              <span className="text-white/20">·</span>
              <Globe className="h-3 w-3" />
              <span>{call.language}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              <LiveDot />
              LIVE
            </span>
            <span className="font-mono text-xs tabular text-muted-foreground">
              {formatDuration(elapsed)}
            </span>
          </div>
        </div>

        {/* Waveform + meters */}
        <div className="mt-4 flex items-center gap-3">
          <VoiceWaveform
            active={!muted}
            bars={22}
            color={muted ? "#5b6478" : "#3A86FF"}
            className="h-8 flex-1"
          />
          <SentimentBadge sentiment={call.sentiment} showEmoji={false} />
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>AI confidence</span>
          </div>
          <ConfidenceMeter value={call.confidence} />
        </div>

        {/* Live transcript snippet */}
        <div
          ref={scrollRef}
          className="mt-4 h-28 space-y-2 overflow-y-auto rounded-lg border border-white/[0.05] bg-white/[0.015] p-3 text-xs"
        >
          {shown.map((turn) => (
            <motion.div
              key={turn.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="leading-relaxed"
            >
              <span
                className="mr-1.5 font-semibold"
                style={{ color: speakerColor[turn.speaker] }}
              >
                {speakerLabel[turn.speaker]}:
              </span>
              <span className="text-muted-foreground">{turn.text}</span>
            </motion.div>
          ))}
          {aiTyping && (
            <div className="flex items-center gap-1.5 text-brand">
              <span className="font-semibold">AI</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-1 w-1 rounded-full bg-brand"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                  />
                ))}
              </span>
              <span className="text-[10px] text-muted-foreground">typing…</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          <ActionBtn
            icon={Headphones}
            label="Take over"
            onClick={() => toast.success(`Taking over ${call.customerName}'s call`)}
          />
          <ActionBtn
            icon={muted ? Mic : MicOff}
            label={muted ? "Unmute AI" : "Mute AI"}
            active={muted}
            onClick={() => {
              setMuted((m) => !m);
              toast(muted ? "AI unmuted" : "AI muted");
            }}
          />
          <ActionBtn
            icon={PhoneForwarded}
            label="Transfer"
            onClick={() => toast.success(`Transferring ${call.customerName} to a human agent`)}
          />
          <ActionBtn
            icon={PhoneOff}
            label="End call"
            danger
            onClick={() => {
              setEnded(true);
              toast.error(`Ended call with ${call.customerName}`);
            }}
          />
        </div>
      </Card>
    </motion.div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  danger,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground focus-ring",
            danger && "hover:border-danger/40 hover:bg-danger/10 hover:text-danger",
            active && "border-brand/40 bg-brand/10 text-brand"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="truncate">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
