import type { AIAgent, EscalationRule } from "@/types";

/** A single node in the visual conversation-flow builder. */
export interface FlowNode {
  id: string;
  kind:
    | "greeting"
    | "intent"
    | "branch"
    | "action"
    | "confirm"
    | "escalate";
  label: string;
  detail: string;
  /** Only for branch nodes — the branch options that fan out. */
  branches?: string[];
}

/** Editable, in-memory copy of an agent so we never mutate the mock db. */
export type DraftAgent = AIAgent;

export type DraftRule = EscalationRule;
