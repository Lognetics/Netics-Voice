"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as Icons from "lucide-react";
import {
  ArrowLeft, ArrowRight, Check, Rocket, Building2, Sparkles, Clock,
  BookOpen, AudioLines, UploadCloud, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { INDUSTRY_TEMPLATES, VOICES, LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { IndustryTemplate } from "@/types";

const STEPS = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "industry", label: "Industry", icon: Sparkles },
  { id: "hours", label: "Hours", icon: Clock },
  { id: "ai", label: "AI Persona", icon: AudioLines },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "launch", label: "Launch", icon: Rocket },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [template, setTemplate] = React.useState<IndustryTemplate>(INDUSTRY_TEMPLATES[0]);
  const [voice, setVoice] = React.useState(VOICES[0].id);
  const [launching, setLaunching] = React.useState(false);
  const [files, setFiles] = React.useState<string[]>([
    "Full Menu 2026.pdf",
    "Refund Policy.docx",
  ]);

  const progress = ((step + 1) / STEPS.length) * 100;

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }
  function launch() {
    setLaunching(true);
    setTimeout(() => {
      toast.success("Your AI employee is live! 🎉");
      router.push("/dashboard");
    }, 1600);
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-40" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
        {/* header */}
        <div className="flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            Skip for now
          </Button>
        </div>

        {/* stepper */}
        <div className="mt-8">
          <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-brand-gradient"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl border transition-colors",
                    i < step && "border-success/40 bg-success/12 text-success",
                    i === step && "border-brand/50 bg-brand/15 text-brand",
                    i > step && "border-white/[0.08] text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* content */}
        <div className="flex flex-1 items-start py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {step === 0 && <BusinessStep />}
              {step === 1 && <IndustryStep template={template} onSelect={setTemplate} />}
              {step === 2 && <HoursStep />}
              {step === 3 && <AIStep voice={voice} onVoice={setVoice} template={template} />}
              {step === 4 && <KnowledgeStep files={files} setFiles={setFiles} template={template} />}
              {step === 5 && <LaunchStep template={template} voice={voice} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* footer nav */}
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="gold" onClick={launch} disabled={launching}>
              {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {launching ? "Launching…" : "Launch AI Employee"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1.5 text-muted-foreground">{desc}</p>
    </div>
  );
}

function BusinessStep() {
  return (
    <div>
      <StepHeader title="Tell us about your business" desc="This shapes your workspace and AI defaults." />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Business name</Label>
          <Input defaultValue="Bella Cucina Group" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input defaultValue="bellacucina.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Primary phone</Label>
            <Input defaultValue="+1 (212) 555-0148" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Input defaultValue="America/New_York" />
          </div>
          <div className="space-y-1.5">
            <Label>Primary language</Label>
            <Input defaultValue="English" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Languages spoken ({LANGUAGES.length}+ supported)</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.slice(0, 6).map((l, i) => (
              <Badge key={l} variant={i < 3 ? "default" : "secondary"}>{l}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IndustryStep({
  template,
  onSelect,
}: {
  template: IndustryTemplate;
  onSelect: (t: IndustryTemplate) => void;
}) {
  return (
    <div>
      <StepHeader title="Choose your industry" desc="We'll pre-populate dashboards, flows and knowledge categories." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {INDUSTRY_TEMPLATES.map((t) => {
          const Icon = (Icons[t.icon as keyof typeof Icons] ?? Icons.Building2) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
          const active = template.industry === t.industry;
          return (
            <button
              key={t.industry}
              onClick={() => onSelect(t)}
              className={cn(
                "group rounded-xl border p-4 text-left transition-all",
                active
                  ? "border-brand/50 bg-brand/10 shadow-glow"
                  : "border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.02]"
              )}
            >
              <Icon className="h-6 w-6" style={{ color: t.color }} />
              <p className="mt-3 text-sm font-medium">{t.label}</p>
              {active && <Check className="mt-2 h-4 w-4 text-brand" />}
            </button>
          );
        })}
      </div>

      <Card className="mt-5 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Pre-configured for {template.label}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Knowledge categories</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {template.knowledgeCategories.map((c) => (
                <Badge key={c} variant="secondary">{c}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sample intents</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {template.sampleIntents.map((c) => (
                <Badge key={c} variant="default">{c}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function HoursStep() {
  const [hours, setHours] = React.useState(
    DAYS.map((d) => ({ day: d, open: "09:00", close: "22:00", closed: d === "Sun" }))
  );
  return (
    <div>
      <StepHeader title="Business hours" desc="The AI answers 24/7 - hours guide bookings and callbacks." />
      <Card className="divide-y divide-white/[0.06] p-0">
        {hours.map((h, i) => (
          <div key={h.day} className="flex items-center justify-between px-5 py-3">
            <span className="w-12 text-sm font-medium">{h.day}</span>
            {h.closed ? (
              <span className="text-sm text-muted-foreground">Closed</span>
            ) : (
              <div className="flex items-center gap-2">
                <Input defaultValue={h.open} className="h-8 w-24" />
                <span className="text-muted-foreground">–</span>
                <Input defaultValue={h.close} className="h-8 w-24" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setHours((prev) =>
                  prev.map((p, j) => (j === i ? { ...p, closed: !p.closed } : p))
                )
              }
            >
              {h.closed ? "Set open" : "Mark closed"}
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AIStep({
  voice,
  onVoice,
  template,
}: {
  voice: string;
  onVoice: (v: string) => void;
  template: IndustryTemplate;
}) {
  return (
    <div>
      <StepHeader title="Design your AI persona" desc="Pick a voice and personality that matches your brand." />
      <div className="grid gap-3 sm:grid-cols-3">
        {VOICES.slice(0, 6).map((v) => {
          const active = voice === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onVoice(v.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                active ? "border-brand/50 bg-brand/10" : "border-white/[0.08] hover:bg-white/[0.02]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{v.name}</span>
                {active && <Check className="h-4 w-4 text-brand" />}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {v.gender} · {v.accent} · {v.tone}
              </p>
              {active && <VoiceWaveform active bars={20} className="mt-3 h-6" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label>Greeting message</Label>
          <Textarea defaultValue={template.greeting} />
        </div>
        <div className="space-y-1.5">
          <Label>AI personality</Label>
          <Textarea defaultValue="Warm, upbeat, and quick to recommend specials. Always confirm before finalizing." />
        </div>
      </div>
    </div>
  );
}

function KnowledgeStep({
  files,
  setFiles,
  template,
}: {
  files: string[];
  setFiles: React.Dispatch<React.SetStateAction<string[]>>;
  template: IndustryTemplate;
}) {
  return (
    <div>
      <StepHeader title="Feed your AI knowledge" desc="Upload documents or add a URL - the AI learns instantly." />
      <button
        onClick={() =>
          setFiles((f) => [...f, `Document ${f.length + 1}.pdf`])
        }
        className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] py-10 transition-colors hover:border-brand/40 hover:bg-brand/[0.03]"
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Drag & drop or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, Word, Excel, CSV, images, menus, URLs - up to 50MB each
        </p>
      </button>

      <div className="mt-4 space-y-2">
        {files.map((f, i) => (
          <motion.div
            key={f + i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-brand" />
              <span className="text-sm">{f}</span>
            </div>
            <Badge variant="success"><Check className="h-3 w-3" /> Indexed</Badge>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Suggested for {template.label}: {template.knowledgeCategories.join(", ")}
      </p>
    </div>
  );
}

function LaunchStep({ template, voice }: { template: IndustryTemplate; voice: string }) {
  const v = VOICES.find((x) => x.id === voice);
  return (
    <div>
      <StepHeader title="Ready to launch 🚀" desc="Review your setup - your AI employee is one click away." />
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Business" value="Bella Cucina Group" />
          <Row label="Industry" value={template.label} />
          <Row label="AI Voice" value={`${v?.name} · ${v?.tone}`} />
          <Row label="Languages" value="English, Spanish, +8" />
          <Row label="Channels" value="Phone, WhatsApp, Web" />
          <Row label="Knowledge docs" value="2 indexed" />
        </div>
        <div className="mt-6 rounded-xl bg-brand/[0.06] p-4">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="font-medium">Sample conversation preview</span>
          </div>
          <div className="mt-3 space-y-2">
            {template.sampleConversation.map((t, i) => (
              <div key={i} className={cn("flex", t.role === "ai" ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-1.5 text-sm",
                    t.role === "ai" ? "bg-brand/12" : "bg-white/[0.05]"
                  )}
                >
                  {t.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
