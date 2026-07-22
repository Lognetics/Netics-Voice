"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SentimentBadge, ConfidenceMeter } from "@/components/shared/indicators";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { formatDuration, cn } from "@/lib/utils";
import type { TranscriptTurn } from "@/types";

const speakerMeta: Record<
  TranscriptTurn["speaker"],
  { label: string; color: string; bubble: string; align: string; ring: string }
> = {
  ai: {
    label: "AI",
    color: "#3A86FF",
    bubble: "bg-brand/10 border-brand/20",
    align: "items-start",
    ring: "ring-brand/40",
  },
  customer: {
    label: "Caller",
    color: "#C9A227",
    bubble: "bg-white/[0.03] border-white/[0.06]",
    align: "items-end",
    ring: "ring-gold/40",
  },
  agent: {
    label: "Agent",
    color: "#00C896",
    bubble: "bg-success/10 border-success/20",
    align: "items-start",
    ring: "ring-success/40",
  },
};

export function TranscriptPlayback({
  transcript,
  duration,
}: {
  transcript: TranscriptTurn[];
  duration: number;
}) {
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0); // seconds
  const total = Math.max(duration, transcript[transcript.length - 1]?.timestamp ?? 0, 1);

  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPosition((p) => {
        if (p >= total) {
          setPlaying(false);
          return total;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, total]);

  const activeIndex = transcript.reduce(
    (acc, turn, i) => (turn.timestamp <= position ? i : acc),
    0
  );

  return (
    <div className="space-y-4">
      {/* Player bar */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant={playing ? "secondary" : "gold"}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setPosition((p) => Math.max(0, p - 10))}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setPosition((p) => Math.min(total, p + 10))}>
            <SkipForward className="h-4 w-4" />
          </Button>
          <VoiceWaveform active={playing} bars={40} className="h-8 flex-1" />
          <span className="font-mono text-xs tabular text-muted-foreground">
            {formatDuration(position)} / {formatDuration(total)}
          </span>
        </div>
        {/* Scrubber */}
        <div
          className="mt-3 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/[0.06]"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setPosition(Math.round(ratio * total));
          }}
        >
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${(position / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Transcript bubbles */}
      <div className="space-y-4">
        {transcript.map((turn, i) => {
          const m = speakerMeta[turn.speaker];
          const isActive = i === activeIndex && playing;
          const isCustomer = turn.speaker === "customer";
          return (
            <motion.div
              key={turn.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className={cn("flex flex-col gap-1", isCustomer ? "items-end" : "items-start")}
            >
              <div className={cn("flex max-w-[85%] gap-2.5", isCustomer && "flex-row-reverse")}>
                <Avatar className={cn("h-8 w-8 shrink-0 ring-2", m.ring)}>
                  <AvatarFallback style={{ color: m.color }} className="text-[10px] font-bold">
                    {m.label.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "rounded-2xl border px-3.5 py-2.5 transition-shadow",
                    m.bubble,
                    isActive && "shadow-glow"
                  )}
                >
                  <div className={cn("mb-1 flex items-center gap-2", isCustomer && "flex-row-reverse")}>
                    <span className="text-xs font-semibold" style={{ color: m.color }}>
                      {m.label}
                    </span>
                    <span className="font-mono text-[10px] tabular text-muted-foreground">
                      {formatDuration(turn.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{turn.text}</p>
                  {(turn.sentiment || turn.confidence !== undefined) && (
                    <div className={cn("mt-2 flex items-center gap-2", isCustomer && "flex-row-reverse")}>
                      {turn.sentiment && <SentimentBadge sentiment={turn.sentiment} showEmoji={false} />}
                      {turn.confidence !== undefined && (
                        <div className="w-20">
                          <ConfidenceMeter value={turn.confidence} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
