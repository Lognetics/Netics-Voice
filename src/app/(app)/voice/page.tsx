"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AudioLines,
  Play,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Mic,
  Languages,
  Gauge,
  Waves,
  Volume2,
  UserRound,
  Globe2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VOICES, LANGUAGES } from "@/lib/constants";
import { aiAgents } from "@/lib/mock";
import { cn } from "@/lib/utils";

import { RangeSlider } from "./_components/range-slider";

const TONES = [
  "Warm",
  "Confident",
  "Calm",
  "Friendly",
  "Professional",
  "Energetic",
];
const ACCENTS = ["US", "UK", "AU", "Neutral", "ES"];
const GENDERS = ["female", "male", "neutral"] as const;

const BRAND_COLOR = "#3A86FF";
const GOLD = "#C9A227";
const GREEN = "#00C896";

/** Deterministic waveform seed so SSR/CSR match; shaped by emotion + pitch. */
function useWaveSeed(emotion: number, pitch: number) {
  return React.useMemo(() => {
    const base = 0.35 + emotion * 0.4;
    return Array.from({ length: 14 }, (_, i) => {
      const wobble = ((i * 29) % 60) / 100;
      const h = base + wobble * (0.4 + pitch * 0.25);
      return Math.max(0.15, Math.min(1, h));
    });
  }, [emotion, pitch]);
}

