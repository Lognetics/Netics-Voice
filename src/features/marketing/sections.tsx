"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PhoneCall, BrainCircuit, BookOpen, Users, CalendarCheck, ShoppingCart,
  BarChart3, Languages, Zap, ShieldCheck, Check, ArrowRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { INDUSTRY_TEMPLATES } from "@/lib/constants";
import * as Icons from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

/* ------------------------------ Features ------------------------------ */

const features = [
  { icon: PhoneCall, title: "AI Voice Engine", desc: "Natural conversations with interruptions, emotion and context memory across 150+ languages.", accent: "text-brand" },
  { icon: BrainCircuit, title: "AI Studio", desc: "A no-code builder for conversation flows, personas and escalation rules. No engineers required.", accent: "text-success" },
  { icon: BookOpen, title: "Knowledge Engine", desc: "Upload menus, PDFs, price lists or a URL - the AI learns everything instantly with RAG.", accent: "text-gold-soft" },
  { icon: CalendarCheck, title: "Booking Engine", desc: "Availability, resources, reminders and waitlists for hotels, clinics, salons and more.", accent: "text-brand" },
  { icon: ShoppingCart, title: "Order Management", desc: "Take, track and upsell orders end-to-end with kitchen status and delivery routing.", accent: "text-success" },
  { icon: Users, title: "Unified CRM", desc: "Every caller gets a profile, history, preferences and AI-generated insights automatically.", accent: "text-gold-soft" },
  { icon: BarChart3, title: "Conversation Intelligence", desc: "Sentiment, intent, confidence scoring and demand forecasting on every interaction.", accent: "text-brand" },
  { icon: Languages, title: "Omnichannel", desc: "One AI across phone, WhatsApp, Instagram, SMS, web chat and email - a single inbox.", accent: "text-success" },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="container">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">One platform</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Not an AI call center. An{" "}
            <span className="text-gradient-brand">AI Operations Employee.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            NETICS understands conversations, executes business workflows, and learns from
            every interaction - giving you one operational brain for customer engagement.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
            >
              <Card className="group h-full p-6 transition-all duration-300 hover:border-white/[0.14] hover:-translate-y-1">
                <div className="mb-4 inline-flex rounded-xl bg-white/[0.04] p-2.5">
                  <f.icon className={`h-5 w-5 ${f.accent}`} />
                </div>
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Industries ----------------------------- */

export function Industries() {
  return (
    <section id="industries" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[130px]" />
      <div className="container relative">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Badge variant="gold" className="mb-4">17 industries</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pre-trained for your business
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pick a template and NETICS pre-populates your dashboards, knowledge categories,
            booking fields and conversation flows in seconds.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRY_TEMPLATES.map((t, i) => {
            const Icon = (Icons[t.icon as keyof typeof Icons] ?? Icons.Building2) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
            return (
              <motion.div
                key={t.industry}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              >
                <Card className="group relative h-full overflow-hidden p-6">
                  <div
                    className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                    style={{ background: t.color }}
                  />
                  <Icon className="h-6 w-6" style={{ color: t.color }} />
                  <h3 className="mt-4 font-medium">{t.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- How it works ---------------------------- */

const steps = [
  { n: "01", title: "Connect your number", desc: "Port an existing line or provision a new one in a click. WhatsApp and web chat included." },
  { n: "02", title: "Upload your knowledge", desc: "Drop in menus, policies, price lists or a URL. The AI indexes everything with RAG." },
  { n: "03", title: "Shape your AI", desc: "Choose a voice, personality and escalation rules in the no-code AI Studio." },
  { n: "04", title: "Go live & learn", desc: "The AI answers instantly, completes transactions, and improves with every call." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24">
      <div className="container">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Live in minutes</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From setup to answering calls - fast
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div key={s.n} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Card className="relative h-full p-6">
                <span className="text-3xl font-semibold text-gradient-brand tabular">{s.n}</span>
                <h3 className="mt-4 font-medium">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Pricing ------------------------------- */

const plans = [
  { name: "Starter", price: 149, desc: "For single-location businesses.", features: ["1 AI agent", "1,500 minutes / mo", "3 seats", "Phone + WhatsApp", "Knowledge base", "Email support"], highlighted: false },
  { name: "Growth", price: 449, desc: "For multi-branch operations.", features: ["5 AI agents", "8,000 minutes / mo", "15 seats", "All channels", "AI Studio + analytics", "Priority support"], highlighted: true },
  { name: "Enterprise", price: 0, desc: "For franchises & agencies.", features: ["Unlimited agents", "Custom minutes", "Unlimited seats", "White-label", "SSO + audit logs", "Dedicated CSM"], highlighted: false },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, scalable pricing
          </h2>
          <p className="mt-4 text-muted-foreground">Start free for 14 days. No credit card required.</p>
        </motion.div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div key={p.name} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Card
                className={`relative h-full p-7 ${
                  p.highlighted ? "border-brand/40 shadow-glow" : ""
                }`}
              >
                {p.highlighted && (
                  <Badge variant="default" className="absolute -top-3 left-7">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-5 flex items-end gap-1">
                  {p.price ? (
                    <>
                      <span className="text-4xl font-semibold tracking-tight">${p.price}</span>
                      <span className="mb-1 text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <span className="text-3xl font-semibold tracking-tight">Custom</span>
                  )}
                </div>
                <Button
                  className="mt-6 w-full"
                  variant={p.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/register">
                    {p.price ? "Start free trial" : "Contact sales"}
                  </Link>
                </Button>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- CTA --------------------------------- */

export function CTA() {
  return (
    <section className="py-24">
      <div className="container">
        <motion.div {...fadeUp}>
          <Card className="relative overflow-hidden p-12 text-center">
            <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-brand/20 blur-[100px]" />
            <div className="relative">
              <div className="mx-auto mb-6 flex items-center justify-center gap-2 text-success">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-medium">SOC 2-ready · GDPR · Multi-tenant isolation</span>
              </div>
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Never miss another customer.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Join thousands of businesses letting NETICS Voice handle the calls, so their
                teams can focus on the work that matters.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" asChild>
                  <Link href="/register">Start free trial <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Explore the demo <Zap className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------ Footer -------------------------------- */

export function Footer() {
  const cols = [
    { title: "Product", links: ["AI Voice Engine", "AI Studio", "Knowledge Base", "Analytics", "Integrations"] },
    { title: "Industries", links: ["Restaurants", "Hotels", "Healthcare", "Real Estate", "Retail"] },
    { title: "Company", links: ["About", "Careers", "Blog", "Security", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "GDPR", "Compliance"] },
  ];
  return (
    <footer className="border-t border-white/[0.06] py-14">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The AI Employee that never misses a customer.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-medium">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 NETICS Voice. All rights reserved.</p>
          <p>Built as a product prototype · Mock data</p>
        </div>
      </div>
    </footer>
  );
}
