"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, Bot, User, RotateCcw, Volume2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { SentimentBadge, ConfidenceMeter } from "@/components/shared/indicators";
import { getAIProvider } from "@/services";
import { currentOrg } from "@/lib/mock/db";
import { cn } from "@/lib/utils";
import type { Sentiment } from "@/types";
import type { DraftAgent } from "./types";

interface ChatTurn {
  id: string;
  role: "user" | "ai";
  text: string;
  sentiment?: Sentiment;
}

interface Analysis {
  intent: string;
  confidence: number;
  sentiment: Sentiment;
}

const SCENARIOS = [
  "I'd like to order a large pepperoni pizza.",
  "Can I book a table for four this Saturday?",
  "My last order was cold and an item was missing.",
  "What time do you close today?",
];

export function Playground({ agent }: { agent: DraftAgent }) {
  const provider = React.useMemo(() => getAIProvider(), []);
  const [turns, setTurns] = React.useState<ChatTurn[]>([
    { id: "seed", role: "ai", text: agent.greeting },
  ]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, streaming]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userTurn: ChatTurn = { id: `u_${Date.now()}`, role: "user", text };
    setTurns((prev) => [...prev, userTurn]);
    setInput("");
    setStreaming(true);
    setAnalysis(null);

    // Analyze the utterance in parallel with generating the reply.
    const [intent, sentiment] = await Promise.all([
      provider.detectIntent(text),
      provider.analyzeSentiment(text),
    ]);
    setAnalysis({ intent: intent.intent, confidence: intent.confidence, sentiment: sentiment.sentiment });
    setTurns((prev) =>
      prev.map((t) => (t.id === userTurn.id ? { ...t, sentiment: sentiment.sentiment } : t))
    );

    const aiId = `a_${Date.now()}`;
    setTurns((prev) => [...prev, { id: aiId, role: "ai", text: "" }]);
    setSpeaking(true);

    let acc = "";
    for await (const token of provider.streamReply({
      orgId: currentOrg.id,
      messages: [
        { role: "system", content: agent.personality },
        { role: "user", content: text },
      ],
      temperature: agent.temperature,
    })) {
      acc += token;
      setTurns((prev) => prev.map((t) => (t.id === aiId ? { ...t, text: acc } : t)));
    }

    setStreaming(false);
    // Keep the waveform "speaking" briefly after the last token for realism.
    setTimeout(() => setSpeaking(false), 600);
  }

  function reset() {
    setTurns([{ id: "seed", role: "ai", text: agent.greeting }]);
    setAnalysis(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {/* Chat column */}
      <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-brand">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{agent.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {agent.voice} · {agent.language}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {speaking ? (
              <div className="flex items-center gap-1.5 text-brand">
                <Volume2 className="h-3.5 w-3.5" />
                <VoiceWaveform active bars={14} className="h-5 w-20" />
              </div>
            ) : (
              <VoiceWaveform active={false} bars={14} className="h-5 w-20 opacity-40" />
            )}
            <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Reset conversation">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="flex flex-col gap-3 p-4">
            {turns.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2.5", t.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                <div
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                    t.role === "ai" ? "bg-brand/15 text-brand" : "bg-white/[0.06] text-muted-foreground"
                  )}
                >
                  {t.role === "ai" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className={cn("max-w-[78%] space-y-1", t.role === "user" && "items-end")}>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2 text-sm",
                      t.role === "ai"
                        ? "bg-brand/[0.10] text-foreground"
                        : "bg-white/[0.05] text-foreground"
                    )}
                  >
                    {t.text || (
                      <span className="inline-flex items-center gap-1">
                        <TypingDots />
                      </span>
                    )}
                  </div>
                  {t.sentiment && t.role === "user" && (
                    <SentimentBadge sentiment={t.sentiment} className="ml-auto" />
                  )}
                </div>
              </motion.div>
            ))}
            {streaming && turns[turns.length - 1]?.text === "" && (
              <p className="pl-9 text-[11px] text-muted-foreground">{agent.name} is typing…</p>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-white/[0.06] p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SCENARIOS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={streaming}
                className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-40"
              >
                {s.length > 34 ? `${s.slice(0, 32)}…` : s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a customer message to test the agent…"
              disabled={streaming}
            />
            <Button type="submit" size="icon" disabled={streaming || !input.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Live analysis column */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold-soft" /> Live analysis
          </p>
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div
                key={analysis.intent + analysis.confidence}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 space-y-3"
              >
                <div>
                  <p className="text-[11px] text-muted-foreground">Detected intent</p>
                  <Badge variant="gold" className="mt-1">{analysis.intent}</Badge>
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-muted-foreground">Confidence</p>
                  <ConfidenceMeter value={analysis.confidence} />
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-muted-foreground">Sentiment</p>
                  <SentimentBadge sentiment={analysis.sentiment} />
                </div>
              </motion.div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Send a message to see the AI's detected intent, confidence and sentiment.
              </p>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Gauge className="h-3.5 w-3.5 text-brand" /> Active config
          </p>
          <dl className="mt-3 space-y-2 text-xs">
            <Row label="Temperature" value={agent.temperature.toFixed(1)} />
            <Row label="Speech rate" value={`${agent.speechRate.toFixed(2)}×`} />
            <Row label="Response delay" value={`${agent.responseDelayMs} ms`} />
            <Row label="Emotion" value={`${Math.round(agent.emotionLevel * 100)}%`} />
            <Row label="Interruptions" value={agent.interruptions ? "On" : "Off"} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular">{value}</dd>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-brand"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
