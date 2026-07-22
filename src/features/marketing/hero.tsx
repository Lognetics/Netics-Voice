"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Sparkles, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { LiveDot, SentimentBadge } from "@/components/shared/indicators";

const demoTurns = [
  { speaker: "ai", text: "Thanks for calling Bella Cucina! How can I help you today?" },
  { speaker: "customer", text: "Hi, I'd like a table for four this Saturday at 7." },
  { speaker: "ai", text: "Perfect - I have a lovely window table at 7pm. Shall I book it, Mr. James?" },
  { speaker: "customer", text: "Yes please, and add a birthday cake." },
  { speaker: "ai", text: "Done! Table for four, 7pm Saturday, with a birthday surprise. 🎉" },
];

export function Hero() {
  const [visible, setVisible] = React.useState(1);

  React.useEffect(() => {
    if (visible >= demoTurns.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 1400);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand/15 blur-[140px]" />

      <div className="container relative grid items-center gap-12 lg:grid-cols-2">
        {/* Left copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="gold" className="mb-5">
              <Sparkles className="h-3 w-3" />
              AI Customer Operations Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            The AI Employee that{" "}
            <span className="text-gradient-brand">never misses</span> a customer.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            NETICS Voice answers every call, books every table, takes every order and
            resolves every request - in 150+ languages, across every channel, for any
            industry. It sounds human. It never sleeps.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" asChild>
              <Link href="/register">
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">
                <PlayCircle className="h-4 w-4" /> View live demo
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
          >
            <div><span className="font-semibold text-foreground">89%</span> resolved by AI</div>
            <div><span className="font-semibold text-foreground">150+</span> languages</div>
            <div><span className="font-semibold text-foreground">0</span> missed calls</div>
            <div><span className="font-semibold text-foreground">17</span> industries</div>
          </motion.div>
        </div>

        {/* Right: live call simulation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="glass rounded-3xl p-5 shadow-soft">
            {/* call header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-brand">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Incoming call · +1 (212) 555-0148</p>
                  <p className="text-xs text-muted-foreground">Aria · Front of House AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LiveDot />
                <span className="text-xs font-medium text-success">Live</span>
              </div>
            </div>

            {/* waveform */}
            <div className="flex items-center justify-center py-4">
              <VoiceWaveform active bars={40} className="h-10 w-full" />
            </div>

            {/* transcript */}
            <div className="space-y-3">
              {demoTurns.slice(0, visible).map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${t.speaker === "ai" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      t.speaker === "ai"
                        ? "bg-brand/12 text-foreground rounded-tl-sm"
                        : "bg-white/[0.05] text-foreground rounded-tr-sm"
                    }`}
                  >
                    {t.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* footer meta */}
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Intent</span>
                <Badge variant="default">Reserve table</Badge>
              </div>
              <SentimentBadge sentiment="positive" />
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium text-success">96%</span>
              </div>
            </div>
          </div>

          {/* floating chips */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -right-4 -top-4 glass rounded-2xl px-4 py-3 shadow-soft"
          >
            <p className="text-xs text-muted-foreground">Booking created</p>
            <p className="text-sm font-semibold text-success">RSV-48213 ✓</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
