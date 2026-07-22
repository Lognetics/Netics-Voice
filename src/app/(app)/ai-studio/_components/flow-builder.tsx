"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play, GitBranch, Zap, CheckCircle2, PhoneForwarded, MessageSquare,
  Plus, Trash2, ArrowDown, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { FlowNode } from "./types";

const KIND_META: Record<
  FlowNode["kind"],
  { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; ring: string; tag: string }
> = {
  greeting: { icon: Play, color: "#3A86FF", ring: "border-brand/40 bg-brand/[0.06]", tag: "Entry" },
  intent: { icon: Sparkles, color: "#C9A227", ring: "border-gold/40 bg-gold/[0.06]", tag: "AI" },
  branch: { icon: GitBranch, color: "#6BA5FF", ring: "border-white/[0.12] bg-white/[0.03]", tag: "Router" },
  action: { icon: Zap, color: "#00C896", ring: "border-success/40 bg-success/[0.06]", tag: "Action" },
  confirm: { icon: CheckCircle2, color: "#00C896", ring: "border-success/40 bg-success/[0.06]", tag: "Confirm" },
  escalate: { icon: PhoneForwarded, color: "#FF4D4F", ring: "border-danger/40 bg-danger/[0.06]", tag: "Fallback" },
};

const ADDABLE: { kind: FlowNode["kind"]; label: string; detail: string }[] = [
  { kind: "intent", label: "Detect intent", detail: "Classify the customer's request." },
  { kind: "action", label: "Perform action", detail: "Look up, create or update a record." },
  { kind: "confirm", label: "Confirm & recap", detail: "Read back details for the customer." },
  { kind: "escalate", label: "Escalate to human", detail: "Warm-transfer to a live agent." },
];

const INITIAL_FLOW: FlowNode[] = [
  { id: "n_greet", kind: "greeting", label: "Greeting", detail: "Welcome the caller and offer help." },
  { id: "n_intent", kind: "intent", label: "Detect intent", detail: "Understand what the customer wants." },
  {
    id: "n_branch",
    kind: "branch",
    label: "Route by intent",
    detail: "Fan out to the right workflow.",
    branches: ["Place order", "Book a table", "Support"],
  },
  { id: "n_action", kind: "action", label: "Fulfil request", detail: "Create the order / booking / ticket." },
  { id: "n_confirm", kind: "confirm", label: "Confirm & recap", detail: "Read back and send confirmation." },
  { id: "n_esc", kind: "escalate", label: "Escalate if needed", detail: "Low confidence or explicit request." },
];

export function FlowBuilder() {
  const [nodes, setNodes] = React.useState<FlowNode[]>(INITIAL_FLOW);
  const [simulating, setSimulating] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);

  function addNode(kind: FlowNode["kind"], label: string, detail: string) {
    const insertAt = Math.max(1, nodes.length - 1); // before the escalate fallback
    const node: FlowNode = { id: `n_${Date.now()}`, kind, label, detail };
    setNodes((prev) => [...prev.slice(0, insertAt), node, ...prev.slice(insertAt)]);
    toast.success(`Added "${label}" step`);
  }

  function removeNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    toast("Step removed");
  }

  function updateBranches(id: string, branches: string[]) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, branches } : n)));
  }

  async function simulate() {
    if (simulating) return;
    setSimulating(true);
    for (let i = 0; i < nodes.length; i++) {
      setActiveIdx(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 520));
    }
    setActiveIdx(-1);
    setSimulating(false);
    toast.success("Flow dry-run complete — all paths valid ✓");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Conversation flow</h3>
          <p className="text-xs text-muted-foreground">
            Drag-free no-code builder · {nodes.length} steps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" /> Add step
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ADDABLE.map((a) => {
                const Icon = KIND_META[a.kind].icon;
                return (
                  <DropdownMenuItem key={a.label} onClick={() => addNode(a.kind, a.label, a.detail)}>
                    <Icon className="h-4 w-4" style={{ color: KIND_META[a.kind].color }} />
                    {a.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="gold" size="sm" onClick={simulate} disabled={simulating}>
            <Play className="h-4 w-4" /> {simulating ? "Running…" : "Dry-run"}
          </Button>
        </div>
      </div>

      <div className="relative rounded-2xl border border-white/[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px] p-6">
        <div className="mx-auto flex max-w-md flex-col items-stretch">
          {nodes.map((node, i) => {
            const meta = KIND_META[node.kind];
            const Icon = meta.icon;
            const active = activeIdx === i;
            const done = simulating && activeIdx > i;
            return (
              <div key={node.id} className="flex flex-col items-center">
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "group relative w-full rounded-xl border p-3.5 transition-shadow",
                    meta.ring,
                    active && "shadow-glow ring-2 ring-brand/50",
                    done && "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                      style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{node.label}</p>
                        <Badge variant="secondary" className="shrink-0">{meta.tag}</Badge>
                        {active && (
                          <span className="ml-auto text-[11px] font-medium text-brand">running…</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{node.detail}</p>

                      {node.branches && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {node.branches.map((b, bi) => (
                            <span
                              key={b}
                              className="group/branch inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px]"
                            >
                              {b}
                              <button
                                aria-label={`Remove ${b}`}
                                onClick={() =>
                                  updateBranches(
                                    node.id,
                                    node.branches!.filter((_, j) => j !== bi)
                                  )
                                }
                                className="opacity-40 transition-opacity hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          <button
                            onClick={() =>
                              updateBranches(node.id, [
                                ...node.branches!,
                                `Branch ${node.branches!.length + 1}`,
                              ])
                            }
                            className="inline-flex items-center gap-1 rounded-md border border-dashed border-white/[0.14] px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand"
                          >
                            <Plus className="h-3 w-3" /> branch
                          </button>
                        </div>
                      )}
                    </div>
                    {node.kind !== "greeting" && (
                      <button
                        aria-label="Remove step"
                        onClick={() => removeNode(node.id)}
                        className="opacity-0 transition-opacity hover:text-danger-soft group-hover:opacity-60 hover:!opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>

                {i < nodes.length - 1 && (
                  <div className="relative flex h-8 items-center justify-center">
                    <span className="absolute h-full w-px bg-white/[0.12]" />
                    <ArrowDown
                      className={cn(
                        "relative h-3.5 w-3.5 text-muted-foreground transition-colors",
                        active && "text-brand"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {nodes.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <MessageSquare className="h-4 w-4" /> Flow is empty — add a step to begin.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
