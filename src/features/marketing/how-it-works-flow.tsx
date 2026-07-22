"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneIncoming,
  Sparkles,
  BrainCircuit,
  BookOpen,
  CalendarCheck,
  BarChart3,
  PhoneCall,
  ShoppingCart,
  Users,
  Languages,
  ShieldCheck,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { LiveDot } from "@/components/shared/indicators";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

/* ============================================================= *
 *  Section 1 - The Call Journey (animated pipeline + live chat) *
 * ============================================================= */

interface Stage {
  icon: LucideIcon;
  label: string;
  detail: string;
  accent: string;
}

const STAGES: Stage[] = [
  {
    icon: PhoneIncoming,
    label: "Call received",
    detail: "Answered in under a second, day or night. No hold music, no missed calls.",
    accent: "#3A86FF",
  },
  {
    icon: Sparkles,
    label: "AI greets naturally",
    detail: "A branded, human-sounding voice welcomes the caller in their language.",
    accent: "#C9A227",
  },
  {
    icon: BrainCircuit,
    label: "Understands intent",
    detail: "Real-time speech-to-text, intent detection, and entity extraction.",
    accent: "#00C896",
  },
  {
    icon: BookOpen,
    label: "Retrieves knowledge",
    detail: "RAG pulls the exact answer from your menus, policies, and live availability.",
    accent: "#3A86FF",
  },
  {
    icon: CalendarCheck,
    label: "Completes the task",
    detail: "Books the table, takes the order, or transfers to a human if needed.",
    accent: "#C9A227",
  },
  {
    icon: BarChart3,
    label: "Logs & learns",
    detail: "Everything is saved to the CRM with sentiment, summary, and next-best action.",
    accent: "#00C896",
  },
];

interface ChatLine {
  speaker: "ai" | "customer";
  text: string;
}

const CHAT: ChatLine[] = [
  { speaker: "ai", text: "Thanks for calling Bella Cucina! How can I help you today?" },
  { speaker: "customer", text: "Hi, I'd like a table for four at 7 tonight." },
  { speaker: "ai", text: "A table for four at 7pm, wonderful. Any seating preference?" },
  { speaker: "customer", text: "By the window if you have it." },
  { speaker: "ai", text: "Done! Window table for four at 7pm. I've texted your confirmation." },
  { speaker: "ai", text: "Anything else I can take care of? Enjoy your evening!" },
];

const TICK_MS = 1900;

