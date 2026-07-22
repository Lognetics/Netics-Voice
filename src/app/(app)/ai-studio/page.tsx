"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles, Bot, Workflow, SlidersHorizontal, AudioLines, ShieldAlert,
  ListTree, BookOpen, FlaskConical, Plus, Check, Play, Pause, Save,
  Trash2, PhoneForwarded, Bell, PhoneOutgoing, Voicemail, ArrowRight,
  Wand2, Gauge, TrendingUp, MessageSquareText,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { LiveDot } from "@/components/shared/indicators";
import { VOICES, LANGUAGES, INDUSTRY_TEMPLATES } from "@/lib/constants";
import { aiAgents, intents as seedIntents, knowledgeDocs } from "@/lib/mock/db";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import type { AIAgent, EscalationRule, Intent } from "@/types";
import { StudioSlider } from "./_components/studio-slider";
import { FlowBuilder } from "./_components/flow-builder";
import { Playground } from "./_components/playground";

/* ------------------------------------------------------------------ */
/* Sub-navigation                                                      */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  { id: "agents", label: "Agents", icon: Bot },
  { id: "flow", label: "Flow Builder", icon: Workflow },
  { id: "persona", label: "Persona", icon: SlidersHorizontal },
  { id: "voice", label: "Voice", icon: AudioLines },
  { id: "escalation", label: "Escalation", icon: ShieldAlert },
  { id: "intents", label: "Intents", icon: ListTree },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "playground", label: "Playground", icon: FlaskConical },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AIStudioPage() {
  // In-memory editable copies — never mutate the mock db.
  const [agents, setAgents] = React.useState<AIAgent[]>(() =>
    aiAgents.map((a) => ({ ...a, escalationRules: a.escalationRules.map((r) => ({ ...r })) }))
  );
  const [selectedId, setSelectedId] = React.useState(agents[0].id);
  const [intents, setIntents] = React.useState<Intent[]>(() => seedIntents.map((i) => ({ ...i })));
  const [section, setSection] = React.useState<SectionId>("agents");
  const [mapping, setMapping] = React.useState<Record<string, string>>({});

  const agent = agents.find((a) => a.id === selectedId) ?? agents[0];

  const patchAgent = React.useCallback(
    (patch: Partial<AIAgent>) => {
      setAgents((prev) => prev.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)));
    },
    [selectedId]
  );

  function toggleStatus(id: string) {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next = a.status === "active" ? "paused" : "active";
        toast[next === "active" ? "success" : "message"](
          next === "active" ? `${a.name} is now live` : `${a.name} paused`
        );
        return { ...a, status: next };
      })
    );
  }

  function saveAgent() {
    toast.success(`Saved changes to ${agent.name}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Sparkles className="h-5 w-5" />}
        title="AI Studio"
        description="Design, tune and test your AI employees — no code required."
        actions={
          <>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {agents.filter((a) => a.status === "active").length} live
            </Badge>
            <Button variant="outline" onClick={() => setSection("playground")}>
              <FlaskConical className="h-4 w-4" /> Test
            </Button>
            <Button variant="gold" onClick={saveAgent}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </>
        }
      />

      {/* Active-agent context bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <Bot className="h-5 w-5" />
              {agent.status === "active" && (
                <span className="absolute -right-1 -top-1">
                  <LiveDot />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{agent.name}</p>
                <StatusBadge status={agent.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {agent.voice} · {agent.language} · {formatNumber(agent.callsHandled, true)} calls handled
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={agent.status === "active" ? "outline" : "success"}
              size="sm"
              onClick={() => toggleStatus(agent.id)}
            >
              {agent.status === "active" ? (
                <><Pause className="h-4 w-4" /> Pause</>
              ) : (
                <><Play className="h-4 w-4" /> Activate</>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Sub-nav */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {SECTIONS.map((s) => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
                active
                  ? "border-brand/40 bg-brand/10 text-foreground shadow-glow"
                  : "border-white/[0.06] text-muted-foreground hover:border-white/[0.14] hover:text-foreground"
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {section === "agents" && (
            <AgentsSection
              agents={agents}
              selectedId={selectedId}
              onSelect={(id) => { setSelectedId(id); }}
              onToggle={toggleStatus}
              onEdit={(id) => { setSelectedId(id); setSection("persona"); }}
            />
          )}
          {section === "flow" && (
            <Card>
              <CardContent className="pt-6">
                <FlowBuilder />
              </CardContent>
            </Card>
          )}
          {section === "persona" && <PersonaSection agent={agent} patch={patchAgent} onSave={saveAgent} />}
          {section === "voice" && <VoiceSection agent={agent} patch={patchAgent} />}
          {section === "escalation" && <EscalationSection agent={agent} patch={patchAgent} />}
          {section === "intents" && <IntentsSection intents={intents} setIntents={setIntents} />}
          {section === "knowledge" && (
            <KnowledgeSection intents={intents} mapping={mapping} setMapping={setMapping} />
          )}
          {section === "playground" && (
            <Card>
              <CardContent className="pt-6">
                <Playground agent={agent} />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Agents                                                              */
/* ------------------------------------------------------------------ */

function AgentsSection({
  agents,
  selectedId,
  onSelect,
  onToggle,
  onEdit,
}: {
  agents: AIAgent[];
  selectedId: string;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((a) => {
        const selected = a.id === selectedId;
        return (
          <motion.div key={a.id} layout>
            <Card
              onClick={() => onSelect(a.id)}
              className={cn(
                "cursor-pointer p-5 transition-all hover:border-white/[0.14]",
                selected && "ring-2 ring-brand/40"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.voice} · {a.language}</p>
                  </div>
                </div>
                <Switch
                  checked={a.status === "active"}
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={() => onToggle(a.id)}
                  aria-label="Toggle active"
                />
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{a.personality}</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric icon={MessageSquareText} label="Calls handled" value={formatNumber(a.callsHandled, true)} />
                <Metric icon={TrendingUp} label="Resolution" value={formatPercent(a.resolutionRate)} accent="#00C896" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <StatusBadge status={a.status} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onEdit(a.id); }}
                >
                  <Wand2 className="h-4 w-4" /> Edit
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}

      {/* Create-new placeholder */}
      <button
        onClick={() => toast("Agent templates coming soon — clone an existing agent to start.")}
        className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.10] text-center transition-colors hover:border-brand/40 hover:bg-brand/[0.03]"
      >
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.04]">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium">New AI agent</p>
        <p className="mt-1 max-w-[14rem] text-xs text-muted-foreground">
          Start from a template or clone an existing agent.
        </p>
      </button>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent = "#3A86FF",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold tabular">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Persona editor                                                      */
/* ------------------------------------------------------------------ */

function PersonaSection({
  agent,
  patch,
  onSave,
}: {
  agent: AIAgent;
  patch: (p: Partial<AIAgent>) => void;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Prompt & persona</CardTitle>
          <p className="text-sm text-muted-foreground">Shape how your agent speaks and behaves.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Agent name</Label>
            <Input value={agent.name} onChange={(e) => patch({ name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>System prompt</Label>
            <Textarea
              rows={4}
              value={agent.personality}
              onChange={(e) => patch({ personality: e.target.value })}
              placeholder="Describe the agent's role, tone and guardrails…"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Greeting</Label>
              <button
                onClick={() =>
                  patch({ greeting: INDUSTRY_TEMPLATES[0].greeting })
                }
                className="text-[11px] text-brand hover:underline"
              >
                Reset to template
              </button>
            </div>
            <Textarea
              rows={2}
              value={agent.greeting}
              onChange={(e) => patch({ greeting: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={agent.language} onValueChange={(v) => patch({ language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Voice</Label>
              <Select value={agent.voice} onValueChange={(v) => patch({ voice: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v.id} value={v.name}>{v.name} · {v.tone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-brand" /> Behaviour tuning
          </CardTitle>
          <p className="text-sm text-muted-foreground">Fine-tune the feel of every conversation.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <StudioSlider
            label="Temperature"
            value={agent.temperature}
            min={0} max={1} step={0.05}
            onChange={(v) => patch({ temperature: v })}
            format={(v) => v.toFixed(2)}
            legend={["Precise", "Creative"]}
            accent="#C9A227"
          />
          <StudioSlider
            label="Speech rate"
            value={agent.speechRate}
            min={0.5} max={2} step={0.05}
            onChange={(v) => patch({ speechRate: v })}
            format={(v) => `${v.toFixed(2)}×`}
            legend={["Slower", "Faster"]}
          />
          <StudioSlider
            label="Emotion level"
            value={agent.emotionLevel}
            min={0} max={1} step={0.05}
            onChange={(v) => patch({ emotionLevel: v })}
            format={(v) => `${Math.round(v * 100)}%`}
            legend={["Flat", "Expressive"]}
            accent="#00C896"
          />
          <StudioSlider
            label="Response delay"
            value={agent.responseDelayMs}
            min={0} max={800} step={20}
            onChange={(v) => patch({ responseDelayMs: v })}
            format={(v) => `${v} ms`}
            legend={["Instant", "Natural pause"]}
            accent="#6BA5FF"
          />
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Allow interruptions</p>
              <p className="text-xs text-muted-foreground">
                Let callers barge in — the agent stops and listens.
              </p>
            </div>
            <Switch
              checked={agent.interruptions}
              onCheckedChange={(v) => patch({ interruptions: v })}
            />
          </div>
          <Button variant="gold" className="w-full" onClick={onSave}>
            <Save className="h-4 w-4" /> Save persona
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Voice selection                                                     */
/* ------------------------------------------------------------------ */

function VoiceSection({
  agent,
  patch,
}: {
  agent: AIAgent;
  patch: (p: Partial<AIAgent>) => void;
}) {
  const [previewing, setPreviewing] = React.useState<string | null>(null);

  function preview(name: string) {
    setPreviewing(name);
    toast(`Previewing ${name}…`);
    setTimeout(() => setPreviewing((p) => (p === name ? null : p)), 2200);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice library</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick the voice that best matches your brand. Preview before you commit.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VOICES.map((v) => {
            const active = agent.voice === v.name;
            const isPreview = previewing === v.name;
            return (
              <motion.button
                key={v.id}
                layout
                onClick={() => { patch({ voice: v.name }); toast.success(`Voice set to ${v.name}`); }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-brand/50 bg-brand/10 shadow-glow"
                    : "border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.02]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{v.name}</span>
                  {active && (
                    <Badge variant="default"><Check className="h-3 w-3" /> Selected</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {v.gender} · {v.accent} · {v.tone}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); preview(v.name); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); preview(v.name); } }}
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-white/[0.10] px-2 text-xs transition-colors hover:border-brand/40 hover:text-brand"
                  >
                    <Play className="h-3 w-3" /> Preview
                  </span>
                  <VoiceWaveform
                    active={isPreview}
                    bars={18}
                    color={active ? "#3A86FF" : "#6B7280"}
                    className={cn("h-6 flex-1", !isPreview && "opacity-40")}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Escalation rules                                                    */
/* ------------------------------------------------------------------ */

const ACTION_META: Record<
  EscalationRule["action"],
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  transfer: { icon: PhoneForwarded, label: "Transfer" },
  notify: { icon: Bell, label: "Notify" },
  callback: { icon: PhoneOutgoing, label: "Callback" },
  voicemail: { icon: Voicemail, label: "Voicemail" },
};

function EscalationSection({
  agent,
  patch,
}: {
  agent: AIAgent;
  patch: (p: Partial<AIAgent>) => void;
}) {
  const rules = agent.escalationRules;

  function update(id: string, changes: Partial<EscalationRule>) {
    patch({ escalationRules: rules.map((r) => (r.id === id ? { ...r, ...changes } : r)) });
  }
  function remove(id: string) {
    patch({ escalationRules: rules.filter((r) => r.id !== id) });
    toast("Escalation rule removed");
  }
  function add(rule: EscalationRule) {
    patch({ escalationRules: [...rules, rule] });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Escalation rules</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            When these conditions fire, the AI hands off to a human.
          </p>
        </div>
        <AddRuleDialog onAdd={add} />
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/[0.08] py-8 text-center text-sm text-muted-foreground">
            No escalation rules yet. The AI will attempt to resolve everything autonomously.
          </p>
        )}
        {rules.map((r) => {
          const Icon = ACTION_META[r.action].icon;
          return (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border p-3.5 transition-colors",
                r.enabled ? "border-white/[0.08] bg-white/[0.02]" : "border-white/[0.05] opacity-60"
              )}
            >
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                  r.action === "transfer" ? "bg-danger/15 text-danger-soft" : "bg-brand/15 text-brand"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{r.trigger}</p>
                  <Badge variant="secondary">{ACTION_META[r.action].label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <code className="rounded bg-white/[0.05] px-1 py-0.5">{r.condition}</code>
                  <ArrowRight className="mx-1.5 inline h-3 w-3" />
                  {r.target}
                </p>
              </div>
              <Switch
                checked={r.enabled}
                onCheckedChange={(v) => update(r.id, { enabled: v })}
                aria-label="Toggle rule"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(r.id)}
                aria-label="Delete rule"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AddRuleDialog({ onAdd }: { onAdd: (r: EscalationRule) => void }) {
  const [open, setOpen] = React.useState(false);
  const [trigger, setTrigger] = React.useState("");
  const [condition, setCondition] = React.useState("");
  const [action, setAction] = React.useState<EscalationRule["action"]>("transfer");
  const [target, setTarget] = React.useState("");

  function submit() {
    if (!trigger.trim() || !target.trim()) {
      toast.error("Trigger and target are required");
      return;
    }
    onAdd({
      id: `er_${Date.now()}`,
      trigger: trigger.trim(),
      condition: condition.trim() || "always",
      action,
      target: target.trim(),
      enabled: true,
    });
    toast.success("Escalation rule added");
    setTrigger(""); setCondition(""); setTarget(""); setAction("transfer");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Add rule</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New escalation rule</DialogTitle>
          <DialogDescription>Define when the AI should hand off to a human.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Trigger name</Label>
            <Input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="e.g. VIP complaint" />
          </div>
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="e.g. sentiment = frustrated" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Action</Label>
              <Select value={action} onValueChange={(v) => setAction(v as EscalationRule["action"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACTION_META) as EscalationRule["action"][]).map((a) => (
                    <SelectItem key={a} value={a}>{ACTION_META[a].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Target</Label>
              <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. Manager" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="gold" onClick={submit}>Add rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Intent library                                                      */
/* ------------------------------------------------------------------ */

function IntentsSection({
  intents,
  setIntents,
}: {
  intents: Intent[];
  setIntents: React.Dispatch<React.SetStateAction<Intent[]>>;
}) {
  const maxCount = Math.max(...intents.map((i) => i.count), 1);

  function add(intent: Intent) {
    setIntents((prev) => [intent, ...prev]);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Intent library</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {intents.length} intents · trained on real conversation data.
          </p>
        </div>
        <AddIntentDialog onAdd={add} />
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {intents.map((it) => (
          <motion.div
            key={it.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{it.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{it.description}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">{it.category}</Badge>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">{formatNumber(it.count, true)} triggers</span>
              <span className="ml-auto font-medium text-success">{formatPercent(it.successRate)} success</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-success"
                style={{ width: `${Math.max(6, (it.count / maxCount) * 100)}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {it.sampleUtterances.slice(0, 3).map((u, i) => (
                <span
                  key={i}
                  className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  “{u}”
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function AddIntentDialog({ onAdd }: { onAdd: (i: Intent) => void }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Support");
  const [utterances, setUtterances] = React.useState("");

  function submit() {
    if (!name.trim()) {
      toast.error("Intent name is required");
      return;
    }
    const samples = utterances
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onAdd({
      id: `int_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `Detects when a customer wants to ${name.toLowerCase()}.`,
      sampleUtterances: samples.length ? samples : [`I want to ${name.toLowerCase()}`],
      count: 0,
      successRate: 0,
      category,
    });
    toast.success(`Intent "${name.trim()}" added`);
    setName(""); setDescription(""); setUtterances(""); setCategory("Support");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Add intent</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New intent</DialogTitle>
          <DialogDescription>
            Teach your AI to recognise a new type of request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Intent name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Change order" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Sales", "Support", "Booking", "Order"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this intent captures" />
          </div>
          <div className="space-y-1.5">
            <Label>Sample utterances (one per line)</Label>
            <Textarea
              rows={3}
              value={utterances}
              onChange={(e) => setUtterances(e.target.value)}
              placeholder={"Can I change my order?\nI need to update my order"}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="gold" onClick={submit}>Add intent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Knowledge mapping                                                   */
/* ------------------------------------------------------------------ */

function KnowledgeSection({
  intents,
  mapping,
  setMapping,
}: {
  intents: Intent[];
  mapping: Record<string, string>;
  setMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  // Distinct knowledge categories available from the mock docs.
  const categories = React.useMemo(
    () => Array.from(new Set(knowledgeDocs.map((d) => d.category))).sort(),
    []
  );
  const docCount = React.useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of knowledgeDocs) m[d.category] = (m[d.category] ?? 0) + 1;
    return m;
  }, []);

  function setFor(intentId: string, category: string) {
    setMapping((prev) => ({ ...prev, [intentId]: category }));
    toast.success("Knowledge source mapped");
  }

  const mapped = Object.keys(mapping).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge mapping</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Ground each intent in the right knowledge so answers stay accurate. {mapped}/{intents.length} mapped.
        </p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="hidden grid-cols-[1fr_16px_1fr] items-center gap-3 px-1 text-[11px] uppercase tracking-wide text-muted-foreground sm:grid">
          <span>Intent</span>
          <span />
          <span>Knowledge source</span>
        </div>
        {intents.map((it) => (
          <div
            key={it.id}
            className="grid grid-cols-1 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:grid-cols-[1fr_16px_1fr]"
          >
            <div className="flex items-center gap-2">
              <ListTree className="h-4 w-4 text-brand" />
              <div>
                <p className="text-sm font-medium">{it.name}</p>
                <p className="text-[11px] text-muted-foreground">{it.category}</p>
              </div>
            </div>
            <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
            <Select value={mapping[it.id] ?? ""} onValueChange={(v) => setFor(it.id, v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select knowledge category…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c} · {docCount[c]} docs
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: AIAgent["status"] }) {
  if (status === "active") return <Badge variant="success"><Check className="h-3 w-3" /> Active</Badge>;
  if (status === "paused") return <Badge variant="warning">Paused</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}