export default function VoiceSettingsPage() {
  const seed = aiAgents[0];

  const [voiceId, setVoiceId] = React.useState(
    VOICES.find((v) => v.name === seed.voice)?.id ?? VOICES[0].id
  );
  const [speed, setSpeed] = React.useState(seed.speechRate);
  const [tone, setTone] = React.useState(0.6); // temperature-like expressiveness
  const [pitch, setPitch] = React.useState(0.5);
  const [delay, setDelay] = React.useState(seed.responseDelayMs);
  const [emotion, setEmotion] = React.useState(seed.emotionLevel);
  const [gender, setGender] = React.useState<string>("female");
  const [accent, setAccent] = React.useState("US");
  const [language, setLanguage] = React.useState(seed.language);
  const [toneStyle, setToneStyle] = React.useState("Warm");

  const [interruptions, setInterruptions] = React.useState(seed.interruptions);
  const [noiseReduction, setNoiseReduction] = React.useState(true);
  const [translation, setTranslation] = React.useState(false);

  const [brandVoice, setBrandVoice] = React.useState(seed.personality);
  const [testing, setTesting] = React.useState(false);

  const selectedVoice = VOICES.find((v) => v.id === voiceId) ?? VOICES[0];
  const waveSeed = useWaveSeed(emotion, pitch);

  const greeting = React.useMemo(
    () =>
      `Thanks for calling Bella Cucina! This is ${selectedVoice.name} — how can I help you today?`,
    [selectedVoice.name]
  );

  function playSample(name: string) {
    toast(`Playing ${name} sample`, {
      icon: "🔊",
      description: `${selectedVoice.accent} accent · ${toneStyle.toLowerCase()} tone`,
    });
  }

  function testVoice() {
    setTesting(true);
    toast.success("Testing voice", {
      description: `${selectedVoice.name} · ${language} · ${Math.round(
        emotion * 100
      )}% emotion`,
    });
    window.setTimeout(() => setTesting(false), 3200);
  }

  function save() {
    toast.success("Voice settings saved", {
      description: `${selectedVoice.name} is now live across all channels.`,
    });
  }

  function reset() {
    setVoiceId(VOICES.find((v) => v.name === seed.voice)?.id ?? VOICES[0].id);
    setSpeed(seed.speechRate);
    setTone(0.6);
    setPitch(0.5);
    setDelay(seed.responseDelayMs);
    setEmotion(seed.emotionLevel);
    setGender("female");
    setAccent("US");
    setLanguage(seed.language);
    setToneStyle("Warm");
    setInterruptions(seed.interruptions);
    setNoiseReduction(true);
    setTranslation(false);
    setBrandVoice(seed.personality);
    toast("Reverted to last saved configuration");
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="AI Voice Settings"
        description="Craft the voice, cadence and personality of your AI employee."
        icon={<AudioLines className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="gold" onClick={testVoice}>
              <Play className="h-4 w-4" /> Test voice
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left / main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Voice selection */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-brand" />
                <CardTitle>Voice library</CardTitle>
              </div>
              <Badge variant="secondary">{VOICES.length} voices</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {VOICES.map((v) => {
                  const active = v.id === voiceId;
                  return (
                    <motion.button
                      key={v.id}
                      type="button"
                      onClick={() => setVoiceId(v.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border p-4 text-left transition-colors",
                        active
                          ? "border-brand/50 bg-brand/[0.08] shadow-glow"
                          : "border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold">{v.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.accent} · {v.tone}
                          </p>
                        </div>
                        {active ? (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <Badge variant="outline" className="capitalize">
                            {v.gender}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 h-8">
                        <VoiceWaveform
                          active={active}
                          bars={20}
                          color={active ? BRAND_COLOR : "#5b6478"}
                          className="h-8 w-full"
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] capitalize text-muted-foreground">
                          {v.gender} voice
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            playSample(v.name);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              playSample(v.name);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
                        >
                          <Play className="h-3 w-3" /> Play sample
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Delivery controls */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Gauge className="h-4 w-4 text-brand" />
              <CardTitle>Delivery &amp; cadence</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <RangeSlider
                label="Speech speed"
                value={speed}
                min={0.5}
                max={2}
                step={0.05}
                onChange={setSpeed}
                format={(v) => `${v.toFixed(2)}×`}
                accent={BRAND_COLOR}
              />
              <RangeSlider
                label="Tone expressiveness"
                value={tone}
                min={0}
                max={1}
                step={0.05}
                onChange={setTone}
                format={(v) => `${Math.round(v * 100)}%`}
                accent={GOLD}
              />
              <RangeSlider
                label="Pitch"
                value={pitch}
                min={0}
                max={1}
                step={0.05}
                onChange={setPitch}
                format={(v) =>
                  v < 0.4 ? "Low" : v > 0.6 ? "High" : "Neutral"
                }
                accent={BRAND_COLOR}
              />
              <RangeSlider
                label="Response delay"
                value={delay}
                min={0}
                max={800}
                step={20}
                onChange={setDelay}
                format={(v) => `${v} ms`}
                accent={GOLD}
              />
              <RangeSlider
                label="Emotion level"
                value={emotion}
                min={0}
                max={1}
                step={0.05}
                onChange={setEmotion}
                format={(v) => `${Math.round(v * 100)}%`}
                accent={GREEN}
                className="sm:col-span-2"
              />
            </CardContent>
          </Card>

          {/* Identity selects + switches */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <UserRound className="h-4 w-4 text-brand" />
              <CardTitle>Identity &amp; behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g} className="capitalize">
                          {g[0].toUpperCase() + g.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Accent</Label>
                  <Select value={accent} onValueChange={setAccent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCENTS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tone style</Label>
                  <Select value={toneStyle} onValueChange={setToneStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <ToggleRow
                  icon={<Waves className="h-4 w-4 text-brand" />}
                  title="Allow interruptions"
                  description="Let callers barge in — the AI stops talking and listens instantly."
                  checked={interruptions}
                  onCheckedChange={setInterruptions}
                />
                <ToggleRow
                  icon={<Volume2 className="h-4 w-4 text-brand" />}
                  title="Background noise reduction"
                  description="Filter ambient noise for cleaner recognition on phone lines."
                  checked={noiseReduction}
                  onCheckedChange={setNoiseReduction}
                />
                <ToggleRow
                  icon={<Languages className="h-4 w-4 text-brand" />}
                  title="Real-time translation"
                  description="Detect the caller's language and respond in kind, live."
                  checked={translation}
                  onCheckedChange={setTranslation}
                />
              </div>
            </CardContent>
          </Card>

          {/* Brand identity alignment */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-soft" />
              <CardTitle>Brand identity alignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Describe your brand&apos;s personality. Your AI mirrors this
                voice in every conversation — word choice, warmth and energy.
              </p>
              <Textarea
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                rows={4}
                placeholder="e.g. Warm, upbeat, and quick to recommend specials — never pushy."
              />
              <div className="flex flex-wrap gap-2">
                {[
                  "Warm & welcoming",
                  "Concise & efficient",
                  "Playful",
                  "Luxury / refined",
                  "Reassuring",
                ].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setBrandVoice((prev) =>
                        prev.includes(p) ? prev : `${prev} ${p}.`.trim()
                      )
                    }
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold-soft"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right / live preview column */}
        <div className="space-y-6">
          <div className="lg:sticky lg:top-6">
            <Card className="overflow-hidden">
              <div className="relative border-b border-white/[0.06] bg-brand-gradient/5 p-6">
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    background:
                      "radial-gradient(120% 80% at 50% 0%, rgba(58,134,255,0.16), transparent 70%)",
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/15 text-brand">
                      <AudioLines className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Live preview</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedVoice.name} · {language}
                      </p>
                    </div>
                  </div>
                  <Badge variant={testing ? "success" : "secondary"}>
                    {testing ? "Speaking…" : "Idle"}
                  </Badge>
                </div>

                <div className="relative mt-6 grid place-items-center">
                  <VoiceWaveform
                    active={testing}
                    bars={28}
                    color={testing ? GREEN : BRAND_COLOR}
                    seed={waveSeed}
                    className="h-16 w-full"
                  />
                </div>
              </div>

              <CardContent className="space-y-4 p-6">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Greeting preview
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    &ldquo;{greeting}&rdquo;
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <PreviewStat label="Speed" value={`${speed.toFixed(2)}×`} />
                  <PreviewStat
                    label="Emotion"
                    value={`${Math.round(emotion * 100)}%`}
                  />
                  <PreviewStat label="Delay" value={`${delay} ms`} />
                  <PreviewStat label="Accent" value={accent} />
                  <PreviewStat label="Tone" value={toneStyle} />
                  <PreviewStat
                    label="Pitch"
                    value={
                      pitch < 0.4 ? "Low" : pitch > 0.6 ? "High" : "Neutral"
                    }
                  />
                </dl>

                <div className="flex flex-wrap gap-1.5">
                  {interruptions && (
                    <Badge variant="default">Interruptions</Badge>
                  )}
                  {noiseReduction && (
                    <Badge variant="success">Noise reduction</Badge>
                  )}
                  {translation && (
                    <Badge variant="gold">
                      <Globe2 className="h-3 w-3" /> Translation
                    </Badge>
                  )}
                </div>

                <Button className="w-full" variant="gold" onClick={testVoice}>
                  <Play className="h-4 w-4" /> Test this voice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.06] bg-base-primary/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <p className="hidden text-sm text-muted-foreground sm:block">
            <span className="font-medium text-foreground">
              {selectedVoice.name}
            </span>{" "}
            · {selectedVoice.accent} · {language}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" onClick={reset}>
              Discard
            </Button>
            <Button onClick={save}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium tabular">{value}</dd>
    </div>
  );
}