export function CallJourney() {
  // `active` counts completed stages (0..STAGES.length). It cycles and resets.
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a >= STAGES.length ? 0 : a + 1));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const current = Math.min(active, STAGES.length - 1);
  const progress = (active / STAGES.length) * 100;
  const revealed = CHAT.slice(0, active);
  const aiSpeaking = active > 0 && CHAT[active - 1]?.speaker === "ai";

  return (
    <section id="live" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-brand/[0.07] blur-[140px]" />
      <div className="container relative">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Badge variant="default" className="mb-4">
            <LiveDot className="mr-1" /> Watch it work
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            One call, start to finish, fully automated
          </h2>
          <p className="mt-4 text-muted-foreground">
            Follow a real conversation as it flows through the platform, from the first ring
            to a booked table logged in your CRM.
          </p>
        </motion.div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* Live phone mock */}
          <motion.div {...fadeUp}>
            <Card className="relative flex h-full flex-col overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15">
                    <PhoneCall className="h-4 w-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">Bella Cucina</p>
                    <p className="text-xs text-muted-foreground">AI Agent - Aria</p>
                  </div>
                </div>
                <Badge variant="success" className="gap-1.5">
                  <LiveDot color="#00C896" /> Live
                </Badge>
              </div>

              <div className="flex min-h-[320px] flex-1 flex-col justify-end gap-3 p-5">
                <AnimatePresence mode="popLayout">
                  {revealed.map((line, i) => (
                    <motion.div
                      key={`${active}-${i}`}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className={cn(
                        "flex",
                        line.speaker === "ai" ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                          line.speaker === "ai"
                            ? "rounded-tl-sm bg-white/[0.05] text-foreground"
                            : "rounded-tr-sm bg-brand/90 text-white"
                        )}
                      >
                        {line.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-4">
                <VoiceWaveform
                  active={aiSpeaking}
                  bars={22}
                  color={aiSpeaking ? "#3A86FF" : "#3f4a5f"}
                  className="h-6 flex-1"
                />
                <span className="text-xs text-muted-foreground">
                  {aiSpeaking ? "Aria is speaking" : "Listening"}
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Animated stage flow */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="relative h-full p-6 sm:p-8">
              <div className="relative">
                {/* progress rail */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 rounded-full bg-white/[0.07]">
                  <motion.div
                    className="w-full rounded-full bg-gradient-to-b from-brand via-gold to-success"
                    animate={{ height: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </div>

                <ul className="space-y-5">
                  {STAGES.map((stage, i) => {
                    const done = i < active;
                    const isCurrent = i === current && active > 0;
                    const Icon = stage.icon;
                    return (
                      <li key={stage.label} className="relative flex gap-4">
                        <div className="relative z-10 shrink-0">
                          <motion.div
                            className="flex h-10 w-10 items-center justify-center rounded-full border"
                            animate={{
                              backgroundColor: done
                                ? `${stage.accent}22`
                                : "rgba(255,255,255,0.03)",
                              borderColor: done
                                ? `${stage.accent}88`
                                : "rgba(255,255,255,0.08)",
                              scale: isCurrent ? 1.12 : 1,
                              boxShadow: isCurrent
                                ? `0 0 26px -6px ${stage.accent}`
                                : "0 0 0px transparent",
                            }}
                            transition={{ duration: 0.4 }}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{ color: done ? stage.accent : "#8a93a6" }}
                            />
                          </motion.div>
                          {isCurrent && (
                            <span
                              className="absolute inset-0 -z-0 animate-pulse-ring rounded-full"
                              style={{ backgroundColor: `${stage.accent}55` }}
                            />
                          )}
                        </div>
                        <motion.div
                          className="pb-1 pt-1.5"
                          animate={{ opacity: done || isCurrent ? 1 : 0.5 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{stage.label}</p>
                            {isCurrent && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                processing
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {stage.detail}
                          </p>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================= *
 *  Section 2 - Platform architecture (animated orbital flow)    *
 * ============================================================= */

interface Engine {
  icon: LucideIcon;
  label: string;
  color: string;
}

const ENGINES: Engine[] = [
  { icon: PhoneCall, label: "Voice Engine", color: "#3A86FF" },
  { icon: BookOpen, label: "Knowledge (RAG)", color: "#C9A227" },
  { icon: CalendarCheck, label: "Booking Engine", color: "#00C896" },
  { icon: ShoppingCart, label: "Order Engine", color: "#3A86FF" },
  { icon: Users, label: "CRM & Memory", color: "#C9A227" },
  { icon: BarChart3, label: "Analytics", color: "#00C896" },
];

const VB = 400; // svg viewbox size
const C = VB / 2;
const R = 150;

function nodePos(i: number, total: number) {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  return { x: C + R * Math.cos(angle), y: C + R * Math.sin(angle) };
}

export function PlatformArchitecture() {
  return (
    <section id="platform" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.05] blur-[150px]" />
      <div className="container relative">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Badge variant="gold" className="mb-4">
            <Cpu className="h-3 w-3" /> The architecture
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            One AI brain, every engine connected
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every conversation flows through a shared intelligence core that orchestrates
            voice, knowledge, bookings, orders, and your CRM in real time.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="relative mx-auto mt-14 aspect-square w-full max-w-[540px]"
        >
          {/* SVG flow layer */}
          <svg
            viewBox={`0 0 ${VB} ${VB}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* rotating dashed guide ring */}
            <motion.circle
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
              strokeDasharray="4 8"
              style={{ transformOrigin: "center" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            {ENGINES.map((e, i) => {
              const { x, y } = nodePos(i, ENGINES.length);
              return (
                <g key={e.label}>
                  <line
                    x1={C}
                    y1={C}
                    x2={x}
                    y2={y}
                    stroke={e.color}
                    strokeOpacity="0.25"
                    strokeWidth="1.5"
                  />
                  {/* data pulse traveling core -> engine */}
                  <motion.circle
                    r="3.5"
                    fill={e.color}
                    initial={{ cx: C, cy: C }}
                    animate={{ cx: [C, x], cy: [C, y], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.33,
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Center core */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="relative flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-brand/40 bg-base-card/80 backdrop-blur-xl sm:h-28 sm:w-28"
              animate={{ boxShadow: [
                "0 0 30px -10px rgba(58,134,255,0.5)",
                "0 0 55px -8px rgba(58,134,255,0.75)",
                "0 0 30px -10px rgba(58,134,255,0.5)",
              ] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <BrainCircuit className="h-7 w-7 text-brand" />
              <p className="mt-1.5 text-center text-[11px] font-semibold leading-tight">
                NETICS
                <br />
                AI Core
              </p>
            </motion.div>
          </div>

          {/* Engine chips positioned on the ring */}
          {ENGINES.map((e, i) => {
            const { x, y } = nodePos(i, ENGINES.length);
            const Icon = e.icon;
            return (
              <motion.div
                key={e.label}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(x / VB) * 100}%`, top: `${(y / VB) * 100}%` }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl border bg-base-card/80 backdrop-blur-md sm:h-12 sm:w-12"
                    style={{ borderColor: `${e.color}55` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: e.color }} />
                  </div>
                  <span className="whitespace-nowrap rounded-md bg-base-bg/70 px-1.5 text-[10px] font-medium text-muted-foreground">
                    {e.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Supporting rail */}
        <motion.div
          {...fadeUp}
          className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-brand" /> 150+ languages
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" /> Tenant-isolated & encrypted
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-soft" /> Learns from every call
          </span>
        </motion.div>
      </div>
    </section>
  );
}
